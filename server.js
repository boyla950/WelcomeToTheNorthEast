const app = require('./app')

const server = app.listen(process.env.PORT || 8090)

const socket = require('socket.io')

const io = socket(server)

io.sockets.on('connection', newConnection)

function newConnection (socket) {
  console.log(`New session: ${socket.id}`)
}
