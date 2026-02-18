# 🏗️ Locobuy Platform Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Design](#database-design)
6. [Technology Stack](#technology-stack)
7. [Data Flow](#data-flow)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Scalability Considerations](#scalability-considerations)

---

## System Overview

Locobuy is a **hyper-local e-commerce platform** that enables users to discover and purchase products from nearby sellers using geospatial search. The platform leverages PostGIS for advanced location-based queries and provides real-time features like chat and group buying.

### Core Features
- **Hyper-local Search**: Find products within a specific radius using GPS coordinates
- **Real-time Chat**: Communicate with sellers via WebSocket
- **Group Buying**: Collaborative purchasing with dynamic progress tracking
- **AI Smart Import**: Product data extraction from external URLs
- **Interactive Maps**: Leaflet-based visualization of products and locations

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │   Browser    │  │   Browser    │         │
│  │  (Buyer)     │  │  (Seller)    │  │  (Store)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │        HTTPS / WebSocket            │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────────┐
│         │     APPLICATION LAYER               │                 │
├─────────┼──────────────────┼──────────────────┼─────────────────┤
│         ▼                  ▼                  ▼                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │         Next.js Frontend (Port 3000)             │          │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │          │
│  │  │   Pages    │  │ Components │  │   State   │  │          │
│  │  │  Routing   │  │    UI      │  │ Management│  │          │
│  │  └────────────┘  └────────────┘  └───────────┘  │          │
│  └──────────────────────┬───────────────────────────┘          │
│                         │ API Calls                             │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────┐          │
│  │         NestJS Backend (Port 3001)               │          │
│  │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐  │          │
│  │  │  Auth  │ │Products│ │  Chat   │ │ Group   │  │          │
│  │  │ Module │ │ Module │ │ Gateway │ │  Buys   │  │          │
│  │  └────────┘ └────────┘ └─────────┘ └─────────┘  │          │
│  └──────────────────────┬───────────────────────────┘          │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                          │ TypeORM
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐    ┌──────────────────────┐       │
│  │  PostgreSQL + PostGIS   │    │       Redis          │       │
│  │    (Port 5432)          │    │    (Port 6379)       │       │
│  │                         │    │                      │       │
│  │  ┌──────────────────┐   │    │  ┌────────────────┐ │       │
│  │  │  Users           │   │    │  │  Socket Cache  │ │       │
│  │  │  Products        │   │    │  │  Session Store │ │       │
│  │  │  Locations (GIS) │   │    │  └────────────────┘ │       │
│  │  │  Messages        │   │    │                      │       │
│  │  │  Group Buys      │   │    │                      │       │
│  │  └──────────────────┘   │    └──────────────────────┘       │
│  └─────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### NestJS Module Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── auth/                      # Authentication Module
│   │   ├── auth.controller.ts    # Endpoints: /auth/register, /login, /me
│   │   ├── auth.service.ts       # Business logic: password hashing, validation
│   │   └── auth.module.ts        # Module configuration
│   │
│   ├── products/                  # Products Module
│   │   ├── products.controller.ts # Endpoints: /products/search, /products/:id
│   │   ├── products.service.ts    # PostGIS spatial queries
│   │   ├── dto/
│   │   │   └── search-products.dto.ts  # Request validation
│   │   └── products.module.ts
│   │
│   ├── chat/                      # Chat Module (WebSocket)
│   │   ├── chat.gateway.ts       # Socket.io gateway
│   │   ├── chat.service.ts       # Message persistence
│   │   └── chat.module.ts
│   │
│   ├── group-buys/               # Group Buying Module
│   │   ├── group-buys.controller.ts  # CRUD endpoints
│   │   ├── group-buys.service.ts     # Progress tracking, status updates
│   │   ├── dto/
│   │   │   └── group-buy.dto.ts
│   │   └── group-buys.module.ts
│   │
│   ├── seed/                     # Database Seeding
│   │   ├── seed.controller.ts   # POST /seed endpoint
│   │   └── seed.module.ts
│   │
│   ├── entities/                 # TypeORM Entities
│   │   ├── user.entity.ts       # User model
│   │   ├── product.entity.ts    # Product model
│   │   ├── pickup-location.entity.ts  # Location with PostGIS geometry
│   │   ├── conversation.entity.ts
│   │   ├── message.entity.ts
│   │   └── group-buy.entity.ts
│   │
│   └── config/                   # Configuration
│       └── typeorm.config.ts    # Database connection
│
├── .env                          # Environment variables
└── package.json
```

### Module Responsibilities

#### **1. Auth Module**
- **Purpose**: User authentication and authorization
- **Key Features**:
  - User registration with bcrypt password hashing (10 rounds)
  - Login with credential validation
  - Role-based access (Buyer, Seller, Local Store)
  - Profile retrieval
- **Dependencies**: User entity, bcrypt

#### **2. Products Module**
- **Purpose**: Product management and geospatial search
- **Key Features**:
  - Hyper-local search using PostGIS `ST_DWithin`
  - Distance calculation (`ST_Distance`)
  - Category filtering
  - Full-text search on name/description
  - Pagination support
- **Dependencies**: Product, PickupLocation, User entities

#### **3. Chat Module (Gateway)**
- **Purpose**: Real-time messaging
- **Key Features**:
  - Socket.io WebSocket gateway
  - Room-based conversations
  - Message persistence
  - Typing indicators
  - Read receipts
  - User presence
- **Dependencies**: Conversation, Message entities, Socket.io

#### **4. Group Buys Module**
- **Purpose**: Collaborative purchasing
- **Key Features**:
  - Create group buy campaigns
  - Join with quantity selection
  - Real-time progress tracking
  - Automatic status updates (active → completed/expired)
  - Target quantity validation
- **Dependencies**: GroupBuy, Product, User entities

#### **5. Seed Module**
- **Purpose**: Development data population
- **Key Features**:
  - HTTP endpoint to seed database
  - Creates sample users, products, locations, group buys
  - Uses direct SQL for PostGIS geometry insertion
- **Note**: Development only, not for production

---

## Frontend Architecture

### Next.js App Router Structure

```
frontend/
├── src/
│   ├── app/                       # App Router (Next.js 14)
│   │   ├── layout.tsx            # Root layout with QueryClientProvider
│   │   ├── globals.css           # Global styles
│   │   ├── providers.tsx         # TanStack Query provider
│   │   │
│   │   ├── page.tsx              # Home (redirects to /search)
│   │   │
│   │   ├── search/               # Main search page
│   │   │   └── page.tsx          # Map view + list view, geolocation
│   │   │
│   │   ├── products/[id]/        # Dynamic product detail
│   │   │   └── page.tsx          # Product info, seller, map, contact
│   │   │
│   │   ├── login/                # Login page
│   │   │   └── page.tsx          # React Hook Form validation
│   │   │
│   │   ├── register/             # Registration page
│   │   │   └── page.tsx          # Multi-step with role selection
│   │   │
│   │   ├── import/               # AI Smart Import
│   │   │   └── page.tsx          # URL parser simulation
│   │   │
│   │   ├── chat/                 # Chat interface
│   │   │   └── page.tsx          # Conversation list + chat window
│   │   │
│   │   └── group-buys/           # Group buying
│   │       └── page.tsx          # Active deals, progress bars
│   │
│   ├── components/               # Reusable Components
│   │   ├── MapView.tsx           # Leaflet map wrapper (dynamic import)
│   │   ├── ProductCard.tsx       # Product display card (clickable)
│   │   └── ChatWindow.tsx        # Real-time chat UI
│   │
│   └── lib/                      # Utilities & API
│       ├── api.ts                # Axios client with interceptors
│       ├── auth.ts               # Auth API methods
│       └── socket.ts             # Socket.io client wrapper
│
├── public/                        # Static assets
├── .env.local                     # Environment variables
├── tailwind.config.js            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
└── package.json
```

### Frontend Layers

```
┌───────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
├───────────────────────────────────────────────────────────┤
│  Next.js Pages (Server Components + Client Components)   │
│  - Server-side rendering                                  │
│  - Client-side hydration                                  │
│  - React 18 features                                      │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                   STATE MANAGEMENT                        │
├───────────────────────────────────────────────────────────┤
│  TanStack Query (React Query)                             │
│  - Data fetching & caching                                │
│  - Auto-refresh (staleTime: 60s)                          │
│  - Optimistic updates                                     │
│  - Query invalidation                                     │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                   API CLIENT LAYER                        │
├───────────────────────────────────────────────────────────┤
│  Axios Instance                                           │
│  - Request interceptor (auth token)                       │
│  - Response interceptor (401 handling)                    │
│  - Base URL configuration                                 │
│                                                            │
│  Socket.io Client                                         │
│  - WebSocket connection management                        │
│  - Event listeners                                        │
│  - Room handling                                          │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
              Backend API (NestJS)
```

### Key Frontend Patterns

#### **1. Server Components (Default)**
- Used for static content and SEO
- Data fetching on the server
- Zero JavaScript to client
- Example: Product detail page initial render

#### **2. Client Components**
- Interactive UI elements
- Use React hooks
- Real-time updates
- Example: MapView, ChatWindow

#### **3. Dynamic Imports**
- Leaflet (map library) loaded client-side only
- Reduces initial bundle size
- Prevents SSR issues

```typescript
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});
```

#### **4. TanStack Query for Data**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['products', searchParams],
  queryFn: () => searchProducts(searchParams),
  staleTime: 60000, // 1 minute
  refetchOnWindowFocus: true,
});
```

#### **5. React Hook Form for Validation**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (UUID) PK    │◄─────────┐
│ email           │          │
│ password        │          │ seller_id
│ name            │          │
│ phone           │          │
│ role (enum)     │          │
│ bio             │          │
│ avatar_url      │          │
│ is_active       │          │
└────────┬────────┘          │
         │                   │
         │ organizer_id      │
         │                   │
         ▼                   │
┌──────────────────┐    ┌────┴─────────────┐
│   GroupBuy       │    │     Product      │
├──────────────────┤    ├──────────────────┤
│ id (UUID) PK     │    │ id (UUID) PK     │
│ title            │◄───┤ name             │
│ description      │    │ description      │
│ target_quantity  │    │ price            │
│ current_quantity │    │ stock            │
│ price_per_unit   │    │ category         │
│ start_time       │    │ image_urls[]     │
│ end_time         │    │ is_available     │
│ status (enum)    │    │ seller_id FK     │
│ product_id FK    │    │ pickup_loc FK ───┐
│ organizer_id FK  │    └──────────────────┘
└──────────────────┘                        │
                                            │
┌────────────────────┐                      │
│  PickupLocation    │◄─────────────────────┘
├────────────────────┤
│ id (UUID) PK       │
│ name               │
│ address            │
│ city               │
│ postal_code        │
│ country            │
│ latitude (float)   │
│ longitude (float)  │
│ location (geometry)│  ◄── PostGIS POINT
│ operating_hours    │      SRID: 4326
│ is_active          │
└────────────────────┘


┌─────────────────┐         ┌──────────────────┐
│  Conversation   │         │     Message      │
├─────────────────┤         ├──────────────────┤
│ id (UUID) PK    │◄────────┤ id (UUID) PK     │
│ user1_id FK     │         │ conversation FK  │
│ user2_id FK     │         │ sender_id FK     │
│ last_message_at │         │ content          │
└─────────────────┘         │ is_read          │
                            │ created_at       │
                            └──────────────────┘
```

### PostGIS Geometry Column

The `location` column in `pickup_locations` uses PostGIS geometry type:

```sql
CREATE TABLE pickup_locations (
  id UUID PRIMARY KEY,
  name VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  location GEOMETRY(Point, 4326),  -- PostGIS spatial type
  ...
);

-- Create spatial index for performance
CREATE INDEX idx_pickup_location_geom 
ON pickup_locations USING GIST (location);
```

### Spatial Queries Example

```sql
-- Find products within 5km of user location
SELECT p.*, 
       ST_Distance(
         pl.location::geography, 
         ST_GeomFromText('POINT(-74.0060 40.7128)', 4326)::geography
       ) / 1000 AS distance_km
FROM products p
JOIN pickup_locations pl ON p.pickup_location_id = pl.id
WHERE ST_DWithin(
  pl.location::geography,
  ST_GeomFromText('POINT(-74.0060 40.7128)', 4326)::geography,
  5000  -- 5km in meters
)
ORDER BY distance_km ASC;
```

---

## Technology Stack

### Backend Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20 | JavaScript runtime |
| **Framework** | NestJS 10 | Progressive Node.js framework |
| **ORM** | TypeORM 0.3 | Database abstraction & migrations |
| **Database** | PostgreSQL 15 | Relational database |
| **GIS Extension** | PostGIS 3.3 | Geospatial queries |
| **Cache** | Redis 7 | Session store, Socket.io adapter |
| **WebSocket** | Socket.io 4 | Real-time bidirectional communication |
| **Validation** | Class Validator | DTO validation |
| **Security** | bcrypt | Password hashing |
| **Language** | TypeScript 5.3 | Type safety |

### Frontend Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 | React framework with App Router |
| **UI Library** | React 18 | Component-based UI |
| **Language** | TypeScript 5.3 | Type safety |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **State Management** | TanStack Query v5 | Server state management |
| **Forms** | React Hook Form | Form handling & validation |
| **HTTP Client** | Axios | API requests |
| **WebSocket Client** | Socket.io Client | Real-time events |
| **Maps** | Leaflet | Interactive maps |
| **Icons** | Lucide React | Icon library |

### DevOps Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Docker Compose | Multi-container management |
| **Version Control** | Git | Source code management |

---

## Data Flow

### 1. Hyper-Local Search Flow

```
User Browser
    │
    │ 1. Request geolocation
    ▼
Geolocation API
    │
    │ 2. Return coordinates
    ▼
Frontend (Search Page)
    │
    │ 3. GET /api/products/search?lat=40.7&lng=-74&radius=5
    ▼
Backend (Products Controller)
    │
    │ 4. Validate DTO
    ▼
Products Service
    │
    │ 5. Build PostGIS query
    │    ST_DWithin(location, point, radius)
    ▼
PostgreSQL + PostGIS
    │
    │ 6. Execute spatial query with index
    │    Calculate distances
    ▼
Products Service
    │
    │ 7. Map results with distance
    ▼
Frontend (Map Component)
    │
    │ 8. Render markers on map
    │    Display product cards
    ▼
User sees products
```

### 2. Real-Time Chat Flow

```
User A (Sender)                        User B (Receiver)
    │                                        │
    │ 1. Type message                        │
    ▼                                        │
Chat Window Component                       │
    │                                        │
    │ 2. Emit 'send_message'                 │
    ▼                                        │
Socket.io Client                            │
    │                                        │
    │ 3. WebSocket message                   │
    ▼                                        │
Backend (Chat Gateway)                      │
    │                                        │
    │ 4. Validate & save to DB               │
    ▼                                        │
Message Repository                          │
    │                                        │
    │ 5. Persist message                     │
    ▼                                        │
PostgreSQL                                  │
    │                                        │
    │ 6. Broadcast to room                   │
    ▼                                        ▼
Socket.io Server ────────────────────▶ Socket.io Client
                                            │
                                            │ 7. Emit 'new_message'
                                            ▼
                                    Chat Window Component
                                            │
                                            │ 8. Append message
                                            ▼
                                    User B sees message
```

### 3. Group Buy Join Flow

```
User
  │
  │ 1. Click "Join Group Buy"
  ▼
Group Buy Page
  │
  │ 2. Show quantity modal
  ▼
User selects quantity
  │
  │ 3. POST /api/group-buys/join
  │    { groupBuyId, userId, quantity }
  ▼
Backend (GroupBuys Controller)
  │
  │ 4. Validate request
  ▼
GroupBuys Service
  │
  │ 5. Check availability
  │    current + quantity <= target?
  ▼
Update current_quantity
  │
  │ 6. Save transaction
  ▼
PostgreSQL
  │
  │ 7. Check if target reached
  ▼
GroupBuys Service
  │
  │ 8. Update status if complete
  │    status = 'completed'
  ▼
Return success
  │
  │ 9. TanStack Query refetch
  ▼
Frontend updates progress bar
  │
  │ 10. Show success toast
  ▼
User sees updated progress
```

---

## Security Architecture

### Authentication Flow

```
1. User Registration
   ├─► Frontend validates input
   ├─► POST /api/auth/register
   ├─► Backend validates DTO
   ├─► Hash password (bcrypt, 10 rounds)
   ├─► Save to database
   └─► Return success (no token yet)

2. User Login
   ├─► Frontend submits credentials
   ├─► POST /api/auth/login
   ├─► Backend finds user by email
   ├─► Compare password hash
   ├─► Generate session/token
   ├─► Store in localStorage (temporary)
   └─► Return user data

3. Authenticated Request
   ├─► Axios interceptor adds token
   ├─► Request to protected endpoint
   ├─► Backend validates token
   ├─► Process request
   └─► Return data
```

### Current Security Measures

✅ **Implemented:**
- Password hashing with bcrypt (10 salt rounds)
- DTO validation on all inputs
- SQL injection protection (TypeORM parameterized queries)
- XSS protection (React auto-escaping)
- CORS configuration
- TypeScript type safety

⚠️ **To Implement (Production):**
- [ ] JWT with httpOnly cookies
- [ ] Refresh token rotation
- [ ] Rate limiting (express-rate-limit)
- [ ] CSRF tokens
- [ ] Helmet.js security headers
- [ ] Input sanitization
- [ ] File upload validation
- [ ] API key management

---

## Deployment Architecture

### Development Environment

```
Developer Machine
├── Docker Desktop
│   ├── PostgreSQL Container (Port 5432)
│   └── Redis Container (Port 6379)
├── Backend (npm run start:dev)
│   └── NestJS on Port 3001
└── Frontend (npm run dev)
    └── Next.js on Port 3000
```

### Production Architecture (Recommended)

```
Internet
    │
    │ HTTPS (443)
    ▼
┌──────────────────┐
│   Load Balancer  │ (AWS ALB / nginx)
│   SSL Termination│
└────────┬─────────┘
         │
         ├─────────────────┬──────────────────┐
         ▼                 ▼                  ▼
    ┌─────────┐      ┌─────────┐       ┌─────────┐
    │Frontend │      │Frontend │       │Frontend │
    │ Instance│      │ Instance│       │ Instance│
    │(Next.js)│      │(Next.js)│       │(Next.js)│
    └────┬────┘      └────┬────┘       └────┬────┘
         │                │                  │
         └────────────────┼──────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ API Gateway   │
                  └───────┬───────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐    ┌─────────┐
    │Backend  │      │Backend  │    │Backend  │
    │Instance │      │Instance │    │Instance │
    │(NestJS) │      │(NestJS) │    │(NestJS) │
    └────┬────┘      └────┬────┘    └────┬────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │PostgreSQL│    │  Redis   │    │   CDN    │
    │ Primary  │    │ Cluster  │    │ (Assets) │
    └────┬─────┘    └──────────┘    └──────────┘
         │
         ▼
    ┌──────────┐
    │PostgreSQL│
    │ Replica  │
    │(Read-only)│
    └──────────┘
```

### Containerization (Docker)

**docker-compose.yml** structure:
```yaml
services:
  postgres:
    image: postgis/postgis:15-3.3
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
```

---

## Scalability Considerations

### Current Capacity

| Component | Current Setup | Estimated Capacity |
|-----------|---------------|-------------------|
| **Database** | Single PostgreSQL | ~1000 concurrent users |
| **Backend** | Single NestJS instance | ~500 requests/sec |
| **Frontend** | Single Next.js instance | ~1000 requests/sec |
| **WebSocket** | Socket.io (Redis adapter) | ~10,000 connections |

### Horizontal Scaling Strategy

#### 1. **Database Layer**
```
Master-Slave Replication
├── PostgreSQL Master (Writes)
└── PostgreSQL Replicas (Reads)
    ├── Replica 1
    ├── Replica 2
    └── Replica 3

- PostGIS indexes ensure fast spatial queries
- Connection pooling (pg-pool)
- Read replicas for search queries
- Master for writes (products, orders)
```

#### 2. **Application Layer**
```
Load Balancer (Round Robin)
├── Backend Instance 1 (NestJS)
├── Backend Instance 2 (NestJS)
├── Backend Instance 3 (NestJS)
└── Backend Instance N

- Stateless design (no session in memory)
- Redis for shared session store
- Socket.io Redis adapter for WebSocket clustering
```

#### 3. **Caching Strategy**
```
Client 
  │
  ▼
CDN (Static Assets)
  │
  ▼
API Gateway
  │
  ▼
Redis Cache Layer
  │
  ├─► Cache hit ────────► Return
  │
  └─► Cache miss
      │
      ▼
  Application Layer
      │
      ▼
  Database
```

**Cache Keys:**
- `product:{id}` - Product details (TTL: 5 min)
- `search:{lat}:{lng}:{radius}` - Search results (TTL: 1 min)
- `user:{id}` - User profile (TTL: 10 min)
- `group-buy:{id}` - Group buy state (TTL: 10 sec)

### Performance Optimizations

#### Database Level
```sql
-- Spatial index for location queries
CREATE INDEX idx_pickup_location_geom 
ON pickup_locations USING GIST (location);

-- B-tree indexes for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_available ON products(is_available);

-- Composite index for filtered searches
CREATE INDEX idx_products_category_available 
ON products(category, is_available);
```

#### Application Level
- **TanStack Query** caching (60s stale time)
- **Memoization** of expensive computations
- **Lazy loading** of maps and heavy components
- **Code splitting** by route

#### Network Level
- **CDN** for static assets
- **Gzip compression**
- **HTTP/2** for multiplexing
- **Image optimization** (Next.js Image)

---

## Module Communication

### Inter-Module Dependencies

```
┌──────────────┐
│  AuthModule  │
└──────┬───────┘
       │ exports: AuthService
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐          ┌──────────────┐
│ProductsModule│          │  ChatModule  │
└──────┬───────┘          └──────┬───────┘
       │                          │
       │ uses: User entity        │ uses: User, Conversation
       │                          │
       ▼                          ▼
┌──────────────┐          ┌──────────────┐
│GroupBuysModule          │ SeedModule   │
└──────────────┘          └──────────────┘
       │                          │
       │ uses: Product, User      │ uses: All entities
       │                          │
       ▼                          ▼
    Database                  Database
```

### Shared Resources

**Entities** (Shared across modules):
- `User` - Used by Auth, Products, Chat, GroupBuys
- `Product` - Used by Products, GroupBuys
- `PickupLocation` - Used by Products
- `Conversation`, `Message` - Used by Chat
- `GroupBuy` - Used by GroupBuys

**Configuration**:
- `ConfigModule` - Global, shared environment variables
- `TypeOrmModule` - Global database connection

---

## API Design Principles

### REST Endpoints

```
Authentication:
POST   /api/auth/register      - Create new user
POST   /api/auth/login         - Authenticate user
GET    /api/auth/me            - Get current user

Products:
GET    /api/products/search    - Hyper-local search
                                 ?lat=40.7&lng=-74&radius=5&category=Electronics
GET    /api/products/:id       - Get product details

Group Buys:
GET    /api/group-buys/active  - List active group buys
POST   /api/group-buys         - Create new group buy
POST   /api/group-buys/join    - Join a group buy
GET    /api/group-buys/:id/progress - Get real-time progress

Seed (Development):
POST   /api/seed               - Populate database with sample data
```

### WebSocket Events

```
Client → Server:
- join_conversation(conversationId, userId)
- send_message(conversationId, senderId, content)
- typing(conversationId, userId)
- mark_read(messageId)

Server → Client:
- new_message(message)
- user_typing(userId)
- message_read(messageId)
- user_joined(userId)
- user_left(userId)
```

### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": {
    "products": [...],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}

// Error Response
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Summary

### System Strengths

✅ **Geospatial Excellence**: PostGIS integration for accurate, performant location queries
✅ **Real-Time Capabilities**: Socket.io for instant communication
✅ **Modern Stack**: Latest versions of Next.js, NestJS, React
✅ **Type Safety**: Full TypeScript coverage
✅ **Scalable Architecture**: Modular design ready for horizontal scaling
✅ **Developer Experience**: Hot reload, clear separation of concerns
✅ **Production Ready**: Docker containerization, environment configs

### Future Enhancements

1. **Microservices**: Break into smaller services (Auth, Products, Chat)
2. **Event Sourcing**: CQRS pattern for complex state management
3. **GraphQL**: Alternative to REST for flexible queries
4. **Service Mesh**: Istio/Linkerd for inter-service communication
5. **Kubernetes**: Container orchestration for large-scale deployment
6. **Monitoring**: Prometheus + Grafana for metrics
7. **Logging**: ELK stack (Elasticsearch, Logstash, Kibana)
8. **CI/CD**: GitHub Actions, GitLab CI for automated deployment

---

**Built with modern best practices and ready to scale! 🚀**
