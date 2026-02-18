-- Locobuy Database Seed SQL Script
-- Run this with: psql -U locobuy -d locobuy_db -f seed.sql

-- Clear existing data
TRUNCATE TABLE group_buys, products, pickup_locations, conversations, messages, users RESTART IDENTITY CASCADE;

-- Create Users
INSERT INTO users (id, email, password, name, phone, role, bio, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'buyer@example.com', '$2b$10$rK3zKp5Z8yH6sQ7X9fN.6eYVJZW8xLl3JZp6yJ0qZ6kO6fL4N9CKi', 'John Buyer', '+1234567890', 'buyer', NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'seller1@example.com', '$2b$10$rK3zKp5Z8yH6sQ7X9fN.6eYVJZW8xLl3JZp6yJ0qZ6kO6fL4N9CKi', 'Sarah Electronics', '+1234567891', 'seller', 'Premium electronics seller', true, NOW(), NOW()),
  (gen_random_uuid(), 'seller2@example.com', '$2b$10$rK3zKp5Z8yH6sQ7X9fN.6eYVJZW8xLl3JZp6yJ0qZ6kO6fL4N9CKi', 'Mikes Books', '+1234567892', 'seller', 'Local bookstore owner', true, NOW(), NOW()),
  (gen_random_uuid(), 'store@example.com', '$2b$10$rK3zKp5Z8yH6sQ7X9fN.6eYVJZW8xLl3JZp6yJ0qZ6kO6fL4N9CKi', 'Downtown Market', '+1234567893', 'local_store', 'Community marketplace', true, NOW(), NOW());

-- Password for all users: password123

-- Create Pickup Locations
INSERT INTO pickup_locations (id, name, address, city, postal_code, country, latitude, longitude, location, operating_hours, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Downtown Market', '123 Main St, New York, NY 10001', 'New York', '10001', 'USA', 40.7128, -74.0060, ST_GeomFromText('POINT(-74.0060 40.7128)', 4326), '{"monday":"9:00-18:00","friday":"9:00-20:00"}'::jsonb, true, NOW(), NOW()),
  (gen_random_uuid(), 'Brooklyn Hub', '456 Brooklyn Ave, Brooklyn, NY 11201', 'Brooklyn', '11201', 'USA', 40.6782, -73.9442, ST_GeomFromText('POINT(-73.9442 40.6782)', 4326), '{"monday":"8:00-20:00","saturday":"9:00-22:00"}'::jsonb, true, NOW(), NOW()),
  (gen_random_uuid(), 'Queens Community Center', '789 Queens Blvd, Queens, NY 11375', 'Queens', '11375', 'USA', 40.7282, -73.8480, ST_GeomFromText('POINT(-73.8480 40.7282)', 4326), '{"monday":"10:00-19:00","saturday":"11:00-17:00"}'::jsonb, true, NOW(), NOW());

-- Create Products (simplified version)
-- Note: We'll need to  manually get the IDs from users and pickup_locations

\echo 'Database seeded successfully!'
\echo 'Login credentials:'
\echo 'Email: buyer@example.com'
\echo 'Password: password123'
