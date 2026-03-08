
import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { PickupLocation } from '../entities/pickup-location.entity';
import { Product } from '../entities/product.entity';
import { GroupBuy, GroupBuyStatus } from '../entities/group-buy.entity';
import { BlogPost, BlogPostType } from '../entities/blog-post.entity';

type SeedLocation = {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
    operating_hours: Record<string, string>;
};

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
        @InjectRepository(BlogPost)
        private blogPostsRepository: Repository<BlogPost>,
        private dataSource: DataSource,
    ) { }

    private async createLocation(location: SeedLocation) {
        const [result] = await this.dataSource.query(`
            INSERT INTO pickup_locations (name, address, city, postal_code, country, latitude, longitude, location, operating_hours, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8, 4326), $9, $10)
            RETURNING *
        `, [
            location.name,
            location.address,
            location.city,
            location.postal_code,
            location.country,
            location.latitude,
            location.longitude,
            `POINT(${location.longitude} ${location.latitude})`,
            JSON.stringify(location.operating_hours),
            true,
        ]);

        return result;
    }

    @Post()
    async seed(@Body() body: { latitude?: number; longitude?: number }) {
        const centerLat = body.latitude ? Number(body.latitude) : 24.1637;
        const centerLng = body.longitude ? Number(body.longitude) : 120.6836;

        try {
            await this.dataSource.query('TRUNCATE TABLE blog_posts, group_buys, products, pickup_locations, users RESTART IDENTITY CASCADE');

            const hashedPassword = await bcrypt.hash('password123', 10);

            const users = {
                buyer1: await this.userRepository.save({
                    email: 'buyer@example.com',
                    password: hashedPassword,
                    name: 'John Buyer',
                    phone: '+1234567890',
                    role: UserRole.BUYER,
                    bio: 'Works near China Medical University and uses convenience-store pickup most days.',
                    is_active: true,
                }),
                buyer2: await this.userRepository.save({
                    email: 'buyer2@example.com',
                    password: hashedPassword,
                    name: 'Amy Lin',
                    phone: '+1234567896',
                    role: UserRole.BUYER,
                    bio: 'Buys beauty services and cafe subscriptions around Yizhong Street.',
                    is_active: true,
                }),
                buyer3: await this.userRepository.save({
                    email: 'buyer3@example.com',
                    password: hashedPassword,
                    name: 'Kevin Chang',
                    phone: '+1234567897',
                    role: UserRole.BUYER,
                    bio: 'Regularly uses Locobuy for 3C repair drop-off and restaurant preorders.',
                    is_active: true,
                }),
                electronics: await this.userRepository.save({
                    email: 'seller1@example.com',
                    password: hashedPassword,
                    name: 'Sarah Electronics',
                    phone: '+1234567891',
                    role: UserRole.SELLER,
                    bio: 'Electronics seller focused on quick pickup in North District.',
                    is_active: true,
                }),
                books: await this.userRepository.save({
                    email: 'seller2@example.com',
                    password: hashedPassword,
                    name: 'Mikes Books',
                    phone: '+1234567892',
                    role: UserRole.SELLER,
                    bio: 'Independent bookstore curator for Taichung readers.',
                    is_active: true,
                }),
                generalStore: await this.userRepository.save({
                    email: 'store@example.com',
                    password: hashedPassword,
                    name: 'North District Select Mart',
                    phone: '+1234567893',
                    role: UserRole.LOCAL_STORE,
                    bio: 'Local goods seller using convenience-store pickup across North District.',
                    is_active: true,
                }),
                restaurant1: await this.userRepository.save({
                    email: 'food1@example.com',
                    password: hashedPassword,
                    name: 'Yizhong Bento Kitchen',
                    phone: '+1234567894',
                    role: UserRole.LOCAL_STORE,
                    bio: 'Bento, soup, and prepared meals with convenience-store handoff.',
                    is_active: true,
                }),
                restaurant2: await this.userRepository.save({
                    email: 'food2@example.com',
                    password: hashedPassword,
                    name: 'Taichung Midnight Snacks',
                    phone: '+1234567895',
                    role: UserRole.LOCAL_STORE,
                    bio: 'Late-night snacks and frozen meal packs for neighborhood pickup.',
                    is_active: true,
                }),
                beauty: await this.userRepository.save({
                    email: 'beauty@example.com',
                    password: hashedPassword,
                    name: 'Glow Beauty Studio',
                    phone: '+1234567898',
                    role: UserRole.LOCAL_STORE,
                    bio: 'Beauty studio selling redeemable service slots and skincare bundles.',
                    is_active: true,
                }),
                repair: await this.userRepository.save({
                    email: 'repair@example.com',
                    password: hashedPassword,
                    name: 'North Tech Repair',
                    phone: '+1234567899',
                    role: UserRole.LOCAL_STORE,
                    bio: '3C repair shop using convenience-store drop-off and pickup.',
                    is_active: true,
                }),
            };
            const locationSeed: SeedLocation[] = [
                {
                    name: body.latitude ? 'Your Nearby 7-ELEVEN' : '7-ELEVEN Zhongqing Store',
                    address: body.latitude ? 'Nearest convenience store to your selected coordinates' : 'No. 358, Zhongqing Rd., North District, Taichung City',
                    city: 'Taichung',
                    postal_code: '404',
                    country: 'Taiwan',
                    latitude: centerLat,
                    longitude: centerLng,
                    operating_hours: { monday: '00:00-23:59', friday: '00:00-23:59', sunday: '00:00-23:59' },
                },
                {
                    name: body.latitude ? 'Your Nearby FamilyMart' : 'FamilyMart Yizhong Store',
                    address: body.latitude ? 'Convenience store north of your selected coordinates' : 'Yizhong St., North District, Taichung City',
                    city: 'Taichung',
                    postal_code: '404',
                    country: 'Taiwan',
                    latitude: centerLat + 0.0042,
                    longitude: centerLng + 0.0016,
                    operating_hours: { monday: '00:00-23:59', thursday: '00:00-23:59', saturday: '00:00-23:59' },
                },
                {
                    name: body.latitude ? 'Your Nearby OK mart' : 'OK mart China Medical Store',
                    address: body.latitude ? 'Convenience store west of your selected coordinates' : 'Xueshi Rd., North District, Taichung City',
                    city: 'Taichung',
                    postal_code: '404',
                    country: 'Taiwan',
                    latitude: centerLat + 0.0012,
                    longitude: centerLng - 0.0048,
                    operating_hours: { monday: '06:00-23:00', wednesday: '06:00-23:00', saturday: '06:00-23:00' },
                },
                {
                    name: body.latitude ? 'Your Nearby Hi-Life' : 'Hi-Life Taichung Park Store',
                    address: body.latitude ? 'Convenience store south-east of your selected coordinates' : 'Sanmin Rd., North District, Taichung City',
                    city: 'Taichung',
                    postal_code: '404',
                    country: 'Taiwan',
                    latitude: centerLat - 0.0043,
                    longitude: centerLng + 0.0037,
                    operating_hours: { monday: '00:00-23:59', friday: '00:00-23:59', sunday: '00:00-23:59' },
                },
                {
                    name: body.latitude ? 'Your Nearby FamilyMart East' : 'FamilyMart Beitun Road Store',
                    address: body.latitude ? 'Convenience store east of your selected coordinates' : 'Beitun Rd., North District, Taichung City',
                    city: 'Taichung',
                    postal_code: '404',
                    country: 'Taiwan',
                    latitude: centerLat + 0.0023,
                    longitude: centerLng + 0.0062,
                    operating_hours: { monday: '00:00-23:59', thursday: '00:00-23:59', saturday: '00:00-23:59' },
                },
            ];

            const locations = [] as any[];
            for (const location of locationSeed) {
                locations.push(await this.createLocation(location));
            }
            const [loc1, loc2, loc3, loc4, loc5] = locations;

            const products = [
                { name: 'ANC Commuter Headphones', description: 'Lightweight noise-canceling headphones for train commutes and study sessions.', price: 129.99, stock: 15, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], seller: users.electronics, pickup_location: loc1, is_available: true },
                { name: 'Smart Watch Pro', description: 'Fitness tracking, sleep monitoring, and NFC tap-to-pay support.', price: 249.99, stock: 8, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], seller: users.electronics, pickup_location: loc1, is_available: true },
                { name: 'Bluetooth Speaker', description: 'Portable speaker with strong bass and IPX7 water resistance.', price: 79.99, stock: 20, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'], seller: users.electronics, pickup_location: loc2, is_available: true },
                { name: 'Wireless Keyboard', description: 'Compact ergonomic keyboard with Mac and Windows layouts.', price: 59.99, stock: 12, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'], seller: users.electronics, pickup_location: loc3, is_available: true },
                { name: 'GaN Fast Charger 65W', description: 'Travel-friendly charger for phones, tablets, and laptops.', price: 42.99, stock: 30, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400'], seller: users.electronics, pickup_location: loc4, is_available: true },
                { name: 'MagSafe Power Bank', description: 'Snap-on battery pack with USB-C backup charging.', price: 54.99, stock: 24, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1609592806955-d81e2f1d4a5b?w=400'], seller: users.electronics, pickup_location: loc5, is_available: true },
                { name: 'USB-C Dock Mini', description: 'Seven-port dock for dual-display desk setups and quick hot-desking.', price: 68.0, stock: 10, category: 'Electronics', image_urls: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400'], seller: users.electronics, pickup_location: loc2, is_available: true },
                { name: 'Programming Book', description: 'Practical software design guide for modern product teams.', price: 45.0, stock: 30, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'], seller: users.books, pickup_location: loc1, is_available: true },
                { name: 'Mystery Novels', description: 'Three page-turning mysteries translated into traditional Chinese.', price: 35.0, stock: 25, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], seller: users.books, pickup_location: loc2, is_available: true },
                { name: 'Cookbook', description: 'Healthy recipes with weeknight meals and low-prep lunch ideas.', price: 29.99, stock: 18, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'], seller: users.books, pickup_location: loc3, is_available: true },
                { name: 'Taichung Cafe Guide', description: 'An indie guidebook to North District cafes, brunch spots, and bookstores.', price: 18.5, stock: 40, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400'], seller: users.books, pickup_location: loc4, is_available: true },
                { name: 'JLPT Vocabulary Flashcards', description: 'Portable card deck for daily Japanese review on the go.', price: 16.0, stock: 35, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400'], seller: users.books, pickup_location: loc5, is_available: true },
                { name: 'Children Picture Book Bundle', description: 'A bright five-book set for bedtime reading and early learning.', price: 32.0, stock: 16, category: 'Books', image_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'], seller: users.books, pickup_location: loc2, is_available: true },
                { name: 'Indoor Plants', description: 'A beginner-friendly five-plant bundle for small apartments.', price: 49.99, stock: 10, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'], seller: users.generalStore, pickup_location: loc1, is_available: true },
                { name: 'Diffuser', description: 'Quiet aromatherapy diffuser with warm mood lighting.', price: 34.99, stock: 22, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1602874801006-52e78d594fdf?w=400'], seller: users.generalStore, pickup_location: loc2, is_available: true },
                { name: 'Storage Basket Set', description: 'Three woven baskets sized for desks, shelves, and entryways.', price: 27.5, stock: 20, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400'], seller: users.generalStore, pickup_location: loc3, is_available: true },
                { name: 'Pour Over Coffee Starter Kit', description: 'Dripper, filter papers, kettle, and server for home brewing.', price: 62.0, stock: 11, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'], seller: users.generalStore, pickup_location: loc4, is_available: true },
                { name: 'Ceramic Rice Bowl Set', description: 'Six stackable bowls sized for rice, soup, and dessert.', price: 31.0, stock: 26, category: 'Home', image_urls: ['https://images.unsplash.com/photo-1516685304081-de7947d419d0?w=400'], seller: users.generalStore, pickup_location: loc5, is_available: true },
                { name: 'Yoga Mat', description: 'Premium non-slip mat with a soft top layer and carry strap.', price: 39.99, stock: 15, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], seller: users.generalStore, pickup_location: loc3, is_available: true },
                { name: 'Resistance Bands', description: 'Five-band set with handles and a door anchor for home workouts.', price: 24.99, stock: 28, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'], seller: users.generalStore, pickup_location: loc1, is_available: true },
                { name: 'Pickleball Paddle Duo', description: 'Beginner-friendly paddle set with two balls and carry sleeve.', price: 58.0, stock: 14, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400'], seller: users.generalStore, pickup_location: loc4, is_available: true },
                { name: 'City Running Belt', description: 'Slim reflective running belt with phone pocket and key clip.', price: 19.0, stock: 34, category: 'Sports', image_urls: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'], seller: users.generalStore, pickup_location: loc5, is_available: true },
                { name: 'Leather Backpack', description: 'Vintage-style backpack sized for a 14-inch laptop and notebooks.', price: 89.99, stock: 8, category: 'Fashion', image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'], seller: users.generalStore, pickup_location: loc2, is_available: true },
                { name: 'Canvas Tote Everyday', description: 'Heavyweight tote bag for markets, school, or short trips.', price: 22.0, stock: 40, category: 'Fashion', image_urls: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], seller: users.generalStore, pickup_location: loc4, is_available: true },
                { name: 'Minimal Card Holder', description: 'Slim leather card holder with RFID-blocking layer.', price: 26.0, stock: 22, category: 'Fashion', image_urls: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'], seller: users.generalStore, pickup_location: loc5, is_available: true },
                { name: 'Handmade Soy Candle', description: 'North District studio-made candle in tea, cedar, and citrus notes.', price: 21.0, stock: 17, category: 'Lifestyle', image_urls: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400'], seller: users.generalStore, pickup_location: loc2, is_available: true },
                { name: 'Desk Plant Lamp', description: 'Compact warm-white lamp designed for desks and bedside tables.', price: 44.0, stock: 9, category: 'Lifestyle', image_urls: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400'], seller: users.generalStore, pickup_location: loc3, is_available: true },
                { name: 'Braised Pork Rice Bento', description: 'Prepared lunch box from a North District kitchen, released in batches for convenience-store pickup.', price: 8.5, stock: 40, category: 'Restaurant', image_urls: ['https://images.unsplash.com/photo-1547592180-85f173990554?w=400'], seller: users.restaurant1, pickup_location: loc1, is_available: true },
                { name: 'Chicken Curry Rice', description: 'Freshly packed curry meal suitable for same-day pickup.', price: 9.2, stock: 32, category: 'Restaurant', image_urls: ['https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400'], seller: users.restaurant1, pickup_location: loc2, is_available: true },
                { name: 'Japanese Hamburg Steak Meal', description: 'Microwave-ready meal box with vegetables and rice.', price: 10.8, stock: 24, category: 'Restaurant', image_urls: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=400'], seller: users.restaurant1, pickup_location: loc4, is_available: true },
                { name: 'Cold Brew Latte Bottle', description: 'Bottled coffee prepared by a local cafe partner for pickup through convenience stores.', price: 4.8, stock: 50, category: 'Cafe', image_urls: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'], seller: users.restaurant1, pickup_location: loc5, is_available: true },
                { name: 'Frozen Salt Crispy Chicken Pack', description: 'Late-night snack pack designed for reheating at home.', price: 7.5, stock: 36, category: 'Restaurant', image_urls: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=400'], seller: users.restaurant2, pickup_location: loc2, is_available: true },
                { name: 'Spicy Mala Hot Pot Set', description: 'Two-person chilled meal kit for evening pickup.', price: 18.9, stock: 18, category: 'Restaurant', image_urls: ['https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400'], seller: users.restaurant2, pickup_location: loc3, is_available: true },
                { name: 'Scallion Pancake Pack', description: 'Frozen handmade pancakes for breakfast or supper.', price: 6.2, stock: 28, category: 'Restaurant', image_urls: ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'], seller: users.restaurant2, pickup_location: loc5, is_available: true },
                { name: 'Hydrating Facial Voucher', description: 'Book a 60-minute facial and receive the redeem code through Locobuy.', price: 38.0, stock: 20, category: 'Beauty', image_urls: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400'], seller: users.beauty, pickup_location: loc1, is_available: true },
                { name: 'Gel Nail Design Session', description: 'Seasonal nail art booking sold as a redeemable slot.', price: 28.0, stock: 16, category: 'Beauty', image_urls: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'], seller: users.beauty, pickup_location: loc2, is_available: true },
                { name: 'Lash Lift Appointment', description: 'Prepaid beauty appointment with flexible redemption dates.', price: 34.0, stock: 14, category: 'Beauty', image_urls: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'], seller: users.beauty, pickup_location: loc4, is_available: true },
                { name: 'Travel Skincare Bundle', description: 'Four-piece skincare set assembled for pickup at a nearby convenience store.', price: 22.0, stock: 30, category: 'Beauty', image_urls: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400'], seller: users.beauty, pickup_location: loc5, is_available: true },
                { name: 'iPhone Battery Replacement', description: 'Drop off at a convenience store, receive repaired phone back the next day.', price: 49.0, stock: 12, category: '3C Repair', image_urls: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'], seller: users.repair, pickup_location: loc1, is_available: true },
                { name: 'Laptop Cleaning Service', description: 'Internal fan cleaning and thermal paste refresh with pickup scheduling.', price: 36.0, stock: 10, category: '3C Repair', image_urls: ['https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=400'], seller: users.repair, pickup_location: loc3, is_available: true },
                { name: 'Nintendo Joy-Con Repair', description: 'Drift repair processed through a convenience-store drop-off workflow.', price: 24.0, stock: 18, category: '3C Repair', image_urls: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'], seller: users.repair, pickup_location: loc4, is_available: true },
                { name: 'Tablet Screen Protector Install', description: 'Install service with same-day pickup and delivery to selected pickup point.', price: 12.0, stock: 25, category: '3C Repair', image_urls: ['https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400'], seller: users.repair, pickup_location: loc5, is_available: true }
            ];

            for (const product of products) {
                await this.productRepository.save(product);
            }

            const allProducts = await this.productRepository.find({ relations: ['seller'] });
            const productByName = new Map(allProducts.map((product) => [product.name, product]));
            const groupBuys = [
                { title: 'Bulk Headphones Deal', description: 'Get 20% off on commuter headphones.', target_quantity: 10, current_quantity: 7, price_per_unit: 103.99, days: 7, productName: 'ANC Commuter Headphones', organizer: users.electronics },
                { title: 'Book Club Deal', description: 'Neighborhood reading group order for mystery novels.', target_quantity: 15, current_quantity: 12, price_per_unit: 28.0, days: 5, productName: 'Mystery Novels', organizer: users.books },
                { title: 'Yoga Mat Group Buy', description: 'Fitness together with a discounted studio-quality mat.', target_quantity: 20, current_quantity: 18, price_per_unit: 31.99, days: 3, productName: 'Yoga Mat', organizer: users.generalStore },
                { title: 'North District Coffee Kit Group Buy', description: 'Home brewing starter pack with pickup near Yizhong and China Medical.', target_quantity: 12, current_quantity: 5, price_per_unit: 51.0, days: 4, productName: 'Pour Over Coffee Starter Kit', organizer: users.generalStore },
                { title: 'Bento Lunch Batch', description: 'Daily lunch batch with pickup through FamilyMart and 7-ELEVEN.', target_quantity: 20, current_quantity: 9, price_per_unit: 7.6, days: 2, productName: 'Braised Pork Rice Bento', organizer: users.restaurant1 },
                { title: 'Hydrating Facial Intro Pack', description: 'Launch promotion for first-time beauty-service customers.', target_quantity: 12, current_quantity: 6, price_per_unit: 31.0, days: 6, productName: 'Hydrating Facial Voucher', organizer: users.beauty },
                { title: 'Battery Repair Week', description: 'Discounted iPhone battery replacements via convenience-store drop-off.', target_quantity: 18, current_quantity: 11, price_per_unit: 42.0, days: 5, productName: 'iPhone Battery Replacement', organizer: users.repair }
            ];

            for (const groupBuy of groupBuys) {
                await this.groupBuyRepository.save({
                    title: groupBuy.title,
                    description: groupBuy.description,
                    target_quantity: groupBuy.target_quantity,
                    current_quantity: groupBuy.current_quantity,
                    price_per_unit: groupBuy.price_per_unit,
                    start_time: new Date(),
                    end_time: new Date(Date.now() + groupBuy.days * 24 * 60 * 60 * 1000),
                    status: GroupBuyStatus.ACTIVE,
                    product: productByName.get(groupBuy.productName),
                    organizer: groupBuy.organizer,
                });
            }

            const blogPosts = [
                {
                    title: 'North Tech Repair launches 24-hour iPhone battery service',
                    excerpt: 'A seller opening post explaining the convenience-store drop-off flow and turnaround time.',
                    content: 'North Tech Repair is opening a faster 24-hour battery replacement lane for commuters in North District. Customers can place the service order in Locobuy, drop the phone at a nearby convenience store, and pick it up the next day from the same point. This opening campaign is designed for office workers and students who do not want to wait inside a repair shop.',
                    cover_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                    type: BlogPostType.SELLER_PROMO,
                    tags: ['opening', '3c repair', 'iphone'],
                    author: users.repair,
                },
                {
                    title: 'Glow Beauty Studio opening week promotion',
                    excerpt: 'A seller post introducing facial, lash, and nail service vouchers for North District buyers.',
                    content: 'Glow Beauty Studio is using Locobuy to launch opening-week beauty vouchers that can be purchased online and redeemed later. Buyers can pay through the marketplace, collect a confirmation through a nearby convenience store pickup point, and schedule their service without repeated messaging. The goal is to make first-time discovery easier and lower the friction of trying a new studio.',
                    cover_image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',
                    type: BlogPostType.SELLER_PROMO,
                    tags: ['opening', 'beauty', 'promotion'],
                    author: users.beauty,
                },
                {
                    title: 'My first Locobuy repair drop-off was smoother than expected',
                    excerpt: 'A buyer shares how the convenience-store flow worked for a phone battery replacement.',
                    content: 'I booked an iPhone battery replacement through Locobuy and used the 7-ELEVEN Zhongqing Store drop-off point. The process felt closer to parcel pickup than a traditional repair workflow. I received clear status updates, the device came back the next day, and I did not need to carve out time to sit in a repair shop. For repeat repairs, this is the model I would choose again.',
                    cover_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                    type: BlogPostType.BUYER_EXPERIENCE,
                    tags: ['buyer story', '3c repair', 'pickup'],
                    author: users.buyer3,
                },
                {
                    title: 'Two lunches, one pickup stop: trying restaurant preorders in North District',
                    excerpt: 'A buyer review covering bento and late-night snack pickups from convenience-store points.',
                    content: 'I tested both the Braised Pork Rice Bento and the Frozen Salt Crispy Chicken Pack using FamilyMart Yizhong Store as the pickup point. The lunch preorder was useful during a busy workday, and the frozen snack pack was practical to pick up after work without coordinating directly with the restaurant. The service works best when you want local food but do not want delivery timing pressure.',
                    cover_image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
                    type: BlogPostType.BUYER_EXPERIENCE,
                    tags: ['restaurant', 'buyer story', 'north district'],
                    author: users.buyer1,
                },
                {
                    title: 'Why we moved our cafe subscription promo onto Locobuy',
                    excerpt: 'A seller explains how blog content and pickup points help convert local discovery into orders.',
                    content: 'Yizhong Bento Kitchen started offering bottled cold brew through Locobuy because convenience-store pickup removes the need for strict handoff timing. Posting updates in the blog lets us explain new menu drops, pickup rules, and preorder windows in one place. It works as a small promotional channel without having to build a separate content site.',
                    cover_image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
                    type: BlogPostType.SELLER_PROMO,
                    tags: ['cafe', 'seller story', 'promotion'],
                    author: users.restaurant1,
                },
                {
                    title: 'Beauty voucher purchase experience after work',
                    excerpt: 'A buyer writes about booking a facial voucher and redeeming it later.',
                    content: 'I bought the Hydrating Facial Voucher through Locobuy because I did not want to coordinate timing while still deciding on a date. The purchase flow felt like buying a normal item, and the seller later confirmed redemption times. This is a useful model for beauty services that are normally hard to compare when you are browsing late at night.',
                    cover_image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
                    type: BlogPostType.BUYER_EXPERIENCE,
                    tags: ['beauty', 'buyer story', 'voucher'],
                    author: users.buyer2,
                }
            ];

            for (const blogPost of blogPosts) {
                await this.blogPostsRepository.save(blogPost);
            }
            return {
                success: true,
                message: 'Demo data seeded successfully.',
                data: {
                    users: 10,
                    locations: 5,
                    products: products.length,
                    groupBuys: groupBuys.length,
                    blogPosts: blogPosts.length,
                    defaultCoordinates: { latitude: centerLat, longitude: centerLng },
                },
                accounts: [
                    { role: 'buyer', email: 'buyer@example.com', password: 'password123', name: 'John Buyer' },
                    { role: 'buyer', email: 'buyer2@example.com', password: 'password123', name: 'Amy Lin' },
                    { role: 'buyer', email: 'buyer3@example.com', password: 'password123', name: 'Kevin Chang' },
                    { role: 'seller', email: 'seller1@example.com', password: 'password123', name: 'Sarah Electronics' },
                    { role: 'seller', email: 'seller2@example.com', password: 'password123', name: 'Mikes Books' },
                    { role: 'local_store', email: 'beauty@example.com', password: 'password123', name: 'Glow Beauty Studio' },
                    { role: 'local_store', email: 'repair@example.com', password: 'password123', name: 'North Tech Repair' }
                ]
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
