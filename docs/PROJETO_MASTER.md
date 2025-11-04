# PROJETO MASTER - BUSINESS EDUCATION SaaS

**Data de criação:** 04/11/2025  
**Última atualização:** 04/11/2025  
**Status:** Em desenvolvimento ativo  
**VPS:** 72.61.39.160 (Hostinger KVM 2)

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Este arquivo consolida **TODO O CONTEXTO DO PROJETO** para:
- Recuperar contexto quando chats excederem limite de tokens
- Onboarding de novos desenvolvedores
- Referência única da arquitetura e decisões
- Histórico de progresso e aprendizados

**Documentos complementares (mantidos separados):**
- `CONFIGURACAO_VPS.md` - Passo a passo técnico de setup do VPS
- `INTERFACE_GRAFICA_VPS.md` - Guia VS Code Remote SSH
- `EXTENSOES_E_INSTRUCOES_CURSOR_AI.md` - Extensões e workflows Cursor AI
- `ANALISE_ARQUITETURA.md` - Análise crítica comparativa com indústria

---

## 📋 ÍNDICE

1. [Contexto da Empresa](#contexto-da-empresa)
2. [Sistemas Atuais](#sistemas-atuais)
3. [Problemas Identificados](#problemas-identificados)
4. [Objetivos do Projeto](#objetivos-do-projeto)
5. [Arquitetura Proposta](#arquitetura-proposta)
6. [Integrações Atuais](#integrações-atuais)
7. [Migração de Dados](#migração-de-dados)
8. [Status Atual](#status-atual)
9. [Próximos Passos](#próximos-passos)
10. [Análise Crítica](#análise-crítica)
11. [Decisões Técnicas](#decisões-técnicas)
12. [Glossário](#glossário)

---

## 🏢 CONTEXTO DA EMPRESA

### Quem somos

**Business Education** é um programa educacional de empreendedorismo que atende:
- Escolas parceiras (múltiplas instituições)
- Professores (treinamento e recursos)
- Alunos (materiais didáticos)
- Pais (compra de livros)
- Gestão escolar (acompanhamento de resultados)

### Estrutura atual

- **Múltiplas mantenedoras:** Cada escola tem uma mantenedora
- **Lojas personalizadas:** Cada escola tem loja própria com branding customizado
- **Múltiplos subdomínios:** loja, forms, dashs (cada um com sistema PHP separado)
- **Integrações críticas:** Getnet (pagamentos), Omie (ERP/fiscal), Melhor Envio (logística), Make (automações)

### Escala

- **Escolas:** ~50+ instituições
- **Lojas ativas:** ~100+ (cada escola pode ter múltiplas unidades)
- **Pedidos/mês:** ~500-1000 transações
- **Usuários finais:** Milhares (pais + professores + alunos + gestão)

---

## 🖥️ SISTEMAS ATUAIS

### 1. **loja.businesseducation.com.br**

**Função:** E-commerce multi-loja para venda de livros didáticos

**Tecnologia atual:**
- PHP (sem framework)
- Arquivos JSON para pedidos
- Sistema multi-store (uma loja por escola)

**Características:**
- Login opcional (para histórico de pedidos)
- Checkout com múltiplos filhos por pedido
- Cálculo de frete integrado (Melhor Envio)
- Pagamento via Getnet (PIX + Cartão)
- Gestão de status: pending → approved → billed → shipped → delivered

**Arquivos principais:**
- `OrderManager.php` - Gestão de pedidos e status
- `StoreResolver.php` - Resolução de lojas por URL
- `SmartStoreIndexer.php` - Indexação de pedidos para dashboards
- `ERP_Omie/OrderIntegrator.php` - Integração com Omie
- `webhooks/WebhookManager.php` - Disparo de webhooks

**Dados armazenados:**
- `/orders/pending/` - Pedidos aguardando pagamento
- `/orders/approved/` - Pedidos aprovados (JSON)
- `/orders/billed/` - Pedidos faturados no Omie
- `/orders/shipped/` - Pedidos enviados
- `/orders/delivered/` - Pedidos entregues
- `/stores/[store-id]/config/` - Configurações por loja

---

### 2. **forms.businesseducation.com.br**

**Função:** Sistema de formulários e pesquisas

**Tecnologia atual:**
- PHP (sem framework)
- Arquivos JSON para respostas

**Tipos de formulários:**
- Pesquisas com pais (satisfação, feedback)
- Pesquisas com professores (avaliação do programa)
- Formulários de cadastro

**Arquivos principais:**
- `SmartFormsIndexer.php` - Indexação de respostas
- `api/data-export.php` - Exportação de dados para dashboard

**Dados armazenados:**
- `/responses/[form-id]/` - Respostas em JSON

---

### 3. **dashs.businesseducation.com.br**

**Função:** Dashboards consolidados multi-fonte

**Tecnologia atual:**
- PHP (sem framework)
- Consome dados de loja + forms via HTTP

**Dashboards:**
- Vendas por escola
- Pesquisas (pais e professores)
- Métricas consolidadas por mantenedora

**Arquivos principais:**
- `FederatedDataAggregator.php` - Agrega dados de múltiplos subdomínios
- `auth/auth-functions.php` - Autenticação atual
- `database/connection.php` - Conexão MySQL (apenas para usuários)

**Comunicação atual:**
- **Loja → Dashboard:** API HTTP que lê JSONs indexados
- **Forms → Dashboard:** API HTTP que lê JSONs indexados
- **Problema:** Alto acoplamento, sem banco relacional

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 PROBLEMA 1: Múltiplos Logins (SSO inexistente)

**Situação atual:**
- Cada subdomínio tem autenticação própria
- Usuário precisa fazer login separado em loja, forms, dashs
- Sem controle centralizado de permissões
- Dados de usuário duplicados

**Impacto:**
- ❌ Má experiência do usuário
- ❌ Dificuldade de gerenciar acessos
- ❌ Impossível ter permissões granulares cross-domain
- ❌ Dados inconsistentes entre sistemas

**Exemplo real:**
Professor loga no dashboard (dashs) → Quer acessar material de treinamento (futuro sistema) → Precisa fazer outro login

---

### 🔴 PROBLEMA 2: Integrações Frágeis e Acopladas

**Situação atual:**
- **Integração Omie:** `OrderManager.php` chama `OrderIntegrator.php` diretamente (linha 842, 1699)
- **Integração Getnet:** Código de pagamento misturado com lógica de pedido
- **Webhooks Make:** Disparados inline no fluxo de aprovação
- **Dashboard:** Lê arquivos JSON diretamente via API HTTP

**Como está implementado (PROBLEMA):**

```php
// OrderManager.php linha 842
$this->triggerERPIntegration($orderId);  // ❌ CHAMADA DIRETA

// OrderManager.php linha 1699
private function triggerERPIntegration(string $orderId): void {
    require_once $integratorFile;  // ❌ ACOPLAMENTO FORTE
    $integrator = new \OrderIntegrator($config);
    $integrator->processStoreOrder($orderData);  // ❌ SÍNCRONO
}

// WebhookManager disparado inline
$this->dispatchWebhook($orderData);  // ❌ BLOQUEIA FLUXO
```

**Consequências:**
- ❌ Mudança no frontend → Quebra integração Omie (já aconteceu)
- ❌ Omie offline → Loja trava ao aprovar pedido
- ❌ Adicionar nova integração → Editar OrderManager
- ❌ Testes impossíveis sem Omie real
- ❌ Código entrelaçado e difícil manter

**Exemplo real citado pelo usuário:**
> "Recentemente fiz edições que quebraram a integração do sistema com o Omie, para emissão de notas. Modifiquei algo no frontend que impactou essa integração."

---

### 🔴 PROBLEMA 3: Código Misturado com Dados

**Situação atual:**
- Pedidos salvos em `/orders/approved/` **DENTRO** do código fonte
- Responses de forms em `/responses/` **DENTRO** do código fonte
- Logs em `/webhooks/logs/` **DENTRO** do código fonte
- Uploads de usuários **MISTURADOS** com arquivos PHP

**Estrutura atual (PROBLEMA):**
```
loja.businesseducation.com.br/
├── orders/              ⚠️ DADOS
│   ├── approved/        ⚠️ JSONs de pedidos
│   └── pending/         ⚠️ JSONs de pedidos
├── OrderManager.php     ✅ CÓDIGO
├── webhooks/
│   └── logs/            ⚠️ DADOS (logs)
└── stores/
    └── [store-id]/
        └── uploads/     ⚠️ DADOS (imagens)
```

**Consequências:**
- ❌ Deploy de código novo → Sobrescreve pedidos antigos
- ❌ Backup de código → Inclui gigabytes de pedidos
- ❌ Git ignora dados → Perde pedidos em rollback
- ❌ Permissões de arquivo inconsistentes
- ❌ Difícil separar staging de produção

**Exemplo real:**
> "Hoje acontece muito de sobrescrevermos pastas inteiras, que contém código e dados de pedidos e pesquisa, por exemplo, quando atualizados o sistema."

---

## 🎯 OBJETIVOS DO PROJETO

### OBJETIVO 1: Integrações Desacopladas e Resilientes

**O que queremos:**
Sistema de eventos onde integrações **OUVEM** mudanças na loja e **REAGEM** independentemente, sem acoplamento direto.

**Como deve funcionar (EVENT-DRIVEN):**

```
[LOJA]
   ↓ (aprova pedido)
   ↓
[EVENT BUS - Redis Pub/Sub]
   ↓ publica "OrderApproved"
   ├────→ [Omie Integration Service] escuta → Emite NF
   ├────→ [Webhook Service] escuta → Dispara Make
   ├────→ [Email Service] escuta → Envia confirmação
   └────→ [Analytics Service] escuta → Atualiza métricas
```

**Vantagens:**
- ✅ Omie offline → Loja continua funcionando (pedido fica em fila)
- ✅ Adicionar integração → Criar listener, não mexer em loja
- ✅ Mudança na loja → Não afeta integrações (contrato de evento fixo)
- ✅ Testes independentes (mock de eventos)
- ✅ Retry automático em caso de falha

**Integrações afetadas:**
- **Omie (ERP):** Emissão de notas fiscais
- **Getnet:** Processamento de pagamentos
- **Melhor Envio:** Geração de etiquetas
- **Make (webhooks):** Automações externas
- **Dashboard (dashs):** Consolidação de dados

---

### OBJETIVO 2: Ambiente Staging Paralelo e Deploy Seguro

**O que queremos:**
Trabalhar em novas features/fixes em ambiente isolado, testar completamente, e só então substituir produção com segurança.

**Workflow desejado:**

```
1. DESENVOLVIMENTO (PC local)
   ├─ Edita código no VS Code
   ├─ Salva
   └─ Git commit

2. STAGING (VPS - ambiente de teste)
   ├─ Git push → Atualiza staging automaticamente
   ├─ Testa completamente (dados similares a produção)
   ├─ Se funciona → Prossegue
   └─ Se quebra → Corrige e repete

3. PRODUÇÃO (VPS - ambiente real)
   ├─ Deploy atômico (staging → produção)
   ├─ Monitoramento de erros
   ├─ Rollback instantâneo se necessário
   └─ Dados preservados sempre

4. SINCRONIZAÇÃO REVERSA (quando necessário)
   └─ Atualiza staging com estado atual de produção
```

**Separação de dados:**

```
VPS
├── /home/deploy/sistemas-businesseducation/
│   ├── services/                    ✅ CÓDIGO (versionado Git)
│   │   ├── auth-service/
│   │   ├── loja-service/
│   │   └── integration-service/
│   │
│   └── data/                        ✅ DADOS (NUNCA no Git)
│       ├── staging/
│       │   ├── postgres/            📊 Banco staging
│       │   ├── redis/               💾 Cache staging
│       │   ├── uploads/             📁 Arquivos staging
│       │   └── logs/                📋 Logs staging
│       │
│       └── production/
│           ├── postgres/            📊 Banco produção
│           ├── redis/               💾 Cache produção
│           ├── uploads/             📁 Arquivos produção
│           └── logs/                📋 Logs produção
```

**Preservação de dados:**
- ✅ Deploy atualiza código, NÃO toca em dados
- ✅ Backup automático antes de deploy
- ✅ Rollback rápido (swap de código)
- ✅ Dados em volumes Docker persistentes

---

### OBJETIVO 3: Autenticação Única (SSO)

**O que queremos:**
Login centralizado com controle granular de permissões cross-domain.

**Estrutura desejada:**

```
[USUÁRIO]
   ↓ login em apps.businesseducation.com.br
   ↓
[AUTH SERVICE - Central]
   ↓ valida credenciais
   ↓ gera JWT token
   ↓ define permissões (roles)
   ↓
[USUÁRIO] recebe token
   ├─→ Acessa loja.businesseducation.com.br (token válido)
   ├─→ Acessa dashs.businesseducation.com.br (token válido)
   ├─→ Acessa forms.businesseducation.com.br (token válido)
   └─→ Futuro: treinamento.businesseducation.com.br (token válido)
```

**Roles e permissões:**

| Role | Loja | Dashboard | Forms | Treinamento |
|------|------|-----------|-------|-------------|
| **Aluno** | Ver pedidos próprios | Ver notas próprias | Responder formulários | Acessar materiais |
| **Pai** | Comprar livros | Ver resultados filhos | Responder pesquisas | ❌ |
| **Professor** | Ver pedidos escola | Ver métricas turma | Criar avaliações | Acessar recursos docentes |
| **Gestão Escola** | Gerenciar pedidos escola | Ver todos dados escola | Ver todas respostas | Gerenciar professores |
| **Business Education** | Gerenciar tudo | Ver tudo | Configurar tudo | Criar cursos |

**Implementação:**
- JWT tokens com claims de permissão
- Refresh tokens em Redis
- Session sharing via domain cookies
- Middleware de autorização em cada service

---

## 🏗️ ARQUITETURA PROPOSTA

### Stack Tecnológico

| Componente | Tecnologia Atual | Migração Para | Motivo |
|------------|-----------------|---------------|--------|
| **Backend** | PHP (sem framework) | Node.js + TypeScript + Express | Async nativo, type-safe, event-driven |
| **Banco de dados** | Arquivos JSON | PostgreSQL 15 | ACID, relacional, queries complexas |
| **Cache** | ❌ Inexistente | Redis 7 | Cache, sessions, pub/sub |
| **Event Bus** | ❌ Inexistente | Redis Pub/Sub | Desacoplamento, async |
| **Containers** | ❌ Inexistente | Docker + Docker Compose | Isolamento, replicação |
| **Frontend** | HTML + CSS + JS vanilla | Manter inicialmente | Migração futura para React |
| **Autenticação** | Sessions PHP dispersas | JWT + Redis | SSO, stateless |
| **API** | Endpoints PHP ad-hoc | REST API padronizada | Contratos claros |

### Arquitetura de Serviços (Microservices)

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                            │
│  (Pais, Professores, Alunos, Gestão, Business Education)   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                    │
│  *.businesseducation.com.br → Roteia para services          │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ LOJA SERVICE  │  │  AUTH SERVICE │  │ DASHS SERVICE │
│ Port 3001     │  │  Port 3000    │  │ Port 3002     │
│ (Node.js)     │  │  (Node.js)    │  │ (Node.js)     │
└───────────────┘  └───────────────┘  └───────────────┘
        ↓                  ↓                  ↓
        └──────────────────┼──────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                     ↓
┌───────────────────────┐          ┌───────────────────────┐
│   REDIS PUB/SUB       │          │    POSTGRESQL 15      │
│   (Event Bus)         │          │    (Dados)            │
│                       │          │                       │
│ Channels:             │          │ Schemas:              │
│ - OrderApproved       │          │ - users               │
│ - OrderRejected       │          │ - orders              │
│ - PaymentProcessed    │          │ - stores              │
│ - ProductShipped      │          │ - form_responses      │
└───────────────────────┘          │ - integrations_log    │
        ↓                          └───────────────────────┘
┌───────────────────────┐
│ INTEGRATION SERVICES  │
│                       │
│ ┌─────────────────┐   │
│ │ Omie Service    │   │ ← Escuta OrderApproved
│ │ Port 3010       │   │
│ └─────────────────┘   │
│                       │
│ ┌─────────────────┐   │
│ │ Webhook Service │   │ ← Escuta eventos diversos
│ │ Port 3011       │   │
│ └─────────────────┘   │
│                       │
│ ┌─────────────────┐   │
│ │ Email Service   │   │ ← Escuta OrderApproved/Shipped
│ │ Port 3012       │   │
│ └─────────────────┘   │
└───────────────────────┘
```

### Estrutura de Diretórios

```
sistemas-businesseducation/
│
├── services/                          # 🚀 Código (Node.js)
│   ├── auth-service/                  # Autenticação SSO
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── loja-service/                  # E-commerce
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── events/                # Event publishers
│   │   │   └── server.ts
│   │   └── ...
│   │
│   ├── integration-service/           # Integrações externas
│   │   ├── src/
│   │   │   ├── subscribers/           # Event subscribers
│   │   │   │   ├── omie-subscriber.ts
│   │   │   │   ├── webhook-subscriber.ts
│   │   │   │   └── email-subscriber.ts
│   │   │   └── server.ts
│   │   └── ...
│   │
│   └── dashs-service/                 # Dashboards
│       └── ...
│
├── data/                              # 📊 Dados (NUNCA no Git)
│   ├── staging/
│   │   ├── postgres/                  # DB staging
│   │   ├── redis/                     # Cache staging
│   │   ├── uploads/                   # Arquivos staging
│   │   └── logs/                      # Logs staging
│   │
│   └── production/
│       ├── postgres/                  # DB produção
│       ├── redis/                     # Cache produção
│       ├── uploads/                   # Arquivos produção
│       └── logs/                      # Logs produção
│
├── infrastructure/                    # 🛠️ Infraestrutura
│   ├── docker/
│   │   ├── docker-compose.staging.yml
│   │   ├── docker-compose.production.yml
│   │   └── nginx/
│   │       ├── nginx.conf
│   │       └── ssl/
│   │
│   └── migrations/                    # Migrations DB
│       ├── 001_create_users.sql
│       ├── 002_create_orders.sql
│       └── ...
│
├── scripts/                           # 📜 Automação
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   ├── backup.sh
│   └── rollback.sh
│
├── docs/                              # 📚 Documentação
│   ├── PROJETO_MASTER.md             # 👈 ESTE ARQUIVO
│   ├── CONFIGURACAO_VPS.md
│   ├── INTERFACE_GRAFICA_VPS.md
│   ├── EXTENSOES_E_INSTRUCOES_CURSOR_AI.md
│   └── ANALISE_ARQUITETURA.md
│
├── .gitignore                         # Ignora data/
├── README.md
└── package.json                       # Root workspace
```

---

## 🔌 INTEGRAÇÕES ATUAIS

### Análise Detalhada das Integrações Existentes

#### 1. **INTEGRAÇÃO OMIE (ERP - Emissão de NF)**

**Status atual:** ❌ ACOPLADA DIRETAMENTE

**Como funciona hoje:**
```php
// OrderManager.php linha 842
public function approveOrder(string $orderId, array $paymentData = []): bool {
    // ... salva pedido como approved
    
    // ❌ CHAMADA DIRETA SÍNCRONA
    $this->triggerERPIntegration($orderId);
    
    return true;
}

// OrderManager.php linha 1699
private function triggerERPIntegration(string $orderId): void {
    // ❌ REQUIRE DIRETO - ACOPLAMENTO FORTE
    require_once $integratorFile;
    $integrator = new \OrderIntegrator($config);
    
    // ❌ CHAMADA SÍNCRONA - BLOQUEIA SE OMIE OFFLINE
    $mapResult = $integrator->processStoreOrder($orderData);
    $apiResult = $integrator->sendOrderToOmieWithData($orderDataWithMapping);
}
```

**Problemas:**
- ❌ Omie offline → Aprovação de pedido falha
- ❌ Mudança no OrderManager → Pode quebrar integração
- ❌ Impossível testar sem Omie real
- ❌ Timeout de Omie → Timeout na loja

**Como deve ficar (EVENT-DRIVEN):**
```typescript
// loja-service/src/events/order-events.ts
export async function publishOrderApproved(order: Order) {
  await redis.publish('OrderApproved', JSON.stringify({
    order_id: order.id,
    store_id: order.store_id,
    total: order.total,
    customer: order.customer,
    items: order.items,
    timestamp: new Date().toISOString()
  }));
}

// integration-service/src/subscribers/omie-subscriber.ts
redis.subscribe('OrderApproved');
redis.on('message', async (channel, message) => {
  if (channel === 'OrderApproved') {
    const orderData = JSON.parse(message);
    
    // ✅ ASSÍNCRONO - NÃO BLOQUEIA LOJA
    try {
      await omieClient.createInvoice(orderData);
      console.log(`NF emitida para pedido ${orderData.order_id}`);
    } catch (error) {
      // ✅ RETRY AUTOMÁTICO
      await retryQueue.add(orderData, { attempts: 3 });
    }
  }
});
```

**Vantagens:**
- ✅ Omie offline → Pedido aprovado, NF emitida depois
- ✅ Mudança na loja → Não afeta integração (contrato de evento fixo)
- ✅ Testes com mock de eventos
- ✅ Retry automático

---

#### 2. **INTEGRAÇÃO GETNET (Pagamentos)**

**Status atual:** ⚠️ PARCIALMENTE ACOPLADA

**Como funciona hoje:**
- Handlers separados (PixHandler, CreditHandler)
- Callbacks disparam `OrderManager::approveOrder()`
- Relativamente desacoplado, mas ainda síncrono

**Como deve ficar:**
```typescript
// loja-service/src/controllers/payment-callback.ts
app.post('/callbacks/payment', async (req, res) => {
  const { payment_id, status, order_id } = req.body;
  
  if (status === 'APPROVED') {
    // 1. Atualiza pedido
    await orderService.approveOrder(order_id, req.body);
    
    // 2. Publica evento
    await publishPaymentApproved({ order_id, payment_id, ...req.body });
    
    // 3. Responde Getnet IMEDIATAMENTE
    res.status(200).json({ received: true });
  }
});

// integration-service escuta PaymentApproved
// - Envia email de confirmação
// - Atualiza analytics
// - Dispara webhook Make
```

**Vantagens:**
- ✅ Getnet recebe confirmação instantânea (< 100ms)
- ✅ Processamento pesado acontece depois (async)
- ✅ Cliente recebe confirmação imediata

---

#### 3. **INTEGRAÇÃO MELHOR ENVIO (Logística)**

**Status atual:** ⚠️ CHAMADA DIRETA API

**Como funciona hoje:**
- Frontend chama API Melhor Envio para calcular frete
- Após aprovação, admin gera etiqueta manualmente

**Como deve ficar:**
```typescript
// integration-service/src/subscribers/shipping-subscriber.ts
redis.subscribe('OrderBilled'); // Escuta quando NF emitida

redis.on('message', async (channel, message) => {
  if (channel === 'OrderBilled') {
    const { order_id } = JSON.parse(message);
    
    // ✅ GERA ETIQUETA AUTOMATICAMENTE
    const shippingLabel = await melhorEnvioClient.createShippingLabel(order_id);
    
    // ✅ PUBLICA EVENTO
    await redis.publish('ShippingLabelCreated', JSON.stringify({
      order_id,
      tracking_code: shippingLabel.tracking_code
    }));
  }
});
```

---

#### 4. **WEBHOOKS MAKE (Automações)**

**Status atual:** ❌ DISPARADOS INLINE

**Como funciona hoje:**
```php
// OrderManager.php linha 978
public function rejectOrder(string $orderId, array $rejectData = []): bool {
    // ... salva pedido
    
    // ❌ DISPARO INLINE - BLOQUEIA SE MAKE OFFLINE
    $this->dispatchWebhook($orderData);
    
    return true;
}
```

**Problema:**
- ❌ Make offline → Rejeição de pedido trava
- ❌ Timeout de webhook → Timeout na loja

**Como deve ficar:**
```typescript
// integration-service/src/subscribers/webhook-subscriber.ts
redis.subscribe('OrderApproved', 'OrderRejected', 'OrderShipped');

redis.on('message', async (channel, message) => {
  const webhookPayload = JSON.parse(message);
  
  // ✅ DISPARA WEBHOOK ASSÍNCRONO
  try {
    await axios.post(MAKE_WEBHOOK_URL, webhookPayload);
  } catch (error) {
    // ✅ RETRY COM BACKOFF
    await retryWithBackoff(webhookPayload, 5);
  }
});
```

---

#### 5. **INTEGRAÇÃO DASHBOARD (dashs ← loja + forms)**

**Status atual:** ❌ API HTTP QUE LÊ JSONS

**Como funciona hoje:**
```php
// dashs/core/FederatedDataAggregator.php
public function buscarDadosLoja($filters = []) {
    // ❌ FAZ REQUEST HTTP TODA VEZ
    $url = 'https://loja.businesseducation.com.br/api/dashboard-data.php';
    $response = file_get_contents($url . '?' . http_build_query($filters));
    return json_decode($response, true);
}

// loja/api/dashboard-data.php
require_once __DIR__ . '/../core/SmartStoreIndexer.php';
$indexer = new \Orders\SmartStoreIndexer();
// ❌ LÊ TODOS OS JSONS E AGREGA NA HORA
$lojaData = $indexer->getStoreDataByMaintainer($maintainer_id, $filters);
```

**Problemas:**
- ❌ Dashboard lento (lê centenas de JSONs toda vez)
- ❌ Sem filtros complexos (não é banco relacional)
- ❌ Dados podem estar desatualizados
- ❌ Alto coupling entre sistemas

**Como deve ficar (BANCO DE DADOS):**

```typescript
// loja-service: Salva pedido no PostgreSQL
await db.orders.create({
  order_id: orderId,
  store_id: storeId,
  maintainer_id: maintainerId,
  customer_name: customerName,
  total: total,
  status: 'approved',
  created_at: new Date()
});

// dashs-service: Query direto no banco
app.get('/api/dashboard/vendas', async (req, res) => {
  const { maintainer_id, data_inicial, data_final } = req.query;
  
  // ✅ QUERY SQL RÁPIDA E COMPLEXA
  const vendas = await db.query(`
    SELECT 
      DATE(created_at) as data,
      COUNT(*) as total_pedidos,
      SUM(total) as valor_total
    FROM orders
    WHERE maintainer_id = $1
      AND created_at BETWEEN $2 AND $3
      AND status = 'approved'
    GROUP BY DATE(created_at)
    ORDER BY data DESC
  `, [maintainer_id, data_inicial, data_final]);
  
  res.json(vendas);
});
```

**Vantagens:**
- ✅ Dashboard instantâneo (queries otimizadas)
- ✅ Filtros complexos (joins, aggregates)
- ✅ Dados sempre atualizados
- ✅ Baixo coupling (apenas schema de BD)

---

## 📊 MIGRAÇÃO DE DADOS

### Estratégia: Strangler Fig Pattern

Migrar progressivamente de JSONs para PostgreSQL sem downtime.

**Fase 1: Dual Write (Em paralelo)**
```typescript
// Salva em AMBOS os locais
async function saveOrder(orderData) {
  // ✅ Salva no JSON (sistema antigo continua funcionando)
  await saveOrderToJSON(orderData);
  
  // ✅ Salva no PostgreSQL (novo sistema)
  await db.orders.create(orderData);
}

// Lê do JSON ainda
async function getOrder(orderId) {
  return await readOrderFromJSON(orderId);
}
```

**Fase 2: Dual Read (Fallback)**
```typescript
// Lê do PostgreSQL, fallback para JSON
async function getOrder(orderId) {
  let order = await db.orders.findOne({ where: { id: orderId } });
  
  if (!order) {
    // ✅ Fallback para JSON (pedidos antigos)
    order = await readOrderFromJSON(orderId);
  }
  
  return order;
}
```

**Fase 3: Migração de Dados Históricos**
```typescript
// Script de migração
async function migrateHistoricalOrders() {
  const jsonFiles = await fs.readdir('./orders/approved/');
  
  for (const file of jsonFiles) {
    const orderData = JSON.parse(await fs.readFile(file));
    
    // Verifica se já existe no BD
    const exists = await db.orders.findOne({ where: { id: orderData.order_id } });
    
    if (!exists) {
      await db.orders.create(orderData);
      console.log(`Migrado: ${orderData.order_id}`);
    }
  }
}
```

**Fase 4: Read from PostgreSQL Only**
```typescript
// Agora lê apenas do PostgreSQL
async function getOrder(orderId) {
  return await db.orders.findOne({ where: { id: orderId } });
}

// JSON vira backup/arquivo
```

**Fase 5: Remove JSON Logic**
```typescript
// Código de JSON completamente removido
// JSONs movidos para /data/archives/
```

---

### Schema PostgreSQL Proposto

```sql
-- TABELA: users (SSO)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    document_type VARCHAR(10),
    document_number VARCHAR(20),
    role VARCHAR(50) NOT NULL, -- 'pai', 'professor', 'aluno', 'gestao', 'admin'
    maintainer_id VARCHAR(50), -- Vincula a mantenedora
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- TABELA: stores
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id VARCHAR(100) UNIQUE NOT NULL, -- 's4vwcb5f-capec'
    maintainer_id VARCHAR(50) NOT NULL,
    maintainer_name VARCHAR(255),
    store_name VARCHAR(255),
    store_url VARCHAR(255),
    profit_margin DECIMAL(5,4) DEFAULT 0.1,
    active BOOLEAN DEFAULT TRUE,
    config JSONB, -- Configurações específicas da loja
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABELA: orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) UNIQUE NOT NULL, -- 'S4VWCB5F-CAPEC-1754945607'
    store_id VARCHAR(100) NOT NULL REFERENCES stores(store_id),
    maintainer_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id), -- Cliente (se logado)
    
    -- Dados do cliente
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_document VARCHAR(20),
    
    -- Dados do pedido
    status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'billed', 'shipped', 'delivered'
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2),
    shipping_cost DECIMAL(10,2),
    discount DECIMAL(10,2),
    
    -- Datas
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    billed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Integração
    omie_order_number VARCHAR(50), -- Número da NF no Omie
    payment_id VARCHAR(100),
    tracking_code VARCHAR(100),
    
    -- Dados completos (JSON para flexibilidade)
    order_details JSONB,
    
    -- Índices para queries rápidas
    INDEX idx_store_id (store_id),
    INDEX idx_maintainer_id (maintainer_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_customer_email (customer_email)
);

-- TABELA: order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(order_id),
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    child_name VARCHAR(255), -- Nome do filho vinculado
    child_grade VARCHAR(50)  -- Série do filho
);

-- TABELA: form_responses (para forms)
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL,
    maintainer_id VARCHAR(50) NOT NULL,
    school_id VARCHAR(100),
    respondent_type VARCHAR(50), -- 'pai', 'professor'
    response_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_form_id (form_id),
    INDEX idx_maintainer_id (maintainer_id),
    INDEX idx_created_at (created_at)
);

-- TABELA: integration_logs (para rastreamento)
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- 'OrderApproved', 'PaymentProcessed', etc
    order_id VARCHAR(100),
    integration_name VARCHAR(50), -- 'omie', 'getnet', 'webhook_make'
    status VARCHAR(50), -- 'success', 'failed', 'retry'
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_order_id (order_id),
    INDEX idx_integration_name (integration_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

---

## ✅ STATUS ATUAL

### O que já foi feito

#### 1. **VPS Configurado** ✅

- **Servidor:** Hostinger KVM 2 (8GB RAM, 2 CPU, 100GB SSD)
- **IP:** 72.61.39.160
- **Sistema:** Ubuntu 25.04
- **Acesso:** SSH via `deploy@72.61.39.160`
- **Docker instalado:** Docker Engine 28.5.1 + Docker Compose v2.40.3

#### 2. **Repositório GitHub Criado** ✅

- **URL:** `github.com/caiquesimiele/sistemas-businesseducation`
- **Estrutura inicial:**
  - `.gitignore` (ignora `/data/`)
  - `infrastructure/docker/` (docker-compose files)
  - `README.md`

#### 3. **Ambientes Docker Rodando** ✅

**Staging:**
- PostgreSQL staging: porta 5433 ✅
- Redis staging: porta 6380 ✅
- Dados em: `/home/deploy/sistemas-businesseducation/data/staging/` ✅

**Produção:**
- PostgreSQL produção: porta 5432 ✅
- Redis produção: porta 6379 ✅
- Dados em: `/home/deploy/sistemas-businesseducation/data/production/` ✅

**Verificação:**
```bash
docker ps
# 4 containers rodando:
# - docker-postgres-staging-1
# - docker-redis-staging-1
# - docker-postgres-production-1
# - docker-redis-production-1
```

#### 4. **Estrutura de Dados Separada** ✅

```
/home/deploy/sistemas-businesseducation/
├── data/
│   ├── staging/
│   │   ├── postgres/  ✅
│   │   ├── redis/     ✅
│   │   ├── uploads/   ✅
│   │   └── logs/      ✅
│   └── production/
│       ├── postgres/  ✅
│       ├── redis/     ✅
│       ├── uploads/   ✅
│       └── logs/      ✅
```

#### 5. **Documentação Criada** ✅

- ✅ `CONFIGURACAO_VPS.md` - Setup completo do VPS
- ✅ `INTERFACE_GRAFICA_VPS.md` - VS Code Remote SSH
- ✅ `EXTENSOES_E_INSTRUCOES_CURSOR_AI.md` - Extensões e workflows
- ✅ `ANALISE_ARQUITETURA.md` - Análise crítica comparativa
- ✅ `PROJETO_MASTER.md` - Este arquivo (contexto completo)

#### 6. **Ferramentas Instaladas** ✅

VS Code Extensions:
- Remote - SSH ✅
- GitLens ✅
- Docker ✅
- Database Client ✅
- Thunder Client ✅
- Error Lens ✅
- ESLint ✅
- Prettier ✅
- Material Icon Theme ✅
- E mais 15 extensões (ver EXTENSOES_E_INSTRUCOES_CURSOR_AI.md)

---

### O que NÃO foi feito ainda

#### 1. **Services Node.js** ❌

- [ ] auth-service (autenticação SSO)
- [ ] loja-service (migração da loja PHP)
- [ ] integration-service (Omie, webhooks, email)
- [ ] dashs-service (dashboards)

#### 2. **Arquivos .env** ❌

- [ ] `.env.staging` (credenciais staging)
- [ ] `.env.production` (credenciais produção)

#### 3. **Event Bus (Redis Pub/Sub)** ❌

- [ ] Implementar publishers (loja → eventos)
- [ ] Implementar subscribers (integrações → escutam eventos)
- [ ] Testar fluxo completo de eventos

#### 4. **Migrations PostgreSQL** ❌

- [ ] Schema inicial (users, orders, stores, etc)
- [ ] Migração de dados históricos (JSON → PostgreSQL)

#### 5. **Nginx** ❌

- [ ] Configuração de reverse proxy
- [ ] SSL/HTTPS (Let's Encrypt)
- [ ] Roteamento de domínios

#### 6. **Deploy Automation** ❌

- [ ] Scripts de deploy (staging/production)
- [ ] CI/CD (GitHub Actions)
- [ ] Backup automático
- [ ] Rollback automático

---

## 🚀 PRÓXIMOS PASSOS

### Roadmap Prioritizado

#### **FASE 1: Foundation (Semana 1-2)** 🏗️

**Objetivo:** Infraestrutura base funcionando

- [ ] **1.1** Criar auth-service básico
  - Registro de usuário
  - Login (email + senha)
  - Geração de JWT
  - Middleware de autenticação
  - Refresh token via Redis

- [ ] **1.2** Criar arquivos `.env`
  - `.env.staging` com credenciais staging
  - `.env.production` com credenciais produção
  - Documentar todas as variáveis necessárias

- [ ] **1.3** Criar migrations PostgreSQL
  - Schema `users`
  - Schema `stores`
  - Schema `orders` (estrutura básica)
  - Testar em staging

- [ ] **1.4** Configurar Nginx
  - Reverse proxy para services
  - SSL com Let's Encrypt
  - Rotas: auth.businesseducation.com.br (teste)

**Entregável:** SSO funcionando em staging

---

#### **FASE 2: Event Bus (Semana 3-4)** 📡

**Objetivo:** Sistema de eventos desacoplado

- [ ] **2.1** Implementar Event Publishers
  - `publishOrderApproved()`
  - `publishPaymentProcessed()`
  - `publishOrderRejected()`
  - Testes unitários

- [ ] **2.2** Criar integration-service
  - Subscriber base (conecta Redis)
  - Omie subscriber (escuta OrderApproved)
  - Webhook subscriber (escuta todos eventos)
  - Email subscriber (confirmações)

- [ ] **2.3** Testar fluxo completo
  - Aprovar pedido (teste) → Evento publicado
  - Integration-service escuta → Processa
  - Log de sucesso/falha
  - Retry em caso de erro

**Entregável:** Integração Omie desacoplada funcionando

---

#### **FASE 3: Migração Loja (Semana 5-8)** 🛒

**Objetivo:** Loja rodando em Node.js (coexistindo com PHP)

- [ ] **3.1** Criar loja-service
  - API REST para pedidos
  - CRUD de pedidos (PostgreSQL)
  - Dual write (JSON + PostgreSQL)

- [ ] **3.2** Migrar endpoints críticos
  - POST /api/orders (criar pedido)
  - GET /api/orders/:id (consultar pedido)
  - PATCH /api/orders/:id/approve (aprovar)
  - PATCH /api/orders/:id/reject (rejeitar)

- [ ] **3.3** Integrar com PHP existente
  - PHP frontend continua funcionando
  - Chama API Node.js em vez de OrderManager.php
  - Testa em staging

- [ ] **3.4** Migração de dados históricos
  - Script de migração JSON → PostgreSQL
  - Validação de dados migrados
  - Backup de JSONs

**Entregável:** Loja rodando em Node + PostgreSQL (staging)

---

#### **FASE 4: Dashboard (Semana 9-10)** 📊

**Objetivo:** Dashboards usando PostgreSQL

- [ ] **4.1** Criar dashs-service
  - API REST para dados consolidados
  - Queries otimizadas PostgreSQL
  - Cache Redis para queries pesadas

- [ ] **4.2** Migrar FederatedDataAggregator
  - Remover leitura de JSONs
  - Queries diretas no PostgreSQL
  - Filtros avançados (joins, aggregates)

- [ ] **4.3** Testar performance
  - Benchmark JSON vs PostgreSQL
  - Otimizar índices
  - Cache inteligente

**Entregável:** Dashboards 10x mais rápidos

---

#### **FASE 5: Deploy Produção (Semana 11-12)** 🚀

**Objetivo:** Sistemas novos em produção

- [ ] **5.1** Testes finais em staging
  - Fluxo completo end-to-end
  - Load testing
  - Validação de integrações

- [ ] **5.2** Deploy gradual produção
  - auth-service → produção
  - integration-service → produção
  - loja-service → produção (beta)
  - Monitoramento de erros

- [ ] **5.3** Migração completa
  - Apontar domínios para VPS
  - Desativar PHP legado
  - Mover JSONs para arquivo

**Entregável:** Sistema novo 100% em produção

---

## 🎓 ANÁLISE CRÍTICA

### Estamos no caminho certo?

**✅ SIM. Arquitetura alinhada com indústria moderna.**

### Validação por Categoria

#### 1. **Docker + Docker Compose** ✅

**Decisão:** Usar containers gerenciados por Docker Compose

**O que empresas fazem:**
- Startups (10-100 pessoas): Docker Compose
- Empresas médias: Kubernetes
- Empresas grandes: K8s multi-região

**Empresas que começaram assim:**
- Airbnb (primeiros anos)
- GitLab (antes de K8s)
- Ghost CMS

**Conclusão:** ✅ Correto para tamanho atual

---

#### 2. **Event-Driven Architecture** ✅

**Decisão:** Integrações via eventos (Redis Pub/Sub)

**O que empresas fazem:**
- Startups: Redis Pub/Sub ou RabbitMQ
- Empresas médias: RabbitMQ ou AWS SQS
- Empresas grandes: Apache Kafka

**Empresas que usam:**
- Uber: Kafka para tracking
- Netflix: Event streaming
- Amazon: SQS para desacoplamento
- Spotify: Eventos para playlists

**Conclusão:** ✅ Arquitetura moderna e escalável

---

#### 3. **Node.js + TypeScript** ✅

**Decisão:** Migrar de PHP para Node.js

**O que empresas fazem:**
- Startups modernas: Node.js, Go, Python
- Empresas legadas: Java, .NET
- Empresas em migração: Node.js (PayPal, Netflix, LinkedIn)

**Empresas que migraram de PHP:**
- PayPal: PHP → Node.js (2x mais rápido)
- LinkedIn: Java → Node.js (10x menos servidores)
- Walmart: Java → Node.js (Black Friday)

**Conclusão:** ✅ Decisão correta

---

#### 4. **PostgreSQL** ✅

**Decisão:** Migrar de JSON para PostgreSQL

**O que empresas fazem:**
- Dados relacionais: PostgreSQL, MySQL
- Dados documentos: MongoDB
- Híbrido: PostgreSQL (tem JSONB)

**Por que PostgreSQL:**
- ✅ ACID compliant
- ✅ Queries complexas (joins, aggregates)
- ✅ Índices performáticos
- ✅ JSONB para flexibilidade
- ✅ Gratuito e open-source

**Conclusão:** ✅ Escolha ideal

---

#### 5. **Staging + Produção** ✅

**Decisão:** Ambientes isolados

**O que empresas fazem:**
- Todas empresas sérias: Mínimo staging + prod
- Empresas médias: Dev → Staging → Prod
- Empresas grandes: 5+ ambientes

**Empresas que não tinham e se arrependeram:**
- Knight Capital: Perdeu $440M em 45min (deploy direto prod)
- GitLab: Deletou BD prod, 6h offline (não testaram backup)

**Conclusão:** ✅ Obrigatório, não negociável

---

### Riscos e Mitigações

#### Risco 1: Complexidade aumentada

**Risco:** Sistema mais complexo que PHP monolítico

**Mitigação:**
- ✅ Documentação completa (este arquivo)
- ✅ Migração gradual (Strangler Fig)
- ✅ Aprendizado incremental
- ✅ Rollback sempre possível

---

#### Risco 2: Curva de aprendizado

**Risco:** Node.js, Docker, PostgreSQL são novos para equipe

**Mitigação:**
- ✅ Começar simples (auth-service primeiro)
- ✅ Documentação didática (sem "ilustrações baratas")
- ✅ Testes em staging (ambiente seguro)
- ✅ Pair programming com Cursor AI

---

#### Risco 3: Migração de dados

**Risco:** Perder dados durante migração JSON → PostgreSQL

**Mitigação:**
- ✅ Dual write (salva em ambos)
- ✅ Backup de JSONs antes de migrar
- ✅ Validação de dados migrados
- ✅ Rollback fácil (JSONs preservados)

---

#### Risco 4: Downtime em produção

**Risco:** Sistema cair durante migração

**Mitigação:**
- ✅ Migração gradual (um service por vez)
- ✅ Blue-green deployment
- ✅ Monitoramento ativo
- ✅ Rollback automatizado

---

### Comparação com Alternativas

| Aspecto | Nossa Escolha | Alternativa 1 | Alternativa 2 |
|---------|---------------|---------------|---------------|
| **Backend** | Node.js + TypeScript | PHP frameworks (Laravel) | Python (Django) |
| **Vantagem** | Async nativo, ecosystem | Familiar, rápido setup | Limpo, libraries |
| **Desvantagem** | Curva aprendizado | Não async nativo | Mais lento |
| **Veredicto** | ✅ Melhor long-term | ⚠️ Ok curto prazo | ⚠️ Overkill |
| | | | |
| **Database** | PostgreSQL | MongoDB | Continuar JSON |
| **Vantagem** | Relacional + JSONB | Flexível, schema-less | Zero setup |
| **Desvantagem** | Schema fixo | Sem joins complexos | Não escalável |
| **Veredicto** | ✅ Ideal para dados | ❌ Inadequado | ❌ Insustentável |
| | | | |
| **Event Bus** | Redis Pub/Sub | RabbitMQ | Chamadas diretas |
| **Vantagem** | Simples, já temos | Robusto, persiste msgs | Simples |
| **Desvantagem** | Não persiste | Mais complexo | Acoplamento total |
| **Veredicto** | ✅ Suficiente agora | ⚠️ Futuro (se precisar) | ❌ Má prática |
| | | | |
| **Infra** | Docker Compose | Kubernetes | Bare metal |
| **Vantagem** | Simples, suficiente | Auto-scaling | Controle total |
| **Desvantagem** | Manual scaling | Muito complexo | Difícil manter |
| **Veredicto** | ✅ Correto p/ tamanho | ❌ Overkill | ❌ Antiquado |

---

## 📝 DECISÕES TÉCNICAS

### Decisão 1: Node.js vs PHP Frameworks (Laravel, Symfony)

**Contexto:** Sistema atual é PHP sem framework. Podemos:
- A) Migrar para Laravel/Symfony (mantém PHP)
- B) Migrar para Node.js (mudança de linguagem)

**Decisão:** Node.js + TypeScript

**Motivo:**
1. **Event-driven nativo:** Async/await perfeito para event bus
2. **Ecosystem moderno:** npm, Docker, microservices
3. **Type safety:** TypeScript previne bugs
4. **Performance:** Non-blocking I/O ideal para APIs
5. **Contratação:** Mais fácil achar devs Node.js

**Trade-off aceito:** Curva de aprendizado inicial

---

### Decisão 2: PostgreSQL vs MongoDB

**Contexto:** Dados atualmente em JSON. Podemos:
- A) PostgreSQL (relacional)
- B) MongoDB (documento)

**Decisão:** PostgreSQL

**Motivo:**
1. **Dados relacionais:** Orders ↔ Users ↔ Stores (muitos joins)
2. **JSONB:** Flexibilidade quando necessário
3. **Queries complexas:** Aggregates, analytics
4. **ACID:** Transações financeiras (crítico)
5. **Maturidade:** Mais estável que MongoDB

**Trade-off aceito:** Schema menos flexível (mas temos JSONB)

---

### Decisão 3: Redis Pub/Sub vs RabbitMQ

**Contexto:** Precisamos de event bus. Podemos:
- A) Redis Pub/Sub (simples)
- B) RabbitMQ (robusto)
- C) Apache Kafka (enterprise)

**Decisão:** Redis Pub/Sub (agora) + RabbitMQ (futuro)

**Motivo:**
1. **Já temos Redis:** Para cache e sessions
2. **Suficiente para volume atual:** < 1000 eventos/dia
3. **Simples implementar:** Pub/Sub nativo
4. **Fácil migrar depois:** Para RabbitMQ se necessário

**Quando migrar para RabbitMQ:**
- Volume > 10.000 eventos/dia
- Precisar de persistência de mensagens
- Precisar de dead letter queues

---

### Decisão 4: Monorepo vs Multirepo

**Contexto:** Múltiplos services. Podemos:
- A) Monorepo (tudo em um repositório)
- B) Multirepo (um repo por service)

**Decisão:** Monorepo

**Motivo:**
1. **Simplicidade:** Um clone, um commit
2. **Refactoring fácil:** Muda contratos sem PRs múltiplos
3. **CI/CD simplificado:** Um pipeline
4. **Tamanho pequeno:** < 10 services (monorepo funciona)

**Quando revisar:** Se passar de 20+ services

---

### Decisão 5: REST vs GraphQL

**Contexto:** Precisamos de APIs. Podemos:
- A) REST (tradicional)
- B) GraphQL (moderno)

**Decisão:** REST

**Motivo:**
1. **Simplicidade:** Mais fácil implementar e debugar
2. **Caching:** HTTP caching nativo
3. **Tooling:** Thunder Client, Postman funcionam direto
4. **Suficiente:** Não temos necessidade de queries flexíveis

**Quando revisar:** Se frontend precisar de queries muito customizadas

---

## 📚 GLOSSÁRIO

### Conceitos Técnicos

**SSO (Single Sign-On)**
Autenticação única. Usuário faz login uma vez e acessa múltiplos sistemas sem relogar.

**JWT (JSON Web Token)**
Token criptografado que contém informações do usuário. Usado para autenticação stateless.

**Event-Driven Architecture**
Arquitetura onde sistemas se comunicam através de eventos, não chamadas diretas. Sistema A publica evento, Sistema B escuta e reage.

**Microservices**
Arquitetura onde aplicação é dividida em serviços pequenos e independentes, cada um com responsabilidade específica.

**Docker Container**
Pacote isolado que contém aplicação + dependências. Roda igual em qualquer servidor.

**Docker Compose**
Ferramenta para orquestrar múltiplos containers. Define services, networks, volumes em arquivo YAML.

**PostgreSQL**
Banco de dados relacional open-source. Suporta SQL + JSONB (JSON dentro de colunas).

**Redis**
Banco de dados em memória (muito rápido). Usado para cache, sessions, pub/sub.

**Pub/Sub (Publish/Subscribe)**
Pattern de mensageria. Publishers enviam mensagens, Subscribers recebem sem conhecer uns aos outros.

**Staging Environment**
Ambiente de teste que simula produção. Para testar mudanças antes de colocar no ar.

**Blue-Green Deployment**
Técnica de deploy. Dois ambientes idênticos (blue e green). Troca entre eles instantaneamente.

**Rollback**
Reverter sistema para versão anterior quando deploy dá problema.

**CI/CD (Continuous Integration/Continuous Deployment)**
Automação de testes e deploy. Código commitado → Testes rodados → Deploy automático.

**ACID (Atomicity, Consistency, Isolation, Durability)**
Propriedades de transações em bancos de dados. Garante integridade de dados financeiros.

**Migration**
Script que altera schema de banco de dados. Versionado e reversível.

**API (Application Programming Interface)**
Interface para sistemas conversarem. Conjunto de endpoints HTTP que aceitam requests e retornam responses.

**REST (Representational State Transfer)**
Estilo de API que usa HTTP methods (GET, POST, PUT, DELETE) + URLs padronizadas.

**Middleware**
Função que intercepta requests antes de chegar ao controller. Usado para autenticação, logging, etc.

**Schema**
Estrutura de dados do banco. Define tabelas, colunas, tipos, relações.

**Index**
Estrutura de dados que acelera queries. Como índice de livro.

**JSONB**
Tipo de dado do PostgreSQL. Armazena JSON de forma binária (mais rápido que texto).

**Dual Write**
Padrão de migração. Salva dados em sistema antigo E novo simultaneamente.

**Strangler Fig Pattern**
Padrão de migração gradual. Sistema novo "estrangula" sistema antigo aos poucos.

**Reverse Proxy**
Servidor que recebe requests e redireciona para servidores corretos. Nginx faz isso.

**SSL/TLS**
Protocolo de criptografia. HTTPS = HTTP + SSL. Garante segurança.

**Load Balancer**
Distribui tráfego entre múltiplos servidores. Evita sobrecarga.

---

### Acrônimos

- **VPS:** Virtual Private Server
- **SSH:** Secure Shell
- **HTTP:** Hypertext Transfer Protocol
- **HTTPS:** HTTP Secure
- **SQL:** Structured Query Language
- **JSON:** JavaScript Object Notation
- **JWT:** JSON Web Token
- **SSO:** Single Sign-On
- **CRUD:** Create, Read, Update, Delete
- **API:** Application Programming Interface
- **REST:** Representational State Transfer
- **URL:** Uniform Resource Locator
- **DNS:** Domain Name System
- **IP:** Internet Protocol
- **TCP:** Transmission Control Protocol
- **SMTP:** Simple Mail Transfer Protocol
- **FTP:** File Transfer Protocol
- **SFTP:** Secure File Transfer Protocol
- **CLI:** Command Line Interface
- **GUI:** Graphical User Interface
- **IDE:** Integrated Development Environment
- **SDK:** Software Development Kit
- **ORM:** Object-Relational Mapping
- **MVC:** Model-View-Controller

---

## 🎯 RESUMO EXECUTIVO

### Em uma frase

Estamos migrando de um monólito PHP com dados em JSON para uma arquitetura de microservices em Node.js com PostgreSQL, event bus, SSO e ambientes staging/produção isolados.

### Problemas que resolve

1. ✅ **Múltiplos logins** → SSO centralizado
2. ✅ **Integrações frágeis** → Event-driven desacoplado
3. ✅ **Código misturado com dados** → Separação completa

### Por que estamos fazendo isso

- Crescimento sustentável (escalar sem reescrever)
- Manutenibilidade (mudanças seguras e rápidas)
- Confiabilidade (testes, staging, rollback)
- Experiência do usuário (SSO, performance)

### Estamos no caminho certo?

**✅ SIM.** Arquitetura alinhada com startups modernas de sucesso. Não é over-engineering nem under-engineering. É o ponto ideal para nosso estágio atual.

### Quanto tempo vai levar?

**Estimativa:** 12 semanas para migração completa
- Semanas 1-2: Foundation (auth, DB)
- Semanas 3-4: Event bus
- Semanas 5-8: Migração loja
- Semanas 9-10: Dashboard
- Semanas 11-12: Deploy produção

### Próximo passo imediato

**Implementar auth-service (autenticação única)**

---

## 📞 CONTATOS E RECURSOS

### Repositório GitHub
https://github.com/caiquesimiele/sistemas-businesseducation

### VPS
- **IP:** 72.61.39.160
- **SSH:** `deploy@72.61.39.160`
- **Console Web:** Via painel Hostinger

### Domínios Atuais
- loja.businesseducation.com.br
- forms.businesseducation.com.br
- dashs.businesseducation.com.br

### Domínios Futuros
- auth.businesseducation.com.br (SSO)
- api.businesseducation.com.br (APIs)
- apps.businesseducation.com.br (Portal único)

---

---

## 📚 DOCUMENTOS COMPLEMENTARES

### Análise Detalhada
- **ANALISE_COMPLETA_ESTRUTURA_ATUAL.md** - Análise exaustiva dos sistemas PHP atuais
  - 26 lojas identificadas
  - 2553 arquivos JSON (pedidos + formulários)
  - Estrutura de diretórios completa
  - Problemas críticos identificados
  - Plano de migração detalhado

### Validação Arquitetural
- **ANALISE_CRITICA_ARQUITETURA.md** - Validação crítica da arquitetura proposta
  - ✅ Múltiplas lojas com visuais únicos (template + temas CSS)
  - ✅ Integrações desacopladas via eventos (Redis Pub/Sub)
  - ✅ Staging/Produção isolados (Docker + data/)
  - ✅ SSO funcionando (JWT centralizado)
  - ✅ Performance via PostgreSQL

### Guias Técnicos
- **CONFIGURACAO_VPS.md** - Setup completo do VPS
- **INTERFACE_GRAFICA_VPS.md** - VS Code Remote SSH
- **EXTENSOES_E_INSTRUCOES_CURSOR_AI.md** - Ferramentas de desenvolvimento
- **FLUXO_DE_TRABALHO.md** - Workflow de desenvolvimento

---

**Última atualização:** 04/11/2025  
**Versão:** 2.0 (Pós-análise crítica completa)  
**Mantenedor:** Caique Simiele + Cursor AI

---

**Este documento é vivo. Atualizar sempre que houver mudanças arquiteturais ou progresso significativo.**

