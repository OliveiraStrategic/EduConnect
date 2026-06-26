const ioredis = require('ioredis');
require('dotenv').config();

let redisClient = null;
let isRedisConnected = false;

if (process.env.REDIS_URL) {
  try {
    redisClient = new ioredis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false, // Prevents hanging requests if Redis goes down
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[REDIS] Falha de conexão persistente. Desativando cache e operando em modo Fallback PostgreSQL.');
          isRedisConnected = false;
          return null; // Stops retrying
        }
        return Math.min(times * 200, 1000);
      }
    });

    redisClient.on('connect', () => {
      console.log('[REDIS] Conectado ao servidor de cache.');
      isRedisConnected = true;
    });

    redisClient.on('error', (err) => {
      console.error('[REDIS ERROR] Erro na conexão do cache:', err.message);
      isRedisConnected = false;
    });
  } catch (error) {
    console.error('[REDIS INIT ERROR] Falha ao instanciar cliente Redis:', error.message);
    isRedisConnected = false;
  }
}

/**
 * Obtém um valor do cache com tratamento de falha (resiliência).
 */
const get = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[REDIS FAILBACK] Falha de leitura da chave "${key}":`, error.message);
    return null; // Fallback automático para consulta ao PostgreSQL
  }
};

/**
 * Grava um valor no cache com TTL (tempo de vida) em segundos.
 */
const set = async (key, value, ttlSeconds = 300) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.set(key, stringValue, 'EX', ttlSeconds);
  } catch (error) {
    console.error(`[REDIS FAILBACK] Falha de escrita no cache da chave "${key}":`, error.message);
  }
};

/**
 * Remove um registro específico do cache (invalidação).
 */
const del = async (key) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`[REDIS FAILBACK] Falha ao deletar chave "${key}" do cache:`, error.message);
  }
};

/**
 * Invalida múltiplas chaves usando padrão de busca (ex: "users:*").
 */
const delPattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[REDIS CACHE] Chaves invalidadas para o padrão "${pattern}":`, keys);
    }
  } catch (error) {
    console.error(`[REDIS FAILBACK] Falha ao invalidar chaves por padrão "${pattern}":`, error.message);
  }
};

module.exports = {
  get,
  set,
  del,
  delPattern,
  isRedisConnected: () => isRedisConnected
};
