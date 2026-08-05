# ─────────────────────────────────────────────────────────────────────────────
# PlateMate Frontend — Production Multi-Stage Dockerfile (Nginx SPA)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build static assets ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments passed from Railway environment or build settings
ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_RAZORPAY_KEY_ID

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

# ── Stage 2: Serve static files with Nginx ───────────────────────────────────
FROM nginx:alpine AS runner

# Use Nginx templates directory: official Nginx Docker image automatically runs
# envsubst on /etc/nginx/templates/*.template to replace ${PORT} with Railway's dynamic $PORT
RUN mkdir -p /etc/nginx/templates && echo 'server { \
    listen ${PORT}; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/templates/default.conf.template

# Fallback default PORT if $PORT is not set
ENV PORT=80

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
