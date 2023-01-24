import { createServer } from 'http'
import staticHandler from 'serve-handler'
import ws from 'ws'
import amqp from 'amqplib'
import JSONStream from 'JSONStream'
import superagent from 'superagent'

const httpPort = process.argv[2] || 8080

async function main() {
   const connection = await amqp.connect(
      'amqps://emcnltcw:VCHqcK3UcsuP1RUAXrVgkYeKulnk-KWG@seal.lmq.cloudamqp.com/emcnltcw'
   )
   const channel = await connection.createChannel()
   await channel.assertExchange('talk', 'fanout')
   const { queue } = await channel.assertQueue(`talk_srv_${httpPort}`, {
      exclusive: true
   })
   await channel.bindQueue(queue, 'talk') // bind exchange 'talk' to queue
   channel.consume(
      queue,
      msg => {
         msg = msg.content.toString()
         console.log(`From queue: ${msg}`)
         broadcast(msg)
      },
      { noAck: true }
   )

   // serve static files
   const server = createServer((req, res) => {
      return staticHandler(req, res, { public: 'www' })
   })

   const wss = new ws.Server({ server })
   wss.on('connection', client => {
      console.log('Client connected')

      client.on('message', msg => {
         console.log(`Message: ${msg}`)
         channel.publish('talk', '', Buffer.from(msg))
      })

      // query the log records
      superagent
         .get('http://localhost:8090')
         .on('error', err => console.error(err))
         .pipe(JSONStream.parse('*'))
         .on('data', msg => client.send(msg))
   })

   function broadcast(msg) {
      for (const client of wss.clients) {
         if (client.readyState === ws.OPEN) {
            client.send(msg)
         }
      }
   }

   server.listen(httpPort)
}

main().catch(err => console.error(err))
