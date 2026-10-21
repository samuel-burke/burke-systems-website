FROM node:26-alpine AS base
WORKDIR /app

FROM base AS package-manager
RUN npm install -g pnpm@10.34.1 && pnpm config set store-dir /home/node/.local/share/pnpm 

FROM package-manager AS dev
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install
COPY . .
CMD ["pnpm","run","dev"]
