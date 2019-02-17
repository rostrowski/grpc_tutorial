const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const PROTO_PATH = 'proto/chat.proto'
const SERVER_URI = '0.0.0.0:50051'

const protoDefinition = protoLoader.loadSync(PROTO_PATH)
const grpcObject = grpc.loadPackageDefinition(protoDefinition)

const server = new grpc.Server()

server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure())

const users = []

const joinChat = call => {
  console.log(`User ${call.request.user} has joined.`)

  users.push(call)
}

const sendMessage = (call, callback) => {
  const { message, user } = call.request

  console.log(`New message from ${user}: ${message}`)

  const messageToSend = {
    message,
    user,
    timestamp: Math.floor(new Date().getTime() / 1000),
  }

  users.forEach(user => user.write(messageToSend))

  callback(null, {})
}

server.addService(grpcObject.ChatService.service, {
  joinChat,
  sendMessage,
})

server.start()

console.log('Server is running.')