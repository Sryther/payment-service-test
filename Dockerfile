FROM node:4.6

WORKDIR /mnt/app

ADD . ./

ENV NODE_ENV production
ENV PORT 8000
ENV DB_DOMAIN localhost
ENV DB_PORT 27017

RUN npm install

CMD node index.js