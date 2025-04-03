function MessageList({ messages, currentUser }) {
    try {
        const messagesEndRef = React.useRef(null);

        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        React.useEffect(() => {
            scrollToBottom();
        }, [messages]);

        return (
            <div data-name="message-list" className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        data-name="message-item"
                        className={`flex ${msg.username === currentUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`message-bubble ${
                                msg.username === currentUser
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <div className="text-sm font-semibold mb-1">{msg.username}</div>
                            {msg.type === 'image' ? (
                                <img
                                    src={msg.content}
                                    alt="Shared image"
                                    className="message-image"
                                    loading="lazy"
                                />
                            ) : (
                                <p className="text-sm">{msg.content}</p>
                            )}
                            <div className="text-xs opacity-75 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        );
    } catch (error) {
        console.error('MessageList component error:', error);
        reportError(error);
        return null;
    }
}
