import { Server } from 'socket.io'

const io = new Server({
  cors: {
    origin: 'http://localhost:3000',
  }
})

io.listen(3001)

const astronauts = []

const generateRandomPosition = () => {
  return [Math.random() * 3, 0, Math.random() * 3]
}

const generateRandomHexColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

io.on('connection', (socket) => {
  console.log('a user connected')

  astronauts.push({
    id: socket.id,
    position: generateRandomPosition(),
    headColor: generateRandomHexColor()
  })

  io.emit('astronauts', astronauts)

  socket.on('disconnect', () => {
    console.log('user disconnected')
    // Remove astronaut from array and emit new array to all clients
    astronauts.splice(astronauts.findIndex(astronaut => astronaut.id === socket.id), 1)
    io.emit('astronauts', astronauts)
  })
})
