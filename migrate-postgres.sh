#!/bin/bash

# Script de migración para PostgreSQL

echo "🔄 Generando cliente de Prisma..."
npx prisma generate

echo "🗃️  Aplicando migraciones a PostgreSQL..."
npx prisma migrate deploy

echo "✅ Migración completada"
