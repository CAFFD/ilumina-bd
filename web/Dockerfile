# ============================================================
# 🏙️ Plataforma de Zeladoria Urbana - Dockerfile
# Build multi-stage para produção
# ============================================================

# Stage 1: Build da aplicação React
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências (cache otimizado)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar build de produção (para a pasta /app/dist)
RUN npm run build

# Stage 2: Servidor Nginx (imagem final enxuta)
FROM nginx:alpine AS production

# Copiar apenas os arquivos estáticos do build anterior
# Reduz drasticamente o tamanho da imagem final
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx (SPA + Proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80 do container
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
