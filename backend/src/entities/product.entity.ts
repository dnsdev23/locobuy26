import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PickupLocation } from './pickup-location.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    external_link: string; // For AI Smart Import feature

    @Column({ type: 'simple-array', nullable: true })
    image_urls: string[];

    @Column({ default: true })
    is_available: boolean;

    // Seller
    @ManyToOne(() => User, user => user.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'seller_id' })
    seller: User;

    @Column()
    seller_id: string;

    // Pickup Location
    @ManyToOne(() => PickupLocation, location => location.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pickup_location_id' })
    pickup_location: PickupLocation;

    @Column()
    pickup_location_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
