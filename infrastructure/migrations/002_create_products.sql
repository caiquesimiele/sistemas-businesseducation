-- ============================================================
-- MIGRATION: 002_create_products.sql
-- Descrição: Tabela de produtos (catálogo global)
-- Data: 2025-11-04
-- ============================================================

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    product_id VARCHAR(100) UNIQUE NOT NULL,         -- '1º-ano-fundamental', 'seed-1ano'
    name VARCHAR(255) NOT NULL,                      -- 'Coleção SEED - 1º ano EFAI'
    grade VARCHAR(50),                               -- '1º ano Fundamental', '2º ano Médio'
    
    -- Preços (JSON)
    prices JSONB NOT NULL,                           -- {"original": 691.95, "pix": 416.95, "credit_card": 438.90}
    
    -- Frete (JSON)
    shipping JSONB,                                  -- {"weight": 1.4, "dimensions": {...}}
    
    -- Integração ERP
    erp_config JSONB,                                -- {"codigo_produto_erp": "8849742340"}
    
    -- Galeria
    image_main VARCHAR(255),                         -- URL da imagem principal
    gallery_images JSONB,                            -- Array de URLs
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT products_product_id_key UNIQUE (product_id)
);

-- Índices
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_grade ON products(grade);
CREATE INDEX idx_products_prices ON products USING GIN (prices);

-- Comentários
COMMENT ON TABLE products IS 'Catálogo global de produtos';
COMMENT ON COLUMN products.product_id IS 'ID único do produto: 1º-ano-fundamental';
COMMENT ON COLUMN products.prices IS 'Preços: {original, pix, credit_card}';
COMMENT ON COLUMN products.shipping IS 'Dados de frete: {weight, dimensions}';
COMMENT ON COLUMN products.erp_config IS 'Código do produto no Omie ERP';

-- Trigger updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

