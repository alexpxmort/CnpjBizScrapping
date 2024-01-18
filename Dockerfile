FROM ghcr.io/puppeteer/puppeteer:21.0.3

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Adiciona um usuário não root
RUN groupadd -r myuser && useradd -r -g myuser -G audio,video myuser \
    && mkdir -p /home/myuser/Downloads \
    && chown -R myuser:myuser /home/myuser \
    && chown -R myuser:myuser /usr/src/app

USER myuser

# Garante que o usuário tem permissões de leitura e escrita em /usr/src/app e /home/myuser/Downloads
RUN chmod -R 755 /usr/src/app 

COPY package.json ./
RUN yarn
COPY . .

CMD ["yarn", "start"]
