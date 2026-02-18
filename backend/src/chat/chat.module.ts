import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Message, Conversation])],
    providers: [ChatGateway],
})
export class ChatModule { }
