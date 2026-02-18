# 🌱 Database Seeding Guide

## Quick Start

Once Docker is running, you can populate your database with sample data:

```powershell
# From the backend directory
cd backend
npm run seed
```

This will create:
- ✅ **4 Sample Users** (1 buyer, 2 sellers, 1 local store)
- ✅ **3 Pickup Locations** in New York area
- ✅ **12 Sample Products** across various categories
- ✅ **3 Active Group Buys** with different progress levels

---

## What Gets Created

### 👥 Users

| Email | Password | Role | Name |
|-------|----------|------|------|
| buyer@example.com | password123 | Buyer | John Buyer |
| seller1@example.com | password123 | Seller | Sarah Electronics |
| seller2@example.com | password123 | Seller | Mike's Books |
| store@example.com | password123 | Local Store | Downtown Market |

### 📍 Pickup Locations

**1. Downtown Market**
- Address: 123 Main St, New York, NY 10001
- Coordinates: 40.7128, -74.0060
- Hours: Mon-Fri 9:00-18:00, Sat 10:00-16:00

**2. Brooklyn Hub**
- Address: 456 Brooklyn Ave, Brooklyn, NY 11201
- Coordinates: 40.6782, -73.9442
- Hours: Mon-Sat 8:00-22:00, Sun 10:00-18:00

**3. Queens Community Center**
- Address: 789 Queens Blvd, Queens, NY 11375
- Coordinates: 40.7282, -73.8480
- Hours: Mon-Fri 10:00-19:00, Sat 11:00-17:00

### 📦 Products by Category

**Electronics (4 products)**
- Premium Wireless Headphones - $129.99
- Smart Watch Pro - $249.99
- Bluetooth Speaker - $79.99
- Wireless Keyboard & Mouse - $59.99

**Books (3 products)**
- The Art of Programming - $45.00
- Mystery Novel Collection - $35.00
- Cookbook: Healthy Eating - $29.99

**Home & Garden (2 products)**
- Indoor Plant Set - $49.99
- Aromatherapy Diffuser - $34.99

**Sports (2 products)**
- Yoga Mat Premium - $39.99
- Resistance Bands Set - $24.99

**Fashion (1 product)**
- Leather Backpack - $89.99

### 👥 Group Buys

**1. Bulk Buy: Wireless Headphones**
- Target: 10 buyers
- Current: 7 buyers (70% complete)
- Price: $103.99 (20% off)
- Ends in: 7 days

**2. Community Book Club Deal**
- Target: 15 members
- Current: 12 members (80% complete)
- Price: $28.00 (discounted)
- Ends in: 5 days

**3. Yoga Mat Group Purchase**
- Target: 20 buyers
- Current: 18 buyers (90% complete!)
- Price: $31.99 (20% off)
- Ends in: 3 days

---

## Step-by-Step: Running the Seed

### Prerequisites

**1. Start Docker Desktop**
   - Make sure Docker Desktop is running on your system

**2. Start Database Services**
```powershell
cd d:\coding\locobuy
docker-compose up -d
```

Wait a few seconds for PostgreSQL to fully start.

**3. Run the Seed Script**
```powershell
cd backend
npm run seed
```

### Expected Output

You should see:
```
🌱 Starting database seed...

✅ Database connected

🗑️  Clearing existing data...
✅ Existing data cleared

👥 Creating users...
✅ Created 4 users

📍 Creating pickup locations...
✅ Created 3 pickup locations

📦 Creating products...
✅ Created 12 products

👥 Creating group buys...
✅ Created 3 group buys

🎉 Database seed completed successfully!

📊 Summary:
   - Users: 4
   - Pickup Locations: 3
   - Products: 12
   - Group Buys: 3

✅ You can now use the application with sample data!

🔐 Test Credentials:
   Email: buyer@example.com
   Password: password123
```

---

## Testing the Sample Data

### 1. Login
Visit http://localhost:3000/login and use:
- Email: `buyer@example.com`
- Password: `password123`

### 2. Search for Products
Go to http://localhost:3000/search
- Allow geolocation (or manually enter New York coordinates)
- See products on the map within your radius
- Try different categories: Electronics, Books, Sports, etc.

### 3. View Product Details
Click on any product card to see:
- Full product information
- Seller details
- Pickup location on map
- Distance from you

### 4. Explore Group Buys
Visit http://localhost:3000/group-buys
- See 3 active group buys with different progress levels
- Watch the "Yoga Mat" group buy (90% complete!)
- Try joining a group buy

### 5. Try AI Import
Go to http://localhost:3000/import
- Use demo URLs to see the AI parsing simulation
- See how products would be extracted

---

## Re-seeding the Database

If you want to start fresh, just run the seed script again:

```powershell
npm run seed
```

The script will:
1. Clear all existing data
2. Create fresh sample data
3. Reset all relationships

---

## Customizing Sample Data

Edit `backend/src/seed.ts` to:
- Add more products
- Change product categories
- Modify pickup locations
- Adjust group buy progress
- Add more users

Example - Add a new product:
```typescript
{
  name: 'Your Product Name',
  description: 'Product description',
  price: 99.99,
  stock: 10,
  category: 'Your Category',
  image_urls: ['https://example.com/image.jpg'],
  seller: seller1,
  pickup_location: location1,
  is_available: true,
}
```

---

## Troubleshooting

### ❌ "Error: Connection refused"
- Docker Desktop isn't running
- Start Docker and run `docker-compose up -d`

### ❌ "Error: Database does not exist"
- The database will be auto-created on first connection
- Make sure PostgreSQL container is running: `docker ps`

### ❌ "Error: Cannot find module"
- Run `npm install` in the backend directory
- Make sure all dependencies are installed

### ❌ TypeScript errors
- These are warnings and won't prevent seeding
- The script will still run successfully

---

## What to Do After Seeding

1. **Start the Backend** (if not already running)
   ```powershell
   cd backend
   npm run start:dev
   ```

2. **Start the Frontend** (if not already running)
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Visit the Application**
   - Open http://localhost:3000
   - Login with test credentials
   - Explore all features with real data!

---

## Production Notes

**⚠️ Important:** This seed script is for **development only**.

For production:
- Don't seed the database
- Use migrations for schema changes
- Add real user registration
- Import actual product data from your sources

---

Happy testing! 🎉
