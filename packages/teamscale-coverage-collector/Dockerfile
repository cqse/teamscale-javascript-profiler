# -- build image --

FROM node:21.7.3-slim AS build

COPY . /collector
WORKDIR /collector
RUN npm install -g pnpm && pnpm install
RUN pnpm clean && pnpm build

FROM build AS deploy

ENTRYPOINT ["pnpm", "collector"]
