-- ============================================================
-- MIGRATION: 004_create_order_items.sql
-- Descrição: Tabela de itens do pedido (produtos)
-- Data: 2025-11-04
-- ============================================================

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    order_id VARCHAR(100) NOT NULL,                  -- FK para orders
    product_id VARCHAR(100) NOT NULL,                -- FK para products
    
    -- Dados do produto (snapshot no momento da compra)
    product_name VARCHAR(255),
    product_grade VARCHAR(50),
    
    -- Quantidade e valores
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Dados do filho (para quem é o produto)
    child_name VARCHAR(255),
    child_grade VARCHAR(50),
    child_shift VARCHAR(20),                         -- 'Manhã', 'Tarde'
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Índices
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_child_name ON order_items(child_name);

-- Comentários
COMMENT ON TABLE order_items IS 'Itens (produtos) de cada pedido';
COMMENT ON COLUMN order_items.child_name IS 'Nome do filho/aluno para quem é o produto';

