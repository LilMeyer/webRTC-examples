Messaging system
================
[![Build Status](https://img.shields.io/travis/LilMeyer/webRTC-examples/master.svg?style=flat-square)](https://travis-ci.org/LilMeyer/webRTC-examples)
[![Dependency Status](https://img.shields.io/david/LilMeyer/webRTC-examples/master.svg?style=flat-square)](https://david-dm.org/lilmeyer/webRTC-examples)

These examples illustrate how the WebRTC technologies are working. For a better
understanding, I decided to split the development into several steps.

## Installation

```bash
npm install
```

## Start the server

You can optionally specify the running step and the port with STEP and PORT
variables:

```bash
export STEP=2    # 3 by default
export PORT=8088 # 8080 by default
```

Launch the server:
```bash
npm start
```

Concerning `adapter.js`:

> `adapter.js` is a shim to insulate apps from spec changes and prefix differences.

It ensures the uniformity of WebRTC functionalities through all browsers.


## Step 1

This is the heart of the communication process, inspired by
[this example](https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/basic/js/main.js).
The communication is only inside one page. We can see the Session Description
Protocol for the offer and the answer. There is no communication through the
server, it's only inside the browser's page.


 * `localConnection = new RTCPeerConnection`
 * `remoteConnection = new RTCPeerConnection`
 * `createDataChannel`
 * `onicecandidate - handle ice candidate`
  - `remoteConnection.addIceCandidate(event.candidate)`
 * `localConnection.createOffer -> offer`
  - `localConnection.setLocalDescription(offer)`
  - `remoteConnection.setRemoteDescription(offer)`
 * `remoteConnection.createAnswer -> answer`
  - `remoteConnection.setLocalDescription(answer)`
  - `localConnection.setRemoteDescription(answer)`

## Step 2

Implementation of [socket.io](http://socket.io/) for the client-server
communication. This works only when 2 users are connected. Each user's `id` is
given by the server to respect unicity. As all variables are stored in memory,
only one server at a time can be launched, and every restart will clear all
variables.


## Step 3

Manage a list of connected users. The server keeps track of every socket with
[`clientSockets`](https://github.com/LilMeyer/webRTC-examples/blob/master/src/step3/index.js#L14).
All opened connections are stored on the client side [`peerConnectionById`](https://github.com/LilMeyer/webRTC-examples/blob/master/src/step3/public/js/main.js#L10).
Hence, once the connection is created for sending a message, we wouldn't have to
reinitialize the connection for backward communication.

## Tests

```bash
npm test
```
Tests are inspired by webRTC utilities. I have to remove firefox beta and
unstable plus chrome unstable to make it pass with node version 6.


### References
 1. [WebRTC adapter - github.com](https://github.com/webrtc/adapter)
 2. [WebRTC utilities - github.com](https://github.com/webrtc/utilities)
 3. [A Dead Simple WebRTC Example - shanetully.com](https://shanetully.com/2014/09/a-dead-simple-webrtc-example/)
 4. [Session Description Protocal - wikipedia](https://en.wikipedia.org/wiki/Session_Description_Protocol)
 5. [WebRTC connectivity - developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
 6. [Using multiple nodes](http://socket.io/docs/using-multiple-nodes/)
