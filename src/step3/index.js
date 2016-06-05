'use strict'

const express = require('express')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

// ------------------------------------
// Variables
// ------------------------------------
let userId = 0
let connectedUsers = new Set()
let connectedUsersInfos = new Map()
let clientSockets = new Map()
const MESSAGES = {
  EXIT: 'exit',                           // the user leaves
  LOADING_USER_LIST: 'loading_user_list', // send the user list
  SEND_ICE_CANDIDATE: 'send_ice_candidate',
  RECEIVE_ICE_CANDIDATE: 'receive_ice_candidate',
  SEND_DESCRIPTION: 'send_description',
  RECEIVE_DESCRIPTION: 'receive_description',
  WELCOME: 'welcome',                     // gives an id to the user
}

// ------------------------------------
// Helpers
// ------------------------------------
const getUserList = () => {
  let result = []
  for (let item of connectedUsers) {
    result.push(item)
  }
  return result;
}

const refreshAllClientUserList = () => {
  io.sockets.emit(MESSAGES.LOADING_USER_LIST, {
    connectedUsers: getUserList()
  })
}

// ------------------------------------
// Socket logic
// ------------------------------------
io.on('connection', socket => {
  console.log(`A new user connected: ${++userId}`)
  connectedUsers.add(userId)
  refreshAllClientUserList()
  clientSockets.set(userId, socket)

  socket.emit(MESSAGES.WELCOME, {
    id: userId,
    connectedUsers: getUserList()
  })

  socket.on(MESSAGES.EXIT, data => {
    if (data.id) {
      connectedUsers.delete(data.id)
    }
    refreshAllClientUserList()
  })

  socket.on(MESSAGES.SEND_DESCRIPTION, data => {
    // This time, we will emit only to the recipient
    let to = JSON.parse(data).to
    if (clientSockets.has(to)) {
      clientSockets.get(to).emit(MESSAGES.RECEIVE_DESCRIPTION, data)
    }
  })

  socket.on(MESSAGES.SEND_ICE_CANDIDATE, data => {
    let to = JSON.parse(data).to
    if (clientSockets.has(to)) {
      clientSockets.get(to).emit(MESSAGES.RECEIVE_ICE_CANDIDATE, data)
    }
  })

})


// ------------------------------------
// Server
// ------------------------------------
module.exports = {
  start: port => {
    app.use(express.static(`${__dirname}/public`));

    app.get('/', (req, res) => {
      res.sendFile(`${__dirname}/index.html`)
    })

    server.listen(port)
    // Put a friendly message on the terminal
    console.log(`Server running at http://127.0.0.1:${port}/`)
  }
}
