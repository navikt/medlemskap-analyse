FROM node:20@sha256:fd0115473b293460df5b217ea73ff216928f2b0bb7650c5e7aa56aae4c028426 AS builder

WORKDIR /app

RUN --mount=type=secret,id=NODE_AUTH_TOKEN sh -c \
    'npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)'
RUN npm config set @navikt:registry=https://npm.pkg.github.com

COPY package.json package-lock.json ./
RUN npm ci

COPY next.config.ts tsconfig.json ./
COPY app app
COPY config config
COPY data data

RUN npm run build

FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12@sha256:aadeb54a6d25fa4f8c47160ca38cfdc2ff7a6227b5d41c8544f9cffb80a31823 AS runtime

WORKDIR /app

COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]

FROM scratch AS export
COPY --from=builder /app/.next/static /