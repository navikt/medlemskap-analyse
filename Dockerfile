FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-dev@sha256:9e1b9bcea61579b6282e6adeaae8ab00fa05a89ee906e5f70d1d40785527c741 AS builder


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

FROM --platform=linux/amd64 europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-slim@sha256:217c47ea627c17fa51c83af4332619fa125dff6df1cbd9221ed4425cc1dd7c27 AS runtime

WORKDIR /app

COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]

FROM scratch AS export
COPY --from=builder /app/.next/static /