# 🔄 FLUXO DE TRABALHO: STAGING → PRODUÇÃO

## **📋 ESTRUTURA DE BRANCHES**

```
📦 Git Repository
├── 🟡 staging   → TESTES (porta 3000 no VPS)
└── 🟢 main      → PRODUÇÃO (porta 80/443 no VPS)
```

---

## **🔧 PASSO A PASSO: EDITAR E TESTAR**

### **1️⃣ EDITAR CÓDIGO LOCAL (sempre na branch staging)**

No Cursor, **verifique que está na branch staging**:
- Olhe no canto inferior esquerdo: deve mostrar `staging`
- Se mostrar `main`, clique e selecione `staging`

---

### **2️⃣ SUBIR ALTERAÇÕES PARA STAGING**

**Opção A: Interface Visual (Cursor)**
1. **Ctrl+Shift+G** (abre Source Control)
2. Clica no **+** ao lado de "Changes"
3. Escreve mensagem: `"ajustes no FAQ"`
4. **Ctrl+Enter** (faz commit)
5. Clica nos **3 pontinhos (...)** → **Push**

**Opção B: Terminal**
```powershell
cd "C:\Users\caiqu\OneDrive\Backup One Drive\Área de Trabalho\Sistemas\sistemas-businesseducation"
git add .
git commit -m "ajustes no FAQ"
git push origin staging
```

---

### **3️⃣ TESTAR NO VPS (STAGING)**

**No PowerShell/CMD:**
```bash
ssh deploy@72.61.39.160

# Ir para o diretório
cd ~/sistemas-businesseducation

# Garantir que está na branch staging
git checkout staging

# Puxar alterações
git pull origin staging

# Ir para o serviço
cd services/loja

# Instalar dependências (só na primeira vez)
npm install

# Rodar servidor de testes
npm start
```

**Acesse no navegador:**
```
http://72.61.39.160:3000
```

---

### **4️⃣ SE FUNCIONAR: COLOCAR EM PRODUÇÃO**

**A) Fazer merge de staging → main (no local)**
```powershell
cd "C:\Users\caiqu\OneDrive\Backup One Drive\Área de Trabalho\Sistemas\sistemas-businesseducation"

# Mudar para branch main
git checkout main

# Fazer merge da staging
git merge staging

# Enviar para GitHub
git push origin main
```

**B) Atualizar produção no VPS**
```bash
ssh deploy@72.61.39.160

cd ~/sistemas-businesseducation

# Mudar para branch main
git checkout main

# Puxar alterações
git pull origin main

# Reiniciar serviço de produção
# (quando configurarmos Nginx/PM2)
```

---

## **📊 RESUMO VISUAL**

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL (seu PC)                                             │
│  ├── Edita código                                           │
│  └── Commit → Push para STAGING                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB                                                      │
│  ├── 🟡 branch staging (código de testes)                   │
│  └── 🟢 branch main (código de produção)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  VPS (servidor)                                             │
│  ├── 🟡 staging → porta 3000 (testes)                       │
│  │   └── git pull origin staging                            │
│  │                                                           │
│  └── 🟢 main → porta 80/443 (produção)                      │
│      └── git pull origin main (só depois de testar)         │
└─────────────────────────────────────────────────────────────┘
```

---

## **🎯 REGRAS DE OURO**

✅ **SEMPRE edite na branch `staging` primeiro**  
✅ **SEMPRE teste no VPS antes de mover para produção**  
✅ **NUNCA edite direto na branch `main`**  
❌ **NUNCA faça push direto para `main` sem testar**

---

## **🔍 COMANDOS ÚTEIS**

### Ver em qual branch você está:
```bash
git branch
```

### Mudar de branch:
```bash
git checkout staging   # vai para staging
git checkout main      # vai para main
```

### Ver diferenças entre staging e main:
```bash
git checkout main
git diff staging
```

### Desfazer último commit (se errou):
```bash
git reset --soft HEAD~1
```

---

## **⚠️ TROUBLESHOOTING**

### Erro: "Your local changes would be overwritten"
```bash
# Salvar alterações temporariamente
git stash

# Puxar alterações
git pull origin staging

# Recuperar alterações salvas
git stash pop
```

### Erro: "conflicts"
```bash
# Ver arquivos em conflito
git status

# Editar manualmente os arquivos com conflito
# Depois:
git add .
git commit -m "resolve conflitos"
git push origin staging
```

---

## **📝 CHECKLIST DIÁRIO**

Antes de começar a trabalhar:
- [ ] Verificar que está na branch `staging`
- [ ] `git pull origin staging` (pegar última versão)

Depois de editar:
- [ ] Commit → Push para `staging`
- [ ] Testar no VPS (porta 3000)
- [ ] Se funcionar → Merge para `main`

---

**✨ AGORA VOCÊ TEM UM FLUXO SEGURO E PROFISSIONAL!**

