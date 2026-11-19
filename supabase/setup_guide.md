# Supabase Database & Integration Setup Guide for EventSync

This guide walks you through setting up Supabase as the PostgreSQL database for the **EventSync: Localized Event Management and Ticketing Platform** (IT342 Systems Integration and Architecture).

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New Project**.
3. Fill in the project details:
   - **Name**: `EventSync-DB`
   - **Database Password**: Choose a strong password (e.g., `EventSync2026!Secure`) and **save it safely** — you will need it for the Spring Boot JDBC connection.
   - **Region**: Choose `Southeast Asia (Singapore)` or the closest region to the Philippines for lowest latency.
   - **Pricing Plan**: Free Tier.
4. Click **Create new project** and wait ~2 minutes for the database to provision.

---

## 2. Execute the Database Schema & ERD

1. In the Supabase Dashboard, look at the left sidebar and click **SQL Editor** (icon with `>_`).
2. Click **New Query**.
3. Open the file `supabase/schema.sql` in this project, copy the entire SQL script, and paste it into the Supabase SQL editor.
4. Click the green **Run** button (or press `Ctrl + Enter`).
5. Verify output: You should see `"Success. No rows returned"` or confirmation messages.
6. Check your tables:
   - Click **Table Editor** on the left menu.
   - You should see the 5 tables matching the SRS ERD:
     - `users`
     - `events`
     - `ticket_types`
     - `orders`
     - `order_items`
   - Notice the seeded demo events (e.g. *Cebu Tech Summit 2026*, *CIT-U IT Hackathon*).

---

## 3. Retrieve Your Supabase API Keys (For Frontend & Node.js)

1. In Supabase, go to **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click **API** under Configuration.
3. Copy the following two values:
   - **Project URL**: e.g., `https://xyzcompany.supabase.co`
   - **Project API Keys** -> `anon` / `public`: e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Paste these values into your `frontend/.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 4. Retrieve Your PostgreSQL Connection String (For Spring Boot)

1. In Supabase, navigate to **Project Settings** -> **Database**.
2. Scroll down to **Connection parameters** / **Connection string**.
3. Select the **URI** or **JDBC** tab:
   - URI format:
     ```
     postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
   - For Spring Boot `application.properties`:
     ```properties
     spring.datasource.url=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
     spring.datasource.username=postgres.[your-project-ref]
     spring.datasource.password=[YOUR-DATABASE-PASSWORD]
     spring.datasource.driver-class-name=org.postgresql.Driver
     spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
     spring.jpa.hibernate.ddl-auto=validate
     ```
   *(Note: Use port `5432` for direct connection or port `6543` for connection pooling mode).*

---

## 5. (Optional) Set up Google OAuth in Supabase

To activate one-click Google OAuth (FR-001):
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and configure the **OAuth consent screen**.
3. Under **Credentials**, click **Create Credentials** -> **OAuth Client ID**.
4. Choose **Web application**.
5. Under **Authorized redirect URIs**, add the callback URL from your Supabase Dashboard:
   - Go to Supabase -> **Authentication** -> **Providers** -> **Google**.
   - Copy the **Callback URL** (e.g. `https://your-ref.supabase.co/auth/v1/callback`).
   - Paste this URL into Google Cloud Console.
6. Copy the **Client ID** and **Client Secret** from Google, and paste them into Supabase under **Authentication** -> **Providers** -> **Google**.
7. Toggle **Enable Google provider** to ON and click **Save**.

---

## 6. Real-Time Concurrency Function Verification

The database includes an atomic stored procedure called `process_ticket_purchase` that locks the ticket row with `FOR UPDATE` to guarantee that concurrent users cannot oversell tickets (FR-008).

You can test this function in the Supabase SQL editor:
```sql
SELECT process_ticket_purchase(
    2, -- user_id (Juan Dela Cruz)
    1, -- event_id (Cebu Tech Summit)
    1, -- ticket_id (Early Bird)
    1, -- qty
    250.00, -- total_amount
    ARRAY['ES-TEST-0001'] -- ticket code
);
```
Result will return:
```json
{
  "success": true,
  "order_id": 2,
  "tickets_purchased": 1,
  "remaining_qty": 44
}
```
If you request more tickets than available, it throws `Sold Out: requested X tickets but only Y are available`, proving the transaction isolation and anti-oversell protection works!
