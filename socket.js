const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const botName = 'ChatCord Bot';

const storage = {
    users: {
        accounts: new Array,
        indexes: new Object,
        get length() {
            return this.accounts.length;
        }
    }
};

let io;

module.exports = function(server) {
    io = socketio(server);

    // Run when client connects
    io.on('connection', socket => {
        socket.on('joinRoom', ({ username, room }) => {
            const user = userJoin(socket.id, username, room);

            storage.users.accounts.push(user);
            socket.join(user.room);

            // Welcome current user
            socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

            // Broadcast when a user connects
            socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        });

        // Listen for chatMessage
        socket.on('chatMessage', msg => {
            const user = getCurrentUser(socket.id);

            io.to(user.room).emit('message', formatMessage(user.username, msg));
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if (user) {
                io.to(user.room).emit( 'message', formatMessage(botName, `${user.username} has left the chat`));

                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });

        console.log(storage, socket.handshake.headers, socket.id);
        socket.on('checkSessionUser', ({ username }) => {
            console.log(username);
        });
    });
}
