FROM node:17

COPY ./packages/egg /app/packages/egg
COPY ./config /app/config
WORKDIR /app/packages/egg

# RUN apt-get update \
#     && apt-get install build-essential libcairo2-dev libpango1.0-dev -y 

# install packages
RUN npm i

# transpile TypeScript code
RUN npm run build

# prune dependancies
RUN npm prune --production

EXPOSE 9090
CMD ["npm", "run", "start"]