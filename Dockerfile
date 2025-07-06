 # Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiando arquivos de dependências
COPY package.json yarn.lock ./

# Instalando dependências
RUN yarn install --frozen-lockfile

# Copiando o código fonte
COPY . .

# Build da aplicação
RUN yarn build

# Estágio de produção
FROM node:20-alpine

WORKDIR /app

# Copiando apenas os arquivos necessários do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Instalando apenas dependências de produção
RUN yarn install --production --frozen-lockfile

# Expondo a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start"]