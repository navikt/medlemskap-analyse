FROM --platform=linux/amd64 europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-slim@sha256:1f94181405cb9046511d9c4981db32c17fa043c916008c78fd5999a23785db2b AS runtime

WORKDIR /app

COPY .next/standalone /app
COPY config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
