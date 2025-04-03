const getServerUrl = () => {
    // Use environment-based server URL
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // Replace this with your Render.com URL once deployed
    return 'https://chat-app-zev6.onrender.com';
};

const socket = io(getServerUrl());

function initializeSocket(roomCode, username) {
    return new Promise((resolve, reject) => {
        try {
            // Add timeout to prevent hanging
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 5000);

            socket.emit('join-room', { roomCode, username });

            socket.on('room-joined', (data) => {
                clearTimeout(timeout);
                resolve(data);
            });

            socket.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });

            // Clean up event listeners on error
            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
}

function sendMessage(message, roomCode, type = 'text') {
    socket.emit('send-message', { message, roomCode, type });
}

function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}
