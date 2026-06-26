# --- Estágio 1: Compilação ---
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Argumento para URL da API injetado no momento de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Executa build de produção estática (gera pasta dist)
RUN npm run build

# --- Estágio 2: Servidor Estático ---
FROM nginx:1.25-alpine

# Copia arquivos estáticos compilados do estágio 1 para pasta do Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copia configurações personalizadas do Nginx (opcional, para lidar com SPA Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
