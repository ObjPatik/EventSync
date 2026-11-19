require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'eventsync_citu_it342_secret_key_2026';

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------
// Persistent Database Store Setup
// Supports both Supabase PostgreSQL (when credentials exist) & Local Persistent DB
// ----------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Seed Data
const DEFAULT_DB = {
  users: [
    {
      user_id: 1,
      email: 'mark.organizer@eventsync.ph',
      // password: 'Password123!'
      password_hash: '$2a$10$Q8BLq9xzUpZmJP7YwmHvieS8P9s/A2v5C2J5nMacGuL3umsMr8xSS',
      role: 'organizer',
      name: 'Mark Evon (Organizer)',
      created_at: '2026-11-05T09:00:00Z'
    },
    {
      user_id: 2,
      email: 'cit.student@citu.edu.ph',
      // password: 'Password123!'
      password_hash: '$2a$10$Q8BLq9xzUpZmJP7YwmHvieS8P9s/A2v5C2J5nMacGuL3umsMr8xSS',
      role: 'attendee',
      name: 'Juan Dela Cruz (Attendee)',
      created_at: '2026-11-06T10:00:00Z'
    }
  ],
  events: [
    {
      event_id: 1,
      org_id: 1,
      title: 'Cebu Tech Summit 2026',
      description: 'The premier technology conference in Central Visayas, bringing together software engineers, cloud architects, and tech founders.',
      date: '2026-12-15T09:00:00+08:00',
      location: 'Waterfront Cebu City Hotel & Casino, Lahug',
      capacity: 250,
      category: 'Technology',
      banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      status: 'published',
      ticket_types: [
        { ticket_id: 1, name: 'Early Bird Ticket', price: 250.00, available_qty: 45, initial_qty: 50 },
        { ticket_id: 2, name: 'General Admission', price: 500.00, available_qty: 140, initial_qty: 150 },
        { ticket_id: 3, name: 'VIP All-Access Pass', price: 1200.00, available_qty: 48, initial_qty: 50 }
      ]
    },
    {
      event_id: 2,
      org_id: 1,
      title: 'CIT-U IT Hackathon & Innovation Expo',
      description: 'Annual 24-hour hackathon hosted by CIT University. Compete, build cutting-edge solutions, and win exciting prizes!',
      date: '2026-11-28T08:00:00+08:00',
      location: 'CIT-U Gymnasium, N. Bacalso Ave, Cebu City',
      capacity: 150,
      category: 'Academic',
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      status: 'published',
      ticket_types: [
        { ticket_id: 4, name: 'Student Hacker Ticket', price: 0.00, available_qty: 95, initial_qty: 100 },
        { ticket_id: 5, name: 'Observer / Mentor Ticket', price: 150.00, available_qty: 48, initial_qty: 50 }
      ]
    }
  ],
  orders: [
    {
      order_id: 1,
      user_id: 2,
      user_name: 'Juan Dela Cruz (Attendee)',
      user_email: 'cit.student@citu.edu.ph',
      event_id: 1,
      event_title: 'Cebu Tech Summit 2026',
      ticket_name: 'Early Bird Ticket',
      quantity: 1,
      total_amount: 250.00,
      date: '2026-11-10T14:32:00+08:00',
      ticket_codes: ['ES-2026-CEB-89X2']
    }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_DB;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Ensure database file is initialized on startup
readDb();

// Initialize Supabase Client (safely, only if valid non-placeholder keys provided)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-ref') && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { createClient: false }
    });
  } catch (err) {
    console.warn('Supabase initialization skipped:', err.message);
    supabase = null;
  }
}

// ----------------------------------------------------------------------
// Authentication Middleware (Token Verification & Protected Routes)
// ----------------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No authentication token provided. Please log in.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired session token. Please log in again.'
      });
    }
    req.user = decoded;
    next();
  });
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to users with '${requiredRole}' role only.`
      });
    }
    next();
  };
}

// Helper: Email format validator
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----------------------------------------------------------------------
// REQUIREMENT 1: User Account Creation
// POST /api/auth/register
// ----------------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = (role === 'organizer') ? 'organizer' : 'attendee';
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Prevent duplicate accounts in Supabase (if connected)
    if (supabase) {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (existingUser) {
          return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
        }

        // 3. Securely hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Store user in Supabase
        const { data: newUser, error: insertErr } = await supabase
          .from('users')
          .insert({
            name: name.trim(),
            email: normalizedEmail,
            password_hash: passwordHash,
            role: assignedRole,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        const token = jwt.sign(
          { userId: newUser.user_id, email: newUser.email, role: newUser.role, name: newUser.name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.status(201).json({
          message: 'Account created successfully.',
          token,
          user: {
            user_id: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        });
      } catch (sbErr) {
        console.warn('Supabase register error, using persistent local DB:', sbErr.message);
      }
    }

    // 2b. Prevent duplicate accounts in local persistent DB
    const db = readDb();
    const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // 3b. Securely hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4b. Store in database
    const newUserId = db.users.length ? Math.max(...db.users.map(u => u.user_id)) + 1 : 1;
    const newUser = {
      user_id: newUserId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: assignedRole,
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    // 5. Generate secure session JWT token
    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during account creation.' });
  }
});

// ----------------------------------------------------------------------
// REQUIREMENT 2: User Login and Logout
// POST /api/auth/login
// ----------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check Supabase if connected
    if (supabase) {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (user) {
          const match = await bcrypt.compare(password, user.password_hash);
          if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
          }

          const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.json({
            message: 'Login successful.',
            token,
            user: {
              user_id: user.user_id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        }
      } catch (sbErr) {
        console.warn('Supabase login check failed, checking local persistent DB:', sbErr.message);
      }
    }

    // Local DB check
    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify bcrypt hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Maintain secure session with JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  return res.json({ message: 'Session successfully terminated. Logged out.' });
});

// Verify current session & get profile (Protected)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.user_id === req.user.userId);
  if (!user) {
    return res.json({ user: req.user });
  }
  return res.json({
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ----------------------------------------------------------------------
// REQUIREMENT 3: Role-Based User Dashboards & Protected Routes
// ----------------------------------------------------------------------

// Attendee Protected Dashboard Data
app.get('/api/dashboard/attendee', authenticateToken, requireRole('attendee'), (req, res) => {
  const db = readDb();
  const userOrders = db.orders.filter(o => o.user_id === req.user.userId);

  return res.json({
    role: 'attendee',
    user: req.user,
    orders: userOrders,
    totalTicketsClaimed: userOrders.reduce((sum, o) => sum + (o.quantity || 1), 0),
    accessibleFeatures: [
      'Browse Published Events',
      'Select Ticket Tiers',
      'Real-time Digital Pass Generation',
      'Download Ticket Receipts'
    ]
  });
});

// Organizer Protected Dashboard Data
app.get('/api/dashboard/organizer', authenticateToken, requireRole('organizer'), (req, res) => {
  const db = readDb();
  const orgEvents = db.events.filter(e => e.org_id === req.user.userId || req.user.userId === 1);
  const orgOrders = db.orders;

  const totalRevenue = orgOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalTicketsSold = orgOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  return res.json({
    role: 'organizer',
    user: req.user,
    totalEvents: orgEvents.length,
    totalRevenue,
    totalTicketsSold,
    events: orgEvents,
    accessibleFeatures: [
      'Create and Publish Events',
      'Set Multi-tier Capacity & Pricing',
      'Live Ticket Sales Monitoring',
      'Attendee List CSV Export'
    ]
  });
});

// ----------------------------------------------------------------------
// General Events & Purchasing Endpoints
// ----------------------------------------------------------------------
app.get('/api/events', (req, res) => {
  const db = readDb();
  return res.json(db.events);
});

app.post('/api/events', authenticateToken, requireRole('organizer'), (req, res) => {
  const db = readDb();
  const { title, description, date, location, capacity, category, banner_url, ticket_tiers } = req.body;

  const newEventId = db.events.length + 1;
  const tiers = (ticket_tiers || []).map((t, idx) => ({
    ticket_id: newEventId * 10 + idx,
    name: t.name || 'General Admission',
    price: parseFloat(t.price) || 0,
    available_qty: parseInt(t.quantity, 10) || 50,
    initial_qty: parseInt(t.quantity, 10) || 50
  }));

  const newEvent = {
    event_id: newEventId,
    org_id: req.user.userId,
    title,
    description,
    date: date || new Date(Date.now() + 14 * 86400000).toISOString(),
    location,
    capacity: parseInt(capacity, 10) || 100,
    category: category || 'Community',
    banner_url: banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    status: 'published',
    ticket_types: tiers
  };

  db.events.push(newEvent);
  writeDb(db);
  return res.status(201).json(newEvent);
});

app.post('/api/tickets/purchase', authenticateToken, (req, res) => {
  const db = readDb();
  const { event_id, ticket_id, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  const event = db.events.find(e => e.event_id === parseInt(event_id, 10));
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const ticket = (event.ticket_types || []).find(t => t.ticket_id === parseInt(ticket_id, 10));
  if (!ticket) return res.status(404).json({ error: 'Ticket tier not found' });

  if (ticket.available_qty < qty) {
    return res.status(400).json({ error: `Sold Out: Only ${ticket.available_qty} ticket(s) remaining.` });
  }

  // Deduct capacity
  ticket.available_qty -= qty;
  event.capacity -= qty;

  const codes = [];
  for (let i = 0; i < qty; i++) {
    codes.push('ES-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  }

  const newOrder = {
    order_id: db.orders.length + 1,
    user_id: req.user.userId,
    user_name: req.user.name,
    user_email: req.user.email,
    event_id: event.event_id,
    event_title: event.title,
    ticket_name: ticket.name,
    quantity: qty,
    total_amount: ticket.price * qty,
    date: new Date().toISOString(),
    ticket_codes: codes
  };

  db.orders.push(newOrder);
  writeDb(db);

  return res.json({
    success: true,
    order: newOrder,
    message: 'Purchase successful.'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  EventSync Auth & API Server running on port ${PORT}`);
  console.log(`  User Accounts & Authentication: ACTIVE`);
  console.log(`  Database Storage: PERSISTENT JSON & SUPABASE READY`);
  console.log(`====================================================`);
});
