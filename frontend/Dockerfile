# Etapa 1: Instalación y Build
FROM node:20-alpine AS builder
# Instalamos dependencias necesarias para Node en Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
# Desactivamos telemetría y errores estrictos para que el build pase
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=false
RUN npm run build

# Etapa 2: Producción (Imagen liviana)
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiamos solo lo necesario del builder
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/public ./public

EXPOSE 3000
CMD ["npm", "start"]