import { Server } from 'socket.io'

const io = new Server({
  cors: {
    origin: 'http://localhost:3000',
  }
})

io.listen(3001)

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.emit('hello')

  socket.on('disconnect', () => {
    console.log('a user disconnected')
  })
})
