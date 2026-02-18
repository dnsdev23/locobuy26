import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { PickupLocation } from '../entities/pickup-location.entity';
import { Product } from '../entities/product.entity';
import { GroupBuy, GroupBuyStatus } from '../entities/group-buy.entity';
import { DataSource } from 'typeorm';

@Controller('seed')
export class SeedController {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(PickupLocation)
        private locationRepository: Repository<PickupLocation>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(GroupBuy)
        private groupBuyRepository: Repository<GroupBuy>,
        private dataSource: DataSource,
    ) { }

    @Post()
    async seed(@Body() body: { latitude?: number; longitude?: number }) {
        const centerLat = body.latitude ? Number(body.latitude) : 40.7128;
        const centerLng = body.longitude ? Number(body.longitude) : -74.0060;

        try {
            // Clear existing data using TRUNCATE
            await this.dataSource.query('TRUNCATE TABLE group_buys, products, pickup_locations, users RESTART IDENTITY CASCADE');

            // Create Users
            const hashedPassword = await bcrypt.hash('password123', 10);

            const buyer1 = await this.userRepository.save({
                email: 'buyer@example.com',
                password: hashedPassword,
                name: 'John Buyer',
                phone: '+1234567890',
                role: UserRole.BUYER,
                is_active: true,
            });

            const seller1 = await this.userRepository.save({
                email: 'seller1@example.com',
                password: hashedPassword,
                name: 'Sarah Electronics',
                phone: '+1234567891',
                role: UserRole.SELLER,
                bio: 'Electronics seller',
                is_active: true,
            });

            const seller2 = await this.userRepository.save({
                email: 'seller2@example.com',
                password: hashedPassword,
                name: 'Mikes Books',
                phone: '+1234567892',
                role: UserRole.SELLER,
                bio: 'Bookstore owner',
                is_active: true,
            });

            const localStore = await this.userRepository.save({
                email: 'store@example.com',
                password: hashedPassword,
                name: 'Downtown Market',
                phone: '+1234567893',
                role: UserRole.LOCAL_STORE,
                bio: 'Community marketplace',
                is_active: true,
            });

            // Create Locations with geometry - Centered around user or default NYC

            // Location 1: Main Hub (At Center)
            const [loc1Result] = await this.dataSource.query(`
                INSERT INTO pickup_locations (name, address, city, postal_code, country, latitude, longitude, location, operating_hours, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8, 4326), $9, $10)
                RETURNING *
            `, [
                body.latitude ? 'Your Local Hub' : 'Downtown Market',
                body.latitude ? 'Your Coordinates' : '123 Main St, New York, NY 10001',
                body.latitude ? 'Your City' : 'New York',
                '10001', 'USA',
                centerLat, centerLng,
                `POINT(${centerLng} ${centerLat})`,
                JSON.stringify({ monday: '9:00-18:00' }), true
            ]);
            const loc1 = loc1Result;

            // Location 2: Nearby Store (Offset approx 400m North)
            const lat2 = centerLat + 0.004;
            const lng2 = centerLng;
            const [loc2Result] = await this.dataSource.query(`
                INSERT INTO pickup_locations (name, address, city, postal_code, country, latitude, longitude, location, operating_hours, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8, 4326), $9, $10)
                RETURNING *
            `, [
                body.latitude ? 'Neighborhood Store' : 'Brooklyn Hub',
                body.latitude ? 'Just North' : '456 Brooklyn Ave, Brooklyn, NY 11201',
                body.latitude ? 'Your City' : 'Brooklyn',
                '11201', 'USA',
                lat2, lng2,
                `POINT(${lng2} ${lat2})`,
                JSON.stringify({ monday: '8:00-20:00' }), true
            ]);
            const loc2 = loc2Result;

            // Location 3: Community Center (Offset approx 400m East)
            const lat3 = centerLat;
            const lng3 = centerLng + 0.005;
            const [loc3Result] = await this.dataSource.query(`
                INSERT INTO pickup_locations (name, address, city, postal_code, country, latitude, longitude, location, operating_hours, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8, 4326), $9, $10)
                RETURNING *
            `, [
                body.latitude ? 'Community Point' : 'Queens Community Center',
                body.latitude ? 'Just East' : '789 Queens Blvd, Queens, NY 11375',
                body.latitude ? 'Your City' : 'Queens',
                '11375', 'USA',
                lat3, lng3,
                `POINT(${lng3} ${lat3})`,
                JSON.stringify({ monday: '10:00-19:00' }), true
            ]);
            const loc3 = loc3Result;

            // Create Products
            const products = [
                { name: 'Premium Wireless Headphones', description: 'High-quality headphones', price: 129.99, stock: 15, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], seller: seller1, pickup_location: loc1, is_available: true },
                { name: 'Smart Watch Pro', description: 'Fitness tracking', price: 249.99, stock: 8, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], seller: seller1, pickup_location: loc1, is_available: true },
                { name: 'Bluetooth Speaker', description: 'Portable speaker', price: 79.99, stock: 20, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'], seller: seller1, pickup_location: loc2, is_available: true },
                { name: 'Wireless Keyboard', description: 'Ergonomic keyboard', price: 59.99, stock: 12, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'], seller: seller1, pickup_location: loc3, is_available: true },
                { name: 'Programming Book', description: 'Software guide', price: 45.00, stock: 30, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'], seller: seller2, pickup_location: loc1, is_available: true },
                { name: 'Mystery Novels', description: '3 bestsellers', price: 35.00, stock: 25, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], seller: seller2, pickup_location: loc2, is_available: true },
                { name: 'Cookbook', description: 'Healthy recipes', price: 29.99, stock: 18, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'], seller: seller2, pickup_location: loc3, is_available: true },
                { name: 'Indoor Plants', description: '5 plants set', price: 49.99, stock: 10, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'], seller: localStore, pickup_location: loc1, is_available: true },
                { name: 'Diffuser', description: 'Aromatherapy', price: 34.99, stock: 22, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1602874801006-52e78d594fdf?w=400'], seller: localStore, pickup_location: loc2, is_available: true },
                { name: 'Yoga Mat', description: 'Premium mat', price: 39.99, stock: 15, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], seller: localStore, pickup_location: loc3, is_available: true },
                { name: 'Resistance Bands', description: '5 bands set', price: 24.99, stock: 28, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'], seller: localStore, pickup_location: loc1, is_available: true },
                { name: 'Leather Backpack', description: 'Vintage backpack', price: 89.99, stock: 8, category: 'Fashion', image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'], seller: localStore, pickup_location: loc2, is_available: true },
            ];

            for (const p of products) {
                await this.productRepository.save(p);
            }

            // Create Group Buys
            const allProducts = await this.productRepository.find({ relations: ['seller'] });

            await this.groupBuyRepository.save({
                title: 'Bulk Headphones Deal',
                description: 'Get 20% off!',
                target_quantity: 10,
                current_quantity: 7,
                price_per_unit: 103.99,
                start_time: new Date(),
                end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: GroupBuyStatus.ACTIVE,
                product: allProducts[0],
                organizer: seller1,
            });

            await this.groupBuyRepository.save({
                title: 'Book Club Deal',
                description: 'Join and save!',
                target_quantity: 15,
                current_quantity: 12,
                price_per_unit: 28.00,
                start_time: new Date(),
                end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: GroupBuyStatus.ACTIVE,
                product: allProducts[5],
                organizer: seller2,
            });

            await this.groupBuyRepository.save({
                title: 'Yoga Mat Group Buy',
                description: 'Fitness together!',
                target_quantity: 20,
                current_quantity: 18,
                price_per_unit: 31.99,
                start_time: new Date(),
                end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: GroupBuyStatus.ACTIVE,
                product: allProducts[9],
                organizer: localStore,
            });

            return {
                success: true,
                message: '🎉 Database seeded successfully!',
                data: {
                    users: 4,
                    locations: 3,
                    products: 12,
                    groupBuys: 3,
                },
                credentials: {
                    email: 'buyer@example.com',
                    password: 'password123',
                },
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error seeding database',
                error: error.message,
            };
        }
    }
}
