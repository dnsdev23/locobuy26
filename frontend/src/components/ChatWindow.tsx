'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { socketService } from '@/lib/socket';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender: {
        id: string;
        name: string;
        avatar_url?: string;
    };
}

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    otherUser: {
        id: string;
        name: string;
        avatar_url?: string;
    };
}

export default function ChatWindow({ conversationId, currentUserId, otherUser }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Connect to socket and join conversation
        const socket = socketService.connect();
        socketService.joinConversation(conversationId, currentUserId);

        // Listen for new messages
        socketService.onNewMessage((message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        // Listen for typing indicator
        socketService.onUserTyping((data) => {
            if (data.user_id !== currentUserId) {
                setIsTyping(data.is_typing);
            }
        });

        return () => {
            socketService.removeListener('new_message');
            socketService.removeListener('user_typing');
        };
    }, [conversationId, currentUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        socketService.sendMessage(conversationId, currentUserId, newMessage);
        setNewMessage('');
        setIsSending(false);

        // Stop typing indicator
        socketService.sendTyping(conversationId, currentUserId, false);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Send typing indicator
        socketService.sendTyping(conversationId, currentUserId, true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            socketService.sendTyping(conversationId, currentUserId, false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-primary-500 text-white p-4 flex items-center gap-3">
                {otherUser.avatar_url ? (
                    <img
                        src={otherUser.avatar_url}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold">{otherUser.name}</h3>
                    {isTyping && <p className="text-sm text-primary-100">typing...</p>}
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.sender_id === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${isOwn
                                                ? 'bg-primary-500 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                            }`}
                                    >
                                        <p className="break-words">{message.content}</p>
                                    </div>
                                    <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                        {new Date(message.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        disabled={isSending}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
