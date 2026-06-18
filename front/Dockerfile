# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

ARG VITE_DISCORD_CLIENT_ID
ARG VITE_SITE_URL

ENV VITE_DISCORD_CLIENT_ID=$VITE_DISCORD_CLIENT_ID
ENV VITE_SITE_URL=$VITE_SITE_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: runner ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
