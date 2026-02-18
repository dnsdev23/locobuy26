const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import entities
const { User, UserRole } = require('./dist/entities/user.entity');
const { PickupLocation } = require('./dist/entities/pickup-location.entity');
const { Product } = require('./dist/entities/product.entity');
const { GroupBuy, GroupBuyStatus } = require('./dist/entities/group-buy.entity');

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

        // Get repositories
        const userRepo = AppDataSource.getRepository('User');
        const locationRepo = AppDataSource.getRepository('PickupLocation');
        const productRepo = AppDataSource.getRepository('Product');
        const groupBuyRepo = AppDataSource.getRepository('GroupBuy');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await groupBuyRepo.delete({});
        await productRepo.delete({});
        await locationRepo.delete({});
        await userRepo.delete({});
        console.log('✅ Existing data cleared\n');

        // Create Users
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const buyer1 = await userRepo.save({
            email: 'buyer@example.com',
            password: hashedPassword,
            name: 'John Buyer',
            phone: '+1234567890',
            role: 'buyer',
            is_active: true,
        });

        const seller1 = await userRepo.save({
            email: 'seller1@example.com',
            password: hashedPassword,
            name: 'Sarah Electronics',
            phone: '+1234567891',
            role: 'seller',
            bio: 'Premium electronics seller',
            is_active: true,
        });

        const seller2 = await userRepo.save({
            email: 'seller2@example.com',
            password: hashedPassword,
            name: 'Mikes Books',
            phone: '+1234567892',
            role: 'seller',
            bio: 'Local bookstore owner',
            is_active: true,
        });

        const localStore = await userRepo.save({
            email: 'store@example.com',
            password: hashedPassword,
            name: 'Downtown Market',
            phone: '+1234567893',
            role: 'local_store',
            bio: 'Community marketplace',
            is_active: true,
        });

        console.log(`✅ Created 4 users\n`);

        // Create Locations
        console.log('📍 Creating pickup locations...');

        const loc1 = await locationRepo.save({
            name: 'Downtown Market',
            address: '123 Main St, New York, NY 10001',
            city: 'New York',
            postal_code: '10001',
            country: 'USA',
            latitude: 40.7128,
            longitude: -74.0060,
            operating_hours: { monday: '9:00-18:00', friday: '9:00-20:00' },
            is_active: true,
        });
        await AppDataSource.query(`UPDATE pickup_locations SET location = ST_GeomFromText('POINT(-74.0060 40.7128)', 4326) WHERE id = $1`, [loc1.id]);

        const loc2 = await locationRepo.save({
            name: 'Brooklyn Hub',
            address: '456 Brooklyn Ave, Brooklyn, NY 11201',
            city: 'Brooklyn',
            postal_code: '11201',
            country: 'USA',
            latitude: 40.6782,
            longitude: -73.9442,
            operating_hours: { monday: '8:00-20:00', saturday: '9:00-22:00' },
            is_active: true,
        });
        await AppDataSource.query(`UPDATE pickup_locations SET location = ST_GeomFromText('POINT(-73.9442 40.6782)', 4326) WHERE id = $1`, [loc2.id]);

        const loc3 = await locationRepo.save({
            name: 'Queens Community Center',
            address: '789 Queens Blvd, Queens, NY 11375',
            city: 'Queens',
            postal_code: '11375',
            country: 'USA',
            latitude: 40.7282,
            longitude: -73.8480,
            operating_hours: { monday: '10:00-19:00', saturday: '11:00-17:00' },
            is_active: true,
        });
        await AppDataSource.query(`UPDATE pickup_locations SET location = ST_GeomFromText('POINT(-73.8480 40.7282)', 4326) WHERE id = $1`, [loc3.id]);

        console.log(`✅ Created 3 pickup locations\n`);

        // Create Products
        console.log('📦 Creating products...');

        const products = [
            { name: 'Premium Wireless Headphones', description: 'High-quality noise-canceling headphones', price: 129.99, stock: 15, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], seller: seller1, pickup_location: loc1, is_available: true },
            { name: 'Smart Watch Pro', description: 'Fitness tracking with GPS', price: 249.99, stock: 8, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], seller: seller1, pickup_location: loc1, is_available: true },
            { name: 'Bluetooth Speaker', description: 'Waterproof portable speaker', price: 79.99, stock: 20, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'], seller: seller1, pickup_location: loc2, is_available: true },
            { name: 'Wireless Keyboard & Mouse', description: 'Ergonomic office set', price: 59.99, stock: 12, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'], seller: seller1, pickup_location: loc3, is_available: true },
            { name: 'The Art of Programming', description: 'Software development guide', price: 45.00, stock: 30, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'], seller: seller2, pickup_location: loc1, is_available: true },
            { name: 'Mystery Novel Collection', description: '3 bestselling mystery novels', price: 35.00, stock: 25, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], seller: seller2, pickup_location: loc2, is_available: true },
            { name: 'Cookbook: Healthy Eating', description: '200+ nutritious recipes', price: 29.99, stock: 18, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'], seller: seller2, pickup_location: loc3, is_available: true },
            { name: 'Indoor Plant Set', description: '5 low-maintenance plants', price: 49.99, stock: 10, category: 'Home & Garden', image_urls: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'], seller: localStore, pickup_location: loc1, is_available: true },
            { name: 'Aromatherapy Diffuser', description: 'Essential oil diffuser with LED', price: 34.99, stock: 22, category: 'Home & Garden', image_urls: ['https://images.unsplash.com/photo-1602874801006-52e78d594fdf?w=400'], seller: localStore, pickup_location: loc2, is_available: true },
            { name: 'Yoga Mat Premium', description: 'Non-slip eco-friendly mat', price: 39.99, stock: 15, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], seller: localStore, pickup_location: loc3, is_available: true },
            { name: 'Resistance Bands Set', description: '5 resistance bands with handles', price: 24.99, stock: 28, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'], seller: localStore, pickup_location: loc1, is_available: true },
            { name: 'Leather Backpack', description: 'Vintage laptop backpack', price: 89.99, stock: 8, category: 'Fashion', image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'], seller: localStore, pickup_location: loc2, is_available: true },
        ];

        for (const p of products) {
            await productRepo.save(p);
        }

        console.log(`✅ Created 12 products\n`);

        // Create Group Buys
        console.log('👥 Creating group buys...');
        const allProducts = await productRepo.find({ relations: ['seller'] });

        await groupBuyRepo.save({
            title: 'Bulk Buy: Wireless Headphones',
            description: 'Get 20% off when we reach 10 buyers!',
            target_quantity: 10,
            current_quantity: 7,
            price_per_unit: 103.99,
            start_time: new Date(),
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'active',
            product: allProducts[0],
            organizer: seller1,
        });

        await groupBuyRepo.save({
            title: 'Community Book Club Deal',
            description: 'Join our book club and save!',
            target_quantity: 15,
            current_quantity: 12,
            priceperunit: 28.00,
            start_time: new Date(),
            end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: 'active',
            product: allProducts[5],
            organizer: seller2,
        });

        await groupBuyRepo.save({
            title: 'Yoga Mat Group Purchase',
            description: 'Fitness together!',
            target_quantity: 20,
            current_quantity: 18,
            price_per_unit: 31.99,
            start_time: new Date(),
            end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: 'active',
            product: allProducts[9],
            organizer: localStore,
        });

        console.log(`✅ Created 3 group buys\n`);
        console.log('🎉 Database seed completed!\n');
        console.log('📊 Summary:');
        console.log('   - Users: 4');
        console.log('   - Pickup Locations: 3');
        console.log('   - Products: 12');
        console.log('   - Group Buys: 3');
        console.log('\n🔐 Test Credentials:');
        console.log('   Email: buyer@example.com');
        console.log('   Password: password123');
        console.log('\n✅ Visit http://localhost:3000 to see your data!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
