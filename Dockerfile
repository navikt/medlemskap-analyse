FROM --platform=linux/amd64 europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-slim@sha256:a1440303664b12241b224b53c6037731e040f53bd640e0bad9e83b47c10033fe AS runtime

WORKDIR /app

COPY .next/standalone /app
COPY config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
