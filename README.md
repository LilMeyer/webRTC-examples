Messaging system
================
[![Build Status](https://img.shields.io/travis/LilMeyer/webRTC-examples/master.svg?style=flat-square)](https://travis-ci.org/LilMeyer/webRTC-examples)
[![Dependency Status](https://img.shields.io/david/LilMeyer/webRTC-examples/master.svg?style=flat-square)](https://david-dm.org/lilmeyer/webRTC-examples)

For a better understanding, I decided to split the development into several
steps.

## Step 1

This is the heart of the communication process, inspired by
[this example](https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/basic/js/main.js).
The communication is only inside one page. We can see the Session Description
Protocol for the offer and the answer. There is no communication through the
server, it's only inside the browser's page.


 * localConnection = new RTCPeerConnection
 * remoteConnection = new RTCPeerConnection
 * createDataChannel
 * onicecandidate - handle ice candidate
  - remoteConnection.addIceCandidate(event.candidate)
 * localConnection.createOffer -> offer
  - localConnection.setLocalDescription(offer)
  - remoteConnection.setRemoteDescription(offer)
 * remoteConnection.createAnswer -> answer
  - remoteConnection.setLocalDescription(answer)
  - localConnection.setRemoteDescription(answer)

## Step 2

Implementation of [socket.io](http://socket.io/) for the client-server
communication. This works only when 2 users are connected.



### References
 1. [WebRTC adapter - github.com](https://github.com/webrtc/adapter)
 2. [WebRTC utilities - github.com](https://github.com/webrtc/utilities)
 3. [A Dead Simple WebRTC Example - shanetully.com](https://shanetully.com/2014/09/a-dead-simple-webrtc-example/)
 4. [Session Description Protocal - wikipedia](https://en.wikipedia.org/wiki/Session_Description_Protocol)
 5. [WebRTC connectivity - developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
