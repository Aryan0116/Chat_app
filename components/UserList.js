function UserList({ users }) {
    try {
        return (
            <div data-name="user-list" className="w-64 bg-gray-50 border-l p-4">
                <h2 className="text-lg font-semibold mb-4">Online Users ({users.length})</h2>
                <div className="space-y-2">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            data-name="user-item"
                            className="flex items-center space-x-2"
                        >
                            <span className="online-indicator"></span>
                            <span className="text-sm">{user.username}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error('UserList component error:', error);
        reportError(error);
        return null;
    }
}
