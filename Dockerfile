FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY app.js server.js ./
COPY lib ./lib
COPY stores ./stores
COPY public ./public
COPY benchmark ./benchmark
COPY dashboard ./dashboard
COPY deploy ./deploy
ENV NODE_ENV=production PORT=3000 CATALOG_MODE=reference CAPTCHA_MODE=off
USER node
EXPOSE 3000
CMD ["node", "deploy/server.js"]
