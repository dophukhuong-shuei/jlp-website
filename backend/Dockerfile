# Build context: backend/ (npm workspaces root — cần package-lock.json ở đây)
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/.medusa/server ./
RUN npm install --omit=dev
EXPOSE 9000
CMD ["npm", "run", "start"]
