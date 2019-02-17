const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const PROTO_PATH = 'proto/chat.proto'
const SERVER_URI = '0.0.0.0:50051'

const protoDefinition = protoLoader.loadSync(PROTO_PATH)
const grpcObject = grpc.loadPackageDefinition(protoDefinition)

const server = new grpc.Server()

server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure())

let users = []

const joinChat = call => {
  users.push(call)

  call.on('cancelled', () => {
    users = users.filter(user => user !== call)
    console.log(`User has left. Users in chat: ${users.length}`)
  })

  console.log(`User ${call.request.user} has joined - users in chat: ${users.length}`)
}

const sendMessage = (call, callback) => {
  const { message, user } = call.request

  if (message === 'Node.js sucks') {
    return callback(new Error('Nieprawda.'))
  }

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