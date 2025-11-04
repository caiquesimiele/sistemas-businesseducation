# COMPARAÇÃO PROFUNDA: CABU vs CAPEC

**Data:** 04/11/2025  
**Objetivo:** Entender O QUE muda entre lojas para estruturar configs JSON

---

## 📊 VISÃO GERAL

| Aspecto | CABU (Buritis) | CAPEC (Campos) |
|---------|----------------|----------------|
| **Store ID** | `erpkl4if-cabu` | `s4vwcb5f-capec` |
| **Escola** | Colégio Adventista do Buritis | Colégio Adventista de Campos |
| **Mantenedora** | AMC (Mineira Central) | ARF (Rio Fluminense) |
| **Margem de lucro** | **20%** (0.20) | **10%** (0.10) |
| **Total alunos** | **350 alunos** (10 séries) | **815 alunos** (12 séries) |

---

## 🔍 DIFERENÇAS DETALHADAS

### 1. IDENTIFICAÇÃO DA LOJA

#### CABU (linha 38-48)
```php
$name_store = 'Colégio Adventista do Buritis';

'store' => [
    'id' => 'erpkl4if-cabu',
    'maintainer_id' => 'amc',                    // ← DIFERENTE
    'maintainer_name' => 'Associação Mineira Central da IASD',  // ← DIFERENTE
    'profit_margin' => 0.20,                     // ← 20% DIFERENTE!
    'project_year' => '2025',
]
```

#### CAPEC (linha 38-48)
```php
$name_store = 'Colégio Adventista de Campos';

'store' => [
    'id' => 's4vwcb5f-capec',
    'maintainer_id' => 'arf',                    // ← DIFERENTE
    'maintainer_name' => 'Associação Rio Fluminense da IASD',  // ← DIFERENTE
    'profit_margin' => 0.10,                     // ← 10% DIFERENTE!
    'project_year' => '2025',
]
```

---

### 2. ALUNOS ELEGÍVEIS (CRÍTICO!)

#### CABU - 350 alunos em 10 séries (linha 50-61)
```php
'eligible_students' => [
    // ❌ NÃO TEM 1º e 2º ano Fundamental
    '3º ano Fundamental' => 36,    // ← Começa aqui
    '4º ano Fundamental' => 48,
    '5º ano Fundamental' => 40,
    '6º ano Fundamental' => 40,
    '7º ano Fundamental' => 44,
    '8º ano Fundamental' => 24,
    '9º ano Fundamental' => 33,
    '1º ano Médio' => 28,
    '2º ano Médio' => 25,
    '3º ano Médio' => 32
],
// Total: 350 alunos
```

#### CAPEC - 815 alunos em 12 séries (linha 50-63)
```php
'eligible_students' => [
    '1º ano Fundamental' => 68,    // ← Tem desde o 1º
    '2º ano Fundamental' => 98,    // ← Tem desde o 1º
    '3º ano Fundamental' => 73,
    '4º ano Fundamental' => 80,
    '5º ano Fundamental' => 104,
    '6º ano Fundamental' => 84,
    '7º ano Fundamental' => 78,
    '8º ano Fundamental' => 66,
    '9º ano Fundamental' => 64,
    '1º ano Médio' => 54,
    '2º ano Médio' => 23,
    '3º ano Médio' => 23
],
// Total: 815 alunos
```

**📌 INSIGHT CRÍTICO:**
- Cada loja atende séries DIFERENTES
- CABU não vende para 1º e 2º ano (não tem alunos)
- CAPEC vende para TODAS as 12 séries

---

### 3. PREÇOS DOS PRODUTOS

#### CABU - Margem 20% (linha 236-239)
```php
'prices' => [
    'original' => 691.95,
    'pix' => 498.56,        // ← DIFERENTE (menor preço, mais margem)
    'credit_card' => 524.80
],
```

#### CAPEC - Margem 10% (linha 238-242)
```php
'prices' => [
    'original' => 691.95,
    'pix' => 416.95,        // ← DIFERENTE (preço menor, menos margem)
    'credit_card' => 438.90
],
```

**📌 CÁLCULO:**
- **CABU (20%):** R$ 691,95 → **R$ 498,56** no PIX
- **CAPEC (10%):** R$ 691,95 → **R$ 416,95** no PIX
- **Diferença:** R$ 81,61 mais barato em CAPEC!

---

### 4. CATÁLOGO DE PRODUTOS

#### ✅ PRODUTOS SÃO IDÊNTICOS (linhas 223-614)

**Ambas têm os mesmos 12 produtos:**
1. 1º ano Fundamental - Coleção SEED
2. 2º ano Fundamental - Coleção LIFE
3. 3º ano Fundamental - Coleção PURPOSE
4. 4º ano Fundamental - Coleção FACTORY
5. 5º ano Fundamental - Coleção SHOPPING
6. 6º ano Fundamental - Coleção INNOVATION
7. 7º ano Fundamental - Coleção ENTERTAINMENT
8. 8º ano Fundamental - Coleção BANKING
9. 9º ano Fundamental - Coleção BANKING
10. 1º ano Médio - Coleção EVOLUTION
11. 2º ano Médio - Coleção IMPULSE
12. 3º ano Médio - Coleção EXPERTS

**MAS:**
- CABU não venderá produtos 1 e 2 (não tem alunos dessas séries)
- Códigos ERP Omie são **IDÊNTICOS** em ambas

---

### 5. IMAGENS E BRANDING

#### CABU (linha 655-656)
```php
$store_config['images']['banner_school'] = 
    '../imagens/faixaescola-Colégio Adventista do Buritis.png';
```

#### CAPEC (linha 657-658)
```php
$store_config['images']['banner_school'] = 
    '../imagens/faixaescola-Colégio Adventista de Campos.png';
```

**📌 ARQUIVOS ÚNICOS POR LOJA:**
- `faixaescola-Colégio Adventista do Buritis.png`
- `faixaescola-Colégio Adventista de Campos.png`
- Logo, favicon, etc (por escola)

---

### 6. CONFIGS IDÊNTICAS

#### ✅ EXATAMENTE IGUAIS EM AMBAS:

1. **Integrações:**
   - Getnet (production)
   - Melhor Envio (production)
   - Omie ERP
   - Webhooks Make

2. **Frete:**
   - Limite: R$ 18,90
   - Dimensões padrão: 1.4kg, 26×32×9cm
   - Melhor Envio habilitado

3. **Pagamento:**
   - Max 12x parcelamento
   - Min R$ 2,00 por parcela
   - Mesmo webhook Make

4. **Ajuda/Suporte:**
   - Max 10MB anexos
   - Mesmo webhook Make

5. **Dados da empresa:**
   - Mesmo CNPJ: 48.037.991/0001-03
   - Mesmo endereço: Macaé/RJ

---

## 📋 RESUMO: O QUE MUDA vs O QUE É IGUAL

### ❌ O QUE MUDA (Específico por loja)

| Campo | Único por loja? |
|-------|----------------|
| `store_id` | ✅ Único (hash) |
| `maintainer_id` | ✅ Único (amc, arf, etc) |
| `maintainer_name` | ✅ Único (nome mantenedora) |
| `profit_margin` | ✅ Único (10%, 20%, etc) |
| `name_store` | ✅ Único (nome escola) |
| `eligible_students` | ✅ Único (quantidade por série) |
| `prices.pix` | ✅ Calculado (varia por margem) |
| `prices.credit_card` | ✅ Calculado (varia por margem) |
| `images.banner_school` | ✅ Único (banner da escola) |
| `images.logo` | ✅ Único (logo da escola) |
| `images.favicon` | ✅ Único (favicon da escola) |

### ✅ O QUE É IGUAL (Compartilhado)

| Campo | Compartilhado? |
|-------|---------------|
| Integrações (Getnet, Omie, Make) | ✅ Igual |
| Catálogo de produtos (12 itens) | ✅ Igual |
| Códigos ERP Omie | ✅ Igual |
| Configurações de frete | ✅ Igual |
| Configurações de pagamento | ✅ Igual |
| Dimensões produtos | ✅ Igual |
| Dados da empresa | ✅ Igual |
| Webhooks Make | ✅ Igual |

---

## 🎯 IMPLICAÇÕES PARA ARQUITETURA

### 1. Separação: Config Loja vs Catálogo Global

```
config/
├── stores/                        # Config ÚNICA por loja
│   ├── erpkl4if-cabu.json
│   └── s4vwcb5f-capec.json
│
├── products/                      # Catálogo GLOBAL (compartilhado)
│   ├── seed-1ano.json
│   ├── life-2ano.json
│   └── ... (12 produtos)
│
└── maintainers/                   # Mantenedoras (compartilhado)
    ├── amc.json
    └── arf.json
```

### 2. Config Store JSON (apenas o que muda)

```json
{
  "store_id": "erpkl4if-cabu",
  "maintainer_id": "amc",
  "store_name": "Colégio Adventista do Buritis",
  "profit_margin": 0.20,
  "project_year": "2025",
  
  "eligible_students": {
    "3º ano Fundamental": 36,
    "4º ano Fundamental": 48,
    "5º ano Fundamental": 40,
    "6º ano Fundamental": 40,
    "7º ano Fundamental": 44,
    "8º ano Fundamental": 24,
    "9º ano Fundamental": 33,
    "1º ano Médio": 28,
    "2º ano Médio": 25,
    "3º ano Médio": 32
  },
  
  "theme": {
    "logo_url": "/uploads/stores/erpkl4if-cabu/logo.png",
    "banner_url": "/uploads/stores/erpkl4if-cabu/banner.png",
    "favicon_url": "/uploads/stores/erpkl4if-cabu/favicon.png",
    "primary_color": "#0066CC",
    "secondary_color": "#FFD700"
  },
  
  "available_products": [
    "3º-ano-fundamental",
    "4º-ano-fundamental",
    "5º-ano-fundamental",
    "6º-ano-fundamental",
    "7º-ano-fundamental",
    "8º-ano-fundamental",
    "9º-ano-fundamental",
    "1º-ano-medio",
    "2º-ano-medio",
    "3º-ano-medio"
  ]
}
```

### 3. Catálogo Global (products/)

```json
{
  "product_id": "1º-ano-fundamental",
  "name": "Coleção SEED - 1º ano EFAI",
  "grade": "1º ano Fundamental",
  "base_price": 691.95,
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

### 4. Cálculo Dinâmico de Preços

```typescript
// services/loja-service/src/services/price-calculator.ts
export function calculatePrices(basePrice: number, profitMargin: number) {
  const pixPrice = basePrice * (1 - profitMargin);
  const creditPrice = pixPrice * 1.05;  // +5% no cartão
  
  return {
    original: basePrice,
    pix: Math.round(pixPrice * 100) / 100,
    credit_card: Math.round(creditPrice * 100) / 100
  };
}

// Uso:
const store = await db.stores.findOne({ store_id: 'erpkl4if-cabu' });
const product = await db.products.findOne({ product_id: '1º-ano-fundamental' });

const prices = calculatePrices(product.base_price, store.profit_margin);
// CABU (0.20): { pix: 498.56, credit_card: 524.80 }
// CAPEC (0.10): { pix: 416.95, credit_card: 438.90 }
```

---

## ✅ CONCLUSÕES FINAIS

### Quantidades

| Aspecto | Quantidade |
|---------|-----------|
| **Configs únicas** | 11 campos |
| **Configs compartilhadas** | 8 seções |
| **Produtos globais** | 12 itens |
| **Imagens únicas** | 3-5 por loja |

### Estratégia de Migração

1. **Criar 1 catálogo global** de produtos (12 JSONs)
2. **Criar 26 configs de lojas** (só o que muda)
3. **Criar 5-7 configs de mantenedoras** (AMC, ARF, etc)
4. **Calcular preços dinamicamente** (backend)
5. **Carregar temas dinamicamente** (frontend)

### Vantagens

- ✅ Atualizar produto = 1 lugar (não 26)
- ✅ Criar loja = 1 JSON pequeno (150 linhas vs 698)
- ✅ Alterar preços = alterar `profit_margin` (não reescrever 12 produtos)
- ✅ Adicionar série nova = adicionar em `eligible_students`
- ✅ Interface admin pode editar via formulário

---

## 🚀 PRÓXIMO PASSO

Criar estrutura de pastas finalizada e começar migração dos dados!

---

**FIM DA COMPARAÇÃO CABU vs CAPEC** ✅

