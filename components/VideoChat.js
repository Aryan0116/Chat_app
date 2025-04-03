function VideoChat({ roomCode, username }) {
    try {
        const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
        const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
        const [streams, setStreams] = React.useState(new Map());
        const [error, setError] = React.useState('');
        const localVideoRef = React.useRef();

        React.useEffect(() => {
            let mounted = true;

            const initVideo = async () => {
                try {
                    const stream = await initializeWebRTC(roomCode);
                    if (mounted) {
                        if (localVideoRef.current) {
                            localVideoRef.current.srcObject = stream;
                        }
                        setStreams(new Map([[username, stream]]));
                    }
                } catch (error) {
                    console.error('Failed to initialize video:', error);
                    setError('Failed to access camera/microphone. Please check permissions.');
                }
            };

            const handleRemoteStream = (event) => {
                const { stream, userId } = event.detail;
                console.log('Received remote stream from:', userId);
                setStreams(prev => new Map(prev).set(userId, stream));
            };

            window.addEventListener('remote-stream', handleRemoteStream);
            initVideo();

            return () => {
                mounted = false;
                window.removeEventListener('remote-stream', handleRemoteStream);
                closeVideoCall();
            };
        }, [roomCode]);

        const toggleVideo = () => {
            const newState = toggleTrack('video');
            setIsVideoEnabled(newState);
        };

        const toggleAudio = () => {
            const newState = toggleTrack('audio');
            setIsAudioEnabled(newState);
        };

        if (error) {
            return (
                <div data-name="video-error" className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Video Chat Error
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div data-name="video-chat" className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="video-grid">
                    <div className="video-container">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="local-video"
                        />
                        <div className="username-label">You</div>
                        <div className="video-controls">
                            <button
                                data-name="toggle-video"
                                className={`video-button ${!isVideoEnabled ? 'active' : ''}`}
                                onClick={toggleVideo}
                            >
                                <i className={`fas fa-video${!isVideoEnabled ? '-slash' : ''}`}></i>
                            </button>
                            <button
                                data-name="toggle-audio"
                                className={`video-button ${!isAudioEnabled ? 'active' : ''}`}
                                onClick={toggleAudio}
                            >
                                <i className={`fas fa-microphone${!isAudioEnabled ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                    </div>
                    {Array.from(streams.entries()).map(([userId, stream]) => (
                        userId !== username && (
                            <div key={userId} className="video-container">
                                <video
                                    autoPlay
                                    playsInline
                                    ref={el => {
                                        if (el && el.srcObject !== stream) {
                                            el.srcObject = stream;
                                        }
                                    }}
                                />
                                <div className="username-label">{userId}</div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error('VideoChat component error:', error);
        reportError(error);
        return null;
    }
}
