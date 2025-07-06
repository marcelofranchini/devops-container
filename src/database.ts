import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'devops_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;

export const createPool = async (): Promise<mysql.Pool> => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    
    try {
      const connection = await pool.getConnection();
      console.log('✅ Conectado ao MySQL com sucesso!');
      connection.release();
    } catch (error) {
      console.error('❌ Erro ao conectar ao MySQL:', error);
      throw error;
    }
  }
  
  return pool;
};

export const getPool = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Pool de conexão não foi inicializado. Chame createPool() primeiro.');
  }
  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Pool de conexão fechado');
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};