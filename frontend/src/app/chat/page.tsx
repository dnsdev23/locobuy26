'use client';

import { useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { MessageCircle, X } from 'lucide-react';

export default function ChatPage() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

    // Mock data - in real app, fetch from API
    const conversations = [
        {
            id: 'conv-1',
            otherUser: {
                id: 'user-2',
                name: 'Sarah Johnson',
                avatar_url: undefined,
            },
            lastMessage: 'Is the product still available?',
            lastMessageTime: '2:30 PM',
            unread: 2,
        },
        {
            id: 'conv-2',
            otherUser: {
                id: 'user-3',
                name: 'Mike Chen',
                avatar_url: undefined,
            },
            lastMessage: 'Thanks for the quick response!',
            lastMessageTime: '1:15 PM',
            unread: 0,
        },
    ];

    const currentUserId = 'user-1'; // In real app, get from auth context

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-500 p-2 rounded-xl">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                    {/* Conversations List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900">Conversations</h2>
                        </div>
                        <div className="overflow-y-auto h-[calc(100%-60px)]">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${selectedConversation === conv.id ? 'bg-primary-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                                            {conv.otherUser.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {conv.otherUser.name}
                                                </h3>
                                                <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                                        </div>
                                        {conv.unread > 0 && (
                                            <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {conv.unread}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2">
                        {selectedConversation ? (
                            <ChatWindow
                                conversationId={selectedConversation}
                                currentUserId={currentUserId}
                                otherUser={
                                    conversations.find((c) => c.id === selectedConversation)!.otherUser
                                }
                            />
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg h-full flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-lg font-medium">Select a conversation</p>
                                    <p className="text-sm">Choose a chat from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
