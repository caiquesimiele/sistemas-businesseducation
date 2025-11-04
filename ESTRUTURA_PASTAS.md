# ESTRUTURA DE PASTAS FINALIZADA

**Data:** 04/11/2025  
**Status:** ✅ Organizada e pronta para desenvolvimento

---

## 📁 ESTRUTURA COMPLETA

```
sistemas-businesseducation/
│
├── .git/                              # Controle de versão
├── .gitignore                         # Ignora data/, .env, node_modules
├── README.md                          # Documentação principal
│
├── docs/                              # 📚 DOCUMENTAÇÃO
│   ├── PROJETO_MASTER.md              # Documento mestre consolidado
│   ├── ANALISE_COMPLETA_ESTRUTURA_ATUAL.md   # Análise dos sistemas PHP
│   ├── ANALISE_CRITICA_ARQUITETURA.md        # Validação da arquitetura
│   ├── RESPOSTA_REQUISITOS.md         # Validação dos 3 requisitos
│   ├── COMPARACAO_LOJAS_CABU_CAPEC.md # Comparação detalhada lojas
│   ├── ESTRUTURA_PASTAS.md            # Este arquivo
│   ├── CONFIGURACAO_VPS.md            # Setup do VPS
│   ├── INTERFACE_GRAFICA_VPS.md       # VS Code Remote SSH
│   ├── EXTENSOES_E_INSTRUCOES_CURSOR_AI.md   # Ferramentas dev
│   └── FLUXO_DE_TRABALHO.md           # Workflow desenvolvimento
│
├── services/                          # 🚀 CÓDIGO (Node.js + TypeScript)
│   ├── auth-service/                  # 🔐 SSO (JWT)
│   ├── loja-service/                  # 🛒 E-commerce
│   ├── integration-service/           # 🔌 Integrações (Omie, Make, Email)
│   ├── forms-service/                 # 📝 Formulários
│   ├── dashs-service/                 # 📊 Dashboards
│   └── admin-service/                 # ⚙️ Admin (CRUD lojas)
│
├── public/                            # 🎨 FRONTEND (HTML/CSS/JS)
│   ├── shared/                        # Compartilhado entre todos
│   │   ├── css/                       # Core CSS
│   │   ├── js/                        # Core JS
│   │   └── images/                    # Logo Business Education
│   ├── loja/                          # Frontend loja
│   │   └── css/
│   │       └── themes/                # 26 temas CSS (um por loja)
│   ├── forms/                         # Frontend forms
│   └── dashs/                         # Frontend dashboards
│
├── config/                            # ⚙️ CONFIGURAÇÕES (JSON/YAML)
│   ├── stores/                        # 26 configs de lojas (JSON)
│   │   ├── erpkl4if-cabu.json
│   │   ├── s4vwcb5f-capec.json
│   │   └── ... (24 mais)
│   ├── products/                      # Catálogo global (12 produtos JSON)
│   │   ├── seed-1ano.json
│   │   ├── life-2ano.json
│   │   └── ... (10 mais)
│   └── maintainers/                   # Mantenedoras (5-7 JSONs)
│       ├── amc.json
│       ├── arf.json
│       └── ... (3-5 mais)
│
├── data/                              # 📊 DADOS (NUNCA no Git!)
│   ├── staging/                       # Ambiente de testes
│   │   ├── postgres/                  # DB staging
│   │   ├── redis/                     # Cache staging
│   │   ├── uploads/                   # Arquivos staging
│   │   │   ├── stores/                # Logos/banners por loja
│   │   │   ├── products/              # Imagens produtos
│   │   │   └── support/               # Anexos de ajuda
│   │   └── logs/                      # Logs staging
│   │       ├── application.log
│   │       ├── error.log
│   │       └── integration.log
│   │
│   └── production/                    # Ambiente real
│       ├── postgres/                  # DB produção
│       ├── redis/                     # Cache produção
│       ├── uploads/                   # Arquivos produção
│       └── logs/                      # Logs produção
│
└── infrastructure/                    # 🛠️ INFRAESTRUTURA
    ├── docker/                        # Docker configs
    │   ├── docker-compose.staging.yml
    │   ├── docker-compose.production.yml
    │   └── nginx/
    │       └── nginx.conf
    ├── migrations/                    # Migrations PostgreSQL
    │   ├── 001_create_stores.sql
    │   ├── 002_create_products.sql
    │   ├── 003_create_orders.sql
    │   └── ... (mais)
    └── scripts/
        ├── backup.sh
        └── restore.sh
```

---

## 🎯 PRINCIPAIS DIRETÓRIOS

### 1. `/docs` - Documentação
- **PROJETO_MASTER.md:** Contexto geral consolidado
- **ANALISE_COMPLETA_ESTRUTURA_ATUAL.md:** 50.000+ linhas analisadas, 26 lojas mapeadas
- **COMPARACAO_LOJAS_CABU_CAPEC.md:** O que muda entre lojas

### 2. `/services` - Código Backend
- Node.js + TypeScript
- Microservices independentes
- Event-driven (Redis Pub/Sub)

### 3. `/public` - Código Frontend
- HTML/CSS/JS
- Template único + 26 temas CSS
- CSS Variables para personalização

### 4. `/config` - Configurações
- **stores/**: 26 JSONs pequenos (só o que muda)
- **products/**: 12 produtos globais
- **maintainers/**: 5-7 mantenedoras

### 5. `/data` - Dados (NUNCA no Git)
- Separação staging/production
- PostgreSQL + Redis + uploads + logs
- Preservado em TODOS os deploys

### 6. `/infrastructure` - Infra
- Docker Compose
- Migrations SQL
- Scripts de backup

---

## 📊 NÚMEROS DA ESTRUTURA

| Aspecto | Quantidade |
|---------|-----------|
| **Documentos criados** | 9 arquivos MD |
| **Services planejados** | 6 microservices |
| **Configs de lojas** | 26 JSONs |
| **Produtos globais** | 12 JSONs |
| **Mantenedoras** | 5-7 JSONs |
| **Temas CSS** | 26 arquivos |
| **Migrations** | 6+ arquivos SQL |

---

## 🔍 COMPARAÇÃO: ATUAL vs PROPOSTO

### Antes (PHP - 26 lojas duplicadas)

```
loja.businesseducation.com.br/
└── stores/
    ├── erpkl4if-cabu/              # 49 arquivos
    │   ├── config/store.php        # 698 linhas!
    │   ├── index.php
    │   ├── css/ (12 arquivos)
    │   ├── js/ (8 arquivos)
    │   └── ... (duplicado)
    │
    └── s4vwcb5f-capec/             # 49 arquivos
        ├── config/store.php        # 698 linhas!
        └── ... (duplicado)

Total: 26 × 49 = 1.274 arquivos duplicados ❌
```

### Depois (Node.js - Template único)

```
sistemas-businesseducation/
├── services/loja-service/          # 1 código
├── public/loja/                    # 1 template
│   └── css/themes/
│       ├── erpkl4if-cabu.css       # Tema único
│       └── s4vwcb5f-capec.css      # Tema único
└── config/stores/
    ├── erpkl4if-cabu.json          # 150 linhas
    └── s4vwcb5f-capec.json         # 150 linhas

Total: 1 código + 26 temas + 26 configs ✅
```

---

## ✅ VANTAGENS DA ESTRUTURA

### 1. Separação Código vs Dados
- **Código:** `/services`, `/public`, `/config` (versionado no Git)
- **Dados:** `/data` (NUNCA no Git, preservado em deploys)

### 2. DRY (Don't Repeat Yourself)
- 1 template HTML (não 26)
- 1 lógica de pedidos (não 26)
- 12 produtos globais (atualize 1 vez)

### 3. Escalabilidade
- Adicionar loja = 1 JSON + 1 tema CSS
- Atualizar produto = 1 lugar
- Bug fix = 1 código (afeta todas)

### 4. Manutenibilidade
- Configs pequenas e legíveis (150 linhas vs 698)
- Separação por domínio (stores, products, maintainers)
- Temas CSS isolados (visual por loja)

---

## 🚀 PRÓXIMAS ETAPAS

### Fase 1: Fundação ✅
- ✅ Estrutura de pastas criada
- ✅ Documentação completa
- ⏳ Criar configs JSON (26 lojas)
- ⏳ Criar catálogo produtos (12 JSONs)
- ⏳ Criar temas CSS (26 arquivos)

### Fase 2: Services
- ⏳ Implementar auth-service
- ⏳ Implementar loja-service
- ⏳ Implementar integration-service

### Fase 3: Migração
- ⏳ Migrar pedidos (1571 JSONs → PostgreSQL)
- ⏳ Migrar formulários (391 JSONs → PostgreSQL)
- ⏳ Migrar imagens (152 arquivos → uploads/)

---

## 📖 DOCUMENTOS DE REFERÊNCIA

Para entender cada parte:
- **Arquitetura geral:** PROJETO_MASTER.md
- **Análise do sistema atual:** ANALISE_COMPLETA_ESTRUTURA_ATUAL.md
- **Diferenças entre lojas:** COMPARACAO_LOJAS_CABU_CAPEC.md
- **Validação dos requisitos:** RESPOSTA_REQUISITOS.md
- **Setup do VPS:** CONFIGURACAO_VPS.md
- **Workflow de dev:** FLUXO_DE_TRABALHO.md

---

## ✅ ESTRUTURA PRONTA!

**Tudo organizado e documentado.**

Pode começar desenvolvimento com confiança! 🚀

---

**FIM DA ESTRUTURA DE PASTAS** ✅

