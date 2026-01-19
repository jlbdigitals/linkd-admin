# Guía de Despliegue - LINKD

Esta guía te ayudará a desplegar la aplicación LINKD en Dockploy u otra plataforma que soporte Docker.

## Requisitos Previos

- Cuenta de Gmail con autenticación de dos factores (2FA) habilitada
- Dockploy u otra plataforma de hosting con soporte Docker
- Variables de entorno configuradas

## Configuración de Gmail para SMTP

Para enviar correos de autenticación, necesitas configurar Gmail SMTP:

### Paso 1: Habilitar 2FA en Gmail

1. Ve a https://myaccount.google.com/security
2. En "Cómo inicias sesión en Google", habilita "Verificación en dos pasos"
3. Sigue las instrucciones para configurar 2FA

### Paso 2: Generar App Password

1. Ve a https://myaccount.google.com/apppasswords
2. En "Selecciona la app", elige "Correo"
3. En "Selecciona el dispositivo", elige "Otro (nombre personalizado)"
4. Escribe "LINKD" o cualquier nombre descriptivo
5. Haz clic en "Generar"
6. **Copia la contraseña de 16 caracteres** que aparece (sin espacios)

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Dockploy:

```bash
# Base de datos (SQLite en contenedor)
DATABASE_URL=file:/app/data/db.sqlite

# JWT Secret (genera uno único y seguro)
JWT_SECRET=tu-clave-secreta-super-segura-y-aleatoria

# Correos de Super Admins (separados por comas)
ADMIN_EMAILS=admin@tuempresa.com,otro-admin@tuempresa.com

# Configuración SMTP de Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # La contraseña de 16 caracteres de arriba
SMTP_FROM=noreply@tudominio.com

# URL de la aplicación
APP_URL=https://tu-dominio.com
```

### Generar JWT_SECRET seguro

Ejecuta en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O en línea:
```bash
openssl rand -hex 32
```

## Despliegue en Dockploy

### Opción 1: Desde GitHub

1. Sube tu código a un repositorio de GitHub
2. En Dockploy, crea una nueva aplicación
3. Selecciona "GitHub" como fuente
4. Conecta tu repositorio
5. Configura las variables de entorno (ver arriba)
6. En "Build Settings":
   - Build Command: `npm run build`
   - Start Command: (Dockploy usará el Dockerfile automáticamente)
7. Haz clic en "Deploy"

### Opción 2: Docker Image Manual

Si prefieres construir la imagen manualmente:

```bash
# Construir la imagen
docker build -t linkd-app .

# Probar localmente
docker run -p 3000:3000 \
  -e DATABASE_URL=file:/app/data/db.sqlite \
  -e JWT_SECRET=tu-secreto \
  -e ADMIN_EMAILS=admin@example.com \
  -e SMTP_USER=tu-email@gmail.com \
  -e SMTP_PASS=tu-app-password \
  linkd-app
```

## Configuración Post-Despliegue

### 1. Crear Super Admin

Los usuarios listados en `ADMIN_EMAILS` tendrán acceso como Super Admin automáticamente cuando inicien sesión.

### 2. Verificar Email

1. Ve a `/login` en tu aplicación desplegada
2. Ingresa tu email de Super Admin
3. Deberías recibir un código por correo
4. Si no recibes el correo, revisa:
   - Variables SMTP correctamente configuradas
   - Logs del contenedor para errores
   - Carpeta de spam en Gmail

### 3. Primera Empresa

1. Inicia sesión como Super Admin
2. Ve a `/admin`
3. Crea tu primera empresa

## Persistencia de Datos

La base de datos SQLite se almacena en `/app/data/db.sqlite` dentro del contenedor.

**IMPORTANTE**: Para no perder datos entre despliegues, asegúrate de que Dockploy tenga configurado un volumen persistente en `/app/data`.

En `docker-compose.yml`:
```yaml
volumes:
  - sqlite-data:/app/data
```

## Solución de Problemas

### No recibo correos

1. Verifica que `SMTP_USER` y `SMTP_PASS` estén correctamente configurados
2. Revisa los logs del contenedor: `docker logs <container-id>`
3. Verifica que la App Password de Gmail sea correcta
4. Intenta enviar un correo de prueba desde tu servidor

### Error de base de datos

1. Asegúrate de que el directorio `/app/data` tenga permisos de escritura
2. Verifica que el volumen esté montado correctamente
3. Revisa los logs para errores de migración de Prisma

### La aplicación no inicia

1. Revisa los logs del contenedor
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el puerto 3000 esté accesible

## Actualización de la Aplicación

1. Haz push de tus cambios a GitHub
2. En Dockploy, haz clic en "Redeploy"
3. Las migraciones de Prisma se ejecutarán automáticamente al inicio

## Seguridad

- Cambia `JWT_SECRET` regularmente
- Usa contraseñas únicas para `SMTP_PASS`
- Limita `ADMIN_EMAILS` solo a usuarios confiables
- Habilita HTTPS en tu dominio
- Considera configurar un dominio personalizado para emails (`SMTP_FROM`)

## Monitoreo

Revisa los logs regularmente:

```bash
# En Dockploy
docker logs -f <container-name>

# Buscar errores de email
docker logs <container-name> | grep -i smtp

# Buscar errores de autenticación
docker logs <container-name> | grep -i login
```

## Backup

Realiza backups regulares de `/app/data/db.sqlite`:

```bash
# Desde el host
docker cp <container-name>:/app/data/db.sqlite ./backup-$(date +%Y%m%d).sqlite
```

## Soporte

Para problemas específicos de la aplicación:
- Revisa los logs del contenedor
- Verifica la configuración de variables de entorno
- Asegúrate de que Gmail SMTP esté correctamente configurado
