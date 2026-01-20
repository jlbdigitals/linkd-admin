#!/bin/bash

# Script para restaurar una base de datos SQLite en Dockploy
# Uso: ./scripts/restore-db.sh [pruebas|produccion] [archivo_backup]

set -e

ENVIRONMENT=${1:-pruebas}
BACKUP_FILE=$2
CONTAINER_NAME="linkd-${ENVIRONMENT}"

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Error: Debes especificar el archivo de backup"
    echo "   Uso: ./scripts/restore-db.sh [pruebas|produccion] [archivo_backup]"
    echo ""
    echo "📋 Backups disponibles:"
    ls -lh ./backups/db-${ENVIRONMENT}-*.sqlite 2>/dev/null || echo "   (ninguno)"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: El archivo '$BACKUP_FILE' no existe"
    exit 1
fi

echo "⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual"
echo "   Ambiente: ${ENVIRONMENT}"
echo "   Contenedor: ${CONTAINER_NAME}"
echo "   Backup: ${BACKUP_FILE}"
echo ""
read -p "¿Estás seguro? (escribe 'SI' para continuar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    echo "❌ Operación cancelada"
    exit 0
fi

# Verificar que el contenedor existe
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: No se encontró el contenedor '${CONTAINER_NAME}'"
    exit 1
fi

# Hacer backup de seguridad antes de restaurar
SAFETY_BACKUP="./backups/db-${ENVIRONMENT}-before-restore-$(date +%Y%m%d_%H%M%S).sqlite"
echo "📦 Haciendo backup de seguridad..."
docker cp ${CONTAINER_NAME}:/app/data/db.sqlite ${SAFETY_BACKUP}
echo "✅ Backup de seguridad guardado en: ${SAFETY_BACKUP}"

# Restaurar backup
echo "📥 Restaurando base de datos..."
docker cp ${BACKUP_FILE} ${CONTAINER_NAME}:/app/data/db.sqlite

if [ $? -eq 0 ]; then
    echo "✅ Base de datos restaurada exitosamente!"
    echo "   Reiniciando contenedor..."
    docker restart ${CONTAINER_NAME}
    echo "✅ Contenedor reiniciado. La aplicación estará lista en unos segundos."
else
    echo "❌ Error al restaurar la base de datos"
    exit 1
fi
