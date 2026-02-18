import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { PickupLocation } from './entities/pickup-location.entity';
import { Product } from './entities/product.entity';
import { GroupBuy, GroupBuyStatus } from './entities/group-buy.entity';

require('dotenv').config();

// Create DataSource
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'locobuy',
    password: process.env.DATABASE_PASSWORD || 'locobuy123',
    database: process.env.DATABASE_NAME || 'locobuy_db',
    entities: [User, PickupLocation, Product, GroupBuy],
    synchronize: true,
});

async function seed() {
    console.log('🌱 Starting database seed...\n');

    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await AppDataSource.getRepository(GroupBuy).delete({});
        await AppDataSource.getRepository(Product).delete({});
        await AppDataSource.getRepository(PickupLocation).delete({});
        await AppDataSource.getRepository(User).delete({});
        console.log('✅ Existing data cleared\n');

        // Create Users
        console.log('👥 Creating users...');
        const userRepository = AppDataSource.getRepository(User);

        const hashedPassword = await bcrypt.hash('password123', 10);

        const buyer1 = await userRepository.save(userRepository.create({
            email: 'buyer@example.com',
            password: hashedPassword,
            name: 'John Buyer',
            phone: '+1234567890',
            role: UserRole.BUYER,
            is_active: true,
        }));

        const seller1 = await userRepository.save(userRepository.create({
            email: 'seller1@example.com',
            password: hashedPassword,
            name: 'Sarah Electronics',
            phone: '+1234567891',
            role: UserRole.SELLER,
            bio: 'Premium electronics seller with 5 years experience',
            is_active: true,
        }));

        const seller2 = await userRepository.save(userRepository.create({
            email: 'seller2@example.com',
            password: hashedPassword,
            name: 'Mike\'s Books',
            phone: '+1234567892',
            role: UserRole.SELLER,
            bio: 'Your local bookstore owner',
            is_active: true,
        }));

        const localStore = await userRepository.save(userRepository.create({
            email: 'store@example.com',
            password: hashedPassword,
            name: 'Downtown Market',
            phone: '+1234567893',
            role: UserRole.LOCAL_STORE,
            bio: 'Community marketplace since 2020',
            is_active: true,
        }));

        console.log(`✅ Created ${await userRepository.count()} users\n`);

        // Create Pickup Locations (New York area)
        console.log('📍 Creating pickup locations...');
        const locationRepository = AppDataSource.getRepository(PickupLocation);

        const location1 = locationRepository.create({
            name: 'Downtown Market',
            address: '123 Main St, New York, NY 10001',
            city: 'New York',
            postal_code: '10001',
            country: 'USA',
            latitude: 40.7128,
            longitude: -74.0060,
            operating_hours: {
                monday: '9:00-18:00',
                tuesday: '9:00-18:00',
                wednesday: '9:00-18:00',
                thursday: '9:00-18:00',
                friday: '9:00-20:00',
                saturday: '10:00-16:00',
                sunday: 'Closed',
            },
            is_active: true,
        } as any) as unknown as PickupLocation;

        await locationRepository.save(location1);
        await AppDataSource.query(
            `UPDATE pickup_locations SET location = ST_GeomFromText('POINT(-74.0060 40.7128)', 4326) WHERE id = $1`,
            [location1.id]
        );

        const location2 = locationRepository.create({
            name: 'Brooklyn Hub',
            address: '456 Brooklyn Ave, Brooklyn, NY 11201',
            city: 'Brooklyn',
            postal_code: '11201',
            country: 'USA',
            latitude: 40.6782,
            longitude: -73.9442,
            operating_hours: {
                monday: '8:00-20:00',
                tuesday: '8:00-20:00',
                wednesday: '8:00-20:00',
                thursday: '8:00-20:00',
                friday: '8:00-22:00',
                saturday: '9:00-22:00',
                sunday: '10:00-18:00',
            },
            is_active: true,
        } as any) as unknown as PickupLocation;

        await locationRepository.save(location2);
        await AppDataSource.query(
            `UPDATE pickup_locations SET location = ST_GeomFromText('POINT(-73.9442 40.6782)', 4326) WHERE id = $1`,
            [location2.id]
        );

        const location3 = locationRepository.create({
            name: 'Queens Community Center',
            address: '789 Queens Blvd, Queens, NY 11375',
            city: 'Queens',
            postal_code: '11375',
            country: 'USA',
            latitude: 40.7282,
            longitude: -73.8480,
            operating_hours: {
                monday: '10:00-19:00',
                tuesday: '10:00-19:00',
                wednesday: '10:00-19:00',
                thursday: '10:00-19:00',
                friday: '10:00-19:00',
                saturday: '11:00-17:00',
                sunday: 'Closed',
            },
            is_active: true,
        } as any) as unknown as PickupLocation;

        await locationRepository.save(location3);
        await AppDataSource.query(
            `UPDATE pickup_locations SET location = ST_GeomFromText('POINT(-73.8480 40.7282)', 4326) WHERE id = $1`,
            [location3.id]
        );

        console.log(`✅ Created ${await locationRepository.count()} pickup locations\n`);

        // Create Products
        console.log('📦 Creating products...');
        const productRepository = AppDataSource.getRepository(Product);

        const products = [
            // Electronics
            {
                name: 'Premium Wireless Headphones',
                description: 'High-quality noise-canceling headphones with 30-hour battery life. Perfect for music lovers and professionals.',
                price: 129.99,
                stock: 15,
                category: 'Electronics',
                image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
                seller: seller1,
                pickup_location: location1,
                is_available: true,
            },
            {
                name: 'Smart Watch Pro',
                description: 'Fitness tracking, heart rate monitor, GPS, and smartphone notifications all in one sleek device.',
                price: 249.99,
                stock: 8,
                category: 'Electronics',
                image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
                seller: seller1,
                pickup_location: location1,
                is_available: true,
            },
            {
                name: 'Bluetooth Speaker',
                description: 'Portable waterproof speaker with 360° sound and 12-hour playtime.',
                price: 79.99,
                stock: 20,
                category: 'Electronics',
                image_urls: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
                seller: seller1,
                pickup_location: location2,
                is_available: true,
            },
            {
                name: 'Wireless Keyboard & Mouse',
                description: 'Ergonomic design with long battery life. Perfect for home office setups.',
                price: 59.99,
                stock: 12,
                category: 'Electronics',
                image_urls: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'],
                seller: seller1,
                pickup_location: location3,
                is_available: true,
            },

            // Books
            {
                name: 'The Art of Programming',
                description: 'Comprehensive guide to modern software development practices and design patterns.',
                price: 45.00,
                stock: 30,
                category: 'Books',
                image_urls: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
                seller: seller2,
                pickup_location: location1,
                is_available: true,
            },
            {
                name: 'Mystery Novel Collection',
                description: 'Set of 3 bestselling mystery novels by award-winning authors.',
                price: 35.00,
                stock: 25,
                category: 'Books',
                image_urls: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'],
                seller: seller2,
                pickup_location: location2,
                is_available: true,
            },
            {
                name: 'Cookbook: Healthy Eating',
                description: '200+ delicious and nutritious recipes for the whole family.',
                price: 29.99,
                stock: 18,
                category: 'Books',
                image_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'],
                seller: seller2,
                pickup_location: location3,
                is_available: true,
            },

            // Home & Garden
            {
                name: 'Indoor Plant Set',
                description: 'Collection of 5 low-maintenance indoor plants to brighten your space.',
                price: 49.99,
                stock: 10,
                category: 'Home & Garden',
                image_urls: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'],
                seller: localStore,
                pickup_location: location1,
                is_available: true,
            },
            {
                name: 'Aromatherapy Diffuser',
                description: 'Ultrasonic essential oil diffuser with LED lights and auto-shutoff.',
                price: 34.99,
                stock: 22,
                category: 'Home & Garden',
                image_urls: ['https://images.unsplash.com/photo-1602874801006-52e78d594fdf?w=400'],
                seller: localStore,
                pickup_location: location2,
                is_available: true,
            },

            // Sports & Fitness
            {
                name: 'Yoga Mat Premium',
                description: 'Non-slip, eco-friendly yoga mat with carrying strap. 6mm thick for extra comfort.',
                price: 39.99,
                stock: 15,
                category: 'Sports',
                image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'],
                seller: localStore,
                pickup_location: location3,
                is_available: true,
            },
            {
                name: 'Resistance Bands Set',
                description: 'Set of 5 resistance bands with different strength levels. Includes door anchor and handles.',
                price: 24.99,
                stock: 28,
                category: 'Sports',
                image_urls: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'],
                seller: localStore,
                pickup_location: location1,
                is_available: true,
            },

            // Fashion
            {
                name: 'Leather Backpack',
                description: 'Vintage-style leather backpack with laptop compartment. Perfect for work or travel.',
                price: 89.99,
                stock: 8,
                category: 'Fashion',
                image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
                seller: localStore,
                pickup_location: location2,
                is_available: true,
            },
        ];

        for (const productData of products) {
            await productRepository.save(productRepository.create(productData));
        }

        console.log(`✅ Created ${await productRepository.count()} products\n`);

        // Create Group Buys
        console.log('👥 Creating group buys...');
        const groupBuyRepository = AppDataSource.getRepository(GroupBuy);

        const allProducts = await productRepository.find({ relations: ['seller'] });

        await groupBuyRepository.save(groupBuyRepository.create({
            title: 'Bulk Buy: Wireless Headphones',
            description: 'Get 20% off when we reach 10 buyers! Premium quality at unbeatable price.',
            target_quantity: 10,
            current_quantity: 7,
            price_per_unit: 103.99,
            start_time: new Date(),
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: GroupBuyStatus.ACTIVE,
            product: allProducts[0],
            organizer: seller1,
        }));

        await groupBuyRepository.save(groupBuyRepository.create({
            title: 'Community Book Club Deal',
            description: 'Join our book club and save! Need 15 members to unlock the discount.',
            target_quantity: 15,
            current_quantity: 12,
            price_per_unit: 28.00,
            start_time: new Date(),
            end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: GroupBuyStatus.ACTIVE,
            product: allProducts[5],
            organizer: seller2,
        }));

        await groupBuyRepository.save(groupBuyRepository.create({
            title: 'Yoga Mat Group Purchase',
            description: 'Fitness together! Get premium yoga mats at wholesale price.',
            target_quantity: 20,
            current_quantity: 18,
            price_per_unit: 31.99,
            start_time: new Date(),
            end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: GroupBuyStatus.ACTIVE,
            product: allProducts[9],
            organizer: localStore,
        }));

        console.log(`✅ Created ${await groupBuyRepository.count()} group buys\n`);

        console.log('🎉 Database seed completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users: ${await userRepository.count()}`);
        console.log(`   - Pickup Locations: ${await locationRepository.count()}`);
        console.log(`   - Products: ${await productRepository.count()}`);
        console.log(`   - Group Buys: ${await groupBuyRepository.count()}`);
        console.log('\n✅ You can now use the application with sample data!');
        console.log('\n🔐 Test Credentials:');
        console.log('   Email: buyer@example.com');
        console.log('   Password: password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
