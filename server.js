const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')

const rooms = { 1: { users:{} }, 2: { users:{} }, 
                3: { users:{} }, 4: { users:{} },
                5: { users:{} }}

app.get('/', (req, res) => {
  res.render('index')
})

const port = process.env.PORT || 3030;

server.listen(port)

io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    console.log(room, name)
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', (room, message) => {
    console.log(room, message)
    console.log(rooms[room].users[socket.id])
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id]})
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      console.log(rooms)
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}