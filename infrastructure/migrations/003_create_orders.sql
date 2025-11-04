-- ============================================================
-- MIGRATION: 003_create_orders.sql
-- Descrição: Tabela de pedidos
-- Data: 2025-11-04
-- ============================================================

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    order_id VARCHAR(100) UNIQUE NOT NULL,           -- 'ERPKL4IF-CABU-1730850123'
    store_id VARCHAR(100) NOT NULL,                  -- FK para stores
    maintainer_id VARCHAR(50) NOT NULL,              -- Desnormalizado para queries rápidas
    
    -- Cliente
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_document VARCHAR(20),                   -- CPF
    customer_address JSONB,                          -- Endereço completo
    
    -- Status do pedido
    status VARCHAR(50) NOT NULL DEFAULT 'pending',   -- pending, approved, billed, shipped, delivered, rejected
    
    -- Valores
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2),
    shipping_cost DECIMAL(10,2),
    discount DECIMAL(10,2),
    
    -- Pagamento
    payment_method VARCHAR(50),                      -- 'pix', 'credit_card'
    payment_id VARCHAR(100),                         -- ID do pagamento na Getnet
    
    -- Ano-projeto
    project_year VARCHAR(4),                         -- '2025', '2026'
    
    -- Dados completos (JSON flexível)
    order_details JSONB NOT NULL,                    -- Todos os detalhes do pedido
    
    -- Integração ERP
    omie_order_number VARCHAR(50),                   -- Número da NF no Omie
    omie_integration_status VARCHAR(50),             -- 'pending', 'success', 'failed'
    
    -- Rastreamento
    tracking_code VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    billed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(store_id),
    CONSTRAINT orders_order_id_key UNIQUE (order_id)
);

-- Índices para queries rápidas
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_maintainer ON orders(maintainer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_year ON orders(project_year);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_customer_document ON orders(customer_document);

-- Índice GIN para buscar dentro do JSONB
CREATE INDEX idx_orders_details ON orders USING GIN (order_details);

-- Comentários
COMMENT ON TABLE orders IS 'Pedidos da loja';
COMMENT ON COLUMN orders.order_id IS 'ID único: ERPKL4IF-CABU-1730850123';
COMMENT ON COLUMN orders.status IS 'pending → approved → billed → shipped → delivered';
COMMENT ON COLUMN orders.order_details IS 'JSON com todos os detalhes do pedido';

-- Trigger updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

