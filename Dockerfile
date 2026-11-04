FROM --platform=linux/amd64 europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:20-slim@sha256:eaaf87de55139b327fdbeacc0f7c4389ac31991217cfc83eccf054c39da3af8f AS runtime

WORKDIR /app

COPY .next/standalone /app
COPY config ./config

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
