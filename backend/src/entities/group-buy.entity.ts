import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum GroupBuyStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    EXPIRED = 'expired'
}

@Entity('group_buys')
export class GroupBuy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int' })
    target_quantity: number;

    @Column({ type: 'int', default: 0 })
    current_quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price_per_unit: number;

    @Column({ type: 'timestamp' })
    start_time: Date;

    @Column({ type: 'timestamp' })
    end_time: Date;

    @Column({
        type: 'enum',
        enum: GroupBuyStatus,
        default: GroupBuyStatus.ACTIVE
    })
    status: GroupBuyStatus;

    // Related Product
    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    product_id: string;

    // Organizer
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizer_id' })
    organizer: User;

    @Column()
    organizer_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
