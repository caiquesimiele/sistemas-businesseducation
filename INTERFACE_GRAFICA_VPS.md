# INTERFACE GRÁFICA PARA VPS

**Data:** 04/11/2025  
**Objetivo:** Gerenciar VPS com interface gráfica familiar

---

## O QUE É VS CODE REMOTE SSH

**Definição:**
Extensão oficial da Microsoft que permite editar arquivos do servidor remoto como se fossem locais.

**Vantagem:**
Transforma VPS (linha de comando) em ambiente visual igual ao seu PC.

**Comparação:**

**ANTES:**
```
VPS = SSH terminal (só texto)
Editar arquivo = nano/vim (difícil)
Ver estrutura = ls -la (confuso)
```

**DEPOIS:**
```
VPS = VS Code (interface visual)
Editar arquivo = clica e edita
Ver estrutura = árvore de pastas
Terminal integrado = melhor dos dois mundos
```

---

## INSTALAÇÃO E CONFIGURAÇÃO

### PASSO 1: Instalar Extensão

**No Cursor AI ou VS Code:**

1. Pressione `Ctrl+Shift+X` (abre extensões)
2. Digite: `Remote - SSH`
3. Encontre: **Remote - SSH** (Microsoft)
4. Clique: **Install**
5. Aguarde: ~10 segundos

**Como identificar a extensão correta:**
- Nome: Remote - SSH
- Autor: Microsoft
- Ícone: Roxo com monitor e seta
- Descrição: "Open any folder on a remote machine..."

---

### PASSO 2: Conectar no VPS

**Abrir conexão:**

1. Pressione `Ctrl+Shift+P` (command palette)
2. Digite: `Remote-SSH: Connect to Host`
3. Selecione a opção
4. Digite: `deploy@72.61.39.160`
5. Pressione `ENTER`

**Perguntas que vão aparecer:**

**Pergunta 1:** "Select the platform of the remote host"
- **Resposta:** `Linux`

**Pergunta 2:** Senha do usuário deploy
- **Resposta:** [Digite senha que você criou]
- **Nota:** Não aparece enquanto digita (normal)

**Aguardar conexão:** 30-60 segundos (primeira vez baixa componentes)

**Sucesso quando:**
- Canto inferior esquerdo mostra: `SSH: deploy@72.61.39.160`
- Nova janela abre (ou janela atual muda)

---

### PASSO 3: Abrir Pasta do Projeto

**Na janela conectada:**

1. Menu: `File` → `Open Folder`
   - Ou: `Ctrl+K Ctrl+O`

2. Campo de texto aparece

3. Digite caminho: `/home/deploy/sistemas-businesseducation`

4. Clique: `OK`

5. Aguarde carregar (~5 segundos)

**Resultado:**
Barra lateral esquerda mostra estrutura completa do projeto.

---

## INTERFACE VISUAL COMPLETA

### BARRA LATERAL ESQUERDA (Explorador de Arquivos)

```
📁 SISTEMAS-BUSINESSEDUCATION [SSH: deploy@72.61.39.160]
  ├─ 📁 data
  │   ├─ 📁 production
  │   │   ├─ 📁 logs
  │   │   ├─ 📁 postgres
  │   │   ├─ 📁 redis
  │   │   └─ 📁 uploads
  │   └─ 📁 staging
  │       ├─ 📁 logs
  │       ├─ 📁 postgres
  │       ├─ 📁 redis
  │       └─ 📁 uploads
  ├─ 📁 infrastructure
  │   └─ 📁 docker
  │       ├─ 📄 docker-compose.production.yml
  │       └─ 📄 docker-compose.staging.yml
  ├─ 📄 .gitignore
  ├─ 📄 ANALISE_ARQUITETURA.md
  ├─ 📄 ARQUITETURA_DESACOPLADA.md
  ├─ 📄 CONFIGURACAO_VPS.md
  └─ 📄 README.md
```

**O que você pode fazer:**

**Expandir/Colapsar pastas:**
- Clica na seta > ao lado da pasta
- Ou clica no nome da pasta

**Abrir arquivo:**
- Clica no nome do arquivo
- Abre no editor central

**Criar novo arquivo:**
- Botão direito na pasta → `New File`
- Ou ícone + ao passar mouse

**Criar nova pasta:**
- Botão direito → `New Folder`

**Deletar:**
- Botão direito → `Delete`
- Ou tecla `Delete`

**Renomear:**
- Botão direito → `Rename`
- Ou tecla `F2`

---

### EDITOR CENTRAL (Edição de Arquivos)

**Abrir arquivo:**
Clica no arquivo na barra lateral → abre no centro

**Editar:**
- Edita normalmente como qualquer arquivo
- Syntax highlighting (coloração de código)
- Autocomplete funciona
- IntelliSense funciona

**Salvar:**
- `Ctrl+S` (salva direto no servidor)
- Ou `File` → `Save`

**Desfazer/Refazer:**
- `Ctrl+Z` (desfazer)
- `Ctrl+Y` (refazer)

**Múltiplos arquivos:**
- Abre vários arquivos (abas no topo)
- `Ctrl+Tab` (alterna entre abas)
- `Ctrl+W` (fecha aba atual)

---

### TERMINAL INTEGRADO (Parte Inferior)

**Abrir terminal:**
- Pressione `` Ctrl+` `` (acento grave)
- Ou: `View` → `Terminal`
- Ou: `Ctrl+J`

**O que você tem:**
- Terminal SSH direto no servidor
- Prompt: `deploy@srv1104116:~/sistemas-businesseducation$`
- Pode rodar qualquer comando

**Comandos úteis:**
```bash
# Ver containers Docker
docker ps

# Logs de staging
docker compose -f infrastructure/docker/docker-compose.staging.yml logs -f

# Git status
git status

# Atualizar código
git pull origin main

# Navegar pastas
cd data/staging
ls -la

# Ver arquivo
cat README.md
```

**Múltiplos terminais:**
- Clica no `+` (cria novo terminal)
- Alterna entre terminais no dropdown
- `Ctrl+Shift+` `` ` `` (novo terminal)

---

## OPERAÇÕES COMUNS

### 1. EDITAR ARQUIVO DE CONFIGURAÇÃO

**Cenário:** Editar `docker-compose.staging.yml`

**Passos:**
1. Barra lateral → `infrastructure/docker/`
2. Clica em `docker-compose.staging.yml`
3. Arquivo abre no editor
4. Edita (ex: mudar porta 5433 → 5434)
5. `Ctrl+S` (salva)
6. Terminal: `docker compose -f infrastructure/docker/docker-compose.staging.yml restart`

**Resultado:** Configuração atualizada

---

### 2. CRIAR NOVO SERVICE

**Cenário:** Criar estrutura para auth-service

**Passos:**
1. Botão direito em `services/` → `New Folder`
2. Nome: `auth-service`
3. Botão direito em `auth-service/` → `New Folder`
4. Nome: `src`
5. Botão direito em `src/` → `New File`
6. Nome: `index.js`
7. Edita arquivo, adiciona código
8. `Ctrl+S` (salva)

**Resultado:** Estrutura criada no servidor

---

### 3. VER LOGS DE CONTAINER

**Cenário:** Ver logs do PostgreSQL staging

**Passos:**
1. Terminal integrado: `` Ctrl+` ``
2. Digite: `docker logs docker-postgres-staging-1 -f --tail=50`
3. Logs aparecem em tempo real
4. `Ctrl+C` para parar

**Resultado:** Visualiza logs sem sair do VS Code

---

### 4. COMMIT E PUSH PARA GITHUB

**Cenário:** Salvar alterações no GitHub

**Opção A: Interface Visual (Git Panel)**

1. Barra lateral esquerda → Ícone Git (terceiro ícone)
2. Vê arquivos modificados
3. Clica em `+` ao lado de cada arquivo (stage)
4. Campo de mensagem: digita "adiciona auth-service"
5. `Ctrl+Enter` ou clica em ✓ (commit)
6. Clica em `...` → `Push`

**Opção B: Terminal**

```bash
git add .
git commit -m "adiciona auth-service"
git push origin main
```

**Resultado:** Código vai pro GitHub

---

### 5. BUSCAR EM TODOS ARQUIVOS

**Cenário:** Encontrar onde "POSTGRES_PASSWORD" está definido

**Passos:**
1. `Ctrl+Shift+F` (abre busca)
2. Digite: `POSTGRES_PASSWORD`
3. Vê todos arquivos que contêm
4. Clica no resultado → abre arquivo

**Resultado:** Busca global instantânea

---

## ATALHOS ESSENCIAIS

### NAVEGAÇÃO

| Atalho | Função |
|--------|--------|
| `Ctrl+P` | Busca rápida de arquivo (digite nome) |
| `Ctrl+Shift+F` | Busca em todos arquivos |
| `Ctrl+Shift+E` | Foca no explorador de arquivos |
| `Ctrl+B` | Mostra/esconde barra lateral |
| `` Ctrl+` `` | Mostra/esconde terminal |
| `Ctrl+Tab` | Alterna entre arquivos abertos |

### EDIÇÃO

| Atalho | Função |
|--------|--------|
| `Ctrl+S` | Salvar arquivo |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Ctrl+F` | Buscar no arquivo atual |
| `Ctrl+H` | Buscar e substituir |
| `Ctrl+/` | Comentar/descomentar linha |
| `Alt+↑/↓` | Move linha pra cima/baixo |
| `Ctrl+D` | Seleciona próxima ocorrência |

### GIT

| Atalho | Função |
|--------|--------|
| `Ctrl+Shift+G` | Abre painel Git |
| `Ctrl+Enter` | Commit (quando em campo mensagem) |

### TERMINAL

| Atalho | Função |
|--------|--------|
| `` Ctrl+` `` | Abre/fecha terminal |
| `` Ctrl+Shift+` `` | Novo terminal |
| `Ctrl+C` | Cancela comando rodando |

---

## CONFIGURAÇÕES RECOMENDADAS

### SALVAR AUTOMATICAMENTE

**Evita esquecer de salvar:**

1. `Ctrl+,` (abre settings)
2. Busca: `auto save`
3. Muda de `off` para `afterDelay`
4. Delay: `1000` (1 segundo)

**Resultado:** Salva automaticamente após 1s de inatividade

---

### FORMATO AO SALVAR

**Formata código automaticamente:**

1. `Ctrl+,` (abre settings)
2. Busca: `format on save`
3. Marca checkbox: ✓ `Editor: Format On Save`

**Resultado:** Código fica padronizado automaticamente

---

### EXCLUIR DA BUSCA

**Ignora pastas grandes na busca:**

1. `Ctrl+,` (abre settings)
2. Busca: `files exclude`
3. Adiciona padrões:
   - `**/node_modules`
   - `**/data/**`
   - `**/.git`

**Resultado:** Busca fica mais rápida

---

## WORKFLOWS PRÁTICOS

### WORKFLOW 1: DESENVOLVIMENTO NORMAL

```
1. Abre VS Code Remote SSH
2. Navega até arquivo (Ctrl+P)
3. Edita código
4. Salva (Ctrl+S)
5. Terminal: testa comando
6. Se funciona:
   - Git add/commit/push
7. Se não funciona:
   - Desfaz (Ctrl+Z) ou continua editando
```

---

### WORKFLOW 2: DEBUGGING

```
1. Arquivo com erro aberto
2. Terminal integrado embaixo
3. Roda comando que gera erro
4. Lê erro no terminal
5. Edita arquivo (no mesmo VS Code)
6. Salva
7. Roda comando novamente
8. Repete até funcionar
```

**Vantagem:** Vê código e terminal ao mesmo tempo (split view)

---

### WORKFLOW 3: DEPLOY STAGING → PRODUÇÃO

```
1. Edita arquivos
2. Git commit/push
3. Terminal: git pull origin main (no servidor)
4. Terminal: docker compose -f docker-compose.staging.yml up -d --build
5. Testa staging (navegador)
6. Se funciona:
   Terminal: ./scripts/deploy-production.sh
7. Monitora logs (terminal integrado)
```

**Vantagem:** Tudo no mesmo lugar, zero troca de janelas

---

## COMPARAÇÃO: ANTES vs DEPOIS

### ANTES (SSH Puro)

**Editar arquivo:**
```bash
ssh deploy@72.61.39.160
cd ~/sistemas-businesseducation
nano infrastructure/docker/docker-compose.staging.yml
# Edita com setas, difícil
Ctrl+O (salva)
Ctrl+X (sai)
```

**Ver estrutura:**
```bash
ls -la
cd data
ls -la
cd staging
ls -la
# Confuso, lento
```

**Múltiplas tarefas:**
```
Janela 1: SSH (editar)
Janela 2: SSH (terminal)
Janela 3: Navegador (documentação)
Janela 4: Git (commits)
# 4 janelas, confusão
```

---

### DEPOIS (VS Code Remote)

**Editar arquivo:**
- Clica no arquivo na árvore
- Edita visualmente
- Ctrl+S (salva)
- Pronto

**Ver estrutura:**
- Árvore visual na esquerda
- Clica pra expandir
- Vê tudo de uma vez

**Múltiplas tarefas:**
- 1 janela só
- Editor central
- Terminal embaixo
- Git integrado
- Tudo organizado

---

## TROUBLESHOOTING

### PROBLEMA 1: "Could not establish connection"

**Causa:** Senha errada ou servidor inacessível

**Solução:**
1. Verifica senha do usuário deploy
2. Testa SSH manual: `ssh deploy@72.61.39.160`
3. Se SSH funciona, VS Code também deve funcionar
4. Reconecta: `Ctrl+Shift+P` → `Remote-SSH: Connect to Host`

---

### PROBLEMA 2: Terminal não abre

**Causa:** Configuração de shell

**Solução:**
1. `` Ctrl+` `` (força abrir)
2. Se não funciona: `View` → `Terminal`
3. Se ainda não: `Ctrl+Shift+P` → `Terminal: Create New Terminal`

---

### PROBLEMA 3: Arquivos não aparecem

**Causa:** Pasta não aberta corretamente

**Solução:**
1. `File` → `Open Folder`
2. Digite: `/home/deploy/sistemas-businesseducation`
3. OK
4. Recarrega janela: `Ctrl+Shift+P` → `Reload Window`

---

### PROBLEMA 4: Mudanças não salvam

**Causa:** Permissões de arquivo

**Solução:**
```bash
# No terminal
cd ~/sistemas-businesseducation
sudo chown -R deploy:deploy .
```

Isso garante que usuário deploy tem permissão em todos arquivos.

---

### PROBLEMA 5: Conexão cai frequentemente

**Causa:** Timeout de conexão SSH

**Solução:**
Adicionar keep-alive no config SSH local.

**No seu PC (não no servidor):**

Arquivo: `C:\Users\caiqu\.ssh\config`

Adicionar:
```
Host 72.61.39.160
  ServerAliveInterval 60
  ServerAliveCountMax 3
```

Salva e reconecta.

---

## DICAS AVANÇADAS

### DICA 1: Split View (Editor Dividido)

**Como:**
- Arrasta aba de arquivo para a direita
- Ou: `Ctrl+\` (split vertical)

**Usa quando:**
- Editar 2 arquivos ao mesmo tempo
- Ver código e documentação lado a lado

---

### DICA 2: Zen Mode (Foco Total)

**Como:**
- `Ctrl+K Z`

**O que faz:**
- Esconde tudo, só editor
- Sem distrações

**Sair:**
- `Esc Esc`

---

### DICA 3: Command Palette (Todos Comandos)

**Como:**
- `Ctrl+Shift+P`

**O que tem:**
- TODOS comandos do VS Code
- Busca rápida
- Não precisa decorar atalhos

**Exemplos:**
- `Git: Pull`
- `Terminal: Create New Terminal`
- `File: Save All`

---

### DICA 4: Integrated Git (Git Visual)

**Como:**
- `Ctrl+Shift+G` (abre painel Git)

**O que vê:**
- Arquivos modificados
- Diff visual (antes vs depois)
- Commit/push visual

**Vantagem:**
- Não precisa memorizar comandos Git
- Vê mudanças visualmente

---

## EXTENSÕES ÚTEIS (OPCIONAL)

### Para Node.js

- **ESLint:** Linter JavaScript/TypeScript
- **Prettier:** Formatador de código
- **npm Intellisense:** Autocomplete para imports

### Para Docker

- **Docker:** Gerenciar containers visualmente

### Para PostgreSQL

- **PostgreSQL:** Client SQL integrado

**Como instalar:**
- `Ctrl+Shift+X` → busca → instala

---

## CONCLUSÃO

### O QUE VOCÊ TEM AGORA:

**Interface completa para gerenciar VPS:**
- ✅ Árvore de arquivos visual
- ✅ Editor de código com syntax highlighting
- ✅ Terminal integrado
- ✅ Git integrado
- ✅ Busca em arquivos
- ✅ Tudo em uma janela

**Comparado a:**
- ❌ SSH puro (só texto, difícil)
- ❌ SFTP separado (troca de janelas)
- ❌ File Manager web (limitado)

**VS Code Remote SSH = melhor de todos**

---

### PRÓXIMOS PASSOS:

Com interface gráfica configurada, fica mais fácil:
1. Implementar Node.js services
2. Editar configurações Docker
3. Ver e editar código
4. Monitorar logs
5. Fazer commits Git

---

**Documento criado em:** 04/11/2025  
**Última atualização:** 04/11/2025  
**Status:** ✅ VS Code Remote SSH configurado e funcional  
**Servidor:** deploy@72.61.39.160  
**Pasta:** /home/deploy/sistemas-businesseducation

