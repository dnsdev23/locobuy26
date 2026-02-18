import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket connected');
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    // Chat methods
    joinConversation(conversationId: string, userId: string) {
        this.getSocket().emit('join_conversation', {
            conversation_id: conversationId,
            user_id: userId,
        });
    }

    sendMessage(conversationId: string, senderId: string, content: string) {
        this.getSocket().emit('send_message', {
            conversation_id: conversationId,
            sender_id: senderId,
            content,
        });
    }

    markAsRead(conversationId: string, userId: string) {
        this.getSocket().emit('mark_read', {
            conversation_id: conversationId,
            user_id: userId,
        });
    }

    sendTyping(conversationId: string, userId: string, isTyping: boolean) {
        this.getSocket().emit('typing', {
            conversation_id: conversationId,
            user_id: userId,
            is_typing: isTyping,
        });
    }

    // Event listeners
    onNewMessage(callback: (message: any) => void) {
        this.getSocket().on('new_message', callback);
    }

    onUserTyping(callback: (data: { user_id: string; is_typing: boolean }) => void) {
        this.getSocket().on('user_typing', callback);
    }

    // Cleanup
    removeListener(event: string) {
        this.getSocket().off(event);
    }
}

export const socketService = new SocketService();
