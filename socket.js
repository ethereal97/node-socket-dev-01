const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const botName = 'ChatCord Bot';

const app = {
    user: {
        accounts: new Array,
        indexes: new Object,
        connect(id, name, room) {
            let account = {
                id,
                name,
                room
            };
            this.indexes[id] = this.accounts.length;
            this.accounts.push(account);
        },
        disconnect(id) {
            if (!id in this.indexes) {
                return true;;
            }
            var i = this.indexes[id];
            delete this.accounts[i];
            delete this.indexes[id];
            
            this.accounts = this.accounts
                .filter(account => account !== null);

            return true;
        },
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
            app.user.connect(socket.id, username, room);
            console.log(username, socket.id, room)
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

            app.user.disconnect(socket.id);
            
            if (user) {
                io.to(user.room).emit( 'message', formatMessage(botName, `${user.username} has left the chat`));

                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });

        socket.on('checkSessionUser', ({ username }) => {
            console.log(username);
            console.log(app);
        });
    });
}
