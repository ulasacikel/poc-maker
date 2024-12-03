FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install && \
    npm install react-router-dom @monaco-editor/react

# Copy source files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 