# 🎬 IMovies – Movie Ticket Booking System

A full-stack cinema ticket booking web application built with the **MERN** stack (MongoDB, Express.js, React.js with Vite, and Node.js), featuring real-time seat availability updates via Socket.IO, secure JWT role-based authentication, an itemized checkout flow with simulated & Razorpay payment modes, scannable QR ticket generation, user booking history with cancellations, and an administrator management dashboard.

---

## 🌟 Key Features

### 🍿 Guest & User Capabilities
- **Curated Box Office Homepage**: Featured movie premiere hero banner with trailer links, now showing carousel, upcoming releases, and popular theatre multi-plexes.
- **Search & Advanced Filtering**: Filter movies by search term, genre (Action, Sci-Fi, Drama, etc.), language (English, Hindi), release status, and rating.
- **Movie Details & Showtimes**: High-definition movie backdrop, runtime, age certificate, cast list, and date picker showing all available theatres and showtimes.
- **Interactive Cinema Seat Grid**: Visual curved cinema screen, realistic seat layouts with row labels (A–H), tiered seat categories (VIP, Premium, Executive, Regular), real-time status indicators (Available, Selected, Reserved/Held, and Booked).
- **Seat Concurrency Control**: Prevents double-booking using server-side temporary holds (8-minute hold window) and live Socket.IO availability broadcasts.
- **Checkout & Simulated Gateway**: Itemized price calculation (tickets subtotal + convenience fee + 5% GST), simulated instant card/UPI payment workflows, plus a dedicated test toggle for simulating payment declines.
- **Digital M-Ticket Confirmation**: Booking reference code, ticket breakdown, and scannable QR code generated server-side for cinema gate entry.
- **User Profile & Booking History**: Manage personal profile, view upcoming active tickets, cancel bookings with automatic 85% refund computation, and review past booking history.

### 🛡️ Administrator Capabilities
- **Executive Analytics Dashboard**: Overview of platform revenue, confirmed tickets, active movies, partner theatres, and total registered guests.
- **Movie Management**: Create, edit, inspect, and delete movies with poster art, ratings, duration, certificate, and trailer links.
- **Theatre & Screen Management**: Add theatres with facilities (Dolby Atmos, IMAX Laser, Food Court), cities, and addresses.
- **Showtime Scheduling**: Schedule movie screenings across theatres, screens, dates, time slots, and tiered pricing structures.
- **Master Bookings Ledger**: Live searchable overview of all transactions, guest information, seat assignments, and booking statuses.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM 6, Axios, Bootstrap 5, Custom Cinema CSS, React Icons, React Toastify, Socket.IO Client, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO (WebSockets), JWT, BcryptJS, Helmet, Express Rate Limit, Express Validator, QRCode, Dotenv, CORS |
| **Database** | MongoDB Atlas / Mongoose (with built-in development in-memory fallback) |
| **Payment Gateway** | Simulated instant payment gateway (Demo mode) with Razorpay integration support |

---

## 📂 Project Structure

```
imovies/
├── client/                     # Frontend React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Navbar, Footer, MovieCard, SeatGrid, Spinners, etc.
│   │   ├── context/            # AuthContext (JWT) and SocketContext (Socket.IO)
│   │   ├── pages/              # Home, Movies, Details, SeatSelection, Checkout, etc.
│   │   │   └── admin/          # Admin Dashboard, Movies, Theatres, Shows, Bookings
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx             # Main router and layout
│   │   ├── index.css           # Premium dark cinematic theme
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json             # Vercel SPA rewrites
│   └── .env.example
├── server/                     # Backend Express.js REST API & WebSockets
│   ├── scripts/
│   │   ├── seed.js             # Database seeding script (10+ movies, theatres, shows)
│   │   └── testApi.js          # Automated backend testing suite
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── controllers/        # Auth, Movies, Theatres, Shows, Bookings, Admin
│   │   ├── middleware/         # JWT Protect, Admin Authorization, Validation, Rate Limiter
│   │   ├── models/             # Mongoose schemas (User, Movie, Theatre, Screen, Show, Booking, etc.)
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # Seat hold concurrency service & Payment processing
│   │   ├── sockets/            # Socket.IO seat synchronization handlers
│   │   ├── utils/              # API response formatting & QR code generator
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # HTTP + Socket.IO server listener
│   ├── package.json
│   └── .env.example
├── .gitignore                  # Git exclusions (node_modules, .env, build output)
└── README.md
```

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9.0.0 or higher

### 2. Install Dependencies

Open your terminal and run:

**Backend Dependencies:**
```bash
cd C:\Users\Admin\imovies\server
npm install
```

**Frontend Dependencies:**
```bash
cd C:\Users\Admin\imovies\client
npm install
```

---

### 3. Environment Configuration

#### Backend Configuration (`server/.env`):
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_imovies_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=IMovies Administrator
ADMIN_EMAIL=admin@imovies.com
ADMIN_PASSWORD=Admin@123456
PAYMENT_MODE=simulated
SEAT_HOLD_DURATION_MINUTES=8
```
> **Note on Database**: If you do not have a MongoDB Atlas connection string yet, the backend automatically operates in **Resilient In-Memory Mode**, populating all 10 sample movies, theatres, and shows so you can use and test the app immediately!

#### Frontend Configuration (`client/.env`):
Create `client/.env` (or copy from `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### 4. Seed the Database

To pre-populate movies, theatres, screens, and shows:
```bash
cd C:\Users\Admin\imovies\server
npm run seed
```

---

### 5. Run the Application

Start the backend server and frontend development server in two separate terminal windows:

**Terminal 1 (Backend API & Socket.IO):**
```bash
cd C:\Users\Admin\imovies\server
npm run dev
```
*Backend runs at: [http://localhost:5000](http://localhost:5000)*

**Terminal 2 (Frontend Client):**
```bash
cd C:\Users\Admin\imovies\client
npm run dev
```
*Frontend runs at: [http://localhost:5173](http://localhost:5173)*

Open your browser and navigate to **http://localhost:5173**!

---

## 🔑 Pre-Configured Demo Accounts

Use these accounts to test both guest booking and administrator workflows (or click the quick autofill buttons on the login screen):

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@123456` | Full Admin Dashboard, Movie CRUD, Showtime Scheduling, Master Bookings |
| **Demo User** | `user@imovies.com` | `User@123456` | Movie browsing, seat selection, checkout, ticket QR code, booking cancellations |

---

## 🧪 Automated Testing

The backend includes an automated test suite verifying health endpoints, password hashing, seat hold concurrency duplicate prevention, payment simulation, and seed data integrity:

```bash
cd C:\Users\Admin\imovies\server
npm test
```

---

## 🌐 Deployment Instructions

### Deploying the Frontend to Vercel

1. Push your repository to GitHub (see below).
2. Go to [Vercel](https://vercel.com) and log in.
3. Click **Add New** → **Project** and import your `imovies` repository.
4. Set the **Root Directory** to `client`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://imovies-api.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your deployed backend URL (e.g. `https://imovies-api.onrender.com`)
6. Click **Deploy**. Vercel will build the Vite app using the included `vercel.json` SPA configuration.

### Deploying the Backend (Render / Railway / Heroku)

Since Express and Socket.IO require persistent WebSocket connections and a running Node process:
1. Create a **Web Service** on [Render.com](https://render.com) or [Railway.app](https://railway.app).
2. Connect your GitHub repository and set the **Root Directory** to `server`.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random secret string
   - `CLIENT_URL`: Your deployed frontend Vercel URL
   - `NODE_ENV`: `production`
6. Deploy the web service and copy its public HTTPS URL into your Vercel frontend `VITE_API_URL` setting.

---

## 📤 Manual Steps to Publish to GitHub

1. Open your terminal in the root project folder:
   ```bash
   cd C:\Users\Admin\imovies
   ```
2. Initialize Git and stage the files:
   ```bash
   git init
   git add .
   git commit -m "feat: complete IMovies full-stack cinema booking application"
   ```
3. Create a new repository on your GitHub account (named `imovies`).
4. Link the remote and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/imovies.git
   git push -u origin main
   ```
*(Note: Because of `.gitignore`, your `node_modules` and `.env` credentials will stay protected on your local computer and will never be uploaded to GitHub.)*

---

## 📄 License
MIT License. Built for educational and demonstration purposes.
