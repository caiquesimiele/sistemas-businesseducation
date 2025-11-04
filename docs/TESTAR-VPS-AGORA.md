# 🚀 TESTAR NO VPS - PASSOS RÁPIDOS

**Objetivo:** Ver o visual funcionando no VPS

---

## 1️⃣ Conectar no VPS

```bash
ssh deploy@SEU_IP_VPS
```

---

## 2️⃣ Baixar código do GitHub

```bash
cd ~/sistemas-businesseducation
git pull origin main
```

---

## 3️⃣ Instalar Node.js (se não tiver)

```bash
# Verificar
node --version

# Se não tiver, instalar:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 4️⃣ Instalar dependências

```bash
cd ~/sistemas-businesseducation/services/loja
npm install
```

---

## 5️⃣ Abrir porta 3000

```bash
sudo ufw allow 3000/tcp
```

---

## 6️⃣ Rodar servidor

```bash
npm start
```

**Ou em background:**
```bash
nohup npm start > /dev/null 2>&1 &
```

---

## 7️⃣ Testar no navegador

```
http://SEU_IP_VPS:3000
```

---

## ✅ DEVE FUNCIONAR:

- ✅ Visual completo
- ✅ CSS/JS carregam
- ✅ Nuvens animadas
- ✅ Todas as 6 páginas

---

## 🎯 PRÓXIMOS PASSOS (Alinhados aos 3 Objetivos):

### 1. **Integrações Desacopladas:**
- [ ] Implementar Event Bus (Redis)
- [ ] Criar eventos: ORDER_CREATED, PAYMENT_CONFIRMED, etc
- [ ] Listeners independentes para Omie, Getnet, Make

### 2. **Staging/Production:**
- [ ] Configurar Nginx
- [ ] Criar subdomínios:
  - `staging.loja.businesseducation.com.br`
  - `capec.loja.businesseducation.com.br`
- [ ] SSL/HTTPS

### 3. **SSO (Single Sign-On):**
- [ ] Implementar serviço de auth
- [ ] JWT tokens
- [ ] Integrar com loja, forms, dashs

---

**Agora:** Testar visual no VPS! 🚀

