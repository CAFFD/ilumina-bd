#!/bin/bash
# ============================================================
# 🚀 Plataforma de Zeladoria Urbana - Script de Deploy
# Envia o build de produção para o servidor remoto
# ============================================================

set -e

# ---- Cores ----
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${BLUE}[ℹ]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✖]${NC} $1"; exit 1; }

# ---- Configuração ----
# Edite estas variáveis conforme seu servidor
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_HOST="${DEPLOY_HOST:-}"
SERVER_PORT="${DEPLOY_PORT:-22}"
REMOTE_DIR="${DEPLOY_DIR:-/var/www/zeladoria/dist}"
SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/id_rsa}"

# ---- Validações ----
if [ -z "$SERVER_HOST" ]; then
  echo ""
  echo "============================================================"
  echo "  🚀  Deploy - Plataforma de Zeladoria Urbana"
  echo "============================================================"
  echo ""
  echo "  Uso:"
  echo "    DEPLOY_HOST=seu-servidor.com bash scripts/deploy.sh"
  echo ""
  echo "  Variáveis de ambiente disponíveis:"
  echo "    DEPLOY_HOST  - IP ou domínio do servidor (obrigatório)"
  echo "    DEPLOY_USER  - Usuário SSH (padrão: root)"
  echo "    DEPLOY_PORT  - Porta SSH (padrão: 22)"
  echo "    DEPLOY_DIR   - Diretório remoto (padrão: /var/www/zeladoria/dist)"
  echo "    DEPLOY_SSH_KEY - Chave SSH (padrão: ~/.ssh/id_rsa)"
  echo ""
  echo "  Exemplo completo:"
  echo "    DEPLOY_HOST=192.168.1.100 DEPLOY_USER=ubuntu bash scripts/deploy.sh"
  echo ""
  err "DEPLOY_HOST não definido."
fi

echo ""
echo "============================================================"
echo "  🚀  Deploy - Plataforma de Zeladoria Urbana"
echo "============================================================"
echo ""

# ---- 1. Build de Produção ----
info "Gerando build de produção..."
if [ -f "package-lock.json" ]; then
  npm ci --silent
  npm run build
elif [ -f "bun.lockb" ]; then
  bun install --frozen-lockfile
  bun run build
else
  npm install
  npm run build
fi

if [ ! -d "dist" ]; then
  err "Pasta 'dist' não encontrada. Build falhou."
fi

BUILD_SIZE=$(du -sh dist | cut -f1)
log "Build gerado com sucesso ($BUILD_SIZE)"

# ---- 2. Comprimir Build ----
info "Comprimindo build..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="zeladoria-build-${TIMESTAMP}.tar.gz"
tar -czf "$ARCHIVE" -C dist .
ARCHIVE_SIZE=$(du -sh "$ARCHIVE" | cut -f1)
log "Arquivo criado: $ARCHIVE ($ARCHIVE_SIZE)"

# ---- 3. Testar conexão SSH ----
info "Testando conexão com $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."
ssh -i "$SSH_KEY" -p "$SERVER_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new \
  "$SERVER_USER@$SERVER_HOST" "echo 'OK'" > /dev/null 2>&1 \
  || err "Falha na conexão SSH. Verifique host, porta e chave."
log "Conexão SSH OK"

# ---- 4. Enviar arquivo ----
info "Enviando build para o servidor..."
scp -i "$SSH_KEY" -P "$SERVER_PORT" "$ARCHIVE" \
  "$SERVER_USER@$SERVER_HOST:/tmp/$ARCHIVE"
log "Arquivo enviado"

# ---- 5. Extrair e ativar no servidor ----
info "Ativando build no servidor..."
ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << REMOTO
set -e

# Backup do deploy anterior
if [ -d "$REMOTE_DIR" ] && [ "\$(ls -A $REMOTE_DIR 2>/dev/null)" ]; then
  BACKUP_DIR="${REMOTE_DIR}_backup_${TIMESTAMP}"
  echo "  📦 Backup anterior → \$BACKUP_DIR"
  cp -r "$REMOTE_DIR" "\$BACKUP_DIR"
fi

# Criar diretório se não existir
mkdir -p "$REMOTE_DIR"

# Limpar e extrair novo build
rm -rf ${REMOTE_DIR}/*
tar -xzf /tmp/$ARCHIVE -C $REMOTE_DIR

# Limpar arquivo temporário
rm -f /tmp/$ARCHIVE

# Recarregar Nginx
if command -v nginx &> /dev/null; then
  nginx -t && systemctl reload nginx
  echo "  ♻️  Nginx recarregado"
fi

# Limpar backups antigos (manter últimos 3)
BACKUP_COUNT=\$(ls -d ${REMOTE_DIR}_backup_* 2>/dev/null | wc -l)
if [ "\$BACKUP_COUNT" -gt 3 ]; then
  ls -dt ${REMOTE_DIR}_backup_* | tail -n +4 | xargs rm -rf
  echo "  🗑️  Backups antigos removidos"
fi

echo "  ✅ Build ativado em $REMOTE_DIR"
REMOTO

log "Deploy remoto concluído"

# ---- 6. Limpeza local ----
rm -f "$ARCHIVE"
log "Arquivo local removido"

# ---- Resumo ----
echo ""
echo "============================================================"
echo "  ✅  DEPLOY CONCLUÍDO COM SUCESSO!"
echo "============================================================"
echo ""
echo "  📦 Build:    $BUILD_SIZE"
echo "  📤 Enviado:  $ARCHIVE_SIZE (comprimido)"
echo "  🖥️  Servidor: $SERVER_USER@$SERVER_HOST"
echo "  📂 Destino:  $REMOTE_DIR"
echo "  🕐 Data:     $(date '+%d/%m/%Y %H:%M:%S')"
echo ""
echo "  🌐 Acesse: http://$SERVER_HOST"
echo ""
echo "============================================================"
