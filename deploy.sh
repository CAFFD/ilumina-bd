#!/bin/bash

# ============================================================
# 🚀 IluminaCity - Script de Deploy Automatizado
# ============================================================

set -e # Parar o script se houver erro

echo "🔄 Iniciando deploy..."

# 1. Atualizar código (Git Pull)
echo "📥 Recebendo atualizações do Git..."
git pull origin main

# 2. Verificar arquivo .env
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "    Criando a partir do .env.example..."
    cp .env.example .env
    echo "⚠️  POR FAVOR, EDITE O ARQUIVO .env COM AS SENHAS CORRETAS E RODE O SCRIPT NOVAMENTE."
    exit 1
fi

# 3. Derrubar containers antigos (se houver)
echo "🛑 Parando containers antigos..."
docker compose down

# 4. Reconstruir as imagens
echo "🏗️  Construindo imagens Docker..."
docker compose build

# 5. Subir os containers em background
echo "🚀 Subindo aplicação..."
docker compose up -d

# 6. Aguardar o banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# 7. Rodar migrações do banco de dados e Seed
echo "🗄️  Rodando migrações do banco..."
docker compose exec api npm run db:migrate

echo "🌱  Rodando Seeds do banco de dados..."
docker compose exec api npm run db:seed

# 8. Criar Admin Padrão (Idempotente - só cria se não existir)
echo "👤 Verificando usuário admin..."
docker compose exec api npx tsx src/db/create-admin.ts

echo "✅ DEPLOY FINALIZADO COM SUCESSO!"
echo "------------------------------------------------"
echo "🌐 Frontend: http://[IP_DA_VM_PROXMOX]"
echo "🔌 API:      http://localhost:3333"
echo "🗃️ Adminer:  http://localhost:8081"
echo "------------------------------------------------"
