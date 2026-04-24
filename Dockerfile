FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev \
  && npx prisma generate \
  && npm cache clean --force

COPY src ./src
COPY server.js ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
