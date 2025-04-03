function JoinRoom({ onJoinRoom }) {
    try {
        const [username, setUsername] = React.useState('');
        const [roomCode, setRoomCode] = React.useState('');
        const [isCreating, setIsCreating] = React.useState(false);
        const [error, setError] = React.useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');

            if (!username.trim()) {
                setError('Username is required');
                return;
            }

            try {
                let finalRoomCode = roomCode;
                
                if (isCreating) {
                    // Generate a random room code when creating a new room
                    finalRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                } else {
                    // When joining, validate room code
                    if (!roomCode.trim()) {
                        setError('Room code is required');
                        return;
                    }
                    finalRoomCode = roomCode.toUpperCase();
                }

                // Initialize socket connection
                const result = await initializeSocket(finalRoomCode, username);
                
                if (result.success) {
                    onJoinRoom(finalRoomCode, username);
                } else {
                    setError('Failed to join room. Please try again.');
                }
            } catch (error) {
                console.error('Room join error:', error);
                setError('Failed to join room. Please try again.');
            }
        };

        return (
            <div data-name="join-room-container" className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Join a Chat Room
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            {isCreating ? 'Create a new room' : 'Join an existing room'}
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <input
                                    data-name="username-input"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            {!isCreating && (
                                <div>
                                    <input
                                        data-name="room-code-input"
                                        type="text"
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Room Code"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div data-name="error-message" className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <button
                                data-name="toggle-mode-button"
                                type="button"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                                onClick={() => {
                                    setIsCreating(!isCreating);
                                    setError('');
                                    setRoomCode('');
                                }}
                            >
                                {isCreating ? 'Join Existing Room' : 'Create New Room'}
                            </button>
                        </div>

                        <div>
                            <button
                                data-name="submit-button"
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isCreating ? 'Create Room' : 'Join Room'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    } catch (error) {
        console.error('JoinRoom component error:', error);
        reportError(error);
        return null;
    }
}
