import express, { Request, Response } from 'express';
import { createPool, testConnection, closePool } from './database';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/healthcheck', async (req: Request, res: Response) => {
  try {
    // Testar conexão com o banco
    const dbStatus = await testConnection();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus ? 'connected' : 'disconnected',
        host: process.env.DB_HOST || 'mysql',
        database: process.env.DB_NAME || 'devops_db'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Erro ao verificar saúde da aplicação',
      database: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Rota para testar conexão com banco
app.get('/db-test', async (req: Request, res: Response) => {
  try {
    const pool = await createPool();
    const [rows] = await pool.execute('SELECT 1 as test');
    
    res.json({
      status: 'success',
      message: 'Conexão com banco funcionando!',
      result: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao conectar com banco',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Inicializar conexão com banco e iniciar servidor
const startServer = async () => {
  try {
    // Criar pool de conexão
    await createPool();
    
    // Iniciando o servidor
    app.listen(port, () => {
      console.log(`🚀 Servidor rodando na porta ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/healthcheck`);
      console.log(`🗄️  DB test: http://localhost:${port}/db-test`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, fechando servidor...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, fechando servidor...');
  await closePool();
  process.exit(0);
});

startServer();