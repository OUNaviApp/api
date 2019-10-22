FROM node:12

COPY . /src/app

WORKDIR /src/app

RUN npm install -g yarn

RUN yarn

RUN yarn build

CMD ["yarn", "start"]