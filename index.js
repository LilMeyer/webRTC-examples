'use strict'

const STEP = process.env.STEP || 3
const PORT = process.env.PORT || 8080

const server = require(`./src/step${STEP}`)
server.start(PORT)
