-- ============================================================
-- MIGRATION: 005_create_integration_logs.sql
-- Descrição: Log de integrações (Omie, Webhooks, Email)
-- Data: 2025-11-04
-- ============================================================

-- Tabela de logs de integração
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Evento
    event_type VARCHAR(100) NOT NULL,                -- 'OrderApproved', 'PaymentProcessed'
    order_id VARCHAR(100),                           -- Pedido relacionado
    
    -- Integração
    integration_name VARCHAR(50) NOT NULL,           -- 'omie', 'getnet', 'webhook_make', 'email'
    
    -- Status
    status VARCHAR(50) NOT NULL,                     -- 'success', 'failed', 'retry'
    
    -- Dados
    request_data JSONB,                              -- Payload enviado
    response_data JSONB,                             -- Resposta recebida
    error_message TEXT,                              -- Mensagem de erro (se houver)
    
    -- Retry
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign Key (opcional, pode não existir order)
    CONSTRAINT fk_integration_logs_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_integration_logs_order ON integration_logs(order_id);
CREATE INDEX idx_integration_logs_integration ON integration_logs(integration_name);
CREATE INDEX idx_integration_logs_status ON integration_logs(status);
CREATE INDEX idx_integration_logs_created ON integration_logs(created_at DESC);
CREATE INDEX idx_integration_logs_event ON integration_logs(event_type);

-- Comentários
COMMENT ON TABLE integration_logs IS 'Log de todas as integrações (Omie, Make, Email)';
COMMENT ON COLUMN integration_logs.event_type IS 'Tipo do evento: OrderApproved, PaymentProcessed';
COMMENT ON COLUMN integration_logs.integration_name IS 'Nome da integração: omie, webhook_make, email';
COMMENT ON COLUMN integration_logs.status IS 'Status: success, failed, retry';

