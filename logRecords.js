import { createServer } from 'http'
import level from 'level'
import timestamp from 'monotonic-timestamp'
import JSONStream from 'JSONStream'
import amqp from 'amqplib'

async function main() {
   const db = level('./msgRecords')

   const connection = await amqp.connect(
      'amqps://emcnltcw:VCHqcK3UcsuP1RUAXrVgkYeKulnk-KWG@seal.lmq.cloudamqp.com/emcnltcw'
   )
   const channel = await connection.createChannel()
   await channel.assertExchange('talk', 'fanout')
   const { queue } = channel.assertQueue('talk_records')
   await channel.bindQueue(queue, 'talk')

   channel.consume(queue, async msg => {
      const content = msg.content.toString()
      console.log(`Saving message: ${content}`)
      await db.put(timestamp(), content)
      channel.ack(msg)
   })

   createServer((req, res) => {
      res.writeHead(200)
      db.createValueStream().pipe(JSONStream.stringify()).pipe(res)
   }).listen(8090)
}

main().catch(err => console.error(err))
