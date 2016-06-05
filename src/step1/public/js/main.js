/**
 * Basic example
 * See: https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/basic/js/main.js
 */
'use strict';

function trace (text) {
  if (window.performance) {
    console.log((window.performance.now() / 1000).toFixed(3) + ': ' + text);
  } else {
    console.log(text);
  }
}

var localConnection, remoteConnection;
var sendChannel, receiveChannel;
var pcConstraint, dataConstraint;

var dataChannelSend = document.querySelector('textarea#dataChannelSend');
var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
var startButton = document.querySelector('button#startButton');
var sendButton = document.querySelector('button#sendButton');
var closeButton = document.querySelector('button#closeButton');

startButton.onclick = createConnection;

sendButton.onclick = () => {
  var data = dataChannelSend.value;
  sendChannel.send(data);
  trace('Sent Data: ' + data);
};

closeButton.onclick = closeDataChannels;

function enableStartButton() {
  startButton.disabled = false;
}

enableStartButton()
createConnection()

function disableSendButton() {
  sendButton.disabled = true;
}

function createConnection() {
  dataChannelSend.placeholder = '';
  var servers = null;
  pcConstraint = null;
  dataConstraint = null;
  trace('Using SCTP based data channels');
  // SCTP is supported from Chrome 31 and is supported in FF.
  // No need to pass DTLS constraint as it is on by default in Chrome 31.
  // For SCTP, reliable and ordered is true by default.
  // Add localConnection to global scope to make it visible
  // from the browser console.
  window.localConnection = localConnection =
    new RTCPeerConnection(servers, pcConstraint);
  trace('Created local peer connection object localConnection');

  sendChannel = localConnection.createDataChannel('sendDataChannel',
    dataConstraint);
  trace('Created send data channel');

  localConnection.onicecandidate = event => {
    trace('local ice callback');
    if (event.candidate) {
      trace('Local ICE candidate: \n' + event.candidate.candidate);
      remoteConnection.addIceCandidate(event.candidate)
        .then(() => trace('AddIceCandidate success.'))
        .catch(err => trace('Failed to add Ice Candidate: ' + err.toString()) )
    };
  };

  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  // Add remoteConnection to global scope to make it visible
  // from the browser console.
  window.remoteConnection = remoteConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created remote peer connection object remoteConnection');

  remoteConnection.onicecandidate = event => {
    trace('remote ice callback');
    if (event.candidate) {
      trace('Remote ICE candidate: \n ' + event.candidate.candidate);
      localConnection.addIceCandidate(event.candidate)
        .then(() => trace('AddIceCandidate success.'))
        .catch(err => trace('Failed to add Ice Candidate: ' + err.toString()))
    };
  };

  remoteConnection.ondatachannel = event => {
    trace('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.onmessage = event => {
      trace('Received Message');
      console.log('event.data +', event.data)
      dataChannelReceive.value = event.data;
    };

    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;
  };

  localConnection.createOffer()
    .then(offer => {
      trace('Offer from localConnection \n' + offer.sdp);
      document.getElementById('textarea_sdp').innerHTML = offer.sdp;
      document.getElementById('label_type').innerHTML = offer.type;
      localConnection.setLocalDescription(offer);
      remoteConnection.setRemoteDescription(offer);
      return remoteConnection.createAnswer()
    })
    .then(answer => {
      trace('Answer from remoteConnection \n' + answer.sdp);
      document.getElementById('textarea_sdp_r').innerHTML = answer.sdp;
      document.getElementById('label_type_r').innerHTML = answer.type;
      remoteConnection.setLocalDescription(answer);
      localConnection.setRemoteDescription(answer);
    })
    .catch(error => {
      trace('An error occured: ' + error.toString());
    });

  startButton.disabled = true;
  closeButton.disabled = false;
}

function closeDataChannels() {
  trace('Closing data channels');
  sendChannel.close();
  trace('Closed data channel with label: ' + sendChannel.label);
  receiveChannel.close();
  trace('Closed data channel with label: ' + receiveChannel.label);
  localConnection.close();
  remoteConnection.close();
  localConnection = null;
  remoteConnection = null;
  trace('Closed peer connections');
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
  disableSendButton();
  enableStartButton();
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  trace('Receive channel state is: ' + readyState);
}
