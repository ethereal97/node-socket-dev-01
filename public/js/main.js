const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
let { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

let cookies = {
    update(key, value) {
        document.cookie = `${key}=${value}; expires=${(new Date(0)).toLocaleTimeString()}; path=/`;
    }
};

document.cookie
    .split(';')
    .filter(c => c.trim() != '')
    .forEach(cookie => {
        var key, value;
        [key, value] = cookie.split('=').map(c => c.trim());
        cookies[key] = value || null;
    });

if(room) {
    cookies.update('room', room);
} else {
    if (cookies.room) room = cookies.room;
    else location.assign('/?err=required-param-room');
}

if(username) {
    cookies.update('username', username);
} else {
    if (cookies.username) username = cookies.username;
    else location.assign('/?err=required-param-username');
}

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  
  msg = msg.trim();
  
  if (!msg){
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  if (message.username === username) {
      div.classList.add('self');
      message.username = '( you )';
  }
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.setAttribute('content', message.time);
  //p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);

  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);

  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';

  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

/* ethereal script */
// Check user is session
function checkSessionUser() {
    socket.emit('checkSessionUser', { username });
}

try {
    checkSessionUser()
} catch(e) {
    alert('ERROR::' + e.message);
}
