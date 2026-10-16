import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import atracoesRoutes from './routes/atracoes.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    nome: 'Balsas Experience API',
    versao: '1.0.0',
    descricao: 'API de experiências turísticas em Balsas-MA',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/atracoes', atracoesRoutes);

// Qualquer caminho que não casou com as rotas acima
app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Middleware de erro: quatro parâmetros, sempre por último
app.use((erro, req, res, next) => {
  console.error(erro);
  const status = erro.status ?? 500;
  const mensagem = status === 500 ? 'Erro interno no servidor' : 'Corpo da requisição inválido';
  res.status(status).json({ erro: mensagem });
});

app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Servidor executando na porta ${PORTA}`);
});