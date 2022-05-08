FROM node:17-alpine

RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    pango-dev \
    font-noto

COPY ./packages/egg /app/packages/egg
COPY ./config /app/config
WORKDIR /app/packages/egg

RUN yarn install --frozen-lockfile
RUN yarn build
RUN yarn autoclean

EXPOSE 9090
CMD ["yarn", "start"]