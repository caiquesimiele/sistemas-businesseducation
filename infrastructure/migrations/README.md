# Migrations PostgreSQL

Migrations do banco de dados para o sistema Business Education.

## Ordem de Execução

Execute as migrations **na ordem numérica**:

1. `001_create_stores.sql` - Tabela de lojas
2. `002_create_products.sql` - Catálogo de produtos
3. `003_create_orders.sql` - Pedidos
4. `004_create_order_items.sql` - Itens dos pedidos
5. `005_create_integration_logs.sql` - Logs de integrações
6. `006_create_form_responses.sql` - Respostas de formulários

## Como Executar (Staging)

```bash
# No VPS, conectar ao PostgreSQL staging
docker exec -it docker-postgres-staging-1 bash

# Dentro do container
psql -U business -d business_staging

# Executar cada migration
\i /path/to/001_create_stores.sql
\i /path/to/002_create_products.sql
\i /path/to/003_create_orders.sql
\i /path/to/004_create_order_items.sql
\i /path/to/005_create_integration_logs.sql
\i /path/to/006_create_form_responses.sql

# Verificar tabelas criadas
\dt

# Sair
\q
exit
```

## Ou via script (mais rápido)

```bash
# No VPS
cd ~/sistemas-businesseducation/infrastructure/migrations

# Executar todas de uma vez (staging)
for file in *.sql; do
    docker exec -i docker-postgres-staging-1 psql -U business -d business_staging < "$file"
done

# Verificar
docker exec -it docker-postgres-staging-1 psql -U business -d business_staging -c "\dt"
```

## Estrutura das Tabelas

### stores
Lojas (26 lojas, uma por escola)

### products
Catálogo global de produtos (12 produtos: 1º ano fundamental ao 3º médio)

### orders
Pedidos dos clientes

### order_items
Itens de cada pedido (produtos)

### integration_logs
Log de integrações (Omie, Make, Email)

### form_responses
Respostas de formulários (pais, professores)

## Notas Importantes

- ✅ Todas as tabelas têm `created_at` e `updated_at`
- ✅ Triggers automáticos para atualizar `updated_at`
- ✅ Índices otimizados para queries rápidas
- ✅ Foreign keys com ON DELETE CASCADE ou SET NULL
- ✅ JSONB para dados flexíveis (config, order_details, response_data)
- ✅ Índices GIN para buscar dentro de JSONB

