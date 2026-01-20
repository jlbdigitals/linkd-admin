#!/bin/bash

# Script para hacer backup de la base de datos SQLite desde Dockploy
# Uso: ./scripts/backup-db.sh [pruebas|produccion]

set -e

ENVIRONMENT=${1:-pruebas}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
CONTAINER_NAME="linkd-${ENVIRONMENT}"
BACKUP_FILE="${BACKUP_DIR}/db-${ENVIRONMENT}-${TIMESTAMP}.sqlite"

echo "🗄️  Haciendo backup de la base de datos..."
echo "   Ambiente: ${ENVIRONMENT}"
echo "   Contenedor: ${CONTAINER_NAME}"

# Crear directorio de backups si no existe
mkdir -p ${BACKUP_DIR}

# Verificar que el contenedor existe
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: No se encontró el contenedor '${CONTAINER_NAME}'"
    echo "   Verifica que el nombre del contenedor sea correcto"
    exit 1
fi

# Hacer backup
echo "📦 Copiando base de datos..."
docker cp ${CONTAINER_NAME}:/app/data/db.sqlite ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "✅ Backup completado exitosamente!"
    echo "   Archivo: ${BACKUP_FILE}"
    echo "   Tamaño: $(du -h ${BACKUP_FILE} | cut -f1)"
else
    echo "❌ Error al hacer backup"
    exit 1
fi

# Listar backups existentes
echo ""
echo "📋 Backups disponibles:"
ls -lh ${BACKUP_DIR}/db-${ENVIRONMENT}-*.sqlite 2>/dev/null || echo "   (ninguno)"
