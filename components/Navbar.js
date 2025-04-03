function Navbar({ roomCode, username, onLeave }) {
    try {
        return (
            <nav data-name="navbar" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <i className="fas fa-comments text-2xl mr-2"></i>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">Chat Room</span>
                                <span className="text-xs opacity-75">Room Code: {roomCode}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <span className="bg-green-400 h-2 w-2 rounded-full mr-2"></span>
                                <span className="text-sm">{username}</span>
                            </div>
                            <button
                                data-name="leave-button"
                                onClick={onLeave}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200 flex items-center"
                            >
                                <i className="fas fa-sign-out-alt mr-2"></i>
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        );
    } catch (error) {
        console.error('Navbar component error:', error);
        reportError(error);
        return null;
    }
}
