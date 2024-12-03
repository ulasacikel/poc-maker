# Stage 1: Get Foundry binaries
FROM ghcr.io/foundry-rs/foundry:latest as foundry

# Stage 2: Build backend
FROM node:18-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    git \
    build-essential \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Foundry
ENV FOUNDRY_DIR="/root/.foundry"
ENV PATH="${FOUNDRY_DIR}/bin:${PATH}"

RUN curl -L https://foundry.paradigm.xyz | bash && \
    ${FOUNDRY_DIR}/bin/foundryup

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"] 