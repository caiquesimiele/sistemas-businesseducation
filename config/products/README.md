# Catálogo de Produtos

Produtos globais do sistema (compartilhados por todas as lojas).

## Produtos Cadastrados

### Ensino Fundamental I (SEED)
- ✅ `seed-1ano-fundamental.json` - 1º ano Fundamental
- ⏳ `seed-2ano-fundamental.json` - 2º ano Fundamental
- ⏳ `seed-3ano-fundamental.json` - 3º ano Fundamental
- ⏳ `seed-4ano-fundamental.json` - 4º ano Fundamental
- ✅ `seed-5ano-fundamental.json` - 5º ano Fundamental

### Ensino Fundamental II (SEED)
- ⏳ `seed-6ano-fundamental.json` - 6º ano Fundamental
- ⏳ `seed-7ano-fundamental.json` - 7º ano Fundamental
- ⏳ `seed-8ano-fundamental.json` - 8º ano Fundamental
- ⏳ `seed-9ano-fundamental.json` - 9º ano Fundamental

### Ensino Médio (LIFE)
- ✅ `life-1ano-medio.json` - 1º ano Médio
- ⏳ `life-2ano-medio.json` - 2º ano Médio
- ⏳ `life-3ano-medio.json` - 3º ano Médio

## Estrutura do Arquivo

```json
{
  "product_id": "identificador-unico",
  "name": "Nome do Produto",
  "grade": "Série",
  "active": true,
  
  "prices": {
    "original": 691.95,
    "pix": 416.95,
    "credit_card": 438.90
  },
  
  "shipping": {
    "weight": 1.4,
    "dimensions": { "length": 29, "width": 34, "height": 10 }
  },
  
  "erp": {
    "codigo_produto_erp": "codigo-omie",
    "observacoes": "observações"
  },
  
  "images": {
    "main": "/images/products/produto-1.png",
    "gallery": [...]
  }
}
```

## Como Adicionar Novo Produto

1. Criar arquivo JSON seguindo o padrão
2. Inserir no PostgreSQL (script de seed)
3. Adicionar imagens em `/public/loja/images/products/`

## Scripts

### Seed de Produtos (inserir todos no banco)

```bash
# Executar no VPS
node scripts/seed-products.js --env staging
node scripts/seed-products.js --env production
```

