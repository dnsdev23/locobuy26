import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum BlogPostType {
    SELLER_PROMO = 'seller_promo',
    BUYER_EXPERIENCE = 'buyer_experience',
}

@Entity('blog_posts')
export class BlogPost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    excerpt: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    cover_image_url: string;

    @Column({
        type: 'enum',
        enum: BlogPostType,
        default: BlogPostType.BUYER_EXPERIENCE,
    })
    type: BlogPostType;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({ default: true })
    is_published: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column()
    author_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
