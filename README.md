# 🎫 CampusPass — College Event Management & Ticketing Platform

> India's #1 college event platform. Discover, book, and manage campus events seamlessly.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Express-MongoDB-green) ![Payments](https://img.shields.io/badge/Razorpay-Integrated-purple)

---

## 🚀 Features

### For Students
- Browse & filter events by category, college, date
- Book tickets with instant QR code generation
- Pay securely via Razorpay
- Download/print tickets with QR codes
- View booking history & referral system

### For Organizers
- Create events with image uploads
- Track registrations & revenue
- QR-based check-in scanner
- Add discount coupons

### For Admins
- Dashboard with analytics (revenue, categories, trends)
- Approve/reject events
- Feature events on homepage
- Manage users & view transactions

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Payments | Razorpay (test mode) |
| Images | Cloudinary / Local upload |
| QR Codes | qrcode library |
| Notifications | Nodemailer (email) |

---

## 📁 Project Structure

```
campuspass/
├── backend/
│   ├── config/          # DB, Cloudinary configs
│   ├── controllers/     # Auth, Event, Booking, Payment, Admin
│   ├── middleware/       # JWT auth, error handler
│   ├── models/          # User, Event, Booking, Payment
│   ├── routes/          # API route definitions
│   ├── utils/           # QR generation, email helper
│   ├── uploads/         # Local image uploads (fallback)
│   ├── server.js        # Express entry point
│   ├── .env.example     # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios client with JWT interceptor
│   │   ├── components/  # Navbar, Footer, EventCard, ProtectedRoute
│   │   ├── contexts/    # AuthContext (login/register/logout)
│   │   ├── lib/         # Utility functions
│   │   └── pages/       # All page components
│   ├── index.html       # Entry HTML with SEO
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** (local or MongoDB Atlas)
- **Razorpay** test-mode account (https://dashboard.razorpay.com)

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Razorpay keys
npm install
npm start
```

The API server starts on `http://localhost:5000`

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`

### 3. Create Admin User

Register a user via the signup page, then manually update their role in MongoDB:

```javascript
// In MongoDB shell or Atlas
db.users.updateOne({ email: "admin@campuspass.in" }, { $set: { role: "admin" } })
```

---

## 🔧 Environment Variables

Create `backend/.env` from `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campuspass
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional — falls back to console logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

CLIENT_URL=http://localhost:5173
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (filters: category, college, search, date) |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event (organizer) |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/coupon` | Add coupon |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Book ticket |
| GET | `/api/bookings/my` | My bookings |
| GET | `/api/bookings/event/:id` | Event registrations (organizer) |
| POST | `/api/bookings/verify/:ticketId` | Verify/check-in ticket |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment & create booking |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats & analytics |
| GET | `/api/admin/events` | All events |
| PUT | `/api/admin/events/:id/status` | Approve/reject event |
| PUT | `/api/admin/events/:id/feature` | Toggle featured |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| GET | `/api/admin/transactions` | All transactions |

---

## 🔐 Security

- JWT-based authentication with encrypted tokens
- Password hashing with bcrypt (12 salt rounds)
- Input validation via express-validator
- Role-based access control (student/organizer/admin)
- Razorpay payment signature verification
- Duplicate booking prevention (DB-level unique index)
- CORS configuration

---

## 🎨 Design

- **Dark mode** with glassmorphism cards
- **Gradient accents** (indigo-to-purple palette)
- **Responsive** mobile-first design
- **Custom animations** (float, glow, slide-up, fade-in)
- **Google Fonts** (Inter + Outfit)
- **Lucide icons** throughout

---

## 📄 License

MIT © CampusPass 2026
