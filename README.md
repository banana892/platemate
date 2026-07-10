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
| 15 | Deployment | ⏳ Pending |

---

## 🔗 API Documentation

Base URL: `http://localhost:5000/api/v1`

Health check: `GET /api/v1/health`

See `docs/api.md` for full API reference (added in Phase 5).

---

## 📐 Architecture Decisions

- **Monorepo**: Single Git repo for frontend + backend
- **JWT Strategy**: Short-lived access tokens (15m) + long-lived refresh tokens (7d) in httpOnly cookies
- **Payments**: Mock → Razorpay (UPI, Cards, Wallets)
- **Email**: Resend — mandatory email verification on register
- **Geography**: Multi-city from day one (lat/lng + delivery radius)
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
