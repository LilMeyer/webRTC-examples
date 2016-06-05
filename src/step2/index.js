'use strict'

const express = require('express')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

// ------------------------------------
// Variables
// ------------------------------------
let userId = 0;
const MESSAGES = {
  EXIT: 'exit',                           // the user leaves
  LOADING_USER_LIST: 'loading_user_list', // send the user list
  SEND_ICE_CANDIDATE: 'send_ice_candidate',
  RECEIVE_ICE_CANDIDATE: 'receive_ice_candidate',
  SEND_OFFER: 'send_offer',
  SEND_DESCRIPTION: 'send_description',
  RECEIVE_DESCRIPTION: 'receive_description',
  RECEIVE_OFFER: 'receive_offer',
  WELCOME: 'welcome',                     // gives an id to the user
}

// ------------------------------------
// Socket logic
// ------------------------------------
io.on('connection', socket => {
  console.log(`A new user connected: ${userId++}`);
  socket.emit(MESSAGES.WELCOME, { id: userId })

  socket.on(MESSAGES.SEND_DESCRIPTION, data => {
    io.sockets.emit(MESSAGES.RECEIVE_DESCRIPTION, data)
  })

  socket.on(MESSAGES.SEND_ICE_CANDIDATE, data => {
    io.sockets.emit(MESSAGES.RECEIVE_ICE_CANDIDATE, data)
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
