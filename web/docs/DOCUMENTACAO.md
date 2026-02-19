# 📖 Documentação Técnica — Plataforma de Zeladoria Urbana

**Prefeitura Municipal de Palmital — SP**  
*Versão 1.0 — Fevereiro 2026*

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Estrutura de Arquivos](#4-estrutura-de-arquivos)
5. [Módulos Funcionais](#5-módulos-funcionais)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Fluxos de Uso](#7-fluxos-de-uso)
8. [Componentes Reutilizáveis](#8-componentes-reutilizáveis)
9. [Sistema de Mapas](#9-sistema-de-mapas)
10. [Sistema de QR Code](#10-sistema-de-qr-code)
11. [Infraestrutura e Deploy](#11-infraestrutura-e-deploy)
12. [Segurança](#12-segurança)
13. [Roadmap](#13-roadmap)

---

## 1. Visão Geral

A **Plataforma de Zeladoria Urbana** é um sistema web para gestão de ocorrências na iluminação pública do município de Palmital-SP. Permite que cidadãos reportem problemas (lâmpadas queimadas, postes danificados, fiação exposta, etc.) e que a equipe técnica da prefeitura gerencie, atribua e acompanhe a resolução dessas ocorrências.

### Objetivos
- Facilitar o registro de problemas de iluminação pública pelos cidadãos
- Automatizar a identificação de postes via geolocalização e QR Code
- Centralizar a gestão de ocorrências com fluxo de aprovação
- Fornecer visibilidade em tempo real via mapas interativos
- Permitir acompanhamento público pelo número de protocolo

### Público-alvo
| Perfil | Acesso | Funcionalidades |
|--------|--------|-----------------|
| **Cidadão** | Público (sem login) | Registrar ocorrência, acompanhar protocolo, escanear QR Code |
| **Administrador** | Dashboard autenticado | Aprovar/rejeitar ocorrências, atribuir operadores, relatórios |
| **Operador/Técnico** | Área restrita autenticada | Visualizar tarefas atribuídas, registrar evidências, solicitar finalização |

---

## 2. Arquitetura do Sistema

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  React + Vite + TypeScript + TailwindCSS    │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Portal  │ │Dashboard │ │   Área do   │  │
│  │ Cidadão │ │  Admin   │ │  Operador   │  │
│  └────┬────┘ └────┬─────┘ └──────┬──────┘  │
│       │           │               │          │
│  ┌────┴───────────┴───────────────┴────┐    │
│  │  Componentes Compartilhados         │    │
│  │  (MapView, StatusBadge, QR, etc.)   │    │
│  └─────────────────────────────────────┘    │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          │  Lovable Cloud  │
          │  (Supabase)     │
          │  ┌────────────┐ │
          │  │ PostgreSQL │ │
          │  │    Auth    │ │
          │  │  Storage   │ │
          │  │Edge Funcs  │ │
          │  └────────────┘ │
          └─────────────────┘
```

### Padrão Arquitetural
- **SPA (Single Page Application)** com roteamento client-side via React Router
- **Mobile-first** no Portal do Cidadão
- **Design system** baseado em tokens semânticos CSS (HSL) e shadcn/ui
- **Dados offline**: dados de postes carregados via arquivo XLSX local (migração para banco em andamento)

---

## 3. Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 18.3 | Framework UI |
| **Vite** | — | Build tool e dev server |
| **TypeScript** | — | Tipagem estática |
| **TailwindCSS** | — | Estilização utilitária |
| **shadcn/ui** | — | Componentes UI (Radix primitives) |
| **React Router** | 6.30 | Roteamento SPA |
| **React Query** | 5.83 | Gerenciamento de estado assíncrono |
| **Framer Motion** | 12.34 | Animações |
| **Leaflet** | 1.9 | Mapas interativos |
| **leaflet.markercluster** | 1.5 | Clusterização de marcadores |
| **Recharts** | 2.15 | Gráficos e visualizações |
| **qrcode.react** | 4.2 | Geração de QR Codes |
| **jsPDF** | 4.1 | Exportação de PDFs |
| **xlsx** | 0.18 | Leitura de planilhas Excel |
| **Zod** | 3.25 | Validação de schemas |
| **React Hook Form** | 7.61 | Formulários |

### Backend (Lovable Cloud)
| Componente | Tecnologia |
|------------|------------|
| **Banco de Dados** | PostgreSQL (Lovable Cloud) |
| **Autenticação** | Lovable Cloud Auth |
| **Funções Serverless** | Edge Functions (Deno) |
| **Armazenamento** | Lovable Cloud Storage |

### Infraestrutura Self-Hosted (Opcional)
| Componente | Tecnologia |
|------------|------------|
| **Web Server** | Nginx |
| **Process Manager** | PM2 |
| **Banco de Dados** | PostgreSQL 15 + PostGIS 3 |
| **SO** | Ubuntu Server 22.04 LTS |
| **SSL** | Certbot (Let's Encrypt) |
| **Firewall** | UFW |

---

## 4. Estrutura de Arquivos

```
├── docs/                          # Documentação
├── public/
│   └── data/BASE_INICIAL.xlsx     # Base de dados dos postes (2.100+ registros)
├── scripts/
│   └── install-server.sh          # Script de instalação para Ubuntu Server
├── src/
│   ├── components/
│   │   ├── DashboardLayout.tsx    # Layout com sidebar para área administrativa
│   │   ├── MapView.tsx            # Componente de mapa Leaflet reutilizável
│   │   ├── NavLink.tsx            # Link de navegação
│   │   ├── PublicHeader.tsx       # Cabeçalho das páginas públicas
│   │   ├── StatusBadge.tsx        # Badges de status e prioridade
│   │   └── ui/                    # Componentes shadcn/ui (40+ componentes)
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Detecção de viewport mobile
│   │   └── use-toast.ts           # Hook para notificações toast
│   ├── integrations/
│   │   └── supabase/              # Cliente e tipos do Lovable Cloud
│   ├── lib/
│   │   ├── mock-data.ts           # Dados mock e tipos (ocorrências, categorias)
│   │   ├── posts-data.ts          # Parser XLSX e cache de postes reais
│   │   └── utils.ts               # Utilitários (cn, etc.)
│   ├── pages/
│   │   ├── Index.tsx              # Landing page pública
│   │   ├── CitizenPortal.tsx      # Portal do Cidadão (registro de ocorrências)
│   │   ├── TrackOccurrence.tsx    # Acompanhamento por protocolo
│   │   ├── Dashboard.tsx          # Dashboard administrativo
│   │   ├── OccurrencesList.tsx    # Gestão de ocorrências (CRUD)
│   │   ├── OperatorArea.tsx       # Área do operador/técnico
│   │   ├── PostesManagement.tsx   # Gestão de postes e QR Codes
│   │   ├── PostDetail.tsx         # Página pública do poste (via QR)
│   │   └── NotFound.tsx           # Página 404
│   ├── App.tsx                    # Roteamento principal
│   ├── index.css                  # Design tokens e estilos globais
│   └── main.tsx                   # Entry point
├── supabase/
│   └── config.toml                # Configuração do Lovable Cloud
└── tailwind.config.ts             # Configuração do Tailwind
```

---

## 5. Módulos Funcionais

### 5.1 Landing Page (`/`)
- Hero com CTA para registro e acompanhamento
- Seção "Como funciona" com 4 features animadas
- Seção de emergência com telefone
- Footer institucional

### 5.2 Portal do Cidadão (`/cidadao`)
Fluxo em 3 etapas:

**Etapa 1 — Localizar Poste:**
- Geolocalização automática via GPS (alta precisão)
- Filtro por raio: 100m padrão, expansão automática para 300m
- Auto-seleção inteligente para postes a menos de 30m
- Círculo visual de busca no mapa
- Toggle "Mostrar todos" / "Apenas próximos"
- Busca manual por ID_POSTE
- Chips de postes próximos com distância

**Etapa 2 — Formulário:**
- Seleção de categoria (6 tipos pré-definidos)
- Descrição do problema
- Upload de foto (câmera do dispositivo)
- Telefone de contato (opcional)

**Etapa 3 — Confirmação:**
- Número de protocolo gerado (`ZU-2026-XXXX`)
- Link para acompanhamento
- Opção de nova ocorrência

### 5.3 Acompanhamento (`/acompanhar`)
- Busca por número de protocolo
- Exibe: status, poste, prioridade, categoria, operador, datas
- Suporta query param `?protocolo=ZU-2026-0001`

### 5.4 Dashboard Administrativo (`/dashboard`)
- **Cards de estatísticas**: Pendentes, Em Execução, Finalizadas, Total
- **Mapa completo**: todos os postes (XLSX) + marcadores de ocorrências com cores por status
- **Lista de ocorrências recentes**: com filtro por status, busca por protocolo
- **QR Code rápido**: modal com QR Code diretamente da lista

### 5.5 Gestão de Ocorrências (`/dashboard/ocorrencias`)
- Tabela com filtros por status e categoria
- Ações contextuais:
  - ✅ Aprovar (para pendentes)
  - ❌ Rejeitar (para pendentes)
  - 👤 Atribuir operador (para aprovadas)
  - 👁 Ver detalhes (modal)
- Responsiva com colunas ocultas em mobile

### 5.6 Área do Operador (`/dashboard/operadores`)
- Visualiza apenas ocorrências atribuídas ao operador logado
- Mapa com marcadores das ocorrências do operador
- Painel de detalhes ao clicar no marcador
- Ações: Upload de foto, Comentar, Solicitar Finalização

### 5.7 Gestão de Postes (`/dashboard/postes`)
- Mapa com todos os postes (clusterização ativada)
- Lista paginada (100 por vez) com busca por ID_POSTE ou ID_IP
- Modal de QR Code individual ao clicar no poste
- **Exportação em lote para PDF** (até 200 postes, 1 QR por página)

### 5.8 Página Pública do Poste (`/postes/:codigoPublico`)
- Acessível via QR Code físico ou link direto
- Exibe: dados técnicos, QR Code, mapa, coordenadas
- Histórico de ocorrências do poste
- CTA para registrar novo problema

---

## 6. Modelo de Dados

### 6.1 Tipos Principais

```typescript
// Status de Ocorrência (fluxo de vida)
type OccurrenceStatus =
  | 'PENDENTE_APROVACAO'  // Cidadão registrou
  | 'APROVADA'            // Admin aprovou
  | 'REJEITADA'           // Admin rejeitou
  | 'CANCELADA'           // Cancelada
  | 'ATRIBUIDA'           // Operador atribuído
  | 'EM_EXECUCAO'         // Operador em campo
  | 'AGUARDANDO_APROVACAO'// Operador solicitou finalização
  | 'FINALIZADA';         // Admin confirmou conclusão

// Prioridades
type Priority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

// Categorias de Problema
// 💡 Lâmpada Queimada | 🔧 Poste Danificado | ⚡ Fiação Exposta
// 📐 Poste Inclinado  | 🔦 Luminária Quebrada | 📋 Outros
```

### 6.2 Estrutura do Poste (RealPost)

```typescript
interface RealPost {
  id: string;          // ID único
  idPoste: string;     // ID_POSTE (ex: "5454769")
  ips: string[];       // IDs dos pontos de iluminação vinculados
  latitude: number;
  longitude: number;
  tipoLampada: string; // Tipo (LED, Vapor de Sódio, etc.)
  potenciaW: number;   // Potência em Watts
}
```

> **Nota**: Um poste central (ID_POSTE) pode conter múltiplos pontos de iluminação (ID_IP), cada um com especificações técnicas próprias.

### 6.3 Estrutura da Ocorrência

```typescript
interface Occurrence {
  id: string;
  protocol: string;        // "ZU-2026-XXXX"
  postId: string;
  postExternalId: string;
  categoryId: string;
  categoryName: string;
  description: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: OccurrenceStatus;
  priority: Priority;
  operatorId?: string;
  operatorName?: string;
  createdAt: string;        // ISO 8601
  updatedAt: string;
}
```

### 6.4 Fonte de Dados dos Postes

Os dados dos postes são carregados a partir do arquivo `public/data/BASE_INICIAL.xlsx`, que contém a base real do município com as colunas:

| Coluna | Descrição |
|--------|-----------|
| `ID_POSTE` | Identificador único do poste |
| `ID_IP` | Identificador do ponto de iluminação |
| `LATITUDE` | Coordenada geográfica |
| `LONGITUDE` | Coordenada geográfica |
| `TIPO_LAMPADA` | Tipo de lâmpada instalada |
| `POTENCIA_W` | Potência em watts |

O parser (`src/lib/posts-data.ts`) agrupa múltiplos `ID_IP` sob o mesmo `ID_POSTE` e mantém cache em memória para performance.

---

## 7. Fluxos de Uso

### 7.1 Registro de Ocorrência pelo Cidadão

```
Cidadão acessa /cidadao
        │
        ▼
  GPS ativado automaticamente
        │
        ├─ Postes encontrados no raio? ──▶ Exibe no mapa (100m)
        │                                        │
        │                                        ├─ 1 poste < 30m? ──▶ Auto-seleção
        │                                        │
        │                                        └─ Múltiplos ──▶ Seleção manual
        │
        └─ Nenhum no raio? ──▶ Expande para 300m
                                     │
                                     └─ Nenhum? ──▶ Busca manual / Mostrar todos
        │
        ▼
  Confirma poste ──▶ Formulário ──▶ Envia ──▶ Protocolo gerado
```

### 7.2 Ciclo de Vida da Ocorrência

```
PENDENTE_APROVAÇÃO ─┬─▶ APROVADA ──▶ ATRIBUÍDA ──▶ EM_EXECUÇÃO ──▶ AGUARDANDO_APROVAÇÃO ──▶ FINALIZADA
                    │
                    ├─▶ REJEITADA
                    │
                    └─▶ CANCELADA
```

---

## 8. Componentes Reutilizáveis

### MapView
Componente Leaflet configurável com suporte a:
- Marcadores coloridos personalizados (ícones SVG)
- Clusterização via `leaflet.markercluster`
- Círculo de raio de busca
- Tooltips e popups HTML
- Callbacks de clique
- Fly-to animado na mudança de centro/zoom

```tsx
<MapView
  center={[-22.786, -50.205]}
  zoom={15}
  markers={markers}
  highlightId="selected-id"
  onMarkerClick={(id) => handleClick(id)}
  enableClustering
  circle={{ center: [-22.786, -50.205], radius: 150 }}
  height="400px"
/>
```

### StatusBadge / PriorityBadge
Badges semânticos com cores derivadas do design system.

### DashboardLayout
Layout com sidebar fixa (desktop) / drawer (mobile), navegação de 5 itens, header sticky com perfil.

### PublicHeader
Cabeçalho das páginas públicas com logo e navegação.

---

## 9. Sistema de Mapas

### Provedor
- **OpenStreetMap** (tiles gratuitos, sem API key)
- Configurável para outros provedores via URL do tile layer

### Performance
- **Clusterização** ativada automaticamente em visualizações com muitos marcadores (>100)
- Desclusterização no zoom 18+
- Raio máximo de cluster: 50px
- Spiderfy no zoom máximo

### Geolocalização
- API `navigator.geolocation` com alta precisão (`enableHighAccuracy: true`)
- Timeout de 10 segundos
- Fallback para centro de Palmital (`-22.786, -50.205`)

### Cálculo de Proximidade
- **Fórmula de Haversine** para distância em metros entre coordenadas
- Raio padrão: 100m, expandido: 300m, auto-seleção: 30m

---

## 10. Sistema de QR Code

### Geração
- Biblioteca: `qrcode.react` (SVG e Canvas)
- Nível de correção de erro: **H** (High, 30%)
- Margem incluída

### URL Codificada
```
https://sistema.prefeitura.com/postes/{ID_POSTE}
```

### Funcionalidades
- **Visualização individual**: modal centralizado acessível via mapa ou lista
- **Download individual**: exportação como PNG (300x300px)
- **Exportação em lote**: PDF com jsPDF, 1 QR Code por página A4
  - Cabeçalho: "PREFEITURA DE PALMITAL — Zeladoria Urbana"
  - Dados: ID do poste, IPs, tipo de lâmpada, potência, coordenadas
  - Limite: 200 postes por exportação (performance)

### Fluxo de Leitura
```
Cidadão escaneia QR no poste ──▶ Abre /postes/:id no navegador ──▶ Visualiza dados + histórico ──▶ Registra ocorrência
```

---

## 11. Infraestrutura e Deploy

### Opção 1: Lovable Cloud (Recomendado)
- Deploy automático via botão "Publish" na interface Lovable
- Backend gerenciado (banco, auth, storage, edge functions)
- Domínio customizado configurável em Settings → Domains

### Opção 2: Self-Hosted (Ubuntu Server)

#### Requisitos Mínimos
- Ubuntu Server 22.04 LTS
- 2 GB RAM
- 20 GB disco

#### Instalação Automatizada
```bash
sudo bash scripts/install-server.sh
```

O script configura:
1. Node.js 20 LTS + PM2
2. PostgreSQL 15 + PostGIS 3 (com schema inicial)
3. Nginx (SPA fallback + proxy reverso)
4. Firewall UFW (SSH + HTTP/HTTPS)
5. SSL opcional via Certbot
6. Comando CLI `deploy-zeladoria`

#### Deploy Subsequente
```bash
deploy-zeladoria
```

#### Schema do Banco (Self-Hosted)
- `postes`: postes com geometria PostGIS, índice GIST
- `ocorrencias`: com referência a postes, status, prioridade
- `usuarios`: operadores com senha hash e roles
- `atividades_log`: log de auditoria
- Trigger: atualização automática da coluna `geom` via `ST_MakePoint`
- Função: `postes_proximos(lat, lng, raio_metros)` para consultas espaciais

---

## 12. Segurança

### Autenticação
- Sistema de autenticação via Lovable Cloud (em implementação)
- Roles: `admin`, `operador`
- Áreas `/dashboard/*` protegidas por login

### Proteção Web (Nginx)
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Banco de Dados
- RLS (Row Level Security) a ser configurado nas tabelas do Lovable Cloud
- Senhas armazenadas como hash (self-hosted)
- Extensão `uuid-ossp` para IDs seguros

---

## 13. Roadmap

### ✅ Implementado
- [x] Landing page institucional
- [x] Portal do Cidadão com geolocalização
- [x] Registro de ocorrências (mock)
- [x] Acompanhamento por protocolo
- [x] Dashboard administrativo com mapa
- [x] Gestão de ocorrências (aprovar/rejeitar/atribuir)
- [x] Área do operador com tarefas
- [x] Gestão de postes com QR Codes
- [x] Exportação em lote para PDF
- [x] Página pública do poste via QR
- [x] Dados reais de postes via XLSX
- [x] Script de instalação para Ubuntu Server
- [x] Lovable Cloud integrado

### 🔄 Em Desenvolvimento
- [ ] Persistência real no banco de dados (migração do mock)
- [ ] Autenticação de operadores e administradores
- [ ] Upload e armazenamento de fotos
- [ ] Notificações em tempo real

### 📋 Planejado
- [ ] API backend completa (Edge Functions)
- [ ] Importação do XLSX para o banco de dados
- [ ] Relatórios com gráficos (Recharts)
- [ ] Integração WhatsApp para notificações
- [ ] PWA (Progressive Web App) para uso offline
- [ ] Dashboard de métricas de performance (SLA)

---

## 📄 Rotas da Aplicação

| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Landing Page | Público |
| `/cidadao` | Portal do Cidadão | Público |
| `/acompanhar` | Acompanhar Protocolo | Público |
| `/postes/:codigoPublico` | Detalhes do Poste | Público |
| `/dashboard` | Dashboard Admin | Autenticado |
| `/dashboard/ocorrencias` | Gestão de Ocorrências | Autenticado |
| `/dashboard/operadores` | Área do Operador | Autenticado |
| `/dashboard/postes` | Gestão de Postes | Autenticado |
| `/dashboard/relatorios` | Relatórios | Autenticado |

---

*Documento gerado automaticamente — Plataforma de Zeladoria Urbana v1.0*
