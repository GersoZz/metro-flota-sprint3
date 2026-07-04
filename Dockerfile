# Etapa de build: instala dependencias, genera el cliente Prisma y compila TypeScript.
FROM node:22-slim AS build

# Prisma necesita openssl para generar el cliente.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos prisma antes del install porque el postinstall corre prisma generate.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa de runtime: imagen mas liviana, solo con lo necesario para correr.
FROM node:22-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Copia el codigo compilado y el cliente Prisma generado.
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated

EXPOSE 3000

# Aplica migraciones pendientes y arranca el servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
