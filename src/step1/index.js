'use strict'

const express = require('express')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

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

