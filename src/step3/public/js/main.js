'use strict';

// ------------------------------------
// Variables
// ------------------------------------
let peerConnection;
let socket, sendChannel, receiveChannel;
let userId, selectedUserId;

let peerConnectionById = new Map();
let sendChannelById = new Map();

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
};

const peerConnectionConfig = {
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
const connectedUsersUl = document.getElementById('connected_users_ul');
const labelId = document.getElementById('your_id');
const messageDiv = document.getElementById('messages_div');

// ------------------------------------
// Helpers
// ------------------------------------
function sendMessage() {
  console.log('sendMessage:', textAreaSend.value)
  sendChannelById.get(selectedUserId).send(textAreaSend.value)
}

function updateConnectedUserList(list) {
  connectedUsersUl.innerHTML = '';
  for (let i = 0, l = list.length; i < l; i++) {
    if (list[i] === userId) {
      continue;
    }
    let li = document.createElement('li');
    li.id = list[i] + '_li';
    li.onclick = connectToUser(list[i]);
    li.appendChild(document.createTextNode(list[i]));
    connectedUsersUl.appendChild(li);
  }
}

function selectConnectedUser(id) {
  let listLi = document.getElementsByTagName('li');
  for (let i = 0, l = listLi.length; i < l; i++) {
    listLi[i].style.backgroundColor = 'silver';
  }
  document.getElementById(id + '_li').style.backgroundColor = 'green';
}


function connectToUser(id) {
  return function (e) {
    selectedUserId = id;
    selectConnectedUser(id);
    startConnectionWith(true, id);
  }
}

function startConnectionWith(isCaller, to) {
  let connection, sendChannel;
  if (!peerConnectionById.has(to)) {
    connection = new RTCPeerConnection(peerConnectionConfig);
    connection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit(MESSAGES.SEND_ICE_CANDIDATE, JSON.stringify({
          ice: event.candidate,
          userId: userId,
          from: userId,
          to,
        }));
      }
    };

    sendChannel = connection.createDataChannel('sendDataChannel', null);
    sendChannel.onopen = onSendChannelByIdStateChange(to);
    sendChannel.onclose = onSendChannelByIdStateChange(to);

    connection.ondatachannel = event => {
      receiveChannel = event.channel;
      receiveChannel.onmessage = event => {
        console.log('Message received:', event.data);
        textAreaReceive.value = event.data;
        let p = document.createElement('p');
        p.innerHTML = `From ${to}:  ${event.data}`;
        messageDiv.appendChild(p);
      };
    }

    sendChannel.onmessage = event => {
      console.log('Receive data from sendChannel', event.data)
      textAreaReceive.value = event.data;
    };

    peerConnectionById.set(to, connection);
    sendChannelById.set(to, sendChannel);
  } else {
    connection = peerConnectionById.get(to);
  }

  if (isCaller) {
    connection.createOffer()
      .then(description => {
        createdDescription(description, to);
      })
      .catch(err => {
        console.log('An error occured', err)
      });
  }

}

function createdDescription(description, to) {
  if (peerConnectionById.has(to)) {
    let connection = peerConnectionById.get(to)
    connection
      .setLocalDescription(description)
      .then(() => {
        socket.emit(MESSAGES.SEND_DESCRIPTION, JSON.stringify({
          sdp: connection.localDescription,
          userId,
          from: userId,
          to
        }));
      })
      .catch(err => {
        console.log('An error occured +', err);
      })
  }

}

function onSendChannelByIdStateChange(id) {
  return () => {
    const sendChannel = sendChannelById.get(id)
    const readyState = sendChannel.readyState;
    console.log('Send channel state is: ' + readyState);
    if (readyState === 'open') {
      sendButton.disabled = false;
      textAreaSend.disabled = false;
    } else {
      sendButton.disabled = true;
      textAreaSend.disabled = true;
    }
  }
}


// ------------------------------------
// Socket logic
// ------------------------------------
socket = io();

socket.on(MESSAGES.WELCOME, data => {
  console.log('welcome received', data);
  userId = data.id;
  labelId.innerHTML = 'Your id: ' + userId;
  updateConnectedUserList(data.connectedUsers);
});

socket.on(MESSAGES.LOADING_USER_LIST, function (data) {
  updateConnectedUserList(data.connectedUsers);
});

socket.on(MESSAGES.RECEIVE_DESCRIPTION, dataString => {
  const data = JSON.parse(dataString);

  if (!peerConnectionById.has(data.from)) {
    startConnectionWith(false, data.from);
  }

  if (data.userId === userId) return;

  const connection = peerConnectionById.get(data.from);
  if (connection) {
    connection.setRemoteDescription(new RTCSessionDescription(data.sdp))
      .then(() => {
        // Only create answers in response to offers
        if (data.sdp.type === 'offer') {
          connection.createAnswer()
            .then(description => {
              // Receive description
              console.log('Receive description data +', data);
              createdDescription(description, data.from);
            })
            .catch(err => {
              console.log('An error occured', err);
            });
        }
      })
      .catch(err => {
        console.log('An error occured', err);
      });
  }
})

socket.on(MESSAGES.RECEIVE_ICE_CANDIDATE, dataString => {
  const data = JSON.parse(dataString);

  if (data.userId === userId) return;
  let connection = peerConnectionById.get(data.from);
  if (connection) {
    connection.addIceCandidate(new RTCIceCandidate(data.ice))
      .catch(err => {
        console.log('An error occured', err);
      });
  }

})

window.onbeforeunload = e => {
  socket.emit(MESSAGES.EXIT, { id: userId });
}
