# 💡 EyeDea — Discussion & Idea-Sharing Forum

A full-stack, high-performance community bulletin board inspired by the layout and UX of classic online forums (like `, Symbianize, PinoyExchange, and TipidPC), re-imagined as a **clean, intellectual sanctuary** where developers, innovators, startup founders, and creators share ideas, discuss architectures, validate concepts, and collaborate.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Lucide React icons
- **Backend**: Next.js API Routes (Node.js runtime), JWT cookie sessions, bcrypt password hashing
- **Database**: PostgreSQL with **Prisma ORM** (Compatible with Supabase, Neon, or local PostgreSQL)
- **Design Aesthetic**: Dark bulletin board theme, multi-paragraph post cards with author profile stats (join date, reputation, role badges), thread reply quote systems, and an interactive Owner Admin Panel.

---

## ⚡ Quick Start

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> The platform comes with a zero-config resilient fallback data layer so you can browse forums, view threads, log in, test the admin panel, and post immediately even before connecting an external database.

---

## 🔐 Owner Credentials

### 👑 Owner / Administrator Account
- **Username**: `kihaan`
- **Email**: `kihaan@ideasphere.ph`
- **Password**: `kianchoi093020`
- **Access**: Full Owner / Admin Panel (`/admin`), board creation, category management, role assignments, thread locking/pinning, and site-wide broadcasts.

*(All previous test dummy users have been removed).*

---

## 🗄️ Connecting to PostgreSQL / Supabase

1. Open your `.env` file.
2. Replace `DATABASE_URL` with your Supabase or PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   ```
3. Push the Prisma schema to create the tables in PostgreSQL:
   ```bash
   npx prisma db push
   ```
4. (Optional) Seed the database with initial categories and administrator:
   ```bash
   npm run prisma:seed
   ```

---

## 🌟 Key Features

1. **Classic Bulletin Board Layout**:
   - Categorized boards with thread & post counters
   - "Latest Post" cards with relative timestamps and author preview
   - Pinned/Sticky threads and lock controls
2. **Author Identity & Reputation**:
   - Two-column thread view with left Author Card (avatar, role badge, reputation score, join date)
   - Real-time upvoting system
   - Quote replying feature
3. **Dedicated Owner Admin Panel (`/admin`)**:
   - Platform health analytics (Users, Threads, Posts, Reports)
   - Category & Subforum Board creator
   - User privilege management (Assign `ADMIN`, `MODERATOR`, or `USER`)
   - Site-wide broadcast announcement publisher
4. **Strictly Clean Ethos**:
   - Community code of conduct at `/guidelines`
   - Focused entirely on ideas, technology, startups, and creative discussions.
