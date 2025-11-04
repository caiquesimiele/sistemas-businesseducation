# 🚀 Servidor Node.js - Loja CAPEC

Servidor simples para testar o **visual 100% funcional** da loja.

---

## 📦 Instalar Dependências

```bash
cd services/loja
npm install
```

---

## ▶️ Rodar Servidor

```bash
npm start
```

Ou com auto-reload:
```bash
npm run dev
```

---

## 🌐 Acessar no Navegador

Abra: **http://localhost:3000**

### Páginas disponíveis:
- **Loja:** http://localhost:3000/
- **Home:** http://localhost:3000/home
- **FAQ:** http://localhost:3000/faq
- **Ajuda:** http://localhost:3000/ajuda
- **Pedidos:** http://localhost:3000/pedidos
- **Sucesso:** http://localhost:3000/sucesso

---

## ✅ O Que Funciona

- ✅ **Visual completo** (CSS/JS carregam)
- ✅ **Imagens** (todas carregam)
- ✅ **Animações** (nuvens, foguetes)
- ✅ **Responsivo** (mobile + desktop)
- ✅ **Navegação** entre páginas

---

## ⚠️ O Que NÃO Funciona (Ainda)

- ❌ Carregar produtos do banco
- ❌ Processar pagamentos
- ❌ Calcular frete
- ❌ Enviar formulários

**Próximo passo:** Implementar essas funcionalidades!

---

## 🛑 Parar Servidor

Pressione **Ctrl + C** no terminal

---

## 📂 Estrutura

```
services/loja/
├── server.js         # Servidor Express
├── package.json      # Dependências
└── README.md         # Este arquivo

public/loja/
├── *.html            # Páginas HTML
├── css/              # Estilos
├── js/               # Scripts
└── images/           # Imagens
```

---

**Status:** ✅ Pronto para testar visual!

