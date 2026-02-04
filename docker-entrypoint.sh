#!/bin/sh
set -e

echo "=== Docker Entrypoint Started ==="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "DATABASE_URL is set: $DATABASE_URL"

# Run Prisma migrations
echo "Running prisma migrate deploy..."
if [ -x "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma migrate deploy
else
  echo "ERROR: Prisma binary not found or not executable"
  ls -la ./node_modules/.bin/prisma || echo "File does not exist"
  exit 1
fi

echo "Database migrations complete"

# Check if server.js exists
if [ ! -f "server.js" ]; then
  echo "ERROR: server.js not found"
  ls -la
  exit 1
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
