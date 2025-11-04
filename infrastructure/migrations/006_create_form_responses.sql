-- ============================================================
-- MIGRATION: 006_create_form_responses.sql
-- Descrição: Tabela de respostas de formulários
-- Data: 2025-11-04
-- ============================================================

-- Tabela de respostas de formulários
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    survey_id VARCHAR(100) UNIQUE NOT NULL,          -- 'arf-pais-20250826155851'
    maintainer_id VARCHAR(50) NOT NULL,              -- 'arf', 'amc'
    
    -- Tipo e origem
    survey_type VARCHAR(50) NOT NULL,                -- 'pais', 'professores', 'onboarding'
    project_year VARCHAR(4),                         -- '2025', '2026'
    
    -- Escola
    escola VARCHAR(100),                             -- 'CAC', 'CABU'
    escola_name VARCHAR(255),                        -- 'Colégio Adventista de Campos'
    segmento VARCHAR(50),                            -- 'fundamental', 'medio'
    
    -- Respondente
    nome_completo VARCHAR(255),
    email VARCHAR(255),
    
    -- Respostas (JSON)
    response_data JSONB NOT NULL,                    -- Todas as respostas
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT form_responses_survey_id_key UNIQUE (survey_id)
);

-- Índices
CREATE INDEX idx_form_responses_maintainer ON form_responses(maintainer_id);
CREATE INDEX idx_form_responses_type ON form_responses(survey_type);
CREATE INDEX idx_form_responses_year ON form_responses(project_year);
CREATE INDEX idx_form_responses_escola ON form_responses(escola);
CREATE INDEX idx_form_responses_created ON form_responses(created_at DESC);
CREATE INDEX idx_form_responses_email ON form_responses(email);

-- Índice GIN para buscar dentro do JSONB
CREATE INDEX idx_form_responses_data ON form_responses USING GIN (response_data);

-- Comentários
COMMENT ON TABLE form_responses IS 'Respostas de formulários (pais, professores)';
COMMENT ON COLUMN form_responses.survey_id IS 'ID único: arf-pais-20250826155851';
COMMENT ON COLUMN form_responses.survey_type IS 'Tipo: pais, professores, onboarding';
COMMENT ON COLUMN form_responses.response_data IS 'JSON com todas as respostas';

