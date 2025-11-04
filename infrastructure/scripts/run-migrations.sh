#!/bin/bash

# ============================================================
# Script: run-migrations.sh
# Descrição: Executa todas as migrations no PostgreSQL
# Uso: ./run-migrations.sh [staging|production]
# ============================================================

set -e  # Para na primeira falha

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica ambiente
ENV=${1:-staging}

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
    echo -e "${RED}❌ Erro: Ambiente deve ser 'staging' ou 'production'${NC}"
    echo "Uso: ./run-migrations.sh [staging|production]"
    exit 1
fi

echo -e "${BLUE}🚀 Executando migrations no ambiente: ${ENV}${NC}"
echo ""

# Define container baseado no ambiente
if [ "$ENV" = "staging" ]; then
    CONTAINER="docker-postgres-staging-1"
    DATABASE="business_staging"
else
    CONTAINER="docker-postgres-production-1"
    DATABASE="business_production"
fi

# Verifica se container está rodando
if ! docker ps | grep -q "$CONTAINER"; then
    echo -e "${RED}❌ Container $CONTAINER não está rodando${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container encontrado: $CONTAINER${NC}"
echo ""

# Diretório das migrations
MIGRATIONS_DIR="$(cd "$(dirname "$0")/../migrations" && pwd)"

# Executa cada migration
echo -e "${BLUE}📋 Executando migrations...${NC}"
echo ""

for file in "$MIGRATIONS_DIR"/*.sql; do
    filename=$(basename "$file")
    
    echo -e "${BLUE}➡️  Executando: $filename${NC}"
    
    docker exec -i "$CONTAINER" psql -U business -d "$DATABASE" < "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $filename - OK${NC}"
    else
        echo -e "${RED}❌ $filename - FALHOU${NC}"
        exit 1
    fi
    
    echo ""
done

echo -e "${GREEN}✅ Todas as migrations executadas com sucesso!${NC}"
echo ""

# Lista tabelas criadas
echo -e "${BLUE}📊 Tabelas no banco:${NC}"
docker exec -i "$CONTAINER" psql -U business -d "$DATABASE" -c "\dt"

echo ""
echo -e "${GREEN}🎉 Processo concluído!${NC}"

