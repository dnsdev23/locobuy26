import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.conversations_as_user1, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user1_id' })
    user1: User;

    @Column()
    user1_id: string;

    @ManyToOne(() => User, user => user.conversations_as_user2, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user2_id' })
    user2: User;

    @Column()
    user2_id: string;

    @Column({ type: 'timestamp', nullable: true })
    last_message_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations
    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];
}
