# FLUXO DE TRABALHO - MIGRAÇÃO PRÁTICA

**Data:** 04/11/2025  
**Objetivo:** Guia prático de como trabalhar na migração PHP → Node.js

---

## 🎯 ESTRATÉGIA GERAL

### Situação Atual

```
┌─────────────────────────────────────┐
│  HOSTINGER COMPARTILHADO (Produção) │
│  147.93.37.47                       │
│                                     │
│  ├── loja.businesseducation.com.br  │ ✅ FUNCIONANDO
│  ├── forms.businesseducation.com.br │ ✅ FUNCIONANDO
│  └── dashs.businesseducation.com.br │ ✅ FUNCIONANDO
│                                     │
│  Usuários reais acessando           │
│  Pedidos sendo criados              │
│  ❌ NÃO MEXER AQUI                  │
└─────────────────────────────────────┘
```

### Situação Desejada

```
┌─────────────────────────────────────┐
│  VPS HOSTINGER (Desenvolvimento)    │
│  72.61.39.160                       │
│                                     │
│  ├── staging/ (ambiente de teste)   │
│  │   ├── auth-service (Node.js)    │ 👈 DESENVOLVEMOS AQUI
│  │   ├── loja-service (Node.js)    │ 👈 DESENVOLVEMOS AQUI
│  │   └── integration-service        │ 👈 DESENVOLVEMOS AQUI
│  │                                  │
│  └── data/staging/ (dados teste)    │
│      ├── postgres/                  │ ✅ JÁ RODANDO
│      └── redis/                     │ ✅ JÁ RODANDO
│                                     │
│  👉 TESTAMOS TUDO AQUI PRIMEIRO     │
└─────────────────────────────────────┘
```

---

## ✅ SUA ESTRATÉGIA ESTÁ CORRETA!

### Resumo do que você entendeu:

1. ✅ **Manter produção no compartilhado** (não mexer)
2. ✅ **Desenvolver tudo no VPS** (staging)
3. ✅ **Testar completamente no VPS**
4. ✅ **Quando tudo funcionar:** Migrar domínios para VPS
5. ✅ **Depois de estável:** Remover compartilhado

**👍 PERFEITO! É exatamente assim que vamos fazer.**

---

## 🚫 NÃO VAMOS COPIAR SISTEMAS PHP PARA VPS

### Por quê?

**Não faz sentido porque:**
- Sistema antigo é PHP
- Sistema novo é Node.js
- Arquitetura diferente (monolito → microservices)
- Dados diferentes (JSON → PostgreSQL)

**O que vamos fazer:**
- ✅ **Desenvolver do ZERO no VPS** (Node.js + TypeScript)
- ✅ **Manter PHP no compartilhado funcionando**
- ✅ **Migrar dados quando necessário** (JSON → PostgreSQL)

---

## 📋 PASSO A PASSO DETALHADO

### **FASE 1: DESENVOLVER NO VPS (Próximas 2-3 semanas)**

#### Passo 1: Criar Estrutura de Diretórios no VPS

**Conecta no VPS:**
```bash
ssh deploy@72.61.39.160
cd ~/sistemas-businesseducation
```

**Cria estrutura:**
```bash
mkdir -p services/auth-service/src
mkdir -p services/loja-service/src
mkdir -p services/integration-service/src
mkdir -p infrastructure/migrations
```

#### Passo 2: Inicializar Projetos Node.js

**Auth Service:**
```bash
cd services/auth-service
npm init -y
npm install express typescript @types/express @types/node
npm install jsonwebtoken bcrypt ioredis pg
npm install --save-dev ts-node nodemon

# Cria tsconfig.json
npx tsc --init
```

**Loja Service:**
```bash
cd ../loja-service
npm init -y
npm install express typescript @types/express @types/node
npm install ioredis pg
npm install --save-dev ts-node nodemon

npx tsc --init
```

**Integration Service:**
```bash
cd ../integration-service
npm init -y
npm install express typescript @types/express @types/node
npm install ioredis axios
npm install --save-dev ts-node nodemon

npx tsc --init
```

#### Passo 3: Desenvolver auth-service (Primeiro Service)

**Criamos arquivos:**
```
services/auth-service/
├── src/
│   ├── server.ts          # Servidor Express
│   ├── routes/
│   │   └── auth.ts        # Rotas de autenticação
│   ├── controllers/
│   │   └── auth-controller.ts
│   ├── middleware/
│   │   └── validate-token.ts
│   ├── models/
│   │   └── user.ts
│   └── config/
│       └── database.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

**Desenvolvemos código Node.js do ZERO**

#### Passo 4: Criar Migrations PostgreSQL

```bash
cd ~/sistemas-businesseducation/infrastructure/migrations
```

**Arquivo:** `001_create_users.sql`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Executa migration:**
```bash
docker exec -it docker-postgres-staging-1 psql -U postgres -d postgres -f /path/to/001_create_users.sql
```

#### Passo 5: Testar auth-service no VPS

**Inicia service:**
```bash
cd ~/sistemas-businesseducation/services/auth-service
npm run dev
```

**Testa endpoints (Thunder Client ou curl):**
```bash
# Registro
curl -X POST http://72.61.39.160:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}'

# Login
curl -X POST http://72.61.39.160:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}'
```

**Se funcionar:** ✅ auth-service pronto!

---

### **FASE 2: DESENVOLVER OUTROS SERVICES (3-6 semanas)**

Repetimos processo para:
- loja-service
- integration-service
- dashs-service

**Cada service:**
1. Criar estrutura
2. Desenvolver código
3. Testar isoladamente
4. Integrar com outros services

---

### **FASE 3: TESTES COMPLETOS NO VPS (1-2 semanas)**

#### Cenários de Teste

**1. Fluxo completo de pedido:**
```
- Criar pedido via API
- Aprovar pedido
- Verificar evento publicado (Redis)
- Verificar Omie recebeu (integration-service)
- Verificar webhook Make disparou
- Verificar dashboard atualizou
```

**2. Autenticação SSO:**
```
- Login em auth-service
- Acessar loja-service com token
- Acessar dashs-service com token
- Token funciona em todos services
```

**3. Performance:**
```
- Tempo de resposta < 200ms
- Queries PostgreSQL < 50ms
- Eventos Redis < 10ms
```

**4. Integrações:**
```
- Omie funcionando
- Getnet funcionando
- Melhor Envio funcionando
- Make funcionando
```

**Se TUDO passar:** ✅ Sistema pronto para produção!

---

### **FASE 4: MIGRAÇÃO DE DADOS (1 semana)**

#### Migrar Dados do Compartilhado para VPS

**1. Backup completo do compartilhado:**
```bash
# No compartilhado
cd loja.businesseducation.com.br
tar -czf backup-loja-$(date +%Y%m%d).tar.gz orders/ stores/

cd ../forms.businesseducation.com.br
tar -czf backup-forms-$(date +%Y%m%d).tar.gz responses/
```

**2. Transferir para VPS:**
```bash
# Do seu PC
scp backup-loja-*.tar.gz deploy@72.61.39.160:~/backups/
scp backup-forms-*.tar.gz deploy@72.61.39.160:~/backups/
```

**3. Script de migração (no VPS):**
```bash
# Script: migrate-json-to-postgres.js
node scripts/migrate-json-to-postgres.js --source ~/backups/backup-loja-*.tar.gz
```

**Script lê JSONs e insere no PostgreSQL**

**4. Validação:**
```sql
-- Verifica se dados migraram corretamente
SELECT COUNT(*) FROM orders; -- Deve ter todos pedidos
SELECT COUNT(*) FROM form_responses; -- Deve ter todas respostas
```

**Se validação OK:** ✅ Dados migrados!

---

### **FASE 5: PREPARAR DNS (1 dia)**

#### Configurar Nginx no VPS

**Arquivo:** `/etc/nginx/sites-available/businesseducation`

```nginx
# loja.businesseducation.com.br → loja-service
server {
    listen 80;
    server_name loja.businesseducation.com.br;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
    
    location / {
        root /var/www/loja/public;
        try_files $uri $uri/ =404;
    }
}

# forms.businesseducation.com.br → forms-service
server {
    listen 80;
    server_name forms.businesseducation.com.br;
    
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
    }
    
    location / {
        root /var/www/forms/public;
        try_files $uri $uri/ =404;
    }
}

# dashs.businesseducation.com.br → dashs-service
server {
    listen 80;
    server_name dashs.businesseducation.com.br;
    
    location /api/ {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
    }
    
    location / {
        root /var/www/dashs/public;
        try_files $uri $uri/ =404;
    }
}
```

**Ativar configuração:**
```bash
sudo ln -s /etc/nginx/sites-available/businesseducation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Configurar SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d loja.businesseducation.com.br
sudo certbot --nginx -d forms.businesseducation.com.br
sudo certbot --nginx -d dashs.businesseducation.com.br
```

**Resultado:** HTTPS funcionando automaticamente

---

### **FASE 6: APONTAR DNS (1 dia)**

#### No Painel Hostinger (ou seu DNS provider)

**1. Acessa gerenciamento de DNS**

**2. Edita registros A:**

```
ANTES:
loja.businesseducation.com.br    A    147.93.37.47 (compartilhado)
forms.businesseducation.com.br   A    147.93.37.47 (compartilhado)
dashs.businesseducation.com.br   A    147.93.37.47 (compartilhado)

DEPOIS:
loja.businesseducation.com.br    A    72.61.39.160 (VPS)
forms.businesseducation.com.br   A    72.61.39.160 (VPS)
dashs.businesseducation.com.br   A    72.61.39.160 (VPS)
```

**3. Aguarda propagação:** 5 minutos a 24 horas (geralmente < 1 hora)

**4. Testa:**
```bash
# Verifica se DNS apontou para VPS
nslookup loja.businesseducation.com.br
# Deve retornar: 72.61.39.160
```

**5. Acessa no navegador:**
```
https://loja.businesseducation.com.br
```

**Se abrir normalmente:** ✅ DNS migrado!

---

### **FASE 7: MONITORAMENTO (1 semana)**

#### Monitorar Logs

```bash
# Logs dos services
docker logs -f docker-loja-service-1
docker logs -f docker-auth-service-1
docker logs -f docker-integration-service-1

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do PostgreSQL
docker logs -f docker-postgres-production-1
```

#### Métricas Críticas

```bash
# Requests por minuto
grep "POST /api/orders" /var/log/nginx/access.log | wc -l

# Erros 5xx
grep "500" /var/log/nginx/error.log

# Tempo de resposta
# (configurar monitoring depois)
```

#### Rollback (se necessário)

**Se algo der errado:**

```bash
# 1. Reverter DNS
loja.businesseducation.com.br    A    147.93.37.47 (volta pro compartilhado)

# 2. Propagação DNS
# Aguarda 5-60 minutos

# 3. Sistema volta a funcionar no compartilhado
```

**Por isso mantemos compartilhado funcionando!**

---

### **FASE 8: DESATIVAR COMPARTILHADO (Depois de estável)**

**Esperar:** 1-2 semanas de VPS 100% estável

**Critérios:**
- ✅ Zero erros críticos
- ✅ Performance igual ou melhor
- ✅ Integrações funcionando
- ✅ Usuários satisfeitos
- ✅ Backups funcionando

**Só então:**
```bash
# 1. Backup final do compartilhado
# 2. Download de todos dados
# 3. Cancelar plano compartilhado
```

---

## 📊 TIMELINE RESUMIDA

```
Semana 1-2:   Desenvolver auth-service no VPS
Semana 3-4:   Desenvolver loja-service no VPS
Semana 5-6:   Desenvolver integration-service no VPS
Semana 7-8:   Desenvolver dashs-service no VPS
Semana 9:     Testes completos no VPS
Semana 10:    Migração de dados
Semana 11:    Configurar Nginx + SSL
Semana 12:    Apontar DNS (produção)
Semana 13-14: Monitoramento intensivo
Semana 15+:   Desativar compartilhado

TOTAL: ~3-4 meses para migração completa e segura
```

---

## 🎯 SEU PRÓXIMO PASSO IMEDIATO

### Hoje/Amanhã:

1. **Conectar no VPS via VS Code Remote SSH**
   - `Ctrl+Shift+P` → "Remote-SSH: Connect"
   - `deploy@72.61.39.160`

2. **Criar estrutura de diretórios:**
```bash
cd ~/sistemas-businesseducation
mkdir -p services/auth-service/src/{routes,controllers,middleware,models,config}
mkdir -p services/loja-service/src/{routes,controllers,models,events}
mkdir -p services/integration-service/src/{subscribers,clients}
```

3. **Inicializar auth-service:**
```bash
cd services/auth-service
npm init -y
npm install express typescript @types/express @types/node jsonwebtoken bcrypt ioredis pg
npm install --save-dev ts-node nodemon @types/jsonwebtoken @types/bcrypt
```

4. **Criar primeiro arquivo:** `src/server.ts`

5. **Commitar no Git:**
```bash
git add .
git commit -m "feat: inicializa auth-service"
git push origin main
```

---

## 📁 ONDE FICA CADA COISA

```
┌──────────────────────────────────────────────────────────┐
│  COMPARTILHADO (147.93.37.47)                            │
│  👉 PRODUÇÃO - NÃO MEXER                                 │
│                                                          │
│  /home/u556338138/domains/                              │
│  ├── loja.businesseducation.com.br/                     │
│  │   ├── OrderManager.php         ✅ PHP funcionando    │
│  │   └── orders/                  📊 Dados reais        │
│  │                                                       │
│  ├── forms.businesseducation.com.br/                    │
│  │   └── responses/               📊 Dados reais        │
│  │                                                       │
│  └── dashs.businesseducation.com.br/                    │
│      └── core/                    ✅ PHP funcionando    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  VPS (72.61.39.160)                                      │
│  👉 DESENVOLVIMENTO/STAGING - TRABALHAR AQUI             │
│                                                          │
│  /home/deploy/sistemas-businesseducation/                │
│  ├── services/                    👈 CÓDIGO NOVO         │
│  │   ├── auth-service/            🚀 Node.js            │
│  │   ├── loja-service/            🚀 Node.js            │
│  │   └── integration-service/     🚀 Node.js            │
│  │                                                       │
│  ├── data/staging/                📊 Dados de teste     │
│  │   ├── postgres/                ✅ BD rodando         │
│  │   └── redis/                   ✅ Cache rodando      │
│  │                                                       │
│  └── data/production/             📊 Dados reais (depois)│
│      ├── postgres/                ⏳ Vazio ainda        │
│      └── redis/                   ⏳ Vazio ainda        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SEU PC (Windows)                                        │
│  👉 DESENVOLVIMENTO LOCAL (opcional)                     │
│                                                          │
│  C:/Users/caiqu/.../Sistemas/                           │
│  ├── loja.businesseducation.com.br/  ✅ PHP antigo      │
│  │   (apenas para referência)                           │
│  │                                                       │
│  └── sistemas-businesseducation/     🔄 Git clone       │
│      (sincronizado com VPS via Git)                     │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST PRÓXIMOS PASSOS

### Esta Semana:
- [ ] Conectar VS Code Remote SSH no VPS
- [ ] Criar estrutura de diretórios
- [ ] Inicializar auth-service (npm init)
- [ ] Instalar dependências
- [ ] Criar arquivo `src/server.ts` básico
- [ ] Testar servidor rodando (Hello World)
- [ ] Commit no Git

### Próxima Semana:
- [ ] Implementar rotas de autenticação
- [ ] Conectar com PostgreSQL
- [ ] Implementar JWT
- [ ] Testar endpoints
- [ ] Documentar API

### Daqui 2 Semanas:
- [ ] Iniciar loja-service
- [ ] Criar migrations
- [ ] Implementar CRUD de pedidos

---

## 🎯 RESUMO FINAL

**Sua estratégia:** ✅ PERFEITA!

1. ✅ Produção fica no compartilhado (não mexer)
2. ✅ Desenvolvimento no VPS (staging)
3. ✅ NÃO copiar PHP para VPS (começar do zero Node.js)
4. ✅ Testar tudo no VPS
5. ✅ Migrar DNS quando pronto
6. ✅ Desativar compartilhado depois

**Próximo passo:** Começar a desenvolver auth-service no VPS

---

**Pronto para começar? Quer que eu te ajude a criar o primeiro arquivo (`server.ts`) do auth-service?**

