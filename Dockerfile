FROM --platform=linux/amd64 europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-slim@sha256:217c47ea627c17fa51c83af4332619fa125dff6df1cbd9221ed4425cc1dd7c27 AS runtime

WORKDIR /app

COPY .next/standalone /app
COPY config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
