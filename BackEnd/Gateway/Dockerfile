FROM node:carbon

WORKDIR /Gateway
ADD . /Gateway
RUN yarn install

CMD ["node", "server.js"]