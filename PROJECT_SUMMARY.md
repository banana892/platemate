# 🍽️ PlateMate Project Summary

PlateMate is a full-stack, production-inspired food delivery platform modelled after real-world systems like Swiggy and Zomato. The project is structured as a monorepo containing a modern React 19 frontend and an Express-powered backend API with PostgreSQL (via Prisma ORM), Redis caching, Cloudinary image hosting, Socket.io real-time updates, and Resend email handling.

---

## 📁 Monorepo Structure

The project code is divided into key directories:

*   **[Root Directory](file:///home/naishring/platemate)**: Contains general project configuration, monorepo documentation, and this project summary.
    *   [README.md](file:///home/naishring/platemate/README.md): Main onboarding documentation, project roadmap, and run instructions.
    *   [PROJECT_SUMMARY.md](file:///home/naishring/platemate/PROJECT_SUMMARY.md): Detailed current state analysis (this file).
*   **[backend/](file:///home/naishring/platemate/backend)**: Express server API, database models, seeds, and configurations.
    *   [package.json](file:///home/naishring/platemate/backend/package.json): Defines backend scripts, engines (Node >=20), dependencies, and devDependencies.
    *   [prisma.config.ts](file:///home/naishring/platemate/backend/prisma.config.ts): Configuration file for Prisma v7 migrations and schema location.
    *   [prisma/schema.prisma](file:///home/naishring/platemate/backend/prisma/schema.prisma): Single source of truth for the database layout (20 models, 8 enums).
    *   [prisma/seed.js](file:///home/naishring/platemate/backend/prisma/seed.js): Idempotent database seeder with realistic test data.
    *   [src/server.js](file:///home/naishring/platemate/backend/src/server.js): HTTP server bootloader, database connector, and graceful shutdown listener.
    *   [src/app.js](file:///home/naishring/platemate/backend/src/app.js): Express app instance containing middleware, logging, security configurations, and routing.
    *   [src/config/db.js](file:///home/naishring/platemate/backend/src/config/db.js): Prisma v7 Client singleton using the `@prisma/adapter-pg` driver.
    *   [src/routes/](file:///home/naishring/platemate/backend/src/routes): Contains API route handlers like [index.js](file:///home/naishring/platemate/backend/src/routes/index.js), [auth.routes.js](file:///home/naishring/platemate/backend/src/routes/auth.routes.js), [restaurant.routes.js](file:///home/naishring/platemate/backend/src/routes/restaurant.routes.js), and [user.routes.js](file:///home/naishring/platemate/backend/src/routes/user.routes.js).
    *   [src/controllers/](file:///home/naishring/platemate/backend/src/controllers): Contains HTTP layer stubs for [auth.controller.js](file:///home/naishring/platemate/backend/src/controllers/auth.controller.js), [restaurant.controller.js](file:///home/naishring/platemate/backend/src/controllers/restaurant.controller.js), and [user.controller.js](file:///home/naishring/platemate/backend/src/controllers/user.controller.js).
*   **[frontend/](file:///home/naishring/platemate/frontend)**: Vite-powered React 19 web application.
    *   [package.json](file:///home/naishring/platemate/frontend/package.json): Frontend dependencies (Redux Toolkit, Tailwind CSS v4, Router v7).
    *   [src/App.jsx](file:///home/naishring/platemate/frontend/src/App.jsx): Main React entrypoint detailing application routes and components.

---

## 🗺️ Project Roadmap & Current Progress

| Phase | Feature | Status | Description |
| :--- | :--- | :---: | :--- |
| **1** | **Frontend Foundation** | ✅ Complete | Basic layout, styling with Tailwind CSS v4, state configuration with Redux. |
| **2** | **Backend Foundation** | ✅ Complete | Express server setup, pino-http logging, helmet, compression, rate-limiting. |
| **3** | **Database Schema** | ✅ Complete | PostgreSQL models & enums in Prisma v7, robust seeds for dev testing. |
| **4** | **Authentication** | ✅ Complete | JWT Access/Refresh tokens, login, register, verify-email, Google OAuth. |
| **5** | **Customer APIs** | ✅ Complete | Menu, Cart, Orders, Addresses, Favorites, Reviews, Coupons. |
| **6** | **Restaurant Panel** | ✅ Complete | Restaurant owner dashboard, menu manager, order lifecycle manager. |
| **7** | **Delivery Panel** | ⏳ Next | Rider availability, active delivery tracker, delivery history. |
| **8** | **Admin Dashboard** | ⏳ Pending | Global management interface for users, restaurants, and order monitoring. |
| **9** | **Real-Time updates** | ⏳ Pending | Socket.io server configuration for live order & rider location tracking. |
| **10** | **Payments Integration**| ⏳ Pending | Payments infrastructure with Razorpay (UPI, Cards, Webhooks). |
| **11** | **Redis Caching** | ⏳ Pending | Optimizing high-frequency reads (restaurants list, menus) using Redis. |
| **12** | **Cloudinary Uploads** | ⏳ Pending | Image processing and storage for menus, profile photos, and restaurants. |
| **13** | **Security Hardening** | ⏳ Pending | Sanitization, CORS restriction, query validation, and bcrypt configs. |
| **14** | **Testing Suite** | ⏳ Pending | Automated integration and unit testing. |
| **15** | **Deployment Pipeline** | ⏳ Pending | Production Dockerization and hosting via services like Neon, Railway, or Render. |

---

## 🗄️ Database Architecture (Phase 3)

The database schema is fully defined in [schema.prisma](file:///home/naishring/platemate/backend/prisma/schema.prisma) and seeded through [seed.js](file:///home/naishring/platemate/backend/prisma/seed.js). It contains **20 models** across **5 distinct domains**:

### 1. Identity Domain
*   `User`: Holds account info (name, email, hashed password, role) supporting four user types: `CUSTOMER`, `PARTNER`, `RIDER`, and `ADMIN`.
*   `Address`: Saved delivery addresses (Home, Work, etc.) with coordinates (latitude, longitude) for calculating delivery ranges.
*   `RefreshToken`: Implements secure multi-device sessions and token rotation, with fields for expiry, IP, and revocation status.

### 2. Restaurant Domain
*   `RestaurantOwner`: Extension table containing partner-only details (business name, pan, bank info, admin approval status).
*   `Restaurant`: Core business entity (latitude/longitude coordinates, delivery radius, delivery fee, average delivery time, review counters).
*   `Cuisine`: Lookup table for cuisines (e.g., Italian, Indian, Chinese).
*   `RestaurantCuisine`: Junction table resolving many-to-many relationship between restaurants and cuisines.
*   `Category`: Restaurant-scoped menu categories (e.g. Starters, Mains, Drinks).
*   `MenuItem`: Individual dishes with price, veg/non-veg status, and availability. Soft-deleted to keep order records valid.
*   `BusinessHour`: Timings (opening/closing hours) for each day of the week to check if a restaurant is open.

### 3. Commerce Domain
*   `Cart` & `CartItem`: Implements the standard single-restaurant rule. All added items must originate from the same restaurant.
*   `Order` & `OrderItem`: Represents completed transactions. Snapshots delivery address details and price points to guarantee financial auditability.
*   `Payment`: Tracks transactions per order (methods: UPI, Card, Net Banking, COD; status: pending, captured, failed, refunded).
*   `Coupon`: Global promotional codes (percentage or flat discounts, validity timeframes, maximum discounts, and usage limits).

### 4. Engagement Domain
*   `Review`: Order-linked customer ratings and reviews. Updates restaurant average scores.
*   `Favorite`: Keeps track of a user's bookmarked restaurants.
*   `Notification`: System, promo, and order update notifications.

### 5. Operations Domain
*   `DeliveryPartner`: Rider-specific parameters (vehicle type, license info, availability status, active location coordinates, average ratings).

---

## ⚡ Backend Architecture

The backend setup strictly isolates responsibilities to facilitate testability and scale:
*   **Separate HTTP & Sockets Execution**: In [server.js](file:///home/naishring/platemate/backend/src/server.js), Express is wrapped in `http.createServer()` to support future socket attachments. It incorporates query validation, connection checks on startup, and automatic graceful shutdowns (releasing Prisma connections and completing in-flight requests cleanly).
*   **Express Middleware Pipeline**: Mounted sequentially inside [app.js](file:///home/naishring/platemate/backend/src/app.js):
    1.  **Security Headers**: `helmet` manages security headers (specifically tuned for Cloudinary resource policies).
    2.  **CORS Policy**: Configured to authorize credentials and restrict origins defined in environmental values.
    3.  **Parsing**: `express.json` and `urlencoded` body parsers are limited to `10kb` to thwart large payload attacks; cookies are parsed via `cookie-parser`.
    4.  **Logging**: `pino-http` handles structured high-performance logging, avoiding health-check endpoint logs to prevent noise.
    5.  **Performance**: `compression` compresses responses above 1KB.
    6.  **Rate Limiter**: General rate limiters restrict spamming on `/api/v1` routes.
*   **Routing and Controller Isolation**:
    *   Routes are cleanly aggregated in [index.js](file:///home/naishring/platemate/backend/src/routes/index.js).
    *   Active endpoints like `/auth/me` are resolved, while unimplemented routes (Phase 4 and beyond) correctly return `501 Not Implemented` stubs.

---

## 💻 Frontend Architecture

The frontend is built on **React 19** with **Vite** and **Tailwind CSS v4**.
*   **State Management**: Configured with Redux Toolkit to maintain user session state, cart status, and checkout flows.
*   **Routing Structure**: Maintained in [App.jsx](file:///home/naishring/platemate/frontend/src/App.jsx) with React Router:
    *   **Customer Pages**: [Home.jsx](file:///home/naishring/platemate/frontend/src/pages/Home.jsx), [Restaurants.jsx](file:///home/naishring/platemate/frontend/src/pages/customer/Restaurants.jsx), [RestaurantDetails.jsx](file:///home/naishring/platemate/frontend/src/pages/customer/RestaurantDetails.jsx), [Cart.jsx](file:///home/naishring/platemate/frontend/src/pages/customer/Cart.jsx), [Login.jsx](file:///home/naishring/platemate/frontend/src/pages/auth/Login.jsx), [Signup.jsx](file:///home/naishring/platemate/frontend/src/pages/auth/Signup.jsx).
    *   **Unimplemented Panels**: Redirect to a `ComingSoon` component featuring custom animations and indicators.
