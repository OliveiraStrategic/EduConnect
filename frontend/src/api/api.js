import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Fila de requisições pendentes aguardando a renovação do token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de requisição: injeta o JWT Access Token no cabeçalho
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('educonnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta: manipula erros 401 para fluxo automático de Refresh Token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Caso a resposta de erro seja 401 e a requisição ainda não tenha sido reprocessada
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Evita loops infinitos se a própria rota de refresh falhar com 401
      if (originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('educonnect_token');
        localStorage.removeItem('educonnect_user');
        localStorage.removeItem('educonnect_refresh_token');
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Enfileira a requisição falha para reprocessamento
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('educonnect_refresh_token');

      if (!refreshToken) {
        // Sem refresh token, desloga e redireciona
        localStorage.removeItem('educonnect_token');
        localStorage.removeItem('educonnect_user');
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }

      try {
        // Tenta renovar o par de tokens chamando o backend de forma assíncrona
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );

        if (response.data && response.data.success) {
          const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('educonnect_token', newToken);
          localStorage.setItem('educonnect_refresh_token', newRefreshToken);

          // Atualiza a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Libera a fila de requisições pendentes com o novo token
          processQueue(null, newToken);

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Caso a renovação falhe, limpa credenciais e envia para login
        processQueue(refreshError, null);
        localStorage.removeItem('educonnect_token');
        localStorage.removeItem('educonnect_user');
        localStorage.removeItem('educonnect_refresh_token');
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || 'Erro de conexão com o servidor.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
