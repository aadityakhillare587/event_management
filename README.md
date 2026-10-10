# EventHub — Modern Full-Stack Event Management System

A production-ready, full-stack **Event Management System** built with **React.js, Vite, Tailwind CSS, Node.js, Express.js, and MongoDB**.

---

## 🌟 Key Features

### 👤 User Capabilities
- **Authentication**: JWT-based registration and secure login with bcryptjs password hashing.
- **Home Landing Page**: Dynamic hero section, metrics counters, categorized event discovery, and upcoming/popular event listings.
- **Event Catalog & Filtering**: Real-time keyword search, category pills (Technology, Music, Business, Workshop, Arts, Sports), and date filters.
- **Event Details & Live Seat Counter**: High-resolution gallery, comprehensive descriptions, venue details, and interactive ticket quantity counter.
- **Ticket Reservation**: Real-time seat decrementing and total price calculation with instant booking confirmation.
- **My Bookings**: Manage personal tickets, check booking statuses, and cancel reservations with automatic ticket return to the seat pool.

### 🛡️ Admin Dashboard (`/admin`)
- **Key Metrics Analytics**: Live counters for **Total Users**, **Total Events**, **Total Bookings**, and **Total Revenue**.
- **Event Management**: Create new events, edit details, adjust ticket pricing/seats, or delete events.
- **Booking Management**: Review all reservations across all users, update statuses (Confirmed / Cancelled), or cancel reservations.
- **User Management**: Inspect registered users and securely remove accounts (with self-deletion protection).
- **Protected Routes**: Restricts unauthorized users from accessing the admin panel and endpoints.

---

## 📂 Project Architecture

```
event-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive navbar with user profile & role-based badges
│   │   │   ├── Footer.jsx           # Modern footer with branding, links & contact info
│   │   │   ├── EventCard.jsx        # Reusable card with seat indicator and price tag
│   │   │   └── ProtectedRoute.jsx   # Route guard for authenticated & admin users
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Hero, category cards, upcoming & popular events
│   │   │   ├── Login.jsx            # Sign in with JWT storage & validation
│   │   │   ├── Register.jsx         # User registration with password confirmation
│   │   │   ├── Events.jsx           # Event catalog with search & multi-filter
│   │   │   ├── EventDetails.jsx     # Full event info & instant ticket booking
│   │   │   ├── MyBookings.jsx       # Personal booking history & cancellation
│   │   │   └── AdminDashboard.jsx   # Analytics cards, event, booking & user management
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state & persistent session management
│   │   ├── api.js                   # Axios client with automated Bearer token attachment
│   │   ├── App.jsx                  # Main router configuration
│   │   ├── main.jsx                 # React root DOM bootstrap
│   │   └── index.css                # Tailwind CSS & custom animations
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── backend/
    ├── config/
    │   └── db.js                    # Mongoose database connection
    │
    ├── models/
    │   ├── User.js                  # User schema with bcrypt password hashing
    │   ├── Event.js                 # Event schema with categories, seats & pricing
    │   └── Booking.js               # Booking schema with User & Event relations
    │
    ├── routes/
    │   ├── authRoutes.js            # /api/auth (register, login, me, admin users)
    │   ├── eventRoutes.js           # /api/events (CRUD & search/filter)
    │   └── bookingRoutes.js         # /api/bookings (reserve, my bookings, admin stats)
    │
    ├── controllers/
    │   ├── authController.js        # Auth logic, JWT issuance & user management
    │   ├── eventController.js       # Event creation, search, update & deletion
    │   └── bookingController.js     # Ticket reservation, seat subtraction & stats
    │
    ├── middleware/
    │   └── authMiddleware.js        # protect (JWT verify) & admin (role check)
    │
    ├── seed.js                      # Database seeder with sample admin, users & events
    ├── .env                         # Backend environment configuration
    ├── server.js                    # Express app entrypoint with CORS & route mounting
    └── package.json
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. MongoDB Setup
You can run MongoDB locally or use a free cloud MongoDB Atlas cluster:

#### Option A: Local MongoDB
1. Download and install **MongoDB Community Server**:
   [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service:
   - On Windows: Start the "MongoDB Server" service in Windows Services or run `mongod` from Command Prompt.
3. The default connection URI is:
   ```
   mongodb://127.0.0.1:27017/event_management
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist your IP (or `0.0.0.0/0`).
3. Copy your connection string and paste it into `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/event_management?retryWrites=true&w=majority
   ```

---

### 2. Configure Backend `.env`
In `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_management
JWT_SECRET=event_management_super_secret_jwt_key_2025
```

---

### 3. Install Dependencies & Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend server starts on: **`http://localhost:5000`**

#### Seed Initial Sample Data (Admin & Events)
To immediately populate the database with an admin user, sample attendee accounts, and 6 high-quality events:
```bash
cd backend
npm run seed
```

**Pre-seeded Credentials:**
- **Admin Account**: `admin@eventhub.com` | Password: `password123`
- **User Account**: `jane@example.com` | Password: `password123`

---

### 4. Install Dependencies & Start the Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on: **`http://localhost:5173`**

---

## 🧪 Testing the Complete Workflow

### User Flow
1. Open [http://localhost:5173](http://localhost:5173).
2. Click **Create Account** or **Sign In** with `jane@example.com` / `password123`.
3. Browse the **Events** page, search for keywords like "Tech", or filter by category "Music".
4. Click **View Details** on any event.
5. Select the number of tickets and click **Book Now**.
6. View the instant confirmation receipt and navigate to **My Bookings**.
7. Test the **Cancel Booking** button to release your tickets back to the event inventory.

### Admin Flow
1. Sign in with the Admin credentials (`admin@eventhub.com` / `password123`).
2. Click **Admin Panel** in the navbar or navigate directly to [http://localhost:5173/admin](http://localhost:5173/admin).
3. Check the real-time analytics cards:
   - **Total Users**
   - **Total Events**
   - **Total Bookings**
   - **Total Revenue**
4. Click **Create New Event** to add a new event with image, date, location, price, and seats.
5. Edit or delete existing events from the catalog.
6. Switch to the **Manage Bookings** tab to review all reservations and change statuses.
7. Switch to the **Manage Users** tab to review all registered accounts.

