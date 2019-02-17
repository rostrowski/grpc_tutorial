const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const PROTO_PATH = 'proto/chat.proto'
const SERVER_URI = '0.0.0.0:50051'

const protoDefinition = protoLoader.loadSync(PROTO_PATH)
const grpcObject = grpc.loadPackageDefinition(protoDefinition)

const server = new grpc.Server()

server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure())

let users = []

const sendMessage = call => {
  if (!users.includes(call)) {
    users.push(call)

    call.on('data', data => {
      const { message, user } = data

      console.log(`New message from ${user}: ${message}`)
      
      const messageToSend = {
        message,
        user,
        timestamp: Math.floor(new Date().getTime() / 1000),
      }
    
      users.forEach(user => user.write(messageToSend))
    })
  }
}

server.addService(grpcObject.ChatService.service, {
  sendMessage,
})

server.start()

console.log('Server is running.')