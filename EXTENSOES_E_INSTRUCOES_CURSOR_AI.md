# EXTENSÕES E INSTRUÇÕES CURSOR AI

**Guia completo das extensões instaladas e melhores práticas para desenvolvimento com Cursor AI**

Data: 04/11/2025

---

## 📦 EXTENSÕES INSTALADAS

### 1. **Remote - SSH** (Microsoft)

**Para que serve:**
- Conectar no VPS via SSH direto do VS Code
- Editar arquivos remotos como se fossem locais
- Abrir terminal remoto integrado

**Como usar:**
1. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
2. Digite: `deploy@147.93.37.46`
3. Senha: [sua senha do VPS]
4. Pronto! Agora você está editando direto no servidor

**Melhor prática:**
- Use para editar arquivos no VPS
- Evita SFTP manual
- Terminal integrado já está no servidor
- Salva automaticamente no servidor

**Quando usar:**
- ✅ Editar código no VPS
- ✅ Ver logs em tempo real
- ✅ Rodar comandos Docker
- ✅ Gerenciar arquivos remotos

---

### 2. **GitLens** (GitKraken)

**Para que serve:**
- Ver histórico de commits inline
- Mostrar quem editou cada linha (blame)
- Comparar versões
- Navegar no histórico

**Como usar:**
- Hover sobre linha → mostra último commit
- `Ctrl+Shift+P` → "GitLens: Show File History"
- Clique no ícone GitLens na sidebar

**Melhor prática:**
- Use para entender mudanças antigas
- Ver quando um bug foi introduzido
- Comparar versões de arquivo

**Quando usar:**
- ❓ "Quem mudou isso?"
- ❓ "Quando isso foi editado?"
- ❓ "Como estava antes?"

---

### 3. **Error Lens** (usernamehw)

**Para que serve:**
- Mostra erros inline (na própria linha)
- Destaca warnings visualmente
- Erros aparecem direto no código

**Como usar:**
- Automático! Só instalar
- Erros aparecem com fundo vermelho
- Warnings aparecem com fundo amarelo

**Melhor prática:**
- Deixa ativo sempre
- Resolve erros conforme aparecem
- Não deixa acumular warnings

**Vantagem:**
- Vê erros sem abrir painel
- Mais rápido para corrigir
- Menos distração

---

### 4. **ESLint** (dbaeumer)

**Para que serve:**
- Analisa código JavaScript/TypeScript
- Encontra bugs antes de rodar
- Padroniza estilo de código

**Como usar:**
- Automático após configurar `.eslintrc`
- Mostra erros em tempo real
- `Ctrl+Shift+P` → "ESLint: Fix all auto-fixable Problems"

**Melhor prática:**
- Configure `.eslintrc` no projeto
- Use com Prettier
- Rode fix antes de commit

**Quando usar:**
- ✅ Todo projeto Node.js
- ✅ Código novo
- ✅ Antes de commit

---

### 5. **Prettier** (esbenp)

**Para que serve:**
- Formata código automaticamente
- Padroniza indentação, espaços, quebras
- Funciona com JS, TS, JSON, CSS, HTML

**Como usar:**
- `Ctrl+Shift+P` → "Format Document"
- Ou salva com auto-format ativado

**Melhor prática:**
- Configure para formatar ao salvar
- Crie `.prettierrc` no projeto
- Use com ESLint

**Configuração recomendada:**
```json
// settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

### 6. **Docker** (Microsoft)

**Para que serve:**
- Gerenciar containers visualmente
- Ver logs de containers
- Start/stop containers com 1 clique
- Inspecionar imagens e volumes

**Como usar:**
- Ícone Docker na sidebar esquerda
- Clique direito em container → Start/Stop/Logs
- Ver containers rodando em tempo real

**Melhor prática:**
- Use para ver logs rapidamente
- Start/stop containers visuais
- Inspecionar volumes e networks

**Quando usar:**
- ✅ Ver se containers estão rodando
- ✅ Ler logs sem terminal
- ✅ Restart rápido de serviços

---

### 7. **Database Client** (cweijan)

**Para que serve:**
- Conectar em PostgreSQL, MySQL, Redis
- Executar queries visualmente
- Ver tabelas e dados
- Export/import dados

**Como usar:**
1. Ícone banco de dados na sidebar
2. "+ New Connection"
3. PostgreSQL:
   - Host: `147.93.37.46`
   - Port: `5433` (staging) ou `5432` (production)
   - User: `postgres`
   - Password: `staging123` ou `prod123changeme`

**Melhor prática:**
- Crie conexões salvas
- Use para queries de teste
- Explore tabelas visualmente

**Vantagem:**
- Não precisa de ferramenta externa
- Tudo no VS Code
- Rápido para testes

---

### 8. **Database Client JDBC** (cweijan)

**Para que serve:**
- Adapter para Database Client
- Suporta mais bancos via JDBC

**Como usar:**
- Automático com Database Client

---

### 9. **Thunder Client** (Thunder Client)

**Para que serve:**
- Testar APIs REST
- Alternativa ao Postman
- Integrado no VS Code

**Como usar:**
1. Ícone raio na sidebar
2. New Request
3. Configure URL, method, headers, body
4. Send

**Melhor prática:**
- Crie Collections (pastas de requests)
- Salve requests importantes
- Use Environment variables

**Exemplo:**
```
POST http://147.93.37.46:3001/api/auth/login
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "123456"
}
```

**Quando usar:**
- ✅ Testar endpoints da API
- ✅ Debug de integrações
- ✅ Validar responses

---

### 10. **REST Client** (humao)

**Para que serve:**
- Testar APIs via arquivos `.http`
- Versionável com Git
- Mais simples que Thunder Client

**Como usar:**
1. Cria arquivo `test.http`
2. Escreve request:
```http
### Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "123456"
}

### Get user
GET http://localhost:3001/api/users/me
Authorization: Bearer {{token}}
```
3. Clique em "Send Request" acima da request

**Melhor prática:**
- Crie pasta `requests/` com `.http` files
- Commita no Git (requests de exemplo)
- Use variables com `{{nome}}`

**Quando usar:**
- ✅ Requests que precisa versionar
- ✅ Documentação de API
- ✅ Testes rápidos

---

### 11. **PostgreSQL** (dkollman)

**Para que serve:**
- Syntax highlighting para SQL
- Autocomplete de queries
- Formatação de SQL

**Como usar:**
- Automático em arquivos `.sql`

---

### 12. **npm Intellisense** (christian-kohler)

**Para que serve:**
- Autocomplete de imports
- Sugere pacotes npm instalados

**Como usar:**
- Automático ao digitar `import`
- Sugere módulos ao digitar nome

**Exemplo:**
```javascript
import express from 'express'; // Autocomplete sugere express
```

---

### 13. **Path Intellisense** (christian-kohler)

**Para que serve:**
- Autocomplete de caminhos de arquivos
- Sugere pastas e arquivos ao importar

**Como usar:**
- Automático ao digitar path
- Ctrl+Space para forçar sugestões

**Exemplo:**
```javascript
import { auth } from './middleware/auth'; // Autocomplete sugere pastas/arquivos
```

---

### 14. **Material Icon Theme** (PKief)

**Para que serve:**
- Ícones bonitos para arquivos/pastas
- Visual mais organizado
- Identifica tipo de arquivo rapidamente

**Como usar:**
- Automático após ativar
- `Ctrl+Shift+P` → "Material Icons: Activate"

**Vantagem:**
- Encontra arquivos mais rápido visualmente
- `.js` tem ícone diferente de `.json`
- Pastas têm ícones específicos

---

### 15. **Composer** (devsense)

**Para que serve:**
- IntelliSense para PHP
- Autocomplete de classes/funções PHP
- Útil para código PHP legado

**Como usar:**
- Automático em arquivos `.php`
- Ctrl+Space para sugestões

**Quando usar:**
- ✅ Editar código PHP existente (loja atual)
- ✅ Manter sistemas legados

---

### 16. **PHP** (devsense)

**Para que serve:**
- Suporte completo para PHP
- Debug, IntelliSense, Linting

**Como usar:**
- Automático em arquivos `.php`

---

### 17. **PHP Profiler** (devsense)

**Para que serve:**
- Profiling de performance PHP
- Identifica código lento

**Como usar:**
- Xdebug + PHP Profiler
- Ver onde PHP está lento

---

### 18. **IntelliPHP** (devsense)

**Para que serve:**
- AI para PHP
- Autocomplete inteligente PHP

**Como usar:**
- Automático em arquivos `.php`

---

### 19. **HTML CSS Support** (ecmel)

**Para que serve:**
- Autocomplete de classes CSS em HTML
- IntelliSense para IDs e classes

**Como usar:**
- Automático em arquivos HTML

---

### 20. **PowerShell** (Microsoft)

**Para que serve:**
- Suporte para PowerShell
- Syntax highlighting
- Debugging PowerShell

**Como usar:**
- Automático em arquivos `.ps1`
- Terminal integrado usa PowerShell

---

### 21. **Container Tools** (Microsoft)

**Para que serve:**
- Gerenciar containers Docker
- Autocomplete em Dockerfile
- IntelliSense docker-compose.yml

**Como usar:**
- Automático em `Dockerfile` e `docker-compose.yml`
- Valida sintaxe
- Sugere comandos Docker

---

### 22. **Rainbow CSV** (mechatroner)

**Para que serve:**
- Colorir colunas de CSV/TSV
- Facilita leitura de arquivos dados
- Queries em CSV

**Como usar:**
- Automático em arquivos `.csv`
- Cores diferentes por coluna

**Quando usar:**
- ✅ Ler exports de dados
- ✅ Analisar logs CSV
- ✅ Importar/exportar dados

---

### 23. **vscode-pdf** (tomoki1207)

**Para que serve:**
- Visualizar PDFs no VS Code
- Não precisa abrir programa externo

**Como usar:**
- Clica em arquivo `.pdf` → abre no VS Code

---

### 24. **YAML** (Red Hat)

**Para que serve:**
- Syntax highlighting YAML
- Validação de sintaxe
- Autocomplete

**Como usar:**
- Automático em arquivos `.yml` e `.yaml`

**Quando usar:**
- ✅ Editar `docker-compose.yml`
- ✅ Configurações Kubernetes (futuro)
- ✅ Arquivos de config YAML

---

## 🚀 RECURSOS DO CURSOR AI

### 1. **COMPOSER** (`Ctrl+I`)

**O que faz:**
- Edita múltiplos arquivos simultaneamente
- Cria estruturas completas
- Refatora código em larga escala

**Como usar:**
```
Ctrl+I → "criar estrutura auth-service completa"
Ctrl+I → "adicionar validação em todos controllers"
Ctrl+I → "refatorar OrderManager para usar eventos"
```

**Vantagens:**
- ✅ Vê diff visual antes de aplicar
- ✅ Pode rejeitar mudanças específicas
- ✅ Edita múltiplos arquivos de uma vez
- ✅ Entende contexto do projeto inteiro

**Quando usar:**
- Criar services/modules novos
- Refatorações grandes
- Adicionar features em múltiplos arquivos
- Migrar código entre arquivos

**Melhor prática:**
- Seja específico no prompt
- Revise diff antes de aceitar
- Use @ para referenciar arquivos: `@OrderManager.php`

---

### 2. **CHAT** (`Ctrl+L`)

**O que faz:**
- Responde perguntas sobre código
- Explica erros
- Sugere soluções
- Debug interativo

**Como usar:**
```
Ctrl+L → "explica como funciona o StoreResolver"
Ctrl+L → "por que esse erro: [cola erro]"
Ctrl+L → "como melhorar performance dessa query?"
```

**Vantagens:**
- ✅ Contexto completo do projeto
- ✅ Analisa stack traces
- ✅ Sugere múltiplas soluções
- ✅ Explica código complexo

**Quando usar:**
- Entender código existente
- Debug de erros
- Perguntas sobre arquitetura
- Sugestões de melhorias

**Melhor prática:**
- Cole erros completos
- Use @ para referenciar contexto:
  - `@arquivo.js` → foca nesse arquivo
  - `@pasta/` → foca nessa pasta
  - `@web` → busca na web

---

### 3. **INLINE EDIT** (`Ctrl+K`)

**O que faz:**
- Edita código inline (na linha)
- Mudanças pequenas e rápidas
- Aceita/rejeita visualmente

**Como usar:**
```
1. Seleciona código
2. Ctrl+K
3. "adicionar try-catch"
4. Aceita ou rejeita
```

**Vantagens:**
- ✅ Muito rápido
- ✅ Edições cirúrgicas
- ✅ Não abre painel separado

**Quando usar:**
- Mudanças pequenas em 1 arquivo
- Adicionar validação
- Refatorar função específica
- Corrigir bug pontual

---

### 4. **AGENTS** (Ícone robô)

**O que faz:**
- Execução autônoma de tarefas
- Roda comandos
- Edita arquivos
- Resolve tarefas complexas

**Vantagens:**
- ✅ Trabalho autônomo
- ✅ Múltiplas etapas

**Desvantagem:**
- ⚠️ Pode travar em comandos longos

**Solução:** Ver seção "EVITAR TRAVAMENTOS" abaixo

---

## ⚠️ EVITAR TRAVAMENTOS DO CURSOR AI

### PROBLEMA: Cursor trava ao executar comandos

**Causas:**
1. Comando demora muito (> 1 minuto)
2. Output muito grande (milhares de linhas)
3. Comando interativo (pede senha/confirmação)

---

### ✅ SOLUÇÃO 1: Terminal Manual (Recomendado)

**Como fazer:**
1. ``Ctrl+` `` (abre terminal integrado)
2. Roda comando manualmente
3. Cursor não trava porque você controla

**Comandos que DEVEM ser manuais:**
```bash
# ❌ NÃO deixe Cursor rodar automaticamente:
docker compose up -d --build    # Demora, muito output
docker pull                     # Download grande
npm install                     # Milhares de linhas
npm run build                   # Pode demorar
git clone [repo grande]         # Demora muito

# ✅ OK para Cursor rodar:
git status                      # Rápido
git add .                       # Rápido
git commit -m "msg"            # Rápido
docker ps                       # Rápido
ls -la                         # Rápido
cat arquivo.txt                # Rápido (arquivo pequeno)
```

---

### ✅ SOLUÇÃO 2: Múltiplas Abas de Terminal

**Como fazer:**
1. Abre terminal: ``Ctrl+` ``
2. Clica em `+` para nova aba
3. Roda comando longo na aba 1
4. Trabalha na aba 2 enquanto aguarda

**Vantagem:**
- Não bloqueia trabalho
- Vê progresso quando quiser
- Alterna entre abas

---

### ✅ SOLUÇÃO 3: Comando em Background

**Para comandos sem necessidade de output:**
```bash
# Adiciona & no final
docker compose up -d &

# Ou redireciona output
npm install > install.log 2>&1 &
```

**Cursor não espera = não trava**

---

### ✅ SOLUÇÃO 4: Dividir Comandos

**Em vez de:**
```bash
docker compose up -d --build && npm install && npm run migrate
```

**Faça:**
```bash
# Comando 1
docker compose up -d --build
# Aguarda terminar...

# Comando 2
npm install
# Aguarda terminar...

# Comando 3
npm run migrate
```

**Cursor processa melhor comandos separados**

---

### ✅ SOLUÇÃO 5: Aumentar Timeout

**Se Cursor trava em comandos normais:**

1. `Ctrl+,` (abre settings)
2. Busca: `timeout`
3. Aumenta:
   - `Cursor: Command Timeout` → 120000 (2 min)
   - `Cursor: Agent Timeout` → 300000 (5 min)

---

## 🔍 DEBUGGING COM CURSOR AI

### MÉTODO 1: Chat + Stack Trace

**Quando tiver erro:**
1. Copia mensagem de erro completa
2. `Ctrl+L`
3. Cola erro
4. Pergunta: "O que está causando?"

**Cursor analisa:**
- Stack trace
- Arquivos relacionados
- Contexto do erro

---

### MÉTODO 2: Composer + Busca Global

**Para erros em múltiplos arquivos:**
1. `Ctrl+I`
2. "encontrar e corrigir erro: [descrição]"
3. Cursor busca em todo projeto
4. Mostra locais problemáticos
5. Sugere correções

**Vantagem:** Vê diff visual antes de aplicar

---

### MÉTODO 3: @ para Contexto Focado

**No chat, use @ para focar:**
```
Ctrl+L → @OrderManager.php por que triggerERPIntegration não roda?
Ctrl+L → @orders/ verificar erros nessa pasta
Ctrl+L → @web buscar solução para erro PostgreSQL connection timeout
```

---

### MÉTODO 4: Error Lens + Hover

**Para erros inline:**
1. Error Lens mostra erro na linha (automático)
2. Hover sobre erro → mostra detalhes
3. `Ctrl+L` → pergunta sobre erro específico

---

## 📋 WORKFLOWS RECOMENDADOS

### WORKFLOW 1: Desenvolvimento Normal

```
1. Edita código
   - Cursor Composer (Ctrl+I) para mudanças grandes
   - Manual para mudanças pequenas

2. Salva (Ctrl+S)

3. Terminal manual: roda teste
   Ctrl+` → npm run dev

4. Se erro:
   - Copia erro completo
   - Ctrl+L → cola erro
   - Aplica solução sugerida
   - Repete teste
```

**Nunca trava: comandos são manuais**

---

### WORKFLOW 2: Criar Nova Feature

```
1. Ctrl+I (Composer)

2. Prompt detalhado:
   "criar auth-service em services/auth/ com:
   - Express router
   - Controllers: login, register, refresh
   - Middleware: validateToken
   - Types TypeScript
   - Conexão PostgreSQL"

3. Revisa diff visual

4. Aceita mudanças

5. Terminal manual:
   Ctrl+` → npm run dev

6. Testa endpoint:
   Thunder Client ou REST Client
```

---

### WORKFLOW 3: Debug de Erro Complexo

```
1. Copia stack trace completo

2. Ctrl+L (Chat)

3. Cola erro + contexto:
   "@OrderManager.php erro ao integrar Omie:
   [cola stack trace]"

4. Cursor analisa e sugere causas

5. Pede mostrar código suspeito:
   "mostra linha 1699 do OrderManager"

6. Aplica correção sugerida

7. Terminal manual: testa novamente

8. Repete até resolver
```

---

### WORKFLOW 4: Refatoração Grande

```
1. Ctrl+I (Composer)

2. Prompt específico:
   "refatorar OrderManager.php:
   - Remover triggerERPIntegration direto
   - Criar evento OrderApproved
   - Event Bus publica evento
   - OrderIntegrator escuta evento
   - Manter backward compatibility"

3. Revisa diff em cada arquivo

4. Aceita mudanças

5. Git:
   git add .
   git commit -m "refactor: desacopla integração ERP"

6. Terminal manual: testa integração

7. Se funciona: push
   Se não: Ctrl+L debug
```

---

### WORKFLOW 5: Trabalho no VPS

```
1. Conecta via Remote SSH:
   Ctrl+Shift+P → "Remote-SSH: Connect"
   deploy@147.93.37.46

2. Abre pasta:
   File → Open Folder → /home/deploy/sistemas-businesseducation

3. Agora está editando direto no servidor!

4. Terminal integrado já está no VPS:
   Ctrl+` → (comandos rodam no servidor)

5. Edita código normalmente

6. Salva (Ctrl+S) → salva direto no servidor

7. Testa imediatamente:
   docker ps
   docker logs [container]
   curl localhost:3001/health

8. Commit:
   git add .
   git commit -m "fix: [descrição]"
   git push
```

---

## 🎯 ATALHOS ESSENCIAIS

### Cursor AI
- `Ctrl+L` → Chat (perguntas/debug)
- `Ctrl+I` → Composer (edições grandes)
- `Ctrl+K` → Inline edit (edições pequenas)

### VS Code Geral
- ``Ctrl+` `` → Terminal integrado
- `Ctrl+P` → Busca arquivo rápido
- `Ctrl+Shift+F` → Busca em todos arquivos
- `Ctrl+Shift+P` → Command Palette
- `Ctrl+,` → Settings
- `Ctrl+B` → Toggle sidebar
- `Ctrl+J` → Toggle painel inferior
- `Ctrl+\` → Split editor
- `Ctrl+W` → Fecha aba
- `Ctrl+Tab` → Navega entre abas

### Git
- `Ctrl+Shift+G` → Source Control
- Clica em arquivo → vê diff visual
- Clica em + → Stage file
- Digita mensagem → Ctrl+Enter → Commit

### Terminal
- ``Ctrl+` `` → Toggle terminal
- `Ctrl+Shift+5` → Split terminal
- `Ctrl+Shift+`` → Novo terminal
- `Alt+↑/↓` → Navega entre terminais

---

## 💡 DICAS FINAIS

### 1. **Sempre tenha terminal manual aberto**
- ``Ctrl+` `` → deixa aberto sempre
- Use para comandos Docker, npm, git
- Evita travamentos

### 2. **Use Cursor AI para:**
- ✅ Editar código (Ctrl+I, Ctrl+K)
- ✅ Explicar erros (Ctrl+L)
- ✅ Sugerir soluções (Ctrl+L)
- ✅ Buscar problemas (Ctrl+I)
- ✅ Refatorar código (Ctrl+I)
- ✅ Entender código legado (Ctrl+L)

### 3. **Use Terminal manual para:**
- ✅ Docker commands
- ✅ npm install/build
- ✅ Git operations grandes
- ✅ Comandos que demoram
- ✅ Comandos interativos

### 4. **Conecte no VPS com Remote SSH**
- Edita direto no servidor
- Não precisa SFTP manual
- Terminal já está no servidor
- Salva automaticamente

### 5. **Use Database Client**
- Conecta em PostgreSQL
- Testa queries visualmente
- Explora dados facilmente

### 6. **Use Thunder Client**
- Testa APIs REST
- Mais rápido que Postman
- Integrado no VS Code

### 7. **Aproveite GitLens**
- Entende histórico de mudanças
- Vê quem editou o que
- Debug temporal de bugs

### 8. **Error Lens sempre ativo**
- Vê erros inline
- Mais rápido para corrigir
- Menos distração

### 9. **Formate código com Prettier**
- Configure format on save
- Código sempre padronizado
- Menos conflitos Git

### 10. **Use @ no chat**
- `@arquivo` → foca contexto
- `@pasta/` → analisa pasta
- `@web` → busca online
- Respostas mais precisas

---

## ✅ CHECKLIST DE PRODUTIVIDADE

### Ao iniciar desenvolvimento:
- [ ] Conecta Remote SSH (se trabalhar no VPS)
- [ ] Abre terminal integrado (``Ctrl+` ``)
- [ ] Abre pasta do projeto
- [ ] Git pull (atualiza código)
- [ ] Docker ps (verifica containers)

### Durante desenvolvimento:
- [ ] Usa Composer (Ctrl+I) para mudanças grandes
- [ ] Usa terminal manual para comandos longos
- [ ] Salva frequentemente (Ctrl+S)
- [ ] Testa imediatamente após mudanças
- [ ] Commit incremental (pequenos commits)

### Ao encontrar erro:
- [ ] Copia stack trace completo
- [ ] Abre Chat (Ctrl+L)
- [ ] Cola erro + contexto
- [ ] Testa solução sugerida
- [ ] Documenta solução (se complexa)

### Antes de commit:
- [ ] Format code (Prettier)
- [ ] Fix ESLint errors
- [ ] Testa funcionalidade
- [ ] Revisa diff (Git)
- [ ] Mensagem commit clara

### Antes de push:
- [ ] Testa em staging
- [ ] Verifica logs (sem erros)
- [ ] Confirma testes passam
- [ ] Push para GitHub
- [ ] Verifica CI/CD (futuro)

---

## 🎓 APRENDIZADO CONTÍNUO

### Pratique estes workflows:
1. **Semana 1:** Dominar Composer (Ctrl+I)
2. **Semana 2:** Dominar Chat (Ctrl+L) + debugging
3. **Semana 3:** Dominar Remote SSH
4. **Semana 4:** Dominar Database Client + Thunder Client

### Metas:
- ✅ Criar service completo com Composer
- ✅ Debug erro complexo com Chat
- ✅ Trabalhar 1 dia inteiro via Remote SSH
- ✅ Testar API completa com Thunder Client
- ✅ Fazer refatoração grande sem travar Cursor

---

## 📚 RECURSOS ADICIONAIS

### Documentação:
- **Cursor AI:** https://docs.cursor.sh
- **Docker:** https://docs.docker.com
- **PostgreSQL:** https://www.postgresql.org/docs
- **Node.js:** https://nodejs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs

### Comunidades:
- **Cursor Discord:** https://discord.gg/cursor
- **Stack Overflow:** Para erros específicos
- **GitHub Issues:** Para bugs de extensões

---

**PRONTO! Você tem todas as ferramentas e conhecimento para desenvolvimento eficiente com Cursor AI.**

**Próximos passos:**
1. Praticar workflows básicos
2. Implementar primeiro service (auth)
3. Dominar terminal manual (evitar travamentos)
4. Explorar cada extensão na prática

**Dúvidas? Use `Ctrl+L` e pergunte para o Cursor AI! 🚀**

