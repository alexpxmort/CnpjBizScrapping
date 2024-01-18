FROM node:18.18.2-bullseye-slim AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY . .



FROM node:18.18.2-bullseye-slim

RUN  apt-get update \
     && apt-get install -y chromium \
     && rm -rf `yarn cache dir` \
     && rm -rf /root/.cache \
     && apt-get clean

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production

CMD ['yarn','start']

 
