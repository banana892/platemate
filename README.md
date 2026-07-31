# 🍽️ PlateMate — Full-Stack Food Delivery Platform

A production-inspired food delivery web application built with modern web technologies, following real-world software engineering practices.

> **Stack**: React 19 + Vite + Tailwind CSS v4 | Node.js + Express | PostgreSQL + Prisma | Redis | Socket.io | Cloudinary | JWT Auth

---

## 📁 Monorepo Structure

```
platemate/
├── frontend/          — React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/     — Redux Toolkit slices
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
├── backend/           — Node.js + Express API
│   ├── src/
│   │   ├── config/    — DB, Redis, Cloudinary, Logger, Env
│   │   ├── constants/ — HTTP codes, roles, messages
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/— Auth, RBAC, validate, error handler
│   │   ├── validators/— Zod schemas
│   │   ├── utils/     — ApiResponse, ApiError, JWT, bcrypt
│   │   ├── sockets/   — Socket.io handlers
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docs/              — Architecture diagrams, API docs
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd backend

# 1. Set up environment
cp .env.example .env
# Edit .env with your DB URL, JWT secrets, etc.

# 2. Install dependencies
npm install

# 3. Generate Prisma client + run migrations
npm run db:generate
npm run db:migrate

# 4. Seed the database
npm run db:seed

# 5. Start development server
npm run dev        # http://localhost:5000
```

---

## 🗺️ Development Phases

| Phase | Feature | Status |
|---|---|---|
| 1 | Frontend Foundation | ✅ Complete |
| 2 | Backend Foundation | ✅ Complete |
| 3 | Database Schema | 🔄 Next |
| 4 | Authentication | ⏳ Pending |
| 5 | Customer APIs | ⏳ Pending |
| 6 | Restaurant Partner Panel | ⏳ Pending |
| 7 | Delivery Partner Panel | ⏳ Pending |
| 8 | Admin Dashboard | ⏳ Pending |
| 9 | Real-Time (Socket.io) | ⏳ Pending |
| 10 | Payments (Mock → Razorpay) | ⏳ Pending |
| 11 | Redis Caching | ⏳ Pending |
| 12 | Cloudinary Image Uploads | ⏳ Pending |
| 13 | Security Hardening | ⏳ Pending |
| 14 | Testing | ⏳ Pending |
| 15 | Deployment (Docker, Render, Vercel, CI/CD) | ✅ Complete |

---

## 🌐 Production Deployment Guide

PlateMate is configured for platform-agnostic deployment across Render, Vercel, Railway, Fly.io, Docker, or self-hosted VPS servers.

### 1. Deployment Platforms

#### Option A: Render Blueprint (Recommended)
1. Push code to your GitHub repository.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your repository — Render will automatically detect `render.yaml`.
4. Fill in required secrets (`CLOUDINARY_*`, `RAZORPAY_*`, `ALLOWED_ORIGINS`, `CLIENT_URL`).
5. Click **Apply** — database, API, and static site will deploy automatically.

#### Option B: Render Web Service (Backend) + Vercel (Frontend)
- **Backend (Render Web Service)**:
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run db:migrate:prod && npm run start`
  - Health Check Path: `/health`
- **Frontend (Vercel)**:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_BASE_URL=https://<your-backend-render-url>/api/v1`

#### Option C: Docker Container Deployment
```bash
# Build and launch PostgreSQL, Redis, Express Backend, and Frontend Nginx
docker compose up --build -d

# Verify container health
docker compose ps
```

---

## 🔑 Environment Variables Checklist

### Backend (`backend/.env`)
| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | App runtime mode | `production` |
| `PORT` | Yes | HTTP listening port | `5000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/platemate?sslmode=require` |
| `JWT_ACCESS_SECRET` | Yes | Min 32 chars secret key | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Yes | Min 32 chars secret key | `openssl rand -base64 32` |
| `CLIENT_URL` | Yes | Frontend application domain | `https://platemate.vercel.app` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins | `https://platemate.vercel.app,https://yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME` | Yes (Prod) | Cloudinary cloud identifier | `platemate-cloud` |
| `CLOUDINARY_API_KEY` | Yes (Prod) | Cloudinary API key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Yes (Prod) | Cloudinary API secret | `secret_key` |
| `RAZORPAY_KEY_ID` | Yes (Prod) | Razorpay payment key | `rzp_test_xxxxxx` |
| `RAZORPAY_KEY_SECRET` | Yes (Prod) | Razorpay secret key | `secret_xxxxxx` |

### Frontend (`frontend/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL | `https://platemate-api.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | Optional | WebSocket host override | `https://platemate-api.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | Yes | Razorpay test key ID | `rzp_test_xxxxxx` |

---

## 🛠️ Common Troubleshooting Guide

- **Database Connection Failure (`P1001`)**: Ensure `DATABASE_URL` contains `?sslmode=require` if required by cloud provider (Neon, Supabase, Render).
- **Prisma Client Missing (`@prisma/client did not initialize`)**: Run `npm run db:generate` inside `backend`.
- **CORS Error (`Blocked by CORS policy`)**: Ensure `ALLOWED_ORIGINS` in backend environment includes the exact domain of the frontend (without trailing slashes).
- **WebSocket Disconnection**: Ensure `VITE_SOCKET_URL` or `VITE_API_BASE_URL` matches the backend protocol (`https://` or `http://`).

---

## 📐 Architecture Decisions

- **Monorepo**: Single Git repo for frontend + backend
- **JWT Strategy**: Short-lived access tokens (15m) + long-lived refresh tokens (7d) in httpOnly cookies
- **Payments**: Razorpay (UPI, Cards, Wallets)
- **Email**: Resend — mandatory email verification on register
- **Logging**: Pino (structured JSON in production, pretty in development)

---

## 🏗️ Built With

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/) / [Upstash](https://upstash.com/)
- [Socket.io](https://socket.io/)
- [Cloudinary](https://cloudinary.com/)
- [Resend](https://resend.com/)

