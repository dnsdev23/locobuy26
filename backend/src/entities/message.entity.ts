import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    is_read: boolean;

    @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @Column()
    conversation_id: string;

    @ManyToOne(() => User, user => user.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @Column()
    sender_id: string;

    @CreateDateColumn()
    created_at: Date;
}
