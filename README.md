# 🎉 Locobuy - Complete Setup Guide

## ✅ **What's Been Built - Full Feature List**

### **Phase 1: Core Infrastructure** ✨
- ✅ Docker Compose with PostgreSQL + PostGIS + Redis
- ✅ NestJS Backend with TypeORM
- ✅ Next.js Frontend with App Router
- ✅ Complete database schema (6 entities)

### **Phase 2: Core Modules** 🚀
1. ✅ **Hyper-Local Search** - PostGIS spatial queries
2. ✅ **Authentication** - Login & Registration with bcrypt
3. ✅ **AI Smart Import** - URL parsing simulation with beautiful UI
4. ✅ **Real-time Chat** - Socket.io with typing indicators
5. ✅ **Group Buying** - Quantity tracking with auto-completion
6. ✅ **Product Details** - Full product pages with maps

### **All Pages & Components:**
- ✅ `/search` - Search with map/list view toggle
- ✅ `/login` - Beautiful login page
- ✅ `/register` - Registration with role selection
- ✅ `/import` - AI Smart Import interface
- ✅ `/products/[id]` - Product detail page
- ✅ `/chat` - Real-time messaging
- ✅ `/group-buys` - Live group buying

---

## 🚦 **Quick Start Guide**

### **Step 1: Start Docker Services**

Make sure Docker Desktop is running, then:

```powershell
cd d:\coding\locobuy
docker-compose up -d
```

**Services started:**
- PostgreSQL with PostGIS (port 5432)
- Redis (port 6379)

### **Step 2: Install & Run Backend**

```powershell
cd backend
npm install
npm run start:dev
```

✅ Backend running at **http://localhost:3001**

The database will auto-sync the schema in development mode.

### **Step 3: Install & Run Frontend**

```powershell
cd frontend
npm install
npm run dev
```

✅ Frontend running at **http://localhost:3000**

---

## 📱 **Available Routes**

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Home (redirects to /search) | Auto-redirect |
| `/search` | Main search page | Map/list view, geolocation, filters |
| `/products/[id]` | Product details | Full info, map, seller contact |
| `/login` | User login | Email/password authentication |
| `/register` | User registration | Role selection (Buyer/Seller/Store) |
| `/import` | AI Smart Import | URL parsing & product extraction |
| `/chat` | Messaging | Real-time Socket.io chat |
| `/group-buys` | Group buying | Live progress tracking |

---

## 🎯 **Backend API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get profile

### **Products**
- `GET /api/products/search` - Hyper-local search with PostGIS
  - Parameters: `latitude`, `longitude`, `radius`, `category`, `search`, `page`, `limit`
- `GET /api/products/:id` - Get product details

### **Group Buys**
- `GET /api/group-buys/active` - List active group buys
- `GET /api/group-buys/:id` - Get specific group buy
- `POST /api/group-buys` - Create group buy
- `POST /api/group-buys/join` - Join a group buy
- `GET /api/group-buys/:id/progress` - Get progress stats

### **WebSocket** (Socket.io)
- `join_conversation` - Join a chat room
- `send_message` - Send a message
- `mark_read` - Mark messages as read
- `typing` - Send typing indicator

---

## 🎨 **Design System**

### **Colors**
- Primary: `#2563eb` (Blue)
- Gradients used for:
  - Group Buys: Green → Emerald
  - AI Import: Purple → Pink

### **Components**
- **MapView** - Interactive Leaflet maps
- **ProductCard** - Clickable product cards
- **ChatWindow** - Real-time messaging UI
- **Form Components** - React Hook Form validation

### **Animations**
- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up from bottom
- `animate-spin` - Loading spinners
- `animate-pulse` - Pulse animations

---

## 🗂️ **Project Structure**

```
locobuy/
├── docker-compose.yml         # PostgreSQL + Redis
├── README.md                  # This file
│
├── backend/                   # NestJS Backend (Port 3001)
│   ├── src/
│   │   ├── entities/         # 6 TypeORM entities
│   │   │   ├── user.entity.ts
│   │   │   ├── pickup-location.entity.ts
│   │   │   ├── product.entity.ts
│   │   │   ├── conversation.entity.ts
│   │   │   ├── message.entity.ts
│   │   │   └── group-buy.entity.ts
│   │   ├── auth/             # Authentication module
│   │   ├── products/         # Hyper-local search
│   │   ├── chat/             # Socket.io gateway
│   │   ├── group-buys/       # Group buying logic
│   │   ├── config/           # TypeORM config
│   │   ├── app.module.ts     # Main module
│   │   └── main.ts           # Bootstrap
│   ├── package.json
│   ├── .env                  # Environment config
│   └── tsconfig.json
│
└── frontend/                  # Next.js App Router (Port 3000)
    ├── src/
    │   ├── app/              # Pages (App Router)
    │   │   ├── search/       # ✅ Main search page
    │   │   ├── products/[id]/# ✅ Product detail
    │   │   ├── login/        # ✅ Login page
    │   │   ├── register/     # ✅ Registration
    │   │   ├── import/       # ✅ AI Smart Import
    │   │   ├── chat/         # ✅ Messaging
    │   │   ├── group-buys/   # ✅ Group buying
    │   │   ├── layout.tsx    # Root layout
    │   │   ├── globals.css   # Tailwind styles
    │   │   └── providers.tsx # TanStack Query
    │   ├── components/
    │   │   ├── MapView.tsx   # ✅ Leaflet maps
    │   │   ├── ProductCard.tsx # ✅ Product cards
    │   │   └── ChatWindow.tsx  # ✅ Chat UI
    │   └── lib/
    │       ├── api.ts        # Axios client
    │       ├── auth.ts       # Auth methods
    │       └── socket.ts     # Socket.io client
    ├── package.json
    ├── .env.local            # Frontend config
    ├── tailwind.config.js    # Tailwind setup
    └── next.config.js
```

---

## 🔐 **Authentication Flow**

1. **Register** at `/register`
   - Choose role: Buyer, Seller, or Local Store
   - Password hashed with bcrypt
   - Stored in localStorage: `user_id`, `user_name`, `user_role`

2. **Login** at `/login`
   - Email & password validation
   - Auto-redirect to `/search`

3. **Profile** (Future)
   - Edit profile
   - Upload avatar
   - Manage listings

---

## 🗺️ **Hyper-Local Search**

The search functionality uses **PostGIS** for efficient geospatial queries:

```sql
-- Example: Find products within 5km
SELECT * FROM products p
INNER JOIN pickup_locations pl ON p.pickup_location_id = pl.id
WHERE ST_DWithin(
  pl.location::geography,
  ST_GeomFromText('POINT(-74.0060 40.7128)', 4326)::geography,
  5000  -- 5km in meters
)
ORDER BY ST_Distance(pl.location::geography, ...) ASC
```

**Frontend Flow:**
1. Get user's geolocation via `navigator.geolocation`
2. Query API with lat/lng + radius
3. Display results on map with custom markers
4. Click product card → navigate to detail page

---

## 💬 **Real-time Chat**

### **Backend** (Socket.io Gateway)
- Rooms based on conversation ID
- Message persistence to PostgreSQL
- Read receipts & typing indicators
- Automatic timestamp handling

### **Frontend**
- `socketService.connect()` - Establish connection
- `joinConversation()` - Enter chat room
- `sendMessage()` - Send with auto-save
- `onNewMessage()` - Live updates
- `onUserTyping()` - Typing indicators

### **Usage Example:**
```typescript
// Join a conversation
socketService.joinConversation(conversationId, userId);

// Listen for messages
socketService.onNewMessage((message) => {
  setMessages(prev => [...prev, message]);
});

// Send a message
socketService.sendMessage(conversationId, userId, content);
```

---

## 👥 **Group Buying**

### **How It Works:**
1. Organizer creates a group buy with target quantity
2. Users join and specify quantity
3. Progress bar updates in real-time (5s auto-refresh)
4. When target is met:
   - Status changes to **COMPLETED**
   - Success notification: "🎉 Target has been met!"
   - Button becomes disabled

### **Backend Logic:**
```typescript
// Join a group buy
current_quantity += user_quantity;

if (current_quantity >= target_quantity) {
  status = 'completed';
  // Trigger success notification
}
```

### **Frontend:**
- Auto-refresh every 5 seconds with TanStack Query
- Beautiful progress bars with gradients
- Modal for quantity selection
- Real-time countdown timer

---

## 🤖 **AI Smart Import**

### **Current Implementation:**
- Simulates AI parsing with 2-second delay
- Demonstrates the complete UX flow
- Shows extracted product details

### **To Integrate Real AI:**

```typescript
// Replace simulateAIParsing with:
const parseProduct = async (url: string) => {
  const response = await apiClient.post('/ai/parse', { url });
  return response.data;
};

// Backend integration ideas:
// 1. OpenAI GPT-4 Vision for images
// 2. Puppeteer for web scraping
// 3. Third-party APIs (e.g., Diffbot)
```

---

## 📦 **Database Schema**

### **Tables:**

**users**
- `id` (UUID)
- `email`, `password` (hashed)
- `name`, `phone`, `avatar_url`, `bio`
- `role` (buyer/seller/local_store)
- `is_active` (boolean)

**pickup_locations**
- `id` (UUID)
- `name`, `address`, `city`, `postal_code`
- `location` (PostGIS Point geometry)
- `latitude`, `longitude` (decimal)
- `operating_hours` (JSONB)

**products**
- `id` (UUID)
- `name`, `description`, `price`, `stock`
- `category`, `external_link`
- `image_urls` (array)
- `seller_id`, `pickup_location_id`

**conversations**
- `id` (UUID)
- `user1_id`, `user2_id`
- `last_message_at`

**messages**
- `id` (UUID)
- `content`, `is_read`
- `conversation_id`, `sender_id`
- `created_at`

**group_buys**
- `id` (UUID)
- `title`, `description`
- `target_quantity`, `current_quantity`
- `price_per_unit`
- `start_time`, `end_time`
- `status` (active/completed/expired)
- `product_id`, `organizer_id`

---

## 🧪 **Testing the Application**

### **1. Test Authentication:**
```powershell
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"buyer"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **2. Create Sample Data:**

You'll need to manually create sample data for testing. Here's a helpful SQL script:

```sql
-- Insert a pickup location
INSERT INTO pickup_locations (
  id, name, address, city, latitude, longitude, location, is_active, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Downtown Market',
  '123 Main St, New York, NY 10001',
  'New York',
  40.7128,
  -74.0060,
  ST_GeomFromText('POINT(-74.0060 40.7128)', 4326),
  true,
  NOW(),
  NOW()
);

-- Note: You'll also need to create users and products
-- Use the API endpoints for easier data creation
```

### **3. Test Search:**
```
GET http://localhost:3001/api/products/search?latitude=40.7128&longitude=-74.0060&radius=10
```

---

## 🚀 **Deployment**

### **Production Checklist:**

**Backend:**
- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Disable `synchronize` in TypeORM (use migrations instead)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS
- [ ] Use a managed PostgreSQL service

**Frontend:**
- [ ] Update API URLs in `.env.local`
- [ ] Build with `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Configure environment variables

**Docker (if deploying together):**
```yaml
# Use volumes for persistence
# Set up nginx reverse proxy
# Configure SSL certificates
```

---

## 🎓 **Technology Stack**

### **Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- React Hook Form
- Leaflet (Maps)
- Socket.io Client
- Lucide React (Icons)

### **Backend:**
- NestJS 10
- TypeORM
- PostgreSQL 15
- PostGIS 3.3
- Socket.io
- Bcrypt
- Class Validator

### **DevOps:**
- Docker & Docker Compose
- Redis

---

## 🌟 **Key Features Breakdown**

### **✅ Completed:**
1. **Hyper-Local Search** - PostGIS spatial queries with interactive maps
2. **Authentication** - Secure login/register with role management
3. **Product Details** - Rich product pages with maps and seller info
4. **Real-time Chat** - Socket.io messaging with typing indicators
5. **Group Buying** - Live progress tracking with auto-completion
6. **AI Smart Import** - Beautiful UI with parsing simulation

### **🔧 To Be Enhanced:**
1. **JWT Tokens** - Currently using simple localStorage
2. **File Uploads** - For product images & avatars
3. **Order Management** - Shopping cart & checkout
4. **Payment Integration** - Stripe/PayPal
5. **Notifications** - Push notifications for messages/group buys
6. **Admin Dashboard** - Platform management
7. **Reviews & Ratings** - Product feedback system
8. **Advanced Filters** - Price range, ratings, etc.
9. **Seller Dashboard** - Inventory management
10. **Analytics** - Sales tracking & insights

---

## 🐛 **Troubleshooting**

### **Issue: Docker containers won't start**
```powershell
# Check Docker Desktop is running
docker ps

# Restart containers
docker-compose down
docker-compose up -d
```

### **Issue: PostGIS extension not enabled**
```sql
-- Connect to your database and run:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### **Issue: Frontend can't connect to backend**
- Check `.env.local` has correct API URL
- Verify backend is running on port 3001
- Check CORS settings in `backend/src/main.ts`

### **Issue: TypeScript errors**
```powershell
# Re-install dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 **Learning Resources**

- [PostGIS Documentation](https://postgis.net/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [Socket.io Guide](https://socket.io/docs/v4/)
- [Leaflet Tutorial](https://leafletjs.com/examples.html)

---

## 🤝 **Contributing**

This is a demonstration project showcasing modern full-stack development.

Feel free to fork and customize for your own needs!

---

## 📄 **License**

MIT License - Use freely!

---

## 🎉 **Credits**

**Built with:**
- ❤️ Modern web technologies
- 🗺️ PostGIS for geospatial magic
- ⚡ Real-time Socket.io communication
- 🎨 Beautiful Tailwind CSS design

---

**Happy coding! 🚀**

For questions or issues, check the troubleshooting section or review the code comments.
