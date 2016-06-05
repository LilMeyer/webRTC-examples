'use strict';

// ------------------------------------
// Variables
// ------------------------------------
let peerConnection;
let socket, sendChannel, receiveChannel;
let userId;

const MESSAGES = {
  SEND_ICE_CANDIDATE: 'send_ice_candidate',
  RECEIVE_ICE_CANDIDATE: 'receive_ice_candidate',
  SEND_DESCRIPTION: 'send_description',
  RECEIVE_DESCRIPTION: 'receive_description',
  WELCOME: 'welcome',                     // gives an id to the user
}

var peerConnectionConfig = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
  ]
};


// ------------------------------------
// Elements
// ------------------------------------
const sendButton = document.getElementById('send_message_button');
const textAreaSend = document.getElementById('data_channel_send');
const textAreaReceive = document.getElementById('data_channel_receive');
const textAreaSdp = document.getElementById('textarea_sdp');
const textAreaSdpRec = document.getElementById('textarea_sdp_r');
const labelSdp = document.getElementById('label_type');
const labelSdpRec = document.getElementById('label_type_r');

// ------------------------------------
// Helpers
// ------------------------------------
function sendMessage() {
  console.log('sendMessage:', textAreaSend.value)
  sendChannel.send(textAreaSend.value)
}


function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit(MESSAGES.SEND_ICE_CANDIDATE, JSON.stringify({
        ice: event.candidate,
        userId: userId
      }))
    }
  };

  sendChannel = peerConnection.createDataChannel('sendDataChannel', null);
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  peerConnection.ondatachannel = event => {
    receiveChannel = event.channel;
    receiveChannel.onmessage = event => {
      console.log('Message received:', event.data)
      textAreaReceive.value = event.data;
    };
  }

  sendChannel.onmessage = event => {
    console.log('Receive data from sendChannel', event.data)
    textAreaReceive.value = event.data;
  };

  if (isCaller) {
    peerConnection.createOffer()
      .then(createdDescription)
      .catch(errorHandler);
  }
}

function createdDescription(description) {
  console.log('got description');

  peerConnection.setLocalDescription(description)
  .then(() => {
    // serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
    socket.emit(MESSAGES.SEND_DESCRIPTION, JSON.stringify({
      sdp: peerConnection.localDescription,
      userId: userId
    }));
  })
  .catch(errorHandler);
}

function errorHandler(error) {
  console.log('error', error);
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  console.log('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    sendButton.disabled = false;
    textAreaSend.disabled = false;
  } else {
    sendButton.disabled = true;
    textAreaSend.disabled = true;
  }
}

// ------------------------------------
// Socket logic
// ------------------------------------
socket = io();

socket.on(MESSAGES.RECEIVE_DESCRIPTION, dataString => {
  if (!peerConnection) {
    start(false);
    console.log('receive_description whereas peerConnection is null');
  }
  var data = JSON.parse(dataString);
  if (data.userId === userId) return;

  if (data.sdp.type === 'offer') {
    textAreaSdp.innerHTML = data.sdp.sdp;
    labelSdp.innerHTML = data.sdp.type;
  }
  if (data.sdp.type === 'answer') {
    textAreaSdpRec.innerHTML = data.sdp.sdp;
    labelSdpRec.innerHTML = data.sdp.type;
  }

  peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
    .then(() => {
      // Only create answers in response to offers
      if (data.sdp.type === 'offer') {
        peerConnection.createAnswer()
          .then(createdDescription)
          .catch(errorHandler);
      }
    })
    .catch(errorHandler);
})

socket.on(MESSAGES.RECEIVE_ICE_CANDIDATE, dataString => {
  // Should not happen
  if (!peerConnection) {
    start(false);
    console.log('receive_ice_candidate whereas peerConnection is null');
  }

  var data = JSON.parse(dataString);
  if (data.userId === userId) return;

  peerConnection.addIceCandidate(new RTCIceCandidate(data.ice))
    .catch(errorHandler);
})
