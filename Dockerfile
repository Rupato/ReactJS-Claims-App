FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Build arguments for environment variables
ARG PUBLIC_API_URL
ARG FRONTEND_PORT
ARG API_PORT

# Set environment variables for build time
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV FRONTEND_PORT=$FRONTEND_PORT
ENV API_PORT=$API_PORT

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE ${FRONTEND_PORT:-3000}

# Start the application
CMD ["pnpm", "preview"]
