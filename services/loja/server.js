// SERVER NODE.JS - LOJA CAPEC
// Servidor simples para testar visual 100% funcional

const express = require('express');
const path = require('path');
const app = express();

// Configurações
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, '../../public/loja');

// Middlewares
app.use(express.static(PUBLIC_DIR));
app.use(express.json());

// ROTAS - Servir HTMLs

// Página principal (loja)
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'demo-capec.html'));
});

// Home
app.get('/home', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'home.html'));
});

// FAQ
app.get('/faq', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'faq.html'));
});

// Ajuda
app.get('/ajuda', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'ajuda.html'));
});

// Pedidos
app.get('/pedidos', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pedidos.html'));
});

// Sucesso
app.get('/sucesso', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'sucesso.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 SERVIDOR NODE.JS RODANDO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('📄 PÁGINAS DISPONÍVEIS:');
  console.log(`   • Loja:    http://localhost:${PORT}/`);
  console.log(`   • Home:    http://localhost:${PORT}/home`);
  console.log(`   • FAQ:     http://localhost:${PORT}/faq`);
  console.log(`   • Ajuda:   http://localhost:${PORT}/ajuda`);
  console.log(`   • Pedidos: http://localhost:${PORT}/pedidos`);
  console.log(`   • Sucesso: http://localhost:${PORT}/sucesso`);
  console.log('');
  console.log('✅ Visual 100% funcional!');
  console.log('🛑 Pressione Ctrl+C para parar');
  console.log('');
});

