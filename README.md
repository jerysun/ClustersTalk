# ClustersTalk

A Node.js Microservice project for the real time communication among the server clusters, written in javascript using the technologies such as WebSocket, RabbitMQ, and the NoSql Database - LevelDB, etc.

## Run

As pre-requisite to this project, you first need to [install RabbitMQ](http://www.rabbitmq.com/download.html) or [register the free RabbitMQ Cloud Service](https://www.cloudamqp.com/)

If you have docker installed, you can run an ephemeral instance of RabbitMQ with the following command:

```bash
docker run -it -p 5672:5672 --hostname my-rabbit rabbitmq:3
```

To try this app, please install the dependencies:

```bash
npm install
```

Then run (in separate terminals):

```bash
node clusters-talk.js 8080
node clusters-talk.js 8081
node logRecords.js
```

You can try to access at the same time those URLs on the address bar of your browser:

```
http://localhost:8080
http://localhost:8081
```
## Advanced Topics

Note that the logRecords microservice behaves in case of downtime. If we stop the logRecords server and continue to send messages using the web UI of the clusters-talk application, we will see that when the logRecords server is restarted, it will immediately receive all the messages it missed. 

It is also interesting to see how the microservice approach allows our system to survive even without one of its components - the logRecords service. There would be a temporary reduction of functionality (no log records available) but servers would still be able to exchange talk messages in real time!