import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

export enum UserRole {
    BUYER = 'buyer',
    SELLER = 'seller',
    LOCAL_STORE = 'local_store'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.BUYER
    })
    role: UserRole;

    @Column({ nullable: true })
    avatar_url: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations
    @OneToMany(() => Product, product => product.seller)
    products: Product[];

    @OneToMany(() => Conversation, conversation => conversation.user1)
    conversations_as_user1: Conversation[];

    @OneToMany(() => Conversation, conversation => conversation.user2)
    conversations_as_user2: Conversation[];

    @OneToMany(() => Message, message => message.sender)
    messages: Message[];
}
