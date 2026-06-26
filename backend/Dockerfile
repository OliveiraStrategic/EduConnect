# Estágio único de produção leve
FROM node:18-alpine

# Cria diretório de trabalho no container
WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala apenas dependências de produção para reduzir imagem
RUN npm ci --only=production

# Copia o código da aplicação
COPY . .

# Expõe a porta configurada
EXPOSE 5000

# Variáveis padrão
ENV NODE_ENV=production

# Executa o entrypoint
CMD ["node", "app.js"]
