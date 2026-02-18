import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Product } from './product.entity';

interface OperatingHours {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
}

@Entity('pickup_locations')
export class PickupLocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    postal_code: string;

    @Column({ nullable: true })
    country: string;

    // PostGIS geometry column for spatial queries
    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false
    })
    location: string; // In the format: POINT(longitude latitude)

    // Store latitude and longitude separately for easy access
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    longitude: number;

    @Column({ type: 'jsonb', nullable: true })
    operating_hours: OperatingHours;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    image_url: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations
    @OneToMany(() => Product, product => product.pickup_location)
    products: Product[];
}
