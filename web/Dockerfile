# ============================================================
# 🏙️ Plataforma de Zeladoria Urbana - Dockerfile
# Build multi-stage para produção
# ============================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Produção com Nginx
FROM nginx:alpine AS production

# Copiar build para o Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
