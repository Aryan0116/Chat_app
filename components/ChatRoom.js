function ChatRoom({ roomCode, username, onLeave }) {
    try {
        const [messages, setMessages] = React.useState([]);
        const [users, setUsers] = React.useState([]);
        const [isVideoActive, setIsVideoActive] = React.useState(false);

        React.useEffect(() => {
            socket.on('message', (message) => {
                setMessages((prev) => [...prev, message]);
            });

            socket.on('users-update', (updatedUsers) => {
                setUsers(updatedUsers);
            });

            return () => {
                socket.off('message');
                socket.off('users-update');
            };
        }, []);

        return (
            <div data-name="chat-room" className="h-screen flex flex-col bg-gray-100">
                <Navbar roomCode={roomCode} username={username} onLeave={onLeave} />
                
                <div className="flex-1 container mx-auto px-4 py-6 flex flex-col space-y-4">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Video Chat
                            </h2>
                            <button
                                data-name="toggle-video-chat"
                                onClick={() => setIsVideoActive(!isVideoActive)}
                                className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                                    isVideoActive 
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                <i className={`fas fa-video${isVideoActive ? '-slash' : ''} mr-2`}></i>
                                {isVideoActive ? 'End Video' : 'Start Video'}
                            </button>
                        </div>
                        {isVideoActive && <VideoChat roomCode={roomCode} username={username} />}
                    </div>

                    <div className="flex-1 bg-white rounded-lg shadow-lg flex overflow-hidden">
                        <div className="flex-1 flex flex-col">
                            <MessageList messages={messages} currentUser={username} />
                            <MessageInput roomCode={roomCode} />
                        </div>
                        <UserList users={users} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('ChatRoom component error:', error);
        reportError(error);
        return null;
    }
}
