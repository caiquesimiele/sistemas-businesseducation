# CONFIGURAÇÃO VPS HOSTINGER - BUSINESS EDUCATION

**Data:** 04/11/2025  
**VPS:** KVM 2 (8GB RAM, 2 CPU, 100GB SSD)  
**IP:** 72.61.39.160  
**Sistema:** Ubuntu 25.04

---

## OBJETIVO

Configurar VPS do zero para rodar:
- Staging (ambiente de teste)
- Produção (ambiente real)
- PostgreSQL (banco de dados)
- Redis (cache e filas)
- Node.js Services (auth, loja, integrações)
- Docker Compose (orquestração)

---

## PRÉ-REQUISITOS

- VPS Hostinger KVM 2 contratado
- Domínios apontados (configurar DNS depois)
- Repositório GitHub criado: `github.com/caiquesimiele/sistemas-businesseducation`
- Token GitHub gerado (para git clone)

---

## FASE 1: ACESSO INICIAL

### 1.1 Conectar via SSH

```bash
ssh root@72.61.39.160
```

**O que é SSH:**
Secure Shell - protocolo para acessar servidores remotamente de forma segura.

**Por que usar root inicialmente:**
Root é o usuário administrador com todas as permissões. Vamos criar usuário comum depois.

**Resultado esperado:**
```
Welcome to Ubuntu 25.04
root@srv1104116:~#
```

---

## FASE 2: ATUALIZAÇÃO DO SISTEMA

### 2.1 Atualizar lista de pacotes e instalar atualizações

```bash
apt update && apt upgrade -y
```

**O que faz:**
- `apt update`: Atualiza lista de pacotes disponíveis
- `apt upgrade`: Instala versões mais recentes dos pacotes
- `-y`: Confirma automaticamente (não pede interação)

**Por que fazer:**
Segurança. Corrige vulnerabilidades e bugs conhecidos.

**Tempo:** ~2 minutos

**Resultado:**
Sistema atualizado com patches de segurança.

---

## FASE 3: INSTALAÇÃO DO DOCKER

### 3.1 Baixar script de instalação oficial

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```

**O que faz:**
- `curl`: Ferramenta para fazer requisições HTTP
- `-fsSL`: Flags para silenciar erros, seguir redirects, mostrar erros HTTP
- `https://get.docker.com`: Script oficial de instalação Docker
- `-o get-docker.sh`: Salva no arquivo get-docker.sh

**Por que usar script oficial:**
Docker mantém script atualizado para todas as distribuições Linux.

---

### 3.2 Executar instalação

```bash
sh get-docker.sh
```

**O que faz:**
- Detecta distribuição Linux (Ubuntu 25.04)
- Adiciona repositório oficial Docker
- Instala Docker Engine
- Configura daemon
- Inicia serviço Docker

**Tempo:** ~3 minutos

**Resultado:**
Docker instalado e rodando.

---

### 3.3 Instalar Docker Compose Plugin

```bash
apt install docker-compose-plugin -y
```

**O que é Docker Compose:**
Ferramenta para definir e rodar aplicações multi-container. Permite gerenciar staging e produção com arquivos YAML.

**Diferença de docker-compose standalone:**
Plugin é a versão moderna, integrada ao Docker CLI. Comando: `docker compose` (espaço).

---

### 3.4 Verificar instalação

```bash
docker --version
docker compose version
```

**Resultado obtido:**
```
Docker version 28.5.1, build e180ab8
Docker Compose version v2.40.3
```

**Status:** ✅ Docker e Docker Compose instalados com sucesso.

---

## FASE 4: CONFIGURAÇÃO DE SEGURANÇA

### 4.1 Criar usuário não-root

```bash
adduser deploy
```

**Por que criar usuário separado:**
- Segurança: root tem acesso total, erros podem ser catastróficos
- Auditoria: logs mostram quem fez o quê
- Boa prática: produção não deve usar root

**Nome escolhido:** `deploy`  
**Senha:** (definir senha forte)

---

### 4.2 Adicionar usuário ao grupo Docker

```bash
usermod -aG docker deploy
```

**O que faz:**
- `usermod`: Modifica usuário
- `-aG docker`: Adiciona (-a) ao grupo (G) docker
- Permite usar docker sem sudo

---

### 4.3 Adicionar usuário ao grupo sudo

```bash
usermod -aG sudo deploy
```

**Por que:**
Permite executar comandos administrativos quando necessário com `sudo`.

---

### 4.4 Testar acesso do novo usuário

```bash
su - deploy
docker ps
```

**O que faz:**
- `su - deploy`: Troca para usuário deploy
- `docker ps`: Lista containers (deve funcionar sem sudo)

**Resultado esperado:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

Vazio, mas sem erro de permissão.

---

## FASE 5: CLONAR REPOSITÓRIO GITHUB

### 5.1 Configurar Git

```bash
git config --global user.name "Caique Simiele"
git config --global user.email "seu-email@gmail.com"
```

**Por que:**
Git precisa saber quem está fazendo commits.

---

### 5.2 Clonar repositório

```bash
cd ~
git clone https://github.com/caiquesimiele/sistemas-businesseducation.git
cd sistemas-businesseducation
```

**Vai pedir:**
- Username: `caiquesimiele`
- Password: [Token GitHub gerado anteriormente]

**O que faz:**
Copia todo código do GitHub para servidor.

**Estrutura esperada:**
```
~/sistemas-businesseducation/
├── services/
├── infrastructure/
├── data/
└── README.md
```

---

## FASE 6: CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

### 6.1 Criar arquivo .env para staging

```bash
nano .env.staging
```

**Conteúdo:**
```bash
# Database
POSTGRES_USER=business
POSTGRES_PASSWORD=staging_senha_forte_123
POSTGRES_DB=business_staging

# Redis
REDIS_PASSWORD=staging_redis_senha_456

# JWT
JWT_SECRET=staging_jwt_secret_change_in_production

# Omie (Sandbox)
OMIE_APP_KEY=seu_omie_sandbox_key
OMIE_APP_SECRET=seu_omie_sandbox_secret
OMIE_SANDBOX=true

# Getnet (Sandbox)
GETNET_CLIENT_ID=seu_getnet_sandbox_id
GETNET_CLIENT_SECRET=seu_getnet_sandbox_secret
GETNET_SANDBOX=true

# Environment
NODE_ENV=staging
```

**Salvar:** Ctrl+O, Enter, Ctrl+X

---

### 6.2 Criar arquivo .env para produção

```bash
nano .env.production
```

**Conteúdo:**
```bash
# Database
POSTGRES_USER=business
POSTGRES_PASSWORD=production_senha_muito_forte_789
POSTGRES_DB=business_production

# Redis
REDIS_PASSWORD=production_redis_senha_xyz

# JWT
JWT_SECRET=production_jwt_secret_super_strong_abc

# Omie (Produção)
OMIE_APP_KEY=seu_omie_producao_key
OMIE_APP_SECRET=seu_omie_producao_secret
OMIE_SANDBOX=false

# Getnet (Produção)
GETNET_CLIENT_ID=seu_getnet_producao_id
GETNET_CLIENT_SECRET=seu_getnet_producao_secret
GETNET_SANDBOX=false

# Environment
NODE_ENV=production
```

**Importante:**
- Senhas staging ≠ senhas produção
- Produção usa APIs reais (não sandbox)
- JWT_SECRET deve ser string aleatória longa

**Salvar:** Ctrl+O, Enter, Ctrl+X

---

## FASE 7: CRIAR ESTRUTURA DE DADOS

### 7.1 Criar diretórios para volumes Docker

```bash
mkdir -p data/staging/{postgres,redis,uploads,logs}
mkdir -p data/production/{postgres,redis,uploads,logs}
```

**O que faz:**
- `mkdir -p`: Cria diretórios recursivamente
- Estrutura separada para staging e produção
- Volumes Docker vão mapear para essas pastas

**Por que separar:**
- Dados staging não misturam com produção
- Staging pode ser resetado sem afetar produção
- Backups independentes

**Estrutura criada:**
```
data/
├── staging/
│   ├── postgres/    (banco de dados staging)
│   ├── redis/       (cache staging)
│   ├── uploads/     (arquivos staging)
│   └── logs/        (logs staging)
└── production/
    ├── postgres/    (banco de dados produção)
    ├── redis/       (cache produção)
    ├── uploads/     (arquivos produção)
    └── logs/        (logs produção)
```

---

## FASE 8: SUBIR AMBIENTE STAGING

### 8.1 Verificar arquivo docker-compose.staging.yml

```bash
cat infrastructure/docker/docker-compose.staging.yml
```

**Deve conter:**
- PostgreSQL na porta 5433
- Redis na porta 6380
- Volumes mapeados para data/staging/

---

### 8.2 Iniciar containers staging

```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml --env-file .env.staging up -d
```

**O que faz:**
- `-f`: Especifica arquivo compose
- `--env-file`: Carrega variáveis de .env.staging
- `up`: Inicia containers
- `-d`: Modo daemon (background)

**Containers criados:**
- postgres-staging
- redis-staging

**Tempo:** ~1-2 minutos (primeira vez baixa imagens)

---

### 8.3 Verificar containers rodando

```bash
docker ps
```

**Resultado esperado:**
```
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
abc123def456   postgres:15-alpine Up 2 minutes   0.0.0.0:5433->5432/tcp   postgres-staging
xyz789ghi012   redis:7-alpine     Up 2 minutes   0.0.0.0:6380->6379/tcp   redis-staging
```

---

### 8.4 Testar conexão PostgreSQL staging

```bash
docker exec -it postgres-staging psql -U business -d business_staging
```

**Dentro do PostgreSQL:**
```sql
\l
\q
```

**O que faz:**
- `\l`: Lista databases
- `\q`: Sai

**Resultado esperado:**
Database `business_staging` existe.

---

### 8.5 Testar conexão Redis staging

```bash
docker exec -it redis-staging redis-cli
```

**Dentro do Redis:**
```
PING
exit
```

**Resultado esperado:**
```
PONG
```

---

## FASE 9: SUBIR AMBIENTE PRODUÇÃO

### 9.1 Iniciar containers produção

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml --env-file .env.production up -d
```

**Containers criados:**
- postgres-production
- redis-production

**Portas diferentes:**
- PostgreSQL: 5432 (padrão)
- Redis: 6379 (padrão)

---

### 9.2 Verificar todos containers

```bash
docker ps
```

**Resultado esperado:**
4 containers rodando (2 staging + 2 produção)

---

## FASE 10: VERIFICAÇÃO FINAL

### 10.1 Status dos serviços

```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml ps
docker compose -f infrastructure/docker/docker-compose.production.yml ps
```

**Todos devem estar:** `Up`

---

### 10.2 Logs de staging

```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml logs
```

**Verificar:**
- Sem erros críticos
- PostgreSQL: "database system is ready to accept connections"
- Redis: "Ready to accept connections"

---

### 10.3 Logs de produção

```bash
docker compose -f infrastructure/docker/docker-compose.production.yml logs
```

**Verificar:**
Mesmas mensagens de sucesso.

---

## FASE 11: CONFIGURAÇÃO DE DOMÍNIOS (PRÓXIMO PASSO)

### 11.1 Criar registros DNS

**No painel Hostinger → Domínios → businesseducation.com.br → DNS:**

Adicionar registros A:

| Tipo | Nome | Aponta para |
|------|------|-------------|
| A | loja-staging | 72.61.39.160 |
| A | loja | 72.61.39.160 |
| A | forms-staging | 72.61.39.160 |
| A | forms | 72.61.39.160 |
| A | dashs-staging | 72.61.39.160 |
| A | dashs | 72.61.39.160 |
| A | api-staging | 72.61.39.160 |
| A | api | 72.61.39.160 |

**Propagação:** 1-24 horas (geralmente 15 minutos)

---

### 11.2 Instalar Nginx

```bash
apt install nginx -y
```

**O que é Nginx:**
Servidor web e reverse proxy. Vai rotear domínios para containers Docker.

---

### 11.3 Configurar reverse proxy

(A ser detalhado quando chegar nesta etapa)

---

## COMANDOS ÚTEIS

### Ver logs em tempo real
```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml logs -f
```

### Parar containers
```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml down
```

### Reiniciar um container
```bash
docker restart postgres-staging
```

### Ver uso de recursos
```bash
docker stats
```

### Acessar container
```bash
docker exec -it postgres-staging bash
```

### Backup banco staging
```bash
docker exec postgres-staging pg_dump -U business business_staging > backup-staging.sql
```

### Restaurar banco staging
```bash
cat backup-staging.sql | docker exec -i postgres-staging psql -U business business_staging
```

---

## TROUBLESHOOTING

### Container não inicia
```bash
docker logs nome-do-container
```

### Porta já em uso
```bash
netstat -tulpn | grep PORTA
```

### Resetar ambiente staging
```bash
docker compose -f infrastructure/docker/docker-compose.staging.yml down -v
rm -rf data/staging/*
docker compose -f infrastructure/docker/docker-compose.staging.yml up -d
```

### Verificar espaço em disco
```bash
df -h
docker system df
```

### Limpar containers/imagens antigas
```bash
docker system prune -a
```

---

## CHECKLIST COMPLETO

- [x] VPS acessível via SSH
- [x] Sistema atualizado
- [x] Docker instalado
- [x] Docker Compose instalado
- [x] Usuário deploy criado
- [x] Repositório clonado
- [ ] .env.staging criado (próximo)
- [ ] .env.production criado (próximo)
- [x] Estrutura data/ criada
- [x] Containers staging rodando
- [x] Containers produção rodando
- [x] PostgreSQL staging funcionando
- [x] PostgreSQL produção funcionando
- [x] Redis staging funcionando
- [x] Redis produção funcionando
- [ ] Node.js services implementados (próximo)
- [ ] DNS configurados (pendente)
- [ ] Nginx instalado (pendente)
- [ ] SSL configurado (pendente)

---

## PRÓXIMAS ETAPAS

1. Implementar Node.js services (auth, loja, integration)
2. Configurar Nginx reverse proxy
3. Configurar SSL/HTTPS (Let's Encrypt)
4. Implementar Event Bus (Redis Pub/Sub)
5. Migrar dados do sistema atual
6. Testes em staging
7. Deploy produção
8. Monitoramento e logs

---

**Documento atualizado em:** 04/11/2025 01:15 UTC  
**Status:** Staging e Produção rodando ✅  
**Próximo passo:** Implementar Node.js services e configurar domínios

