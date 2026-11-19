# EventSync: Localized Event Management and Ticketing Platform
**Course:** IT342 – Systems Integration and Architecture 1  
**Institution:** Cebu Institute of Technology – University (CIT-U)  
**Author:** Mark Evon S. Verano  
**GitHub Repository:** [https://github.com/ObjPatik/EventSync](https://github.com/ObjPatik/EventSync)  
**Assignment:** Project Increment 1 – User Accounts and Authentication  
**Submission Deadline:** November 19, 2026, 9:00 PM / 21:30  
**Submission Form:** [https://forms.gle/yvRC4QJQu3kDhX718](https://forms.gle/yvRC4QJQu3kDhX718)  

---

## 📌 Project Increment 1 Implementation Overview

This repository contains the complete implementation for **Project Development Increment 1: User Accounts and Authentication**, strictly aligned with the approved Software Requirements Specification (SRS).

All three Minimum Functional Requirements are **fully functional across the Frontend, Backend, and Database**:

### 1. User Account Creation
- **Endpoint**: `POST /api/auth/register`
- **Field Validation**: Validates full name, email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), password minimum length (6+ characters), and role (`attendee` or `organizer`).
- **Duplicate Prevention**: Case-insensitive unique email check against the database before creation; returns `409 Conflict: "An account with this email already exists"`.
- **Password Security**: Passwords are encrypted before storage using **BCrypt** with salt (`bcryptjs.hash(password, 10)`). Plaintext passwords are never stored.
- **Database Storage**: User profile, hashed password, role, and registration timestamp are persisted to PostgreSQL (Supabase) / local persistent store (`backend/data/database.json`).

### 2. User Login and Logout
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: Looks up user by email and compares entered password against stored BCrypt hash (`bcryptjs.compare()`).
- **Error Handling**: Displays explicit error messages for empty fields and invalid credentials (`401 Unauthorized: "Invalid email or password"`).
- **Session Security**: Issues signed JSON Web Tokens (JWT) containing user ID, email, and role.
- **Logout Endpoint**: `POST /api/auth/logout` properly clears authenticated tokens and client session state.
- **Protected Route Guards**: `authenticateToken` middleware inspects `Authorization: Bearer <token>` on protected endpoints (`GET /api/auth/me`, `/api/dashboard/*`). Unauthorized requests receive `401 Unauthorized`.

### 3. Role-Based User Dashboards
- **Attendee Dashboard** (`/dashboard/attendee`):
  - Automatically redirects attendees upon login.
  - Displays attendee profile, claimed entrance passes with unique verification codes (`ES-2026-XXXXXX`), QR representations, and registered events.
  - Restricted from organizer administrative privileges.
- **Organizer Dashboard** (`/dashboard/organizer`):
  - Automatically redirects organizers upon login.
  - Displays real-time sales KPIs (Total Revenue in ₱, Tickets Sold, Occupancy Rate).
  - Event management and full attendee roster with **Export Attendees (CSV)**.
- **Role-Based Access Control (RBAC)**:
  - Frontend guards block unauthorized views.
  - Backend middleware (`requireRole('organizer')` / `requireRole('attendee')`) returns `403 Forbidden` for cross-role privilege violations.

---

## 📁 Complete Project Architecture & Structure

```text
EventSync/
├── frontend/                     # ReactJS Frontend (Vite + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx             # User Account Creation & Login (BCrypt + JWT)
│   │   │   ├── AttendeeDashboard.jsx     # Role-based Attendee Dashboard & Digital Passes
│   │   │   ├── OrganizerDashboard.jsx    # Role-based Organizer Dashboard & CSV Export
│   │   │   ├── EventDiscovery.jsx        # Public Event Discovery Feed with Search & Filters
│   │   │   ├── EventCard.jsx             # Event Cards with Live Capacity Progress
│   │   │   ├── EventDetailModal.jsx      # Ticket Selection with Concurrency Checks
│   │   │   ├── DigitalTicketModal.jsx    # Digital Passes with Unique Code & Barcode
│   │   │   ├── CreateEventModal.jsx      # Multi-tier Pricing & Capacity Management
│   │   │   ├── MyTicketsView.jsx         # Attendee Verified Passes Viewer
│   │   │   ├── Navbar.jsx                # Dynamic Role-based Navigation & Auth Controls
│   │   │   └── SupabaseSettingsModal.jsx # Live Database Integration Connector
│   │   ├── lib/
│   │   │   ├── supabaseClient.js         # Supabase Client Initialization
│   │   │   └── mockData.js               # Initial Seed Events & Demo Users
│   │   ├── App.jsx                       # Root Application Orchestrator & Session Guards
│   │   ├── index.css                     # Modern Glassmorphic Design System
│   │   └── main.jsx                      # React Root Entrypoint
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                      # Node.js & Express API Backend
│   ├── src/
│   │   └── server.js             # Auth Routes, BCrypt Hashing, JWT Sessions, RBAC Middleware
│   ├── data/
│   │   └── database.json         # Real Persistent Database Storage on Disk
│   ├── tests/
│   │   └── auth.test.js          # Automated Auth & Role Verification Test Suite
│   ├── package.json
│   └── .env.example
├── backend-springboot/           # Enterprise Java Spring Boot 3 Backend (SRS Architecture)
│   ├── pom.xml                   # Maven Configuration (Spring Web, Data JPA, PostgreSQL, SendGrid)
│   ├── src/main/resources/
│   │   └── application.properties # PostgreSQL & Database Connection Settings
│   └── src/main/java/com/citu/eventsync/
│       ├── EventSyncApplication.java
│       ├── controller/           # UserController, EventController, OrderController, OrganizerController
│       ├── model/                # User, Event, TicketType, Order, OrderItem JPA Entities
│       ├── repository/           # Spring Data JPA Repositories with Pessimistic Write Lock
│       └── service/              # EventService, OrderService, EmailService
├── supabase/                     # PostgreSQL Cloud Database Architecture
│   ├── schema.sql                # Complete ERD Schema, BCrypt Hash Support, & Row-locking Functions
│   └── setup_guide.md            # Step-by-Step Cloud PostgreSQL Walkthrough
└── README.md                     # Comprehensive Increment 1 Documentation & Setup Guide
```

---

## 🗄️ Database Schema (`users` Table)

```sql
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

CREATE INDEX idx_users_email ON users(email);
```

---

## 🚀 How to Run and Test

### 1. Start the Backend API Server
```powershell
cd backend
npm install
npm start
```
The server starts on port `8080`.
*Note: Both Supabase PostgreSQL and the local persistent database (`backend/data/database.json`) are supported.*

### 2. Run Automated Auth Verification Tests
Run the included test suite to verify all authentication and RBAC requirements:
```powershell
cd backend
npm test
```
**Test Results:**
- ✅ Test 1: Validation Error Handling (400 Bad Request)
- ✅ Test 2: User Account Creation with BCrypt Hashing (201 Created)
- ✅ Test 3: Duplicate Registration Prevention (409 Conflict)
- ✅ Test 4: Invalid Password Rejection (401 Unauthorized)
- ✅ Test 5: Valid Login & JWT Issuance (200 OK)
- ✅ Test 6: Attendee Dashboard Access (200 OK)
- ✅ Test 7: RBAC Protection - Attendee blocked from Organizer Dashboard (403 Forbidden)
- ✅ Test 8: Organizer Login & Dashboard Access (200 OK)

### 3. Start the React Frontend
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser to: **`http://localhost:5173`**

### 4. Demo Accounts for Quick Grading
| Role | Email | Password |
| :--- | :--- | :--- |
| **Organizer** | `mark.organizer@eventsync.ph` | `Password123!` |
| **Attendee** | `cit.student@citu.edu.ph` | `Password123!` |
*(Or click **Register** to create a brand new account).*

---

## 📦 Submission Guide

1. Push your code to your individual GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Increment 1 user accounts and authentication module"
   git remote add origin https://github.com/YOUR_USERNAME/EventSync.git
   git branch -M main
   git push -u origin main
   ```
2. Submit your GitHub repository URL to the official CIT-U Google Form:  
   🔗 **[https://forms.gle/yvRC4QJQu3kDhX718](https://forms.gle/yvRC4QJQu3kDhX718)**
