-- ============================================================
-- MIGRATION: 001_create_stores.sql
-- Descrição: Tabela de lojas (stores)
-- Data: 2025-11-04
-- ============================================================

-- Tabela principal de lojas
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    store_id VARCHAR(100) UNIQUE NOT NULL,           -- 'erpkl4if-cabu', 's4vwcb5f-capec'
    maintainer_id VARCHAR(50) NOT NULL,              -- 'amc', 'arf', 'ap'
    maintainer_name VARCHAR(255),                    -- 'Associação Mineira Central da IASD'
    store_name VARCHAR(255) NOT NULL,                -- 'Colégio Adventista do Buritis'
    
    -- Configurações de negócio
    profit_margin DECIMAL(5,4) DEFAULT 0.10,         -- 0.10 = 10%, 0.20 = 20%
    project_year VARCHAR(4) DEFAULT '2025',          -- '2025', '2026'
    active BOOLEAN DEFAULT TRUE,
    
    -- Configurações completas (JSON flexível)
    config JSONB NOT NULL DEFAULT '{}',              -- Todas as outras configs
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices para queries rápidas
    CONSTRAINT stores_store_id_key UNIQUE (store_id),
    CONSTRAINT stores_maintainer_id_check CHECK (maintainer_id ~ '^[a-z]{2,10}$')
);

-- Índices para otimização
CREATE INDEX idx_stores_maintainer ON stores(maintainer_id);
CREATE INDEX idx_stores_active ON stores(active);
CREATE INDEX idx_stores_year ON stores(project_year);

-- Índice GIN para buscar dentro do JSONB
CREATE INDEX idx_stores_config ON stores USING GIN (config);

-- Comentários
COMMENT ON TABLE stores IS 'Tabela de lojas - cada escola/instituição tem uma loja';
COMMENT ON COLUMN stores.store_id IS 'ID único da loja (hash-sigla): erpkl4if-cabu';
COMMENT ON COLUMN stores.maintainer_id IS 'ID da mantenedora: amc, arf, ap, etc';
COMMENT ON COLUMN stores.profit_margin IS 'Margem de lucro: 0.10 = 10%, 0.20 = 20%';
COMMENT ON COLUMN stores.config IS 'Configurações completas da loja em JSON';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

