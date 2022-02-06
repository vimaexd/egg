FROM node:17-alpine

COPY ./packages/egg /app/packages/egg
COPY ./config /app/config
WORKDIR /app/packages/egg

# Install packages
RUN npm i

# Transpile TypeScript code
RUN npm run build

CMD ["npm", "run", "start"]