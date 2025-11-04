# 🎨 Como Abrir o HTML Demo no Navegador

## ✅ Arquivo Pronto: `demo-capec.html`

**O que é:**
- HTML REAL capturado do servidor em produção
- Código EXATO que o PHP gera (zero perdas!)
- 212.89 KB de HTML puro
- Visual 100% idêntico ao sistema atual

---

## 🚀 Como Abrir

### Opção A: Diretamente no Navegador (Simples)

1. Navegue até a pasta:
   ```
   C:\Users\caiqu\OneDrive\Backup One Drive\Área de Trabalho\Sistemas\sistemas-businesseducation\public\loja\
   ```

2. Clique duas vezes em `demo-capec.html`

3. Ou arraste o arquivo para o navegador

**⚠️ Limitação:** Alguns recursos podem não funcionar (JavaScript que faz requisições ao backend)

---

### Opção B: Com Servidor Local (Completo)

**Instalar servidor simples:**

```powershell
# Opção 1: Python (se tiver instalado)
cd "C:\...\sistemas-businesseducation\public\loja"
python -m http.server 8000

# Opção 2: Node.js (se tiver instalado)
cd "C:\...\sistemas-businesseducation\public\loja"
npx serve -p 8000

# Opção 3: PHP (se tiver instalado)
cd "C:\...\sistemas-businesseducation\public\loja"
php -S localhost:8000
```

**Depois abrir:**
```
http://localhost:8000/demo-capec.html
```

---

## 📂 Estrutura de Arquivos

```
public/loja/
├── demo-capec.html     ✅ HTML demo (ESTE ARQUIVO)
├── css/                ✅ 9 arquivos CSS
├── js/                 ✅ 8 arquivos JS
└── images/             ✅ 151 imagens
```

---

## 🎯 O Que Funciona

### ✅ Visual Completo:
- Layout responsivo
- Cores e fontes
- Imagens e ícones
- Animações CSS
- Estrutura HTML

### ⚠️ Limitações (sem backend):
- Não carrega produtos (precisa API)
- Não processa pagamentos
- Não calcula frete
- Não envia formulários

**Isso é esperado!** Este é apenas um teste VISUAL.

---

## 🔄 Próximos Passos

1. **AGORA:** Validar visual no navegador
2. **DEPOIS:** Implementar backend Node.js
3. **FINAL:** Conectar frontend ao backend

---

## 💡 Dica

Para ver o código fonte:
- Abra o arquivo com VS Code
- Ou clique com botão direito → "Exibir código-fonte da página"

---

**Criado:** 04/11/2025 01:45  
**Origem:** HTML capturado do servidor em produção  
**URL original:** https://loja.businesseducation.com.br/stores/s4vwcb5f-capec/

