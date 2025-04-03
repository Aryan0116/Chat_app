function MessageInput({ roomCode }) {
    try {
        const [message, setMessage] = React.useState('');
        const [isUploading, setIsUploading] = React.useState(false);
        const fileInputRef = React.useRef(null);

        const handleSubmit = (e) => {
            e.preventDefault();
            if (message.trim()) {
                sendMessage(message, roomCode);
                setMessage('');
            }
        };

        const handleImageUpload = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    setIsUploading(true);
                    const imageData = await uploadImage(file);
                    sendMessage(imageData, roomCode, 'image');
                } catch (error) {
                    console.error('Image upload error:', error);
                } finally {
                    setIsUploading(false);
                }
            }
        };

        return (
            <form data-name="message-input-form" onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex items-center space-x-4">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    <button
                        data-name="upload-button"
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isUploading}
                    >
                        <i className="fas fa-image text-xl"></i>
                    </button>
                    <input
                        data-name="message-input"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        data-name="send-button"
                        type="submit"
                        className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                        disabled={!message.trim() || isUploading}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
                {isUploading && (
                    <div className="text-sm text-gray-500 mt-2">
                        Uploading image...
                    </div>
                )}
            </form>
        );
    } catch (error) {
        console.error('MessageInput component error:', error);
        reportError(error);
        return null;
    }
}
