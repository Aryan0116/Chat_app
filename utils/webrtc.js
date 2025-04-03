const peerConnections = new Map();
const mediaConstraints = {
    video: true,
    audio: true
};

let localStream = null;

async function initializeWebRTC(roomCode) {
    try {
        localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        socket.emit('ready', roomCode);
        
        // Set up socket listeners for WebRTC signaling
        socket.on('user-connected', async (userId) => {
            console.log('User connected:', userId);
            const pc = createPeerConnection(userId, roomCode);
            
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', {
                    offer,
                    to: userId,
                    roomCode
                });
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        });

        socket.on('offer', async ({ offer, from, roomCode }) => {
            console.log('Received offer from:', from);
            await handleOffer(offer, from, roomCode);
        });

        socket.on('answer', async ({ answer, from }) => {
            console.log('Received answer from:', from);
            await handleAnswer(answer, from);
        });

        socket.on('ice-candidate', ({ candidate, from }) => {
            console.log('Received ICE candidate from:', from);
            handleIceCandidate(candidate, from);
        });

        return localStream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
}

function createPeerConnection(remoteUserId, roomCode) {
    try {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: remoteUserId,
                    roomCode
                });
            }
        };

        pc.ontrack = event => {
            console.log('Received remote track');
            const stream = event.streams[0];
            dispatchEvent(new CustomEvent('remote-stream', { 
                detail: { stream, userId: remoteUserId }
            }));
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
        };

        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        peerConnections.set(remoteUserId, pc);
        return pc;
    } catch (error) {
        console.error('Error creating peer connection:', error);
        throw error;
    }
}

async function handleOffer(offer, remoteUserId, roomCode) {
    try {
        console.log('Handling offer from:', remoteUserId);
        const pc = createPeerConnection(remoteUserId, roomCode);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { answer, to: remoteUserId, roomCode });
    } catch (error) {
        console.error('Error handling offer:', error);
    }
}

async function handleAnswer(answer, remoteUserId) {
    try {
        console.log('Handling answer from:', remoteUserId);
        const pc = peerConnections.get(remoteUserId);
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    } catch (error) {
        console.error('Error handling answer:', error);
    }
}

function handleIceCandidate(candidate, remoteUserId) {
    try {
        console.log('Handling ICE candidate for:', remoteUserId);
        const pc = peerConnections.get(remoteUserId);
        if (pc) {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
    }
}

function closeVideoCall() {
    try {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }

        peerConnections.forEach(pc => {
            pc.close();
        });
        peerConnections.clear();

        // Remove WebRTC socket listeners
        socket.off('user-connected');
        socket.off('offer');
        socket.off('answer');
        socket.off('ice-candidate');
    } catch (error) {
        console.error('Error closing video call:', error);
    }
}

function toggleTrack(type) {
    if (!localStream) return false;
    
    const track = localStream.getTracks().find(t => t.kind === type);
    if (track) {
        track.enabled = !track.enabled;
        return track.enabled;
    }
    return false;
}
