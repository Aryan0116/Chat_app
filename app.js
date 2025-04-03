function App() {
    try {
        const [roomState, setRoomState] = React.useState({
            isInRoom: false,
            roomCode: '',
            username: ''
        });

        const handleJoinRoom = (roomCode, username) => {
            setRoomState({
                isInRoom: true,
                roomCode,
                username
            });
        };

        const handleLeaveRoom = () => {
            setRoomState({
                isInRoom: false,
                roomCode: '',
                username: ''
            });
        };

        return (
            <div data-name="app-container">
                {!roomState.isInRoom ? (
                    <JoinRoom onJoinRoom={handleJoinRoom} />
                ) : (
                    <ChatRoom
                        roomCode={roomState.roomCode}
                        username={roomState.username}
                        onLeave={handleLeaveRoom}
                    />
                )}
            </div>
        );
    } catch (error) {
        console.error('App component error:', error);
        reportError(error);
        return null;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
