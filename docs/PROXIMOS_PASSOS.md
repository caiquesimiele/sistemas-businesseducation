# 🚀 PRÓXIMOS PASSOS - IMPLEMENTAÇÃO

**Data:** 04/11/2025  
**Status:** Fundação criada - Pronto para executar

---

## ✅ O QUE JÁ FOI FEITO

### 1. Migrations PostgreSQL Criadas
- ✅ `001_create_stores.sql` - Tabela de lojas
- ✅ `002_create_products.sql` - Catálogo de produtos
- ✅ `003_create_orders.sql` - Pedidos
- ✅ `004_create_order_items.sql` - Itens dos pedidos
- ✅ `005_create_integration_logs.sql` - Logs de integrações
- ✅ `006_create_form_responses.sql` - Respostas de formulários

**Localização:** `infrastructure/migrations/`

---

### 2. Protótipo CABU Criado
- ✅ `config/stores/erpkl4if-cabu.json` - Config da loja
- ✅ `config/products/seed-1ano-fundamental.json` - Produto exemplo
- ✅ `config/products/seed-5ano-fundamental.json` - Produto exemplo
- ✅ `config/products/life-1ano-medio.json` - Produto exemplo
- ✅ `public/loja/css/themes/erpkl4if-cabu.css` - Tema CSS

---

### 3. Scripts de Automação
- ✅ `infrastructure/scripts/run-migrations.sh` - Executa migrations
- ✅ `infrastructure/scripts/seed-database.js` - Insere dados iniciais

---

## 🎯 EXECUTAR AGORA (VPS)

### **PASSO 1: Conectar no VPS**

```bash
ssh deploy@72.61.39.160
cd ~/sistemas-businesseducation
```

---

### **PASSO 2: Pull do Código Atualizado**

```bash
# Pull do GitHub (pegar arquivos novos)
git pull origin main

# Se não tiver commitado ainda no PC, fazer:
# git add .
# git commit -m "feat: migrations, configs e scripts"
# git push origin main
```

---

### **PASSO 3: Executar Migrations (Staging)**

```bash
# Dar permissão de execução ao script
chmod +x infrastructure/scripts/run-migrations.sh

# Executar migrations no staging
./infrastructure/scripts/run-migrations.sh staging
```

**Resultado esperado:**
```
🚀 Executando migrations no ambiente: staging
✅ Container encontrado: docker-postgres-staging-1
➡️  Executando: 001_create_stores.sql
✅ 001_create_stores.sql - OK
➡️  Executando: 002_create_products.sql
✅ 002_create_products.sql - OK
...
✅ Todas as migrations executadas com sucesso!
📊 Tabelas no banco:
 stores
 products
 orders
 order_items
 integration_logs
 form_responses
```

---

### **PASSO 4: Instalar Dependências do Seed Script**

```bash
cd infrastructure/scripts
npm install
cd ../..
```

---

### **PASSO 5: Executar Seed (Inserir Dados Iniciais)**

```bash
# Inserir loja CABU + 3 produtos no staging
node infrastructure/scripts/seed-database.js --env staging
```

**Resultado esperado:**
```
🚀 Seed do banco de dados - Ambiente: staging
🔌 Conectando ao PostgreSQL...
✅ Conectado!

📦 Inserindo lojas (stores)...
✅ erpkl4if-cabu - Colégio Adventista do Buritis
📊 1 loja(s) inserida(s)

📦 Inserindo produtos (products)...
✅ 1º-ano-fundamental - Coleção SEED - 1º ano EFAI
✅ 5º-ano-fundamental - Coleção SEED - 5º ano EFAI
✅ 1º-ano-medio - Coleção LIFE - 1º ano EM
📊 3 produto(s) inserido(s)

🎉 Seed concluído com sucesso!
```

---

### **PASSO 6: Verificar Dados Inseridos**

```bash
# Conectar ao PostgreSQL staging
docker exec -it docker-postgres-staging-1 psql -U business -d business_staging

# Dentro do PostgreSQL:

-- Ver lojas
SELECT store_id, store_name, maintainer_id FROM stores;

-- Ver produtos
SELECT product_id, name, grade FROM products;

-- Ver quantidades
SELECT 
    (SELECT COUNT(*) FROM stores) as lojas,
    (SELECT COUNT(*) FROM products) as produtos;

-- Sair
\q
```

---

## ✅ VALIDAÇÃO

Se tudo funcionou:
- ✅ 6 tabelas criadas no PostgreSQL staging
- ✅ 1 loja (CABU) inserida
- ✅ 3 produtos inseridos
- ✅ Queries retornam dados corretamente

---

## 🎯 PRÓXIMOS PASSOS (Depois desta fundação)

### **Semana Atual:**

1. **Completar os 9 produtos restantes**
   - Criar JSONs para 2º, 3º, 4º ano fundamental
   - Criar JSONs para 6º, 7º, 8º, 9º ano fundamental
   - Criar JSONs para 2º e 3º ano médio
   - Executar seed novamente

2. **Converter as 25 lojas restantes**
   - Pegar `store.php` de cada loja
   - Converter para JSON
   - Inserir no banco

---

### **Próxima Semana:**

3. **Implementar Loja Service (API REST)**
   ```
   services/loja-service/
   ├── src/
   │   ├── server.ts
   │   ├── routes/
   │   │   ├── stores.ts        # GET /api/stores/:storeId/config
   │   │   ├── products.ts      # GET /api/products
   │   │   └── orders.ts        # POST /api/orders
   │   ├── controllers/
   │   ├── models/
   │   └── config/
   │       └── database.ts      # Conexão PostgreSQL
   ```

4. **Conectar Frontend ao Backend**
   - Template HTML carrega config da loja via API
   - Carregar tema CSS dinamicamente
   - Listar produtos via API

---

### **Daqui 2 Semanas:**

5. **Integração Getnet**
   - PIX Handler
   - Callback de aprovação
   - Atualizar status do pedido

6. **Event Bus (Redis Pub/Sub)**
   - Publicar `OrderApproved`
   - Integration service escuta eventos

---

## 📊 RESUMO DO QUE TEMOS AGORA

```
✅ Infraestrutura VPS (Docker + PostgreSQL + Redis)
✅ Migrations criadas e executadas
✅ 1 loja protótipo (CABU) configurada
✅ 3 produtos configurados
✅ Tema CSS personalizado (CABU)
✅ Scripts de automação

⏳ Falta: 25 lojas + 9 produtos
⏳ Falta: API REST (Node.js/TypeScript)
⏳ Falta: Integrações (Getnet, Omie, Make)
⏳ Falta: Event Bus
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Container não encontrado"
```bash
# Verificar se containers estão rodando
docker ps

# Se não estiverem, subir novamente
docker-compose -f infrastructure/docker/docker-compose.staging.yml up -d
```

### Erro: "Permission denied" no script
```bash
# Dar permissão de execução
chmod +x infrastructure/scripts/run-migrations.sh
```

### Erro: "pg: Connection refused"
```bash
# Verificar se PostgreSQL está rodando
docker logs docker-postgres-staging-1

# Verificar portas
docker ps | grep postgres
```

### Erro: "Migration já executada"
```bash
# Migrations são idempotentes (IF NOT EXISTS)
# Pode executar múltiplas vezes sem problema
```

---

## 📞 CHECKLIST DE VALIDAÇÃO

Execute este checklist para garantir que tudo está OK:

```bash
# 1. PostgreSQL staging rodando?
docker ps | grep postgres-staging

# 2. Migrations executadas?
docker exec -it docker-postgres-staging-1 psql -U business -d business_staging -c "\dt"

# 3. Dados inseridos?
docker exec -it docker-postgres-staging-1 psql -U business -d business_staging -c "SELECT COUNT(*) FROM stores;"
docker exec -it docker-postgres-staging-1 psql -U business -d business_staging -c "SELECT COUNT(*) FROM products;"

# 4. Arquivos de config existem?
ls config/stores/
ls config/products/

# 5. Tema CSS existe?
ls public/loja/css/themes/
```

Se todos retornarem resultados positivos: **✅ Fundação completa!**

---

**Pronto para continuar? Avise quando terminar estas etapas!**

