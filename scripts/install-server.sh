#!/bin/bash
# ============================================================
# 🏙️ Plataforma de Zeladoria Urbana - Script de Instalação
# Ubuntu Server 22.04 LTS+
# Instala: Nginx, PostgreSQL 15 + PostGIS, Node.js 20, Certbot
# ============================================================

set -e

# ---- Cores para output ----
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${BLUE}[ℹ]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✖]${NC} $1"; }

# ---- Verificações ----
if [ "$EUID" -ne 0 ]; then
  err "Execute como root: sudo bash install-server.sh"
  exit 1
fi

echo ""
echo "============================================================"
echo "  🏙️  Instalação - Plataforma de Zeladoria Urbana"
echo "============================================================"
echo ""

# ---- Variáveis configuráveis ----
read -p "📌 Nome do domínio (ou IP do servidor): " DOMAIN
read -p "📌 Nome do banco de dados [zeladoria]: " DB_NAME
DB_NAME=${DB_NAME:-zeladoria}
read -p "📌 Usuário do banco [zeladoria_admin]: " DB_USER
DB_USER=${DB_USER:-zeladoria_admin}
read -sp "📌 Senha do banco de dados: " DB_PASS
echo ""
read -p "📌 Porta da aplicação [3000]: " APP_PORT
APP_PORT=${APP_PORT:-3000}
read -p "📌 Deseja instalar SSL com Certbot? (s/n) [n]: " INSTALL_SSL
INSTALL_SSL=${INSTALL_SSL:-n}

APP_DIR="/var/www/zeladoria"
DIST_DIR="$APP_DIR/dist"

echo ""
info "Configuração:"
info "  Domínio:  $DOMAIN"
info "  Banco:    $DB_NAME"
info "  Usuário:  $DB_USER"
info "  Porta:    $APP_PORT"
info "  App dir:  $APP_DIR"
echo ""

# ============================================================
# 1. ATUALIZAR SISTEMA
# ============================================================
info "Atualizando sistema..."
apt update -y && apt upgrade -y
log "Sistema atualizado"

# ============================================================
# 2. INSTALAR DEPENDÊNCIAS BASE
# ============================================================
info "Instalando dependências base..."
apt install -y \
  curl wget git unzip build-essential \
  software-properties-common apt-transport-https \
  ca-certificates gnupg lsb-release ufw
log "Dependências base instaladas"

# ============================================================
# 3. INSTALAR NODE.JS 20 LTS
# ============================================================
info "Instalando Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
  log "Node.js $(node -v) instalado"
else
  log "Node.js já instalado: $(node -v)"
fi

# Instalar npm global tools
npm install -g pm2
log "PM2 instalado globalmente"

# ============================================================
# 4. INSTALAR POSTGRESQL 15 + POSTGIS
# ============================================================
info "Instalando PostgreSQL 15 + PostGIS..."
if ! command -v psql &> /dev/null; then
  sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
  apt update -y
  apt install -y postgresql-15 postgresql-15-postgis-3
  log "PostgreSQL 15 + PostGIS instalados"
else
  log "PostgreSQL já instalado"
fi

# Iniciar e habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Criar banco e usuário
info "Configurando banco de dados..."
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'\" | grep -q 1 || psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\" | grep -q 1 || psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""
su - postgres -c "psql -d $DB_NAME -c 'CREATE EXTENSION IF NOT EXISTS postgis;'"
su - postgres -c "psql -d $DB_NAME -c 'CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";'"
su - postgres -c "psql -c \"ALTER USER $DB_USER CREATEDB;\""
log "Banco '$DB_NAME' configurado com PostGIS"

# ============================================================
# 5. CRIAR SCHEMA INICIAL
# ============================================================
info "Criando schema inicial..."
su - postgres -c "psql -d $DB_NAME" << 'EOSQL'
-- Tabela de postes
CREATE TABLE IF NOT EXISTS postes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_poste VARCHAR(50) UNIQUE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  tipo_lampada VARCHAR(100),
  potencia_w INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ativo',
  bairro VARCHAR(100),
  logradouro VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice geoespacial
CREATE INDEX IF NOT EXISTS idx_postes_geom ON postes USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_postes_id_poste ON postes(id_poste);

-- Tabela de ocorrências
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  poste_id UUID REFERENCES postes(id),
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  status VARCHAR(30) DEFAULT 'aberta',
  prioridade VARCHAR(20) DEFAULT 'media',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  foto_url TEXT,
  reportado_por VARCHAR(100),
  telefone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolvido_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_protocolo ON ocorrencias(protocolo);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_poste ON ocorrencias(poste_id);

-- Tabela de usuários operadores
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'operador',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de log de atividades
CREATE TABLE IF NOT EXISTS atividades_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  ocorrencia_id UUID REFERENCES ocorrencias(id),
  acao VARCHAR(50) NOT NULL,
  detalhes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger para atualizar geom automaticamente
CREATE OR REPLACE FUNCTION atualizar_geom_poste()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_postes_geom ON postes;
CREATE TRIGGER trg_postes_geom
  BEFORE INSERT OR UPDATE ON postes
  FOR EACH ROW EXECUTE FUNCTION atualizar_geom_poste();

-- Função para buscar postes próximos
CREATE OR REPLACE FUNCTION postes_proximos(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  raio_metros INTEGER DEFAULT 100
)
RETURNS TABLE(
  id UUID,
  id_poste VARCHAR,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tipo_lampada VARCHAR,
  potencia_w INTEGER,
  distancia_m DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.id_poste, p.latitude, p.longitude,
    p.tipo_lampada, p.potencia_w,
    ST_Distance(
      p.geom::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distancia_m
  FROM postes p
  WHERE ST_DWithin(
    p.geom::geography,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    raio_metros
  )
  ORDER BY distancia_m;
END;
$$ LANGUAGE plpgsql;

EOSQL
log "Schema inicial criado com sucesso"

# ============================================================
# 6. INSTALAR NGINX
# ============================================================
info "Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
log "Nginx instalado"

# ============================================================
# 7. CONFIGURAR NGINX
# ============================================================
info "Configurando Nginx..."
mkdir -p $DIST_DIR

cat > /etc/nginx/sites-available/zeladoria << EONGINX
server {
    listen 80;
    server_name $DOMAIN;

    root $DIST_DIR;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - todas as rotas vão para index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy para API backend (se existir)
    location /api/ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EONGINX

ln -sf /etc/nginx/sites-available/zeladoria /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log "Nginx configurado"

# ============================================================
# 8. SSL COM CERTBOT (OPCIONAL)
# ============================================================
if [ "$INSTALL_SSL" = "s" ] || [ "$INSTALL_SSL" = "S" ]; then
  info "Instalando Certbot para SSL..."
  apt install -y certbot python3-certbot-nginx
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
  log "SSL configurado com Certbot"
  
  # Renovação automática
  systemctl enable certbot.timer
  log "Renovação automática de SSL ativada"
fi

# ============================================================
# 9. CONFIGURAR FIREWALL
# ============================================================
info "Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
log "Firewall configurado (SSH + HTTP/HTTPS)"

# ============================================================
# 10. CRIAR SCRIPT DE DEPLOY
# ============================================================
info "Criando script de deploy..."
cat > /usr/local/bin/deploy-zeladoria << 'EODEPLOY'
#!/bin/bash
set -e
APP_DIR="/var/www/zeladoria"
REPO_DIR="$APP_DIR/repo"

echo "🚀 Deploy - Plataforma de Zeladoria Urbana"
echo "==========================================="

cd $REPO_DIR

echo "📥 Atualizando código..."
git pull origin main

echo "📦 Instalando dependências..."
npm ci

echo "🔨 Gerando build de produção..."
npm run build

echo "📂 Copiando build para Nginx..."
rm -rf $APP_DIR/dist/*
cp -r dist/* $APP_DIR/dist/

echo "♻️  Recarregando Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse: https://$(cat /etc/nginx/sites-available/zeladoria | grep server_name | awk '{print $2}' | tr -d ';')"
EODEPLOY

chmod +x /usr/local/bin/deploy-zeladoria
log "Script de deploy criado: /usr/local/bin/deploy-zeladoria"

# ============================================================
# 11. CRIAR ARQUIVO .ENV DE EXEMPLO
# ============================================================
mkdir -p $APP_DIR
cat > $APP_DIR/.env.example << EOENV
# Banco de Dados
DATABASE_URL=postgresql://$DB_USER:SUA_SENHA@localhost:5432/$DB_NAME
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=SUA_SENHA

# Aplicação
APP_PORT=$APP_PORT
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)

# Domínio
DOMAIN=$DOMAIN
EOENV

log "Arquivo .env.example criado em $APP_DIR"

# ============================================================
# 12. CRIAR SERVIÇO SYSTEMD PARA API (OPCIONAL)
# ============================================================
cat > /etc/systemd/system/zeladoria-api.service << EOSERVICE
[Unit]
Description=Zeladoria Urbana API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR/repo
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env

[Install]
WantedBy=multi-user.target
EOSERVICE

systemctl daemon-reload
log "Serviço systemd criado (zeladoria-api)"

# ============================================================
# RESUMO FINAL
# ============================================================
echo ""
echo "============================================================"
echo "  ✅  INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "============================================================"
echo ""
echo "  📦 Componentes instalados:"
echo "     • Node.js $(node -v)"
echo "     • PostgreSQL 15 + PostGIS 3"
echo "     • Nginx"
echo "     • PM2"
echo "     • UFW Firewall"
[ "$INSTALL_SSL" = "s" ] && echo "     • Certbot (SSL)"
echo ""
echo "  🗄️  Banco de dados:"
echo "     • Database: $DB_NAME"
echo "     • Usuário:  $DB_USER"
echo "     • Host:     localhost:5432"
echo ""
echo "  📂 Diretórios:"
echo "     • App:      $APP_DIR"
echo "     • Build:    $DIST_DIR"
echo "     • Env:      $APP_DIR/.env.example"
echo ""
echo "  🚀 Próximos passos:"
echo "     1. Clone o repositório:"
echo "        git clone SEU_REPO $APP_DIR/repo"
echo ""
echo "     2. Configure o .env:"
echo "        cp $APP_DIR/.env.example $APP_DIR/.env"
echo "        nano $APP_DIR/.env"
echo ""
echo "     3. Faça o primeiro deploy:"
echo "        deploy-zeladoria"
echo ""
echo "     4. Acesse: http://$DOMAIN"
echo ""
echo "============================================================"
