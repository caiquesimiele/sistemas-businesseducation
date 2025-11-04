# 🚀 Como Iniciar o Servidor Node.js

**Objetivo:** Testar o visual da loja 100% funcional

---

## 📋 PRÉ-REQUISITOS

Você precisa ter instalado:
- ✅ **Node.js** (versão 18 ou superior)

**Não tem Node.js?** Baixe aqui: https://nodejs.org

---

## ⚡ PASSO A PASSO

### 1. Abrir Terminal no VS Code

- Pressione **Ctrl + `** (til)
- Ou: Menu > Terminal > New Terminal

### 2. Navegar até a pasta do serviço

```powershell
cd services/loja
```

### 3. Instalar dependências (PRIMEIRA VEZ APENAS)

```powershell
npm install
```

**Aguarde:** ~30 segundos (baixa Express, EJS, etc)

### 4. Iniciar servidor

```powershell
npm start
```

**Você verá:**
```
🚀 SERVIDOR NODE.JS RODANDO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 URL: http://localhost:3000

📄 PÁGINAS DISPONÍVEIS:
   • Loja:    http://localhost:3000/
   • Home:    http://localhost:3000/home
   • FAQ:     http://localhost:3000/faq
   • Ajuda:   http://localhost:3000/ajuda
   • Pedidos: http://localhost:3000/pedidos
   • Sucesso: http://localhost:3000/sucesso

✅ Visual 100% funcional!
🛑 Pressione Ctrl+C para parar
```

### 5. Abrir no navegador

Abra: **http://localhost:3000**

---

## 🎯 TESTAR VISUAL

Agora você pode:
1. ✅ Ver a loja CAPEC funcionando
2. ✅ Navegar entre as páginas
3. ✅ Ver nuvens animadas
4. ✅ Testar responsividade (F12 > Device Toggle)
5. ✅ Confirmar que está idêntico ao atual

---

## 🛑 PARAR SERVIDOR

No terminal onde está rodando:
- Pressione **Ctrl + C**

---

## 🔄 REINICIAR (se fizer alterações)

```powershell
# Parar (Ctrl + C)
# Iniciar novamente
npm start
```

---

## ❓ PROBLEMAS COMUNS

### "npm não é reconhecido"
**Solução:** Instale Node.js (link acima) e reinicie o terminal

### "Porta 3000 já está em uso"
**Solução:** Edite `server.js`, linha 8:
```javascript
const PORT = 3001; // ou 3002, 3003, etc
```

### "Cannot find module 'express'"
**Solução:** Execute `npm install` novamente

---

## ✅ PRÓXIMOS PASSOS

Depois de validar o visual:
1. ⏳ Implementar backend completo
2. ⏳ Conectar com PostgreSQL
3. ⏳ Criar APIs REST
4. ⏳ Deploy no VPS

---

**Status:** 🎨 Visual 100% pronto para teste!

