# ANÁLISE COMPLETA - ESTRUTURA ATUAL DOS SISTEMAS

**Data:** 04/11/2025  
**Objetivo:** Análise exaustiva para migração escalável PHP → Node.js  
**Status:** Documento de referência para novo chat

---

## 📊 ÍNDICE

1. [Sistema LOJA - Análise Completa](#loja)
2. [Sistema FORMS - Análise Completa](#forms)
3. [Sistema DASHS - Análise Completa](#dashs)
4. [Arquitetura Proposta Escalável](#arquitetura-proposta)
5. [Plano de Migração Detalhado](#plano-migração)

---

## 🛒 SISTEMA LOJA - ANÁLISE COMPLETA {#loja}

### Visão Geral

**Sistema multi-loja** onde cada escola/instituição tem uma loja personalizada com branding próprio.

**Total de lojas identificadas:** 26+ lojas ativas

**Padrão de ID:** `[hash-8chars]-[sigla]`  
Exemplo: `s4vwcb5f-capec`, `ypsidlev-cait`, `erpkl4if-cabu`

---

### Estrutura de Diretórios (Loja Atual)

```
loja.businesseducation.com.br/
│
├── stores/                          # 🏪 TODAS AS LOJAS (26+)
│   ├── b2c/                         # Loja B2C geral
│   ├── s4vwcb5f-capec/              # Colégio Adventista de Campos
│   ├── ypsidlev-cait/               # Colégio Adventista de Itaboraí
│   ├── erpkl4if-cabu/               # Colégio Adventista do Buritis
│   ├── m7k9x2wq-eac/                # Escola Adventista da Concórdia
│   ├── p4h8n5zt-eacon/              # Escola Adventista de Contagem
│   ├── r9v3j6mn-casf/               # Colégio Adventista de São Francisco
│   ├── v8f4m3dr-camoc/              # Colégio Adventista de Montes Claros
│   ├── xnftrkw3-casg/               # Colégio Adventista de São Gonçalo
│   ├── z976ymnj-cam/                # Colégio Adventista de Macaé
│   ├── t2l7w4yx-eap/                # Escola Adventista da Pampulha
│   ├── q6b9s1kp-cevl/               # Centro Educacional Vila Sol
│   ├── k28tw298-can/                # Colégio Adventista de Niterói
│   ├── seu-colegio/                 # Template ativo
│   ├── new-store/                   # Template novo
│   ├── menu-geral-business/         # Menu de seleção de lojas
│   ├── menu-modelo/                 # Template de menu
│   └── imagens/                     # Imagens compartilhadas (logos, banners)
│       ├── logo-loja.png
│       ├── banner-topo.png
│       ├── Botão CABU.png
│       ├── Botão CAN.png
│       └── ... (152+ imagens)
│
├── orders/                          # 📦 PEDIDOS (JSON - PROBLEMA!)
│   ├── pending/                     # Aguardando pagamento
│   ├── approved/                    # Pagos (1571 arquivos JSON)
│   ├── rejected/                    # Rejeitados
│   ├── billed/                      # Faturados no ERP
│   ├── shipped/                     # Enviados
│   ├── delivered/                   # Entregues
│   ├── shipment/                    # Rastreamento
│   └── indexes/                     # Índices para dashboard
│
├── core/                            # 🧠 LÓGICA CENTRAL
│   ├── StoreResolver.php            # Resolução multi-store (362 linhas)
│   └── SmartStoreIndexer.php        # Indexação de pedidos
│
├── orders/                          # 📋 GESTÃO DE PEDIDOS
│   ├── OrderManager.php             # Gerenciamento completo (2329 linhas!)
│   └── SmartStoreIndexer.php        # Indexação
│
├── payment_getnet/                  # 💳 PAGAMENTO
│   ├── PixHandler.php               # PIX
│   ├── CreditHandler.php            # Cartão
│   └── config/                      # Credenciais
│
├── frete_melhorenvio/               # 📦 FRETE
│   ├── MelhorEnvioService.php
│   └── config/
│
├── ERP_Omie/                        # 🧾 ERP (INTEGRAÇÃO ACOPLADA!)
│   ├── core/
│   │   └── OrderIntegrator.php      # Integração Omie (chamada direta!)
│   └── config/
│       └── integration_mapping.php  # Mapeamento produtos
│
├── webhooks/                        # 🔔 WEBHOOKS
│   ├── WebhookManager.php           # Disparos para Make
│   └── logs/                        # 21694 arquivos JSON!
│
├── cupons/                          # 🎫 CUPONS
│   ├── admin/                       # Gestão de cupons
│   ├── core/
│   └── storage/
│
├── customer-services/               # 👥 CLIENTES
│   ├── CustomerManager.php
│   └── auth/
│
├── logs/                            # 📋 LOGS (MISTURADOS COM CÓDIGO!)
│   ├── order_debug.log
│   └── ...
│
└── api/                             # 🔌 API ATUAL
    └── dashboard-data.php           # Expõe dados para dashboard
```

---

### Estrutura de UMA Loja Individual

**Exemplo:** `stores/s4vwcb5f-capec/`

```
s4vwcb5f-capec/                      # ID único da loja
│
├── config/                          # ⚙️ CONFIGURAÇÕES (ARQUIVO GIGANTE!)
│   ├── store.php                    # 698 linhas de config!
│   └── env.php                      # Credenciais sensíveis
│
├── home/                            # 🏠 PÁGINA INICIAL
│   ├── index.php
│   └── css/
│       └── home.css
│
├── views/                           # 📄 PÁGINAS
│   └── sucesso.php                  # Confirmação de pedido
│
├── pedidos/                         # 📦 ÁREA DO CLIENTE
│   ├── meus-pedidos.php
│   ├── visualizar-pedidos.php
│   ├── escolher-acesso.php
│   └── set-access-type.php
│
├── ajuda/                           # 🆘 SUPORTE
│   ├── index.php
│   ├── processar-ajuda.php
│   ├── ajuda.css
│   └── uploads/                     # Anexos de tickets
│
├── faq/                             # ❓ FAQ
│   ├── index.php
│   └── faq.css
│
├── customers/                       # 👤 CADASTRO/LOGIN
│   ├── register.php
│   ├── acesso.log
│   └── logs/                        # Logs de acesso
│
├── css/                             # 🎨 ESTILOS (12 arquivos CSS)
│   ├── style.css                    # Principal
│   ├── pedidos.css
│   ├── autofill-neutralizer.css
│   ├── field-feedback.css
│   ├── phone-ddi-selector.css
│   ├── custom-dropdown.css
│   ├── clouds-pattern.css
│   ├── rocket-animated.css
│   └── rocket-background.css
│
├── js/                              # 📜 JAVASCRIPT (8 arquivos)
│   ├── script.js                    # Principal
│   ├── payment.js                   # Pagamento
│   ├── frete.js                     # Cálculo de frete
│   ├── coupon.js                    # Validação de cupons
│   ├── field-feedback.js
│   ├── phone-ddi-selector.js
│   ├── custom-dropdown.js
│   └── clouds-manager.js
│
├── imagens/                         # 🖼️ IMAGENS LOCAIS
│   ├── banner-promocional.png
│   └── banner-promocional-mobile.png
│
├── logs/                            # 📋 LOGS LOCAIS
│   └── ajuda_2025-10.log
│
├── Favicon.png                      # 🔖 Favicon
├── index.php                        # 🏪 Página principal da loja
└── docs/                            # 📚 Documentação interna
    └── CORRECAO_ESPACAMENTO_SLIDE4.md
```

---

### Arquivo config/store.php - Análise Detalhada

**Localização:** `stores/[store-id]/config/store.php`  
**Tamanho:** ~698 linhas  
**Função:** TODAS as configurações da loja em um único arquivo PHP

#### Estrutura do Arquivo

```php
<?php
/**
 * Configuração central do sistema
 */

// ID da loja (detectado automaticamente)
$store_id = basename(dirname(__DIR__)); // Ex: 's4vwcb5f-capec'

// Array GIGANTE de configuração
$store_config = [
    
    // ===== IDENTIFICAÇÃO =====
    'store' => [
        'id' => $store_id,
        'maintainer_id' => 'arf',                    // Mantenedora
        'maintainer_name' => 'Associação Rio Fluminense da IASD',
        'profit_margin' => 0.10,                      // 10% de lucro
        'project_year' => '2025',                     // Ano-projeto
        'name' => 'Loja Business Education & CAC',
        'name_store' => 'Colégio Adventista de Campos',
        
        // Alunos elegíveis por série
        'eligible_students' => [
            '1º ano Fundamental' => 68,
            '2º ano Fundamental' => 98,
            '3º ano Fundamental' => 73,
            // ... 12 séries
        ],
    ],
    
    // ===== PAGAMENTO =====
    'payment' => [
        'max_installments' => 12,
        'min_installment_value' => 2.00,
        'webhook_url_orders' => 'https://hook.us1.make.com/...',  // Make
        'redirect_url_success' => '...',
    ],
    
    // ===== FRETE =====
    'freight' => [
        'enabled' => true,
        'melhor_envio' => [
            'enabled' => true,
            'sandbox' => false,
            'price_limit' => [
                'enabled' => true,
                'limit_value' => 18.90,
            ]
        ],
        'product_dimensions' => [
            'weight' => 1.400,  // kg
            'height' => 26.0,
            'width' => 32.0,
            'length' => 9.0,
        ],
    ],
    
    // ===== PRODUTOS ===== (12 produtos, ~400 linhas!)
    'products' => [
        '1º-ano-fundamental' => [
            'id' => '1º-ano-fundamental',
            'name' => 'Coleção SEED - 1º ano EFAI',
            'grade' => '1º ano Fundamental',
            'image_main' => '../imagens/1-ano-fundamental-1.png',
            'gallery_images' => [/* 5 imagens */],
            'prices' => [
                'original' => 691.95,
                'pix' => 416.95,
                'credit_card' => 438.90
            ],
            'shipping' => [/* dimensões */],
            'erp' => [
                'codigo_produto_erp' => '8849742340',  // Código Omie
                'observacoes' => '...',
            ]
        ],
        // ... mais 11 produtos (2º ao 3º médio)
    ],
    
    // ===== ERP OMIE =====
    'erp' => [
        'cenario_fiscal' => '8850880673',
        'categoria_fiscal' => '1.01.01',
        'frete_padrao' => 'retirada_escola',
        'consumidor_final' => true,
    ],
    
    // ===== GETNET =====
    'getnet' => [
        'environment' => 'production',
        'base_url' => 'https://api.getnet.com.br',
    ],
    
    // ===== AJUDA/SUPORTE =====
    'help' => [
        'webhook_url' => 'https://hook.us1.make.com/...',
        'max_file_size' => 10485760,  // 10MB
        'allowed_file_types' => ['jpeg', 'jpg', 'png', 'pdf'],
    ],
    
    // ===== IMAGENS =====
    'images' => [
        'banner_top' => '../imagens/banner-topo.png',
        'banner_school' => '...',
        'logo_primary' => '../imagens/logo-loja.png',
        'institutional_video' => '...',
    ],
    
    // ===== EMPRESA =====
    'company' => [
        'cnpj' => '48.037.991/0001-03',
        'ie' => '123456789',
        'company_name' => 'Business Education Soluções de Ensino LTDA',
        'address' => [/* endereço completo */],
        'contact' => [/* telefone, email */],
    ],
];

return $store_config;
```

---

### Problemas Identificados - LOJA

#### 1. **Arquivo config/store.php Gigante** ❌

- **Problema:** 698 linhas, mistura tudo (produtos, pagamento, frete, ERP, imagens)
- **Impacto:** Difícil manter, erro em um lugar quebra tudo
- **Solução:** Separar em múltiplos arquivos JSON/YAML por domínio

#### 2. **Pedidos em Arquivos JSON Misturados com Código** ❌

- **Problema:** `/orders/approved/` com 1571 arquivos JSON dentro do código fonte
- **Impacto:** Deploy sobrescreve pedidos, Git ignora dados, backup inclui código
- **Solução:** PostgreSQL + separação `data/` de `code/`

#### 3. **26+ Lojas com Estrutura Duplicada** ❌

- **Problema:** Cada loja tem CSS/JS/PHP duplicado (49 arquivos × 26 lojas = 1274 arquivos!)
- **Impacto:** Atualização de bug = editar 26 lojas manualmente
- **Solução:** Template único + configuração por loja

#### 4. **StoreResolver.php - Complexidade Desnecessária** ⚠️

- **Problema:** 362 linhas para resolver path de loja (case-insensitive, fallbacks)
- **Motivo:** Nomes de pastas inconsistentes
- **Solução:** Convenção de nomes + banco de dados de lojas

#### 5. **OrderManager.php - God Class** ❌

- **Problema:** 2329 linhas, faz TUDO (criar, aprovar, rejeitar, integrar, indexar, notificar)
- **Impacto:** Impossível testar, manter ou escalar
- **Solução:** Separar responsabilidades (OrderService, PaymentService, IntegrationService)

#### 6. **Integração Omie Acoplada** ❌

```php
// OrderManager.php linha 842
$this->triggerERPIntegration($orderId);  // ❌ CHAMADA DIRETA

// OrderManager.php linha 1699
private function triggerERPIntegration(string $orderId): void {
    require_once $integratorFile;  // ❌ REQUIRE INLINE
    $integrator = new \OrderIntegrator($config);
    $integrator->sendOrderToOmie($orderId);  // ❌ SÍNCRONO, BLOQUEIA
}
```

**Impacto:** Omie offline = loja não aprova pedidos

#### 7. **21.694 Arquivos de Webhook Logs** ❌

- **Localização:** `/webhooks/logs/`
- **Problema:** Um arquivo JSON por webhook enviado
- **Solução:** Logs em banco de dados + rotação automática

#### 8. **Sem Gestão Centralizada de Lojas** ❌

- **Problema:** Para criar loja nova = duplicar pasta inteira + editar `config/store.php` manualmente
- **Impacto:** Propenso a erros, demorado
- **Solução:** Interface administrativa para gestão de lojas

---

### Como Funciona Hoje - Fluxo de Pedido

```
1. Cliente acessa: loja.businesseducation.com.br/stores/s4vwcb5f-capec/
   ↓
2. index.php carrega config/store.php (698 linhas)
   ↓
3. Cliente seleciona produtos, preenche dados
   ↓
4. JavaScript (payment.js) chama payment_getnet/PixHandler.php
   ↓
5. Getnet processa pagamento
   ↓
6. Callback volta para callbacks/payment.php
   ↓
7. OrderManager::approveOrder() é chamado
   ↓
8. Salva JSON em /orders/approved/PEDIDO-123.json  ❌ (arquivo)
   ↓
9. triggerERPIntegration() chama Omie DIRETAMENTE  ❌ (acoplado)
   ↓
10. dispatchWebhook() envia para Make INLINE  ❌ (bloqueante)
   ↓
11. SmartStoreIndexer indexa pedido para dashboard
   ↓
12. Responde sucesso para cliente
```

**Tempo total:** 3-5 segundos (se tudo funcionar)  
**Se Omie offline:** FALHA TOTAL ❌

---

## 📝 SISTEMA FORMS - ANÁLISE COMPLETA {#forms}

### Visão Geral

**Sistema de formulários e pesquisas** para coletar feedback de pais, professores e alunos.

**Tipos de formulários:**
- Pesquisas com pais (satisfação)
- Pesquisas com professores (avaliação programa)
- Onboarding (cadastro inicial)
- Pitch Deal/Seed (formulários específicos)

---

### Estrutura de Diretórios (Forms Atual)

```
forms.businesseducation.com.br/
│
├── data/                            # 📊 DADOS (391+ JSONs)
│   ├── responses/                   # Respostas por mantenedora
│   │   ├── arf/                     # Associação Rio Fluminense
│   │   │   ├── pais/                # 375 arquivos JSON
│   │   │   ├── professores/         # 16 arquivos JSON
│   │   │   └── estudantes/
│   │   ├── amc/                     # Outra mantenedora
│   │   ├── ap/
│   │   ├── cevs/
│   │   ├── mmn/
│   │   └── business.education/
│   │
│   ├── indexes/                     # Índices para dashboard
│   │   ├── arf_2025_responses.json
│   │   ├── amc_2025_responses.json
│   │   └── ... (um por mantenedora + ano)
│   │
│   └── onboarding/                  # Dados específicos de onboarding
│
├── core/                            # 🧠 LÓGICA CENTRAL
│   ├── ResponseManager.php          # Gestão de respostas
│   └── SmartFormsIndexer.php        # Indexação (852 linhas)
│
├── api/                             # 🔌 API
│   ├── data-export.php              # Exportação para dashboard
│   ├── dashboard-data.php           # Dados consolidados
│   └── mantenedoras-list.php        # Lista de mantenedoras
│
├── experiencia/                     # 📋 FORMULÁRIOS POR MANTENEDORA
│   └── mantenedoras/
│       ├── amc/
│       │   ├── pais/
│       │   │   └── index.php        # Formulário pais AMC
│       │   └── professores/
│       │       └── index.php        # Formulário professores AMC
│       ├── arf/
│       │   ├── pais/
│       │   └── professores/
│       └── ... (uma pasta por mantenedora)
│
├── onboarding/                      # 🎯 ONBOARDING
│   ├── index.php
│   ├── processar-onboarding.php
│   ├── onboarding.js
│   ├── onboarding.css
│   └── logs/
│
├── pitch_deal/                      # 💼 PITCH DEAL
│   ├── index.php
│   └── processar-pitch-deal.php
│
├── pitch_seed/                      # 🌱 PITCH SEED
│   ├── index.php
│   └── processar-pitch-seed.php
│
├── scripts/                         # 🔄 AUTOMAÇÃO
│   ├── cron_forms_indexes.php       # Cron de indexação
│   ├── sync_forms_indexes.php
│   └── add_project_year_to_responses.php  # Migração dados
│
├── logs/                            # 📋 LOGS
│   ├── forms_indexer.log
│   ├── responses.log
│   └── sync_cron.log
│
├── imagens/                         # 🖼️ IMAGENS (69 arquivos)
└── custom_form.html                 # Template de formulário
```

---

### SmartFormsIndexer.php - Análise

**Tamanho:** 852 linhas  
**Função:** Indexar respostas de formulários para o dashboard

#### Características

```php
class SmartFormsIndexer {
    // Separação por ANO-PROJETO (novo em 2025)
    $indexFile = $maintainerId . '_' . $projectYear . '_responses.json';
    // Ex: arf_2025_responses.json, arf_2026_responses.json
    
    // Indexação inteligente
    - Detecta responses novos
    - Remove responses deletados
    - Atualiza responses modificados
    - Calcula estatísticas consolidadas
    
    // Estrutura do índice
    [
        'maintainer_id' => 'arf',
        'project_year' => '2025',
        'total_responses' => 375,
        'responses' => [
            'survey-123' => [
                'survey_id' => 'survey-123',
                'survey_type' => 'pais',
                'timestamp' => '...',
                'escola' => '...',
                'file_path' => '/data/responses/arf/pais/...'
            ],
            // ... mais responses
        ],
        'stats' => [
            'by_school' => [...],
            'by_type' => [...],
        ]
    ]
}
```

---

### Estrutura de Response JSON

**Localização:** `data/responses/[maintainer]/[tipo]/[survey-id].json`

**Exemplo:** `data/responses/arf/pais/arf-pais-20250826155851.json`

```json
{
  "survey_id": "arf-pais-20250826155851",
  "survey_type": "pais",
  "timestamp": "2025-08-26T15:58:51Z",
  "maintainer_id": "arf",
  "project_year": "2025",
  "escola": "CAC",
  "escola_name": "Colégio Adventista de Campos",
  "segmento": "fundamental",
  "nome_completo": "Maria Silva",
  "email": "maria@example.com",
  "responses": {
    "q1": "Muito satisfeito",
    "q2": "9",
    "q3": "Excelente programa",
    // ... mais respostas
  }
}
```

---

### Problemas Identificados - FORMS

#### 1. **Respostas em JSON Misturadas com Código** ❌

- **Problema:** 391 arquivos JSON em `/data/responses/` dentro do código
- **Impacto:** Mesmo problema da loja (deploy, backup, Git)
- **Solução:** PostgreSQL com schema `form_responses`

#### 2. **Formulários Duplicados por Mantenedora** ⚠️

- **Problema:** `/experiencia/mantenedoras/amc/pais/`, `/experiencia/mantenedoras/arf/pais/`, etc
- **Impacto:** Atualizar pergunta = editar 7+ arquivos
- **Solução:** Formulário dinâmico baseado em config JSON

#### 3. **Indexação Pode Ficar Desatualizada** ⚠️

- **Problema:** `SmartFormsIndexer` roda via CRON, pode ter delay
- **Impacto:** Dashboard mostra dados antigos
- **Solução:** Atualização em tempo real via eventos

#### 4. **Sem Validação de Schema** ❌

- **Problema:** Cada response pode ter campos diferentes
- **Impacto:** Difícil consolidar dados, queries inconsistentes
- **Solução:** JSON Schema validation + PostgreSQL JSONB

---

## 📊 SISTEMA DASHS - ANÁLISE COMPLETA {#dashs}

### Visão Geral

**Dashboard federado** que agrega dados de `loja` + `forms` para mostrar métricas consolidadas.

**Dashboards:**
- Vendas por escola
- Pesquisas (pais e professores)
- Métricas consolidadas por mantenedora

---

### Estrutura de Diretórios (Dashs Atual)

```
dashs.businesseducation.com.br/
│
├── core/                            # 🧠 LÓGICA CENTRAL
│   ├── FederatedDataAggregator.php  # Agregação multi-fonte (356 linhas)
│   ├── JsonIndexer.php              # Indexação
│   └── CacheManager.php             # Cache
│
├── dashboard/                       # 📊 DASHBOARDS
│   ├── index.php                    # Dashboard principal
│   ├── federado.php                 # Visão federada
│   ├── sistema-federado.php
│   │
│   ├── loja/                        # Dashboard vendas
│   │   ├── index.php
│   │   ├── loja.css
│   │   └── loja.js
│   │
│   ├── experiencia/                 # Dashboard pesquisas
│   │   ├── pais/
│   │   │   └── index.php
│   │   └── professores/
│   │       └── index.php
│   │
│   ├── home/                        # Home
│   │   └── index.php
│   │
│   └── cache/                       # Cache de dados (9 JSONs)
│
├── auth/                            # 🔐 AUTENTICAÇÃO
│   ├── auth-functions.php           # Funções de auth
│   ├── login.php
│   ├── dashboard-redirect.php
│   └── utils/
│
├── database/                        # 🗄️ BANCO (MySQL)
│   └── connection.php               # Apenas para users!
│
├── api/                             # 🔌 API
│   ├── dashboard-data.php
│   ├── test-maintainer-sync.php
│   └── unified-maintainers.php
│
├── classes/                         # 📦 CLASSES
│   ├── EmailService.php
│   └── UserManager.php
│
├── config/                          # ⚙️ CONFIG
│   ├── env.php                      # Credenciais
│   └── setup-database.php
│
├── scripts/                         # 🔄 SCRIPTS
│   ├── auto_sync_maintainers.php
│   └── cron_sync_maintainers.php
│
├── cache/                           # 💾 CACHE
├── logs/                            # 📋 LOGS
└── imagens/                         # 🖼️ IMAGENS (54 arquivos)
```

---

### FederatedDataAggregator.php - Análise

**Tamanho:** 356 linhas  
**Função:** Buscar dados de loja + forms via HTTP e agregar

#### Como Funciona

```php
class FederatedDataAggregator {
    // APIs dos subdomínios
    $forms_api_base = 'https://forms.businesseducation.com.br/api';
    $loja_api_base = 'https://loja.businesseducation.com.br/api';
    
    // Agrega dados
    public function agregarDadosCompletos($filters) {
        // 1. Busca dados de FORMS via HTTP
        $forms_data = $this->buscarDadosForms($filters);
        // GET https://forms.../api/data-export.php?maintainer_id=arf
        
        // 2. Busca dados de LOJA via HTTP
        $loja_data = $this->buscarDadosLoja($filters);
        // GET https://loja.../api/dashboard-data.php?maintainer_id=arf
        
        // 3. Consolida tudo
        return [
            'forms' => $forms_data,
            'loja' => $loja_data,
            'resumo_federado' => [
                'total_respostas' => ...,
                'total_pedidos' => ...,
                'valor_total_vendas' => ...,
            ]
        ];
    }
}
```

---

### Comunicação Atual (Problema!)

```
┌─────────────────────────────────────┐
│  DASHS                              │
│  FederatedDataAggregator            │
└─────────────────────────────────────┘
           ↓ HTTP GET
           ↓
┌─────────────────────────────────────┐
│  FORMS                              │
│  /api/data-export.php               │
│    ↓                                │
│  SmartFormsIndexer                  │
│    ↓                                │
│  Lê 391 arquivos JSON               │ ❌ LENTO!
│  Agrega na hora                     │
└─────────────────────────────────────┘

           ↓ HTTP GET
           ↓
┌─────────────────────────────────────┐
│  LOJA                               │
│  /api/dashboard-data.php            │
│    ↓                                │
│  SmartStoreIndexer                  │
│    ↓                                │
│  Lê 1571 arquivos JSON              │ ❌ MUITO LENTO!
│  Agrega na hora                     │
└─────────────────────────────────────┘
```

**Tempo de resposta:** 2-5 segundos!  
**Cache:** 5 minutos (dados podem estar desatualizados)

---

### Problemas Identificados - DASHS

#### 1. **Busca HTTP + Leitura de Milhares de JSONs** ❌

- **Problema:** Cada dashboard faz HTTP → API lê todos JSONs → Agrega
- **Impacto:** Dashboard MUITO lento (2-5s por load)
- **Solução:** PostgreSQL + queries otimizadas (< 50ms)

#### 2. **Cache com TTL Fixo** ⚠️

- **Problema:** Cache de 5 minutos pode mostrar dados antigos
- **Impacto:** Métricas desatualizadas
- **Solução:** Invalidação de cache via eventos

#### 3. **Sem Banco de Dados para Dados de Negócio** ❌

- **Problema:** MySQL só para users, dados de pedidos/forms em JSON
- **Impacto:** Impossível fazer queries complexas (filtros, joins, aggregates)
- **Solução:** PostgreSQL para TUDO

#### 4. **Acoplamento Alto entre Sistemas** ❌

- **Problema:** Dashs depende de URLs específicas de loja/forms
- **Impacto:** Mudança em loja/forms pode quebrar dashboard
- **Solução:** API Gateway + contratos bem definidos

---

## 🏗️ ARQUITETURA PROPOSTA ESCALÁVEL {#arquitetura-proposta}

### Princípios de Design

1. **Separação de Código e Dados**
2. **Template Único + Configuração**
3. **Event-Driven** (desacoplamento)
4. **API-First** (contratos claros)
5. **Database-Centric** (não mais JSONs)
6. **Interface de Gestão** (não mais edição manual)

---

### Estrutura de Diretórios Proposta

```
sistemas-businesseducation/
│
├── services/                              # 🚀 CÓDIGO (Node.js + TypeScript)
│   │
│   ├── auth-service/                      # 🔐 AUTENTICAÇÃO SSO
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.ts                # POST /api/auth/login
│   │   │   ├── controllers/
│   │   │   │   └── auth-controller.ts
│   │   │   ├── middleware/
│   │   │   │   └── validate-token.ts
│   │   │   ├── models/
│   │   │   │   └── user.ts
│   │   │   └── config/
│   │   │       └── database.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── loja-service/                      # 🛒 E-COMMERCE
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── routes/
│   │   │   │   ├── orders.ts              # CRUD pedidos
│   │   │   │   ├── stores.ts              # Info lojas
│   │   │   │   ├── products.ts            # Produtos
│   │   │   │   └── coupons.ts             # Cupons
│   │   │   ├── controllers/
│   │   │   │   ├── order-controller.ts
│   │   │   │   └── store-controller.ts
│   │   │   ├── models/
│   │   │   │   ├── order.ts
│   │   │   │   ├── store.ts
│   │   │   │   └── product.ts
│   │   │   ├── events/                    # 📡 EVENT PUBLISHERS
│   │   │   │   ├── order-events.ts        # publishOrderApproved()
│   │   │   │   └── payment-events.ts
│   │   │   └── services/
│   │   │       ├── order-service.ts
│   │   │       ├── payment-service.ts
│   │   │       └── freight-service.ts
│   │   └── ...
│   │
│   ├── integration-service/               # 🔌 INTEGRAÇÕES
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── subscribers/               # 📡 EVENT SUBSCRIBERS
│   │   │   │   ├── omie-subscriber.ts     # Escuta OrderApproved
│   │   │   │   ├── webhook-subscriber.ts  # Envia para Make
│   │   │   │   └── email-subscriber.ts    # Confirmações
│   │   │   └── clients/
│   │   │       ├── omie-client.ts
│   │   │       ├── getnet-client.ts
│   │   │       └── melhorenvio-client.ts
│   │   └── ...
│   │
│   ├── forms-service/                     # 📝 FORMULÁRIOS
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── forms.ts               # CRUD forms
│   │   │   │   └── responses.ts           # Respostas
│   │   │   ├── models/
│   │   │   │   ├── form.ts
│   │   │   │   └── response.ts
│   │   │   └── services/
│   │   │       └── form-service.ts
│   │   └── ...
│   │
│   ├── dashs-service/                     # 📊 DASHBOARDS
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── analytics.ts           # Queries otimizadas
│   │   │   │   └── reports.ts
│   │   │   ├── services/
│   │   │   │   ├── analytics-service.ts
│   │   │   │   └── cache-service.ts
│   │   │   └── queries/                   # SQL otimizados
│   │   │       ├── vendas.sql
│   │   │       └── pesquisas.sql
│   │   └── ...
│   │
│   └── admin-service/                     # ⚙️ ADMINISTRAÇÃO
│       ├── src/
│       │   ├── routes/
│       │   │   ├── stores.ts              # CRUD lojas
│       │   │   ├── products.ts            # CRUD produtos
│       │   │   ├── users.ts               # CRUD usuários
│       │   │   └── coupons.ts             # CRUD cupons
│       │   └── controllers/
│       │       └── store-admin-controller.ts
│       └── ...
│
├── public/                                # 🎨 FRONTEND (Template Único)
│   │
│   ├── shared/                            # Compartilhado entre todos
│   │   ├── css/
│   │   │   ├── core.css                   # Estilos base
│   │   │   ├── components.css             # Componentes reutilizáveis
│   │   │   ├── theme-variables.css        # Variáveis CSS
│   │   │   └── responsive.css
│   │   ├── js/
│   │   │   ├── api-client.js              # Cliente API centralizado
│   │   │   ├── auth.js                    # Autenticação
│   │   │   ├── utils.js                   # Utilitários
│   │   │   └── components/
│   │   │       ├── cart.js
│   │   │       ├── payment.js
│   │   │       └── freight.js
│   │   └── images/
│   │       └── logo-business.png
│   │
│   ├── loja/                              # Template loja
│   │   ├── index.html                     # Template base
│   │   ├── checkout.html
│   │   ├── sucesso.html
│   │   ├── pedidos.html
│   │   └── css/
│   │       └── loja-theme.css             # Overrides por loja
│   │
│   ├── forms/                             # Template forms
│   │   ├── index.html
│   │   └── css/
│   │       └── forms-theme.css
│   │
│   └── dashs/                             # Template dashboard
│       ├── index.html
│       ├── vendas.html
│       ├── pesquisas.html
│       └── css/
│           └── dashs-theme.css
│
├── data/                                  # 📊 DADOS (NUNCA no Git!)
│   │
│   ├── staging/                           # Ambiente de teste
│   │   ├── postgres/                      # Database staging
│   │   ├── redis/                         # Cache staging
│   │   ├── uploads/                       # Arquivos enviados
│   │   │   ├── store-logos/
│   │   │   ├── product-images/
│   │   │   └── support-attachments/
│   │   └── logs/
│   │       ├── application.log
│   │       ├── error.log
│   │       └── integration.log
│   │
│   └── production/                        # Ambiente real
│       ├── postgres/                      # Database produção
│       ├── redis/
│       ├── uploads/
│       └── logs/
│
├── config/                                # ⚙️ CONFIGURAÇÕES (JSON/YAML)
│   │
│   ├── stores/                            # Config por loja (JSON)
│   │   ├── s4vwcb5f-capec.json           # CAC
│   │   ├── ypsidlev-cait.json            # CAIT
│   │   └── template.json                  # Template padrão
│   │
│   ├── products/                          # Catálogo de produtos (JSON)
│   │   ├── seed-1ano.json
│   │   ├── life-2ano.json
│   │   └── ...
│   │
│   ├── maintainers/                       # Mantenedoras (JSON)
│   │   ├── arf.json
│   │   ├── amc.json
│   │   └── ...
│   │
│   └── integrations/                      # Integrações (YAML)
│       ├── omie.yaml
│       ├── getnet.yaml
│       └── melhorenvio.yaml
│
├── infrastructure/                        # 🛠️ INFRAESTRUTURA
│   │
│   ├── docker/
│   │   ├── docker-compose.staging.yml
│   │   ├── docker-compose.production.yml
│   │   └── nginx/
│   │       ├── nginx.conf
│   │       └── ssl/
│   │
│   ├── migrations/                        # Migrations PostgreSQL
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_stores.sql
│   │   ├── 003_create_products.sql
│   │   ├── 004_create_orders.sql
│   │   ├── 005_create_form_responses.sql
│   │   └── 006_create_integration_logs.sql
│   │
│   └── scripts/
│       ├── backup.sh                      # Backup automatizado
│       └── restore.sh                     # Restore
│
├── docs/                                  # 📚 DOCUMENTAÇÃO
│   ├── PROJETO_MASTER.md
│   ├── ANALISE_COMPLETA_ESTRUTURA_ATUAL.md  # 👈 ESTE ARQUIVO
│   ├── FLUXO_DE_TRABALHO.md
│   └── API.md
│
├── .gitignore                             # Ignora data/
├── .env.example                           # Template de env vars
├── README.md
└── package.json
```

---

### Comparação: Atual vs Proposto

| Aspecto | Atual (PHP) | Proposto (Node.js) |
|---------|-------------|---------------------|
| **Lojas** | 26 pastas duplicadas (1274 arquivos) | 1 template + 26 configs JSON |
| **Config loja** | store.php (698 linhas) | store.json (~150 linhas) |
| **Pedidos** | 1571 JSONs misturados | PostgreSQL + `orders` table |
| **Forms** | 391 JSONs misturados | PostgreSQL + `form_responses` table |
| **Dashboard** | HTTP + lê JSONs (2-5s) | PostgreSQL queries (< 50ms) |
| **Integrações** | Acopladas, síncronas | Event-driven, assíncronas |
| **Gestão lojas** | Edição manual de arquivos | Interface administrativa |
| **Deploy** | Sobrescreve dados | Separação code/data |
| **Backup** | Código + dados misturados | Dados separados, rotação |
| **Testes** | Impossível | Unit + integration tests |

---

## 📋 PLANO DE MIGRAÇÃO DETALHADO {#plano-migração}

### Fase 1: Fundação (Semanas 1-2)

#### 1.1 Estrutura Base

```bash
sistemas-businesseducation/
├── services/
│   └── auth-service/           # Criar primeiro
├── config/
│   └── stores/                 # Migrar configs
├── infrastructure/
│   └── migrations/             # Schemas PostgreSQL
└── public/
    └── shared/                 # CSS/JS compartilhado
```

#### 1.2 Migrations PostgreSQL

**001_create_stores.sql**
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id VARCHAR(100) UNIQUE NOT NULL,       -- 's4vwcb5f-capec'
    maintainer_id VARCHAR(50) NOT NULL,           -- 'arf'
    maintainer_name VARCHAR(255),
    store_name VARCHAR(255),
    profit_margin DECIMAL(5,4) DEFAULT 0.10,
    project_year VARCHAR(4) DEFAULT '2025',
    active BOOLEAN DEFAULT TRUE,
    config JSONB,                                 -- Resto da config
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stores_maintainer ON stores(maintainer_id);
CREATE INDEX idx_stores_active ON stores(active);
```

**002_create_products.sql**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) UNIQUE NOT NULL,     -- '1º-ano-fundamental'
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(50),
    prices JSONB NOT NULL,                        -- {original, pix, credit_card}
    shipping JSONB,                               -- {weight, dimensions}
    erp_config JSONB,                             -- {codigo_produto_erp}
    gallery_images JSONB,                         -- Array de URLs
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**003_create_orders.sql**
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) UNIQUE NOT NULL,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(store_id),
    maintainer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_document VARCHAR(20),
    status VARCHAR(50) NOT NULL,                  -- pending, approved, etc
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_id VARCHAR(100),
    project_year VARCHAR(4),
    order_details JSONB,                          -- Dados completos
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    
    INDEX idx_orders_store (store_id),
    INDEX idx_orders_maintainer (maintainer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_year (project_year),
    INDEX idx_orders_created (created_at)
);
```

**004_create_form_responses.sql**
```sql
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id VARCHAR(100) UNIQUE NOT NULL,
    maintainer_id VARCHAR(50) NOT NULL,
    survey_type VARCHAR(50),                      -- 'pais', 'professores'
    project_year VARCHAR(4),
    escola VARCHAR(100),
    response_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_responses_maintainer (maintainer_id),
    INDEX idx_responses_type (survey_type),
    INDEX idx_responses_year (project_year)
);
```

#### 1.3 Migrar Configs para JSON

**De:**
```php
// stores/s4vwcb5f-capec/config/store.php (698 linhas)
$store_config = [
    'store' => ['id' => 's4vwcb5f-capec', ...],
    'payment' => [...],
    'freight' => [...],
    'products' => [...],  // 400+ linhas
    // ...
];
```

**Para:**
```json
// config/stores/s4vwcb5f-capec.json (150 linhas)
{
  "store_id": "s4vwcb5f-capec",
  "maintainer_id": "arf",
  "store_name": "Colégio Adventista de Campos",
  "profit_margin": 0.10,
  "project_year": "2025",
  "eligible_students": {
    "1º ano Fundamental": 68,
    "2º ano Fundamental": 98
  },
  "theme": {
    "primary_color": "#003366",
    "logo_url": "/uploads/store-logos/cac-logo.png",
    "banner_url": "/uploads/banners/cac-banner.png"
  },
  "payment": {
    "max_installments": 12,
    "webhook_url": "https://hook.us1.make.com/..."
  },
  "freight": {
    "melhor_envio_enabled": true,
    "price_limit": 18.90
  }
}
```

**E separar produtos:**
```json
// config/products/seed-1ano.json
{
  "product_id": "1º-ano-fundamental",
  "name": "Coleção SEED - 1º ano EFAI",
  "grade": "1º ano Fundamental",
  "prices": {
    "original": 691.95,
    "pix": 416.95,
    "credit_card": 438.90
  },
  "shipping": {
    "weight": 1.4,
    "dimensions": {"length": 29, "width": 34, "height": 10}
  },
  "erp": {
    "codigo_produto_erp": "8849742340"
  },
  "gallery_images": [
    "/uploads/products/1-ano-1.png",
    "/uploads/products/1-ano-2.png"
  ]
}
```

---

### Fase 2: Event Bus (Semanas 3-4)

#### 2.1 Implementar Publishers

```typescript
// services/loja-service/src/events/order-events.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT)
});

export async function publishOrderApproved(orderData: Order) {
  const event = {
    event_type: 'OrderApproved',
    order_id: orderData.order_id,
    store_id: orderData.store_id,
    maintainer_id: orderData.maintainer_id,
    total: orderData.total,
    customer: orderData.customer,
    items: orderData.items,
    timestamp: new Date().toISOString()
  };
  
  await redis.publish('OrderApproved', JSON.stringify(event));
  console.log(`✅ Evento publicado: OrderApproved - ${orderData.order_id}`);
}
```

#### 2.2 Implementar Subscribers

```typescript
// services/integration-service/src/subscribers/omie-subscriber.ts
import Redis from 'ioredis';
import OmieClient from '../clients/omie-client';

const redis = new Redis();
const omie = new OmieClient();

redis.subscribe('OrderApproved');

redis.on('message', async (channel, message) => {
  if (channel === 'OrderApproved') {
    const event = JSON.parse(message);
    
    console.log(`📨 Recebido: ${event.event_type} - ${event.order_id}`);
    
    try {
      // Criar NF no Omie
      const nf = await omie.createInvoice({
        clienteId: event.customer.document_number,
        produtos: event.items.map(item => ({
          codigo: item.erp_code,
          quantidade: item.quantity,
          valor: item.unit_price
        })),
        valorTotal: event.total
      });
      
      console.log(`✅ NF criada: ${nf.numero} - Pedido ${event.order_id}`);
      
      // Registrar sucesso
      await db.integration_logs.create({
        event_type: 'OrderApproved',
        order_id: event.order_id,
        integration_name: 'omie',
        status: 'success',
        response_data: nf
      });
      
    } catch (error) {
      console.error(`❌ Erro Omie: ${error.message}`);
      
      // Registrar falha
      await db.integration_logs.create({
        event_type: 'OrderApproved',
        order_id: event.order_id,
        integration_name: 'omie',
        status: 'failed',
        error_message: error.message
      });
      
      // Retry automático
      await retryQueue.add(event, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60000 }
      });
    }
  }
});
```

---

### Fase 3: Migração de Dados (Semanas 5-6)

#### 3.1 Script de Migração - Lojas

```typescript
// scripts/migrate-stores.ts
import fs from 'fs';
import path from 'path';
import { db } from '../services/loja-service/src/config/database';

async function migrateStores() {
  const storesDir = path.join(__dirname, '../loja.businesseducation.com.br/stores');
  const storeFolders = fs.readdirSync(storesDir);
  
  for (const storeFolder of storeFolders) {
    const configFile = path.join(storesDir, storeFolder, 'config/store.php');
    
    if (!fs.existsSync(configFile)) continue;
    
    console.log(`Migrando loja: ${storeFolder}...`);
    
    // Ler config PHP (precisa parser ou executar PHP)
    const storeConfig = await parsePHPConfig(configFile);
    
    // Inserir no PostgreSQL
    await db.stores.create({
      store_id: storeConfig.store.id,
      maintainer_id: storeConfig.store.maintainer_id,
      maintainer_name: storeConfig.store.maintainer_name,
      store_name: storeConfig.store.name_store,
      profit_margin: storeConfig.store.profit_margin,
      project_year: storeConfig.store.project_year,
      active: true,
      config: {
        eligible_students: storeConfig.store.eligible_students,
        payment: storeConfig.payment,
        freight: storeConfig.freight,
        images: storeConfig.images,
        help: storeConfig.help
      }
    });
    
    console.log(`✅ Loja ${storeFolder} migrada`);
  }
}

migrateStores();
```

#### 3.2 Script de Migração - Pedidos

```typescript
// scripts/migrate-orders.ts
import fs from 'fs';
import path from 'path';
import { db } from '../services/loja-service/src/config/database';

async function migrateOrders() {
  const ordersDir = path.join(__dirname, '../loja.businesseducation.com.br/orders/approved');
  const orderFiles = fs.readdirSync(ordersDir).filter(f => f.endsWith('.json'));
  
  console.log(`Encontrados ${orderFiles.length} pedidos para migrar`);
  
  let migrated = 0;
  let errors = 0;
  
  for (const file of orderFiles) {
    try {
      const orderData = JSON.parse(fs.readFileSync(path.join(ordersDir, file), 'utf8'));
      
      // Verificar se já existe
      const exists = await db.orders.findOne({
        where: { order_id: orderData.order_id }
      });
      
      if (exists) {
        console.log(`⏭️  Pulando ${orderData.order_id} (já existe)`);
        continue;
      }
      
      // Inserir no PostgreSQL
      await db.orders.create({
        order_id: orderData.order_id,
        store_id: orderData.store_id,
        maintainer_id: orderData.maintainer_id || extractMaintainerFromStore(orderData.store_id),
        customer_name: orderData.order_details?.customer?.name,
        customer_email: orderData.order_details?.customer?.email,
        customer_document: orderData.order_details?.customer?.document_number,
        status: orderData.status,
        total: parseFloat(orderData.valor_discriminado?.valor_total_pedido || 0),
        payment_method: orderData.payment_details?.payment_method,
        payment_id: orderData.payment_id,
        project_year: orderData.project_year || '2025',
        order_details: orderData,  // JSON completo
        created_at: new Date(orderData.created_at),
        approved_at: orderData.approved_at ? new Date(orderData.approved_at) : null
      });
      
      migrated++;
      console.log(`✅ ${migrated}/${orderFiles.length} - ${orderData.order_id}`);
      
    } catch (error) {
      errors++;
      console.error(`❌ Erro em ${file}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Migração concluída:`);
  console.log(`   Migrados: ${migrated}`);
  console.log(`   Erros: ${errors}`);
}

migrateOrders();
```

---

### Fase 4: Interface de Gestão (Semanas 7-8)

#### 4.1 Admin Service - CRUD Lojas

```typescript
// services/admin-service/src/routes/stores.ts
import express from 'express';
import { validateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Listar todas as lojas
router.get('/api/admin/stores', validateToken, requireRole('admin'), async (req, res) => {
  const stores = await db.stores.findAll({
    order: [['store_name', 'ASC']]
  });
  res.json(stores);
});

// Criar nova loja
router.post('/api/admin/stores', validateToken, requireRole('admin'), async (req, res) => {
  const { store_id, maintainer_id, store_name, config } = req.body;
  
  // Validar
  if (!store_id || !maintainer_id || !store_name) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
  
  // Criar loja
  const store = await db.stores.create({
    store_id,
    maintainer_id,
    store_name,
    config,
    active: true,
    project_year: new Date().getFullYear().toString()
  });
  
  // Criar diretório de uploads
  await fs.mkdir(`data/production/uploads/store-logos/${store_id}`, { recursive: true });
  await fs.mkdir(`data/production/uploads/store-banners/${store_id}`, { recursive: true });
  
  res.json({ success: true, store });
});

// Atualizar loja
router.put('/api/admin/stores/:storeId', validateToken, requireRole('admin'), async (req, res) => {
  const { storeId } = req.params;
  const updates = req.body;
  
  await db.stores.update(updates, {
    where: { store_id: storeId }
  });
  
  res.json({ success: true });
});

// Desativar loja
router.delete('/api/admin/stores/:storeId', validateToken, requireRole('admin'), async (req, res) => {
  const { storeId } = req.params;
  
  await db.stores.update({ active: false }, {
    where: { store_id: storeId }
  });
  
  res.json({ success: true });
});

export default router;
```

---

## 🎯 RESUMO EXECUTIVO

### Sistemas Analisados

1. ✅ **LOJA:** 26+ lojas, multi-store, config gigantes, pedidos em JSON
2. ✅ **FORMS:** Formulários por mantenedora, respostas em JSON, indexação complexa
3. ✅ **DASHS:** Agregação federada via HTTP, lê milhares de JSONs, lento

### Problemas Críticos

1. ❌ **Dados misturados com código** (2553 JSONs)
2. ❌ **Lojas duplicadas** (26 × 49 arquivos = 1274 arquivos)
3. ❌ **Config monolítico** (698 linhas por loja)
4. ❌ **Integrações acopladas** (OrderManager 2329 linhas)
5. ❌ **Dashboard lento** (2-5 segundos)
6. ❌ **Sem interface de gestão** (edição manual)

### Solução Proposta

1. ✅ **PostgreSQL:** Dados estruturados, queries rápidas
2. ✅ **Template único:** 1 código × 26 configs JSON
3. ✅ **Event-driven:** Integrações desacopladas, assíncronas
4. ✅ **Config modular:** JSON pequenos, separados por domínio
5. ✅ **Interface admin:** CRUD lojas, produtos, usuários
6. ✅ **Separação code/data:** Deploy seguro

---

## 📞 PRÓXIMAS AÇÕES

Este documento serve como **REFERÊNCIA COMPLETA** para:

1. Abrir novo chat com contexto completo
2. Tomar decisões arquiteturais informadas
3. Planejar migração gradual
4. Entender complexidade real do sistema atual

**Total de páginas analisadas:** 3 sistemas (loja, forms, dashs)  
**Total de arquivos analisados:** 2500+ arquivos  
**Total de linhas de código analisadas:** ~50.000 linhas

---

**FIM DA ANÁLISE COMPLETA** ✅

