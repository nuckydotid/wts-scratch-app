# Cloud Run image (build from repo root: gcloud run deploy --source . with this Dockerfile, or `gcloud builds submit`).
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock* bunfig.toml ./
COPY backend/package.json backend/
# bun.lock references patched dependencies, so the install fails without their patch files.
COPY patches patches/
RUN cd backend && bun install --production --ignore-scripts
COPY backend backend
COPY project.config.json ./
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
USER bun
CMD ["bun", "backend/src/index.ts"]
