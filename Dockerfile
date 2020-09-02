FROM node:12-alpine AS build

COPY . /var/www/backend

WORKDIR /var/www/backend

RUN npm ci

CMD ["npx", "pm2", "start", "--no-daemon", "npm", "--name", "rickmorty47 telegram server", "--", "start"]
