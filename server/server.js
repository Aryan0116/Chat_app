const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

// Trust proxy for Render.com
app.set('trust proxy', 1);

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-room', ({ roomCode, username }) => {
        try {
            socket.join(roomCode);
            
            if (!rooms.has(roomCode)) {
                rooms.set(roomCode, new Map());
            }
            
            const roomUsers = rooms.get(roomCode);
            roomUsers.set(socket.id, { id: socket.id, username });

            io.to(roomCode).emit('users-update', Array.from(roomUsers.values()));
            socket.emit('room-joined', { success: true });

            socket.to(roomCode).emit('message', {
                type: 'text',
                content: `${username} has joined the room`,
                username: 'System',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', 'Failed to join room');
        }
    });

    socket.on('ready', (roomCode) => {
        socket.to(roomCode).emit('user-connected', socket.id);
    });

    socket.on('offer', ({ offer, to, roomCode }) => {
        socket.to(to).emit('offer', {
            offer,
            from: socket.id,
            roomCode
        });
    });

    socket.on('answer', ({ answer, to, roomCode }) => {
        socket.to(to).emit('answer', {
            answer,
            from: socket.id,
            roomCode
        });
    });

    socket.on('ice-candidate', ({ candidate, to, roomCode }) => {
        socket.to(to).emit('ice-candidate', {
            candidate,
            from: socket.id,
            roomCode
        });
    });

    socket.on('send-message', ({ message, roomCode, type }) => {
        try {
            const roomUsers = rooms.get(roomCode);
            const user = roomUsers?.get(socket.id);
            
            if (user) {
                io.to(roomCode).emit('message', {
                    type,
                    content: message,
                    username: user.username,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('leave-room', ({ roomCode, username }) => {
        try {
            socket.leave(roomCode);
            const roomUsers = rooms.get(roomCode);
            
            if (roomUsers) {
                roomUsers.delete(socket.id);
                
                if (roomUsers.size === 0) {
                    rooms.delete(roomCode);
                } else {
                    io.to(roomCode).emit('users-update', Array.from(roomUsers.values()));
                    io.to(roomCode).emit('message', {
                        type: 'text',
                        content: `${username} has left the room`,
                        username: 'System',
                        timestamp: new Date()
                    });
                }
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    });

    socket.on('disconnect', () => {
        try {
            rooms.forEach((users, roomCode) => {
                const user = users.get(socket.id);
                if (user) {
                    users.delete(socket.id);
                    if (users.size === 0) {
                        rooms.delete(roomCode);
                    } else {
                        io.to(roomCode).emit('users-update', Array.from(users.values()));
                        io.to(roomCode).emit('message', {
                            type: 'text',
                            content: `${user.username} has disconnected`,
                            username: 'System',
                            timestamp: new Date()
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
