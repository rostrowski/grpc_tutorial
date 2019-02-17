const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const PROTO_PATH = 'proto/chat.proto'
const SERVER_URI = '0.0.0.0:50051'

const protoDefinition = protoLoader.loadSync(PROTO_PATH)
const grpcObject = grpc.loadPackageDefinition(protoDefinition)

const client = new grpcObject.ChatService(SERVER_URI, grpc.credentials.createInsecure())

const user = 'Rafal'

const chatStream = client.sendMessage({ message: '', user })

chatStream.on('data', data => {
  console.log(data)
})

let i = 0
setInterval(() => {
  chatStream.write({ message: `Message no. ${i++}`, user })
}, 2000)