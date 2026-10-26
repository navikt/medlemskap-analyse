FROM --platform=linux/amd64 europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-slim@sha256:3b1cb2ce5b04f62f33765b1e83eba6cc240ec66b4213604273023754fbcdbfcb AS runtime

WORKDIR /app

COPY .next/standalone /app
COPY config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
