#!/bin/sh
set -e

echo "=== Starting application initialization ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "DATABASE_URL is set"

# Create database directory if using SQLite
if echo "$DATABASE_URL" | grep -q "file:"; then
  DB_PATH=$(echo "$DATABASE_URL" | sed 's/file://')
  DB_DIR=$(dirname "$DB_PATH")
  echo "Creating database directory: $DB_DIR"
  mkdir -p "$DB_DIR"
fi

# Run Prisma migrations or db push
if [ -d "./prisma/migrations" ]; then
  echo "Running prisma migrate deploy..."
  node_modules/.bin/prisma migrate deploy
else
  echo "No migrations found, running prisma db push..."
  node_modules/.bin/prisma db push --accept-data-loss
fi

echo "Database setup complete"

# Start the application
echo "Starting Next.js server..."
exec node server.js
