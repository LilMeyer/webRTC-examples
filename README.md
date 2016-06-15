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

## Start the server

You can optionally specify the running step and the port with `STEP` and `PORT`
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


## Step 3

Manage a list of connected users. The server keeps track of every socket with
[`clientSockets`](https://github.com/LilMeyer/webRTC-examples/blob/master/src/step3/index.js#L14).
All opened connections are stored on the client side [`peerConnectionById`](https://github.com/LilMeyer/webRTC-examples/blob/master/src/step3/public/js/main.js#L10).
Hence, once the connection is created for sending a message, we wouldn't have to
reinitialize the connection for backward communication.

## Tests

```bash
npm test
```
To run tests locally, you need chromium-browser.

For linux, follow these steps: http://stackoverflow.com/a/24364290/4388775.

For windows, follow these steps: http://stackoverflow.com/a/26561341/4388775.

Tests are inspired by webRTC utilities. I have to remove firefox beta and
unstable plus chrome unstable to make it pass with node version 6.
[sleep](https://github.com/erikdubbelboer/node-sleep) can't be built on Travis.


#### What percentage of users is supported ?

According to socket.io:

> It works on every platform, browser or device, focusing equally on reliability
> and speed.


#### How many users can connect to one server ?

Supposing it's in parallel, it [appears](http://stackoverflow.com/questions/15872788/maximum-concurrent-socket-io-connections) that socket.io can support up to about
1800 simultaneous connections with the server. Otherwise, SocketCluster [observes](http://socketcluster.io/#!/performance)
42K concurrent users from a single machine.

Finally, Daniel Kleveros [claims](https://www.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/)
to have handled 600k concurrent websocket connections.
For me, it really depends on the use case and the messages per second per
user but I don't see technical limitation.


#### How can the system support more users ?

To support more users, we could partition our user set by chosen groups. In real
case, it's unlikely that every user needs potentially to connect to any user
because they will not watch the same video for example. Hence, with a
persistence load balancing strategy, every request of the same user can be sent
to the same server.

#### How can I create my own stun server ?

Creating a stun server from scratch is a hard problem to tackle. However you can use this [open project](https://github.com/coturn/coturn) mainly written in C and follow the install instructions.


### References
 1. [WebRTC adapter - github.com](https://github.com/webrtc/adapter)
 2. [WebRTC utilities - github.com](https://github.com/webrtc/utilities)
 3. [A Dead Simple WebRTC Example - shanetully.com](https://shanetully.com/2014/09/a-dead-simple-webrtc-example/)
 4. [Session Description Protocal - wikipedia](https://en.wikipedia.org/wiki/Session_Description_Protocol)
 5. [WebRTC connectivity - developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
 6. [Using multiple nodes](http://socket.io/docs/using-multiple-nodes/)
 7. [600k concurrent websocket connections on AWS using Node.js](https://www.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/)
 8. [Maximum concurrent Socket.IO connections](http://stackoverflow.com/questions/15872788/maximum-concurrent-socket-io-connections)
