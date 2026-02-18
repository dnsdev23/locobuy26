import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';

interface SendMessageDto {
    conversation_id: string;
    sender_id: string;
    content: string;
}

interface JoinConversationDto {
    conversation_id: string;
    user_id: string;
}

@Injectable()
@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        // Remove user from active sockets
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @MessageBody() data: JoinConversationDto,
        @ConnectedSocket() client: Socket,
    ) {
        const { conversation_id, user_id } = data;

        // Store user's socket
        this.userSockets.set(user_id, client.id);

        // Join the conversation room
        client.join(conversation_id);

        console.log(`User ${user_id} joined conversation ${conversation_id}`);

        return { success: true };
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() data: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const { conversation_id, sender_id, content } = data;

        try {
            // Save message to database
            const message = this.messageRepository.create({
                conversation_id,
                sender_id,
                content,
                is_read: false,
            });

            const savedMessage = await this.messageRepository.save(message);

            // Update conversation's last_message_at
            await this.conversationRepository.update(
                { id: conversation_id },
                { last_message_at: new Date() }
            );

            // Load full message with relations
            const fullMessage = await this.messageRepository.findOne({
                where: { id: savedMessage.id },
                relations: ['sender'],
            });

            // Broadcast to all users in the conversation room
            this.server.to(conversation_id).emit('new_message', fullMessage);

            return { success: true, message: fullMessage };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('mark_read')
    async handleMarkRead(
        @MessageBody() data: { conversation_id: string; user_id: string },
    ) {
        const { conversation_id, user_id } = data;

        try {
            // Mark all messages in conversation as read (except sender's own messages)
            await this.messageRepository
                .createQueryBuilder()
                .update(Message)
                .set({ is_read: true })
                .where('conversation_id = :conversation_id', { conversation_id })
                .andWhere('sender_id != :user_id', { user_id })
                .execute();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() data: { conversation_id: string; user_id: string; is_typing: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        const { conversation_id, user_id, is_typing } = data;

        // Broadcast typing status to others in the conversation
        client.to(conversation_id).emit('user_typing', {
            user_id,
            is_typing,
        });
    }
}
