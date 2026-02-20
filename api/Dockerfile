# ============================================================
# 🏙️ IluminaCity API - Dockerfile
# Node.js 20 LTS (Alpine)
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Instalar dependências de sistema necessárias (opcional, mas boa prática)
RUN apk add --no-cache curl

# Copiar arquivos de dependência primeiro (Cache Layer Optimization)
COPY package.json package-lock.json ./

# Instalar dependências (limpo e rápido)
RUN npm ci

# Copiar o restante do código
COPY . .

# Buildar o TypeScript (se necessário)
# Se o seu projeto usa tsx/ts-node em dev, para prod geralmente buildamos
# Mas como o start script pode variar, vamos garantir que o build ocorra.
RUN npm run build

# Expor a porta da API
EXPOSE 3333

# Comando de inicialização
CMD ["npm", "start"]
