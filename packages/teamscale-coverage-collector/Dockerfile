# -- build image --

FROM node:16-slim AS build

COPY . /collector
WORKDIR /collector
RUN yarn set version berry && yarn install
RUN yarn clean && yarn build 

FROM build AS deploy

ENTRYPOINT ["yarn", "collector"]
