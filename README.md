# LINKD - Sistema de Tarjetas Digitales para Empleados

Sistema Next.js para gestionar perfiles digitales de empleados con enlaces personalizados y análisis de interacciones.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📚 Documentación

- **[Guía de Despliegue en Dockploy](./DOCKPLOY-DEPLOY.md)** - Paso a paso completo para desplegar en Dockploy con ambientes de pruebas y producción
- **[Guía de Despliegue General](./DEPLOYMENT.md)** - Información sobre Docker, Gmail SMTP y variables de entorno

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Base de datos**: SQLite + Prisma ORM
- **Autenticación**: JWT passwordless (códigos por email)
- **Email**: Nodemailer + Gmail SMTP
- **Estilos**: TailwindCSS 4 + next-themes
- **UI**: Componentes shadcn/ui + Lucide icons
- **Containerización**: Docker + docker-compose

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Base de datos
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="tu-super-secret-jwt-key"

# Admin Emails (separados por comas)
ADMIN_EMAILS="admin@example.com,otro@example.com"

# Gmail SMTP (requiere App Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password-de-16-caracteres"
SMTP_FROM="noreply@tudominio.com"
```

Ver [DOCKPLOY-DEPLOY.md](./DOCKPLOY-DEPLOY.md) para instrucciones sobre cómo generar App Password de Gmail.

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm start            # Iniciar servidor de producción

# Base de datos
npx prisma migrate dev       # Crear y aplicar migraciones
npx prisma studio           # Abrir editor visual de BD
npx prisma generate         # Generar Prisma Client

# Docker
docker-compose up           # Iniciar con Docker
docker build -t linkd .     # Construir imagen

# Backups (requiere acceso a contenedores Docker)
./scripts/backup-db.sh pruebas      # Backup ambiente de pruebas
./scripts/backup-db.sh produccion   # Backup ambiente de producción
./scripts/restore-db.sh pruebas [archivo]  # Restaurar backup
```

## 🏗️ Estructura del Proyecto

```
linkd-admin/
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── admin/          # Páginas de administración
│   │   ├── login/          # Sistema de autenticación
│   │   ├── [slug]/         # Páginas públicas de empleados
│   │   └── actions.ts      # Server Actions
│   ├── components/         # Componentes React
│   │   └── ui/            # Componentes shadcn/ui
│   └── lib/               # Utilidades y configuración
│       ├── auth.ts        # Sistema de autenticación
│       ├── email.ts       # Servicio de email
│       └── prisma.ts      # Cliente Prisma
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── migrations/        # Migraciones SQL
├── scripts/              # Scripts de utilidad
│   ├── backup-db.sh     # Backup de BD
│   └── restore-db.sh    # Restaurar BD
├── public/              # Archivos estáticos
├── Dockerfile           # Configuración Docker
├── docker-compose.yml   # Docker Compose
└── DOCKPLOY-DEPLOY.md  # Guía de despliegue
```

## 🎨 Características

- ✅ **Super Admin y Company Admin** - Dos niveles de administración
- ✅ **Autenticación passwordless** - Login con códigos por email
- ✅ **Gestión de empresas** - Límites de empleados configurables
- ✅ **Perfiles de empleados** - Tarjetas digitales personalizadas
- ✅ **Campos personalizados** - Agregar campos específicos por empresa
- ✅ **Modo oscuro/claro** - Cambio de tema con next-themes
- ✅ **Análisis de clicks** - Tracking de interacciones con botones
- ✅ **Slugs únicos** - URLs amigables para cada empleado
- ✅ **Imagen de perfil** - Recorte de imágenes con crop circular
- ✅ **Responsive** - Diseño adaptativo móvil y desktop

## 🚢 Despliegue

### Opción 1: Dockploy (Recomendado)

Sigue la guía detallada: **[DOCKPLOY-DEPLOY.md](./DOCKPLOY-DEPLOY.md)**

### Opción 2: Docker Manual

```bash
# Construir imagen
docker build -t linkd-app .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL=file:/app/data/db.sqlite \
  -e JWT_SECRET=tu-secreto \
  -e ADMIN_EMAILS=admin@example.com \
  -e SMTP_USER=tu-email@gmail.com \
  -e SMTP_PASS=tu-app-password \
  -v linkd-data:/app/data \
  linkd-app
```

### Opción 3: Docker Compose

```bash
# Configurar variables en .env
cp .env.example .env

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🔐 Seguridad

- JWT para autenticación de sesiones
- Códigos de un solo uso con expiración de 10 minutos
- Validación de emails de administradores
- Headers de seguridad configurados
- Rate limiting en rutas sensibles (recomendado agregar)
- Variables de entorno para secretos
- HTTPS requerido en producción

## 📊 Base de Datos

### Modelos Principales

- **Company**: Empresas con configuración de límites y visibilidad
- **Employee**: Empleados con perfil y enlaces sociales
- **CustomField**: Campos personalizados por empresa
- **ClickLog**: Registro de interacciones con botones
- **SuperAdmin**: Usuarios con acceso total al sistema
- **VerificationToken**: Códigos de autenticación temporales

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name descripcion_del_cambio

# Aplicar migraciones en producción
npx prisma migrate deploy
```

## 🐛 Solución de Problemas

### No recibo correos de login

1. Verifica que tengas 2FA habilitado en Gmail
2. Genera una App Password específica para la aplicación
3. Revisa que `SMTP_USER` y `SMTP_PASS` estén correctos
4. Revisa los logs: `docker logs <container-name>`

### Error de base de datos

1. Verifica que el directorio `/app/data` tenga permisos de escritura
2. Ejecuta las migraciones: `npx prisma migrate deploy`
3. Si usas Docker, verifica que el volumen esté montado

### Aplicación no inicia

1. Revisa que todas las variables de entorno estén configuradas
2. Verifica que `JWT_SECRET` esté presente
3. Revisa los logs del contenedor
4. Verifica que el puerto 3000 no esté en uso

## 📝 Licencia

Privado - Todos los derechos reservados

## 👥 Equipo

Desarrollado por Agencia Digitals

---

Para más información sobre despliegue, consulta: **[DOCKPLOY-DEPLOY.md](./DOCKPLOY-DEPLOY.md)**
