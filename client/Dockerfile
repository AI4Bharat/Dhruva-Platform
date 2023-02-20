FROM node:lts-alpine

WORKDIR /usr/app

EXPOSE 3000

RUN apk update \
    && apk upgrade \
    && apk add --no-cache --upgrade bash \
    && apk add git



RUN chmod +x /usr/app

CMD yarn install \
    && yarn run dev

