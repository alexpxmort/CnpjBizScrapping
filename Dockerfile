# Estágio de construção
FROM node:18.18.2-bullseye-slim AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

# Instalação completa das dependências (incluindo desenvolvimento)
RUN yarn install

COPY . .

# Estágio final
FROM node:18.18.2-bullseye-slim

# Instalação do Chromium
RUN apt-get update \
    && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia apenas os arquivos necessários do estágio de construção
COPY --from=builder /usr/src/app .

# Instalação apenas das dependências de produção
RUN yarn install --production

CMD ["yarn", "start"]
