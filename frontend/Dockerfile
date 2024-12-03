# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Development stage
FROM node:18-alpine

WORKDIR /app

# Copy from build stage
COPY --from=build /app ./

EXPOSE 3000

CMD ["npm", "run", "dev"] 