FROM node:17-alpine

COPY ./packages/egg /app/packages/egg
COPY ./config /app/config
WORKDIR /app/packages/egg

# install packages
RUN npm i

# transpile TypeScript code
RUN npm run build

# prune dependancies
RUN npm prune --production

CMD ["npm", "run", "start"]