FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DB_PATH=/data/klassno/klassno.sqlite
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/* \
    && npm ci --omit=dev \
    && mkdir -p /data/klassno && chown node:node /data/klassno
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/klassno-entrypoint
COPY --from=build /app/dist ./dist
COPY server ./server
VOLUME ["/data"]
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/klassno-entrypoint"]
CMD ["node", "server/index.mjs"]
