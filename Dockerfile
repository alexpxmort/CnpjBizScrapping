FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Define variáveis de ambiente
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia apenas os arquivos necessários para instalar as dependências

COPY package.json ./
# Instala as dependências
RUN yarn

# Copia todos os arquivos restantes
COPY . .

# Comando padrão para iniciar o aplicativo
CMD [ "yarn", "start" ]
