#!/bin/sh
set -e

# Run Prisma migrations or db push
# If no migrations folder exists, use db push
if [ -d "./prisma/migrations" ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
else
  echo "No migrations found, running prisma db push..."
  npx prisma db push --accept-data-loss
fi

# Start the application
echo "Starting application..."
exec node server.js
