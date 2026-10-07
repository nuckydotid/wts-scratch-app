# Cloud Run image for the team server (build from the repo root: `gcloud builds submit --config team-server/cloudbuild.yaml`
# or `gcloud run deploy --source . ` with this Dockerfile). One instance only: room state lives in memory.
FROM oven/bun:1.4.2
WORKDIR /app
COPY package.json bun.lock* bunfig.toml ./
COPY team-server/package.json team-server/
# bun.lock references patched dependencies, so the install fails without their patch files.
COPY patches patches/
RUN cd team-server && bun install --production --ignore-scripts
COPY team-server team-server
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
USER bun
CMD ["bun", "team-server/src/index.ts"]
