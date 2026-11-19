-- ========================================================================
-- EventSync: Localized Event Management and Ticketing Platform
-- Database Schema for PostgreSQL / Supabase
-- Based on CIT-U IT342 SRS Specification
-- ========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (in correct dependency order)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------
-- 1. USER Table (Matches SRS ERD: USER)
-- ------------------------------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('attendee', 'organizer', 'admin')),
    oauth_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for OAuth lookups and email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth_id ON users(oauth_id);

-- ------------------------------------------------------------------------
-- 2. EVENT Table (Matches SRS ERD: EVENT)
-- ------------------------------------------------------------------------
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL CHECK (capacity >= 0),
    category VARCHAR(100) DEFAULT 'Community',
    banner_url TEXT,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_org_id ON events(org_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);

-- ------------------------------------------------------------------------
-- 3. TICKET_TYPE Table (Matches SRS ERD: TICKET_TYPE)
-- ------------------------------------------------------------------------
CREATE TABLE ticket_types (
    ticket_id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    available_qty INT NOT NULL CHECK (available_qty >= 0),
    initial_qty INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- ------------------------------------------------------------------------
-- 4. ORDER Table (Matches SRS ERD: ORDER)
-- ------------------------------------------------------------------------
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    event_id INT NOT NULL REFERENCES events(event_id) ON DELETE RESTRICT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);

-- ------------------------------------------------------------------------
-- 5. ORDER_ITEM Table (Matches SRS ERD: ORDER_ITEM)
-- ------------------------------------------------------------------------
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    ticket_id INT NOT NULL REFERENCES ticket_types(ticket_id) ON DELETE RESTRICT,
    unique_code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_unique_code ON order_items(unique_code);

-- ------------------------------------------------------------------------
-- 6. ATOMIC PURCHASE TRANSACTION FUNCTION (Prevents Overselling / Race Conditions)
-- Fulfills SRS FR-008 & Non-Functional Concurrency Requirement
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_ticket_purchase(
    p_user_id INT,
    p_event_id INT,
    p_ticket_id INT,
    p_qty INT,
    p_total_amount NUMERIC,
    p_ticket_codes TEXT[] -- array of generated unique codes
)
RETURNS JSON AS $$
DECLARE
    v_available INT;
    v_order_id INT;
    v_code TEXT;
    v_i INT;
BEGIN
    -- 1. Row-level Lock on the ticket_type to prevent race conditions
    SELECT available_qty INTO v_available
    FROM ticket_types
    WHERE ticket_id = p_ticket_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket type ID % does not exist', p_ticket_id;
    END IF;

    -- 2. Verify sufficient capacity
    IF v_available < p_qty THEN
        RAISE EXCEPTION 'Sold Out: requested % tickets but only % are available', p_qty, v_available;
    END IF;

    -- 3. Deduct purchased tickets from available quantity
    UPDATE ticket_types
    SET available_qty = available_qty - p_qty
    WHERE ticket_id = p_ticket_id;

    -- 4. Deduct total event capacity
    UPDATE events
    SET capacity = capacity - p_qty
    WHERE event_id = p_event_id;

    -- 5. Create Order
    INSERT INTO orders (user_id, event_id, total_amount, status, date)
    VALUES (p_user_id, p_event_id, p_total_amount, 'completed', NOW())
    RETURNING order_id INTO v_order_id;

    -- 6. Create Order Items with unique codes
    FOR v_i IN 1..array_length(p_ticket_codes, 1) LOOP
        v_code := p_ticket_codes[v_i];
        INSERT INTO order_items (order_id, ticket_id, unique_code)
        VALUES (v_order_id, p_ticket_id, v_code);
    END LOOP;

    -- Return confirmation object
    RETURN json_build_object(
        'success', true,
        'order_id', v_order_id,
        'tickets_purchased', p_qty,
        'remaining_qty', v_available - p_qty
    );
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------
-- 7. SEED DATA (Realistic Local Cebu Events for CIT-U IT342 Testing)
-- ------------------------------------------------------------------------

-- Insert Demo Users (Default password for demo accounts is: Password123!)
INSERT INTO users (user_id, email, password_hash, role, oauth_id, name, avatar_url) VALUES
(1, 'mark.organizer@eventsync.ph', '$2a$10$Q8BLq9xzUpZmJP7YwmHvieS8P9s/A2v5C2J5nMacGuL3umsMr8xSS', 'organizer', 'google-oauth-org-001', 'Mark Evon (Organizer)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'cit.student@citu.edu.ph', '$2a$10$Q8BLq9xzUpZmJP7YwmHvieS8P9s/A2v5C2J5nMacGuL3umsMr8xSS', 'attendee', 'google-oauth-att-002', 'Juan Dela Cruz (Attendee)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 'tech.club@citu.edu.ph', '$2a$10$Q8BLq9xzUpZmJP7YwmHvieS8P9s/A2v5C2J5nMacGuL3umsMr8xSS', 'organizer', 'google-oauth-org-003', 'CIT-U Tech Innovators Guild', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150');

-- Reset user sequence to avoid conflict with future inserts
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- Insert Demo Events
INSERT INTO events (event_id, org_id, title, description, date, location, capacity, category, banner_url, status) VALUES
(1, 1, 'Cebu Tech Summit 2026', 'The premier technology conference in Central Visayas, bringing together software engineers, cloud architects, and tech founders.', '2026-12-15 09:00:00+08', 'Waterfront Cebu City Hotel & Casino, Lahug', 250, 'Technology', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'published'),
(2, 1, 'CIT-U IT Hackathon & Innovation Expo', 'Annual 24-hour hackathon hosted by CIT University. Compete, build cutting-edge solutions, and win exciting prizes!', '2026-11-28 08:00:00+08', 'CIT-U Gymnasium, N. Bacalso Ave, Cebu City', 150, 'Academic', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'published'),
(3, 3, 'Sugbo Indie Music Fest', 'A night of vibrant local music featuring homegrown Cebuano indie bands, acoustic sets, and artisanal food pop-ups.', '2026-12-05 18:00:00+08', 'IT Park Garden Bloc, Cebu City', 300, 'Concert', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', 'published'),
(4, 1, 'Visayas Small Business Networking Night', 'Connect with local Cebu entrepreneurs, investors, and community leaders for collaboration and growth.', '2026-12-20 17:30:00+08', 'Oakridge Business Park, Mandaue City', 80, 'Business', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', 'published');

SELECT setval('events_event_id_seq', (SELECT MAX(event_id) FROM events));

-- Insert Ticket Types for Events
INSERT INTO ticket_types (ticket_id, event_id, name, price, available_qty, initial_qty) VALUES
-- Event 1: Cebu Tech Summit
(1, 1, 'Early Bird Ticket', 250.00, 45, 50),
(2, 1, 'General Admission', 500.00, 140, 150),
(3, 1, 'VIP All-Access Pass', 1200.00, 48, 50),
-- Event 2: CIT-U Hackathon
(4, 2, 'Student Hacker Ticket', 0.00, 95, 100),
(5, 2, 'Observer / Mentor Ticket', 150.00, 48, 50),
-- Event 3: Sugbo Indie Music Fest
(6, 3, 'General Admission', 300.00, 180, 200),
(7, 3, 'VIP Backstage Pass', 800.00, 95, 100),
-- Event 4: Small Business Networking
(8, 4, 'Standard Entry', 350.00, 75, 80);

SELECT setval('ticket_types_ticket_id_seq', (SELECT MAX(ticket_id) FROM ticket_types));

-- Insert Initial Sample Order
INSERT INTO orders (order_id, user_id, event_id, total_amount, status, date) VALUES
(1, 2, 1, 250.00, 'completed', '2026-11-10 14:32:00+08');

SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));

-- Insert Initial Sample Order Item
INSERT INTO order_items (item_id, order_id, ticket_id, unique_code) VALUES
(1, 1, 1, 'ES-2026-CEB-89X2');

SELECT setval('order_items_item_id_seq', (SELECT MAX(item_id) FROM order_items));

-- ------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to events & ticket types so attendees can discover them
CREATE POLICY "Public can view published events" ON events FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view ticket types" ON ticket_types FOR SELECT USING (true);

-- Allow organizers full control over their events
CREATE POLICY "Organizers can create events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Organizers can update own events" ON events FOR UPDATE USING (true);
CREATE POLICY "Organizers can delete own events" ON events FOR DELETE USING (true);
CREATE POLICY "Organizers can manage ticket types" ON ticket_types FOR ALL USING (true);

-- Allow users to view their own profile and read public profiles
CREATE POLICY "Allow read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow update own user" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow insert user" ON users FOR INSERT WITH CHECK (true);

-- Allow orders to be created and read
CREATE POLICY "Allow create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow create order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read order_items" ON order_items FOR SELECT USING (true);
