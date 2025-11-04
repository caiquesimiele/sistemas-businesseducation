# 🚀 Deploy Rápido no VPS - Testar Visual

**Fluxo:** PC → GitHub → VPS → Navegador

---

## 📋 PASSO A PASSO

### 1️⃣ NO PC - Subir para GitHub

```powershell
# Na pasta sistemas-businesseducation
git add .
git commit -m "Servidor Node.js + frontend completo"
git push origin main
```

### 2️⃣ NO VPS - Baixar código

```bash
# Conectar no VPS
ssh deploy@SEU_IP_VPS

# Ir para pasta do projeto
cd ~/sistemas-businesseducation

# Baixar última versão
git pull origin main
```

### 3️⃣ NO VPS - Instalar Node.js (se não tiver)

```bash
# Verificar se tem Node.js
node --version

# Se não tiver, instalar:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4️⃣ NO VPS - Instalar dependências

```bash
cd ~/sistemas-businesseducation/services/loja
npm install
```

### 5️⃣ NO VPS - Iniciar servidor

```bash
# Rodar em background (não trava terminal)
nohup npm start > /dev/null 2>&1 &

# Ver se está rodando
ps aux | grep node
```

### 6️⃣ NO NAVEGADOR - Testar

```
http://SEU_IP_VPS:3000
```

**Exemplo:**
```
http://45.79.241.123:3000
```

---

## 🔄 CICLO DE DESENVOLVIMENTO

### Fazer Alteração:
1. Editar no PC
2. `git add . && git commit -m "ajuste X" && git push`
3. No VPS: `git pull`
4. No VPS: `pm2 restart loja` (ou matar e rodar de novo)
5. Testar no navegador

---

## 🛑 PARAR SERVIDOR NO VPS

```bash
# Ver processos Node.js
ps aux | grep node

# Matar processo (substituir PID)
kill PID_NUMBER
```

---

## ⚡ MELHOR: Usar PM2 (Auto-reinicia)

```bash
# Instalar PM2 (só primeira vez)
sudo npm install -g pm2

# Iniciar com PM2
cd ~/sistemas-businesseducation/services/loja
pm2 start server.js --name "loja"

# Ver status
pm2 status

# Ver logs
pm2 logs loja

# Reiniciar
pm2 restart loja

# Parar
pm2 stop loja
```

---

## 🔓 ABRIR PORTA 3000 NO VPS

```bash
# Verificar firewall
sudo ufw status

# Abrir porta 3000
sudo ufw allow 3000/tcp

# Verificar de novo
sudo ufw status
```

---

## 📝 COMANDOS RÁPIDOS

### No PC:
```powershell
git add . && git commit -m "update" && git push
```

### No VPS:
```bash
cd ~/sistemas-businesseducation
git pull
cd services/loja
pm2 restart loja
```

### No Navegador:
```
http://SEU_IP_VPS:3000
```

---

## ✅ CHECKLIST

- [ ] Git push do PC
- [ ] Git pull no VPS
- [ ] Node.js instalado no VPS
- [ ] npm install executado
- [ ] Porta 3000 aberta
- [ ] Servidor rodando
- [ ] Acessível no navegador

---

**Pronto!** Agora você pode: editar → push → pull → testar! 🚀

