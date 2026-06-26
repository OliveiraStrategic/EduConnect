const dashboardRepository = require('./dashboard.repository');
const redis = require('../cache/redis');

class DashboardController {
  /**
   * Retorna as métricas da dashboard (com caching otimizado).
   */
  async getMetrics(req, res, next) {
    try {
      const cacheKey = 'dashboard:metrics';

      // Tenta obter do cache
      const cachedMetrics = await redis.get(cacheKey);
      if (cachedMetrics) {
        console.log('[CACHE HIT] Métricas de dashboard obtidas do Redis.');
        return res.status(200).json({
          success: true,
          message: 'Métricas da dashboard obtidas do cache.',
          data: cachedMetrics
        });
      }

      // Fallback PostgreSQL
      console.log('[CACHE MISS] Consultando métricas de dashboard no PostgreSQL.');
      const metrics = await dashboardRepository.getMetrics();
      const recentActivity = await dashboardRepository.getRecentActivityFeed(5);

      const dashboardData = { metrics, recentActivity };

      // Grava no cache
      await redis.set(cacheKey, dashboardData, 300); // TTL 5 minutos

      return res.status(200).json({
        success: true,
        message: 'Métricas da dashboard obtidas com sucesso.',
        data: dashboardData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna os dados agregados de atividades recentes (com caching otimizado).
   */
  async getActivity(req, res, next) {
    try {
      const cacheKey = 'dashboard:activity';

      // Tenta obter do cache
      const cachedActivity = await redis.get(cacheKey);
      if (cachedActivity) {
        console.log('[CACHE HIT] Dados de atividade obtidos do Redis.');
        return res.status(200).json({
          success: true,
          message: 'Dados de atividades obtidos do cache.',
          data: cachedActivity
        });
      }

      // Fallback PostgreSQL
      console.log('[CACHE MISS] Consultando dados de atividade no PostgreSQL.');
      const activityData = await dashboardRepository.getActivityData(15);

      // Grava no cache
      await redis.set(cacheKey, activityData, 300); // TTL 5 minutos

      return res.status(200).json({
        success: true,
        message: 'Dados de atividades do sistema obtidos com sucesso.',
        data: activityData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
