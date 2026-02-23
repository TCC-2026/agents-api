const express = require('express');
const app = express();

// 1. O Express já filtra URL e Método com a função .get()
app.get('/api/ola', (req, res) => {
  
  // 2. e 3. O .json() já define o cabeçalho e já faz o stringify automático
  return res.json({ mensagem: "Olá, mundo 2!" });
  
});
// 4. O 404 é tratado automaticamente se nenhuma rota bater.

app.listen(3000);