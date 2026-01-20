# Guía Paso a Paso: Despliegue en Dockploy

Esta guía te ayudará a desplegar LINKD en Dockploy con dos ambientes: **PRUEBAS** y **PRODUCCIÓN**.

---

## 📋 Requisitos Previos

### 1. Cuenta de Gmail para SMTP
- ✅ Gmail con 2FA habilitado
- ✅ App Password generada

### 2. Repositorio GitHub
- ✅ Código pusheado a GitHub
- ✅ Repositorio: `https://github.com/jlbdigitals/linkd-admin`

### 3. Cuenta Dockploy
- ✅ Acceso a panel de Dockploy
- ✅ Servidor configurado

---

## 🔧 PARTE 1: Configurar Gmail SMTP

### Paso 1.1: Habilitar 2FA en Gmail

1. Ve a https://myaccount.google.com/security
2. En "Cómo inicias sesión en Google", haz clic en "Verificación en dos pasos"
3. Sigue las instrucciones para habilitar 2FA
4. Verifica que esté activado ✅

### Paso 1.2: Generar App Password

1. Ve a https://myaccount.google.com/apppasswords
2. En "Selecciona la app", elige **"Correo"**
3. En "Selecciona el dispositivo", elige **"Otro (nombre personalizado)"**
4. Escribe: **"LINKD Pruebas"** (o "LINKD Producción")
5. Haz clic en **"Generar"**
6. **COPIA LA CONTRASEÑA DE 16 CARACTERES** (ejemplo: `abcd efgh ijkl mnop`)
7. Guárdala en un lugar seguro (la necesitarás en 2 minutos)

> ⚠️ **IMPORTANTE**: Genera una App Password diferente para PRUEBAS y otra para PRODUCCIÓN

---

## 🚀 PARTE 2: Crear Ambiente de PRUEBAS en Dockploy

### Paso 2.1: Crear Nueva Aplicación

1. Inicia sesión en tu panel de Dockploy
2. Haz clic en **"New Application"** o **"Nueva Aplicación"**
3. Selecciona **"Docker"** como tipo de aplicación
4. Configura:
   - **Nombre**: `linkd-pruebas`
   - **Tipo**: Docker
   - **Source**: GitHub

### Paso 2.2: Conectar Repositorio GitHub

1. Haz clic en **"Connect GitHub"** si no está conectado
2. Selecciona el repositorio: `jlbdigitals/linkd-admin`
3. **Branch**: `main` (o crea una rama `staging` para pruebas)
4. Dockploy detectará automáticamente el `Dockerfile`

### Paso 2.3: Configurar Variables de Entorno (PRUEBAS)

En la sección de **Environment Variables**, agrega las siguientes:

```bash
# Base de datos (SQLite en contenedor - se creará automáticamente)
DATABASE_URL=file:/app/data/db.sqlite

# JWT Secret (genera uno único)
JWT_SECRET=<GENERA_UNO_NUEVO>

# Correos de Super Admins (TU EMAIL DE PRUEBAS)
ADMIN_EMAILS=tu-email@gmail.com

# SMTP Gmail (para pruebas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=<LA_APP_PASSWORD_DE_16_CARACTERES>
SMTP_FROM=noreply-pruebas@linkd.app

# URL de la aplicación (la que te dará Dockploy)
APP_URL=https://linkd-pruebas.tu-dominio.com

# Ambiente
NODE_ENV=production
```

#### Cómo generar JWT_SECRET:

Opción 1 (en tu terminal local):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Opción 2 (con openssl):
```bash
openssl rand -hex 32
```

Copia el resultado y úsalo como `JWT_SECRET`.

### Paso 2.4: Configurar Volumen Persistente

**MUY IMPORTANTE**: Para que no pierdas los datos entre despliegues:

1. En la sección **"Volumes"** o **"Volúmenes"**
2. Agrega un volumen:
   - **Host Path**: `/app/data` (o el path que Dockploy asigne)
   - **Container Path**: `/app/data`
   - **Type**: Persistent Volume

> 📝 Esto asegura que tu base de datos SQLite persista entre despliegues

### Paso 2.5: Configurar Dominio (Opcional)

1. En **"Domain Settings"** o **"Configuración de Dominio"**
2. Agrega un subdominio: `pruebas.tudominio.com` o `linkd-pruebas.tudominio.com`
3. Dockploy generará automáticamente el certificado SSL

### Paso 2.6: Desplegar

1. Revisa que todas las variables estén correctas
2. Haz clic en **"Deploy"** o **"Desplegar"**
3. Espera 3-5 minutos mientras se construye la imagen Docker
4. Observa los logs para verificar que no haya errores

---

## ✅ PARTE 3: Verificar Ambiente de PRUEBAS

### Paso 3.1: Revisar Logs

1. En Dockploy, ve a la sección **"Logs"**
2. Busca mensajes como:
   ```
   ✓ Starting...
   ✓ Ready in XXXXms
   Running on http://0.0.0.0:3000
   ```
3. **NO** deben aparecer errores de Prisma o SMTP

### Paso 3.2: Probar Login

1. Abre tu aplicación: `https://linkd-pruebas.tudominio.com/login`
2. Ingresa tu email (el que pusiste en `ADMIN_EMAILS`)
3. Deberías recibir un correo con el código de 6 dígitos
4. Si no lo recibes:
   - Revisa la carpeta de **Spam**
   - Revisa los **Logs** en Dockploy (busca errores de SMTP)
   - Verifica que `SMTP_USER` y `SMTP_PASS` sean correctos

### Paso 3.3: Crear Empresa de Prueba

1. Inicia sesión como Super Admin
2. Ve a `/admin`
3. Crea una empresa de prueba: "Empresa Test"
4. Agrega empleados de prueba
5. Verifica que todo funcione correctamente

---

## 🏭 PARTE 4: Crear Ambiente de PRODUCCIÓN (Cuando estés listo)

Repite los pasos 2.1 a 2.6, pero con estas diferencias:

### Configuración de Producción:

```bash
# Nombre de la aplicación
Nombre: linkd-produccion

# Variables de entorno diferentes
JWT_SECRET=<GENERA_OTRO_DIFERENTE>
ADMIN_EMAILS=admin-produccion@tuempresa.com
SMTP_PASS=<OTRA_APP_PASSWORD_DE_GMAIL>
SMTP_FROM=noreply@linkd.app
APP_URL=https://linkd.tudominio.com

# Branch (opcional)
Branch: main
```

### Diferencias Clave:

| Aspecto | PRUEBAS | PRODUCCIÓN |
|---------|---------|------------|
| Nombre app | `linkd-pruebas` | `linkd-produccion` |
| Dominio | `pruebas.tudominio.com` | `linkd.tudominio.com` |
| Base de datos | SQLite independiente | SQLite independiente |
| JWT_SECRET | Uno único | **OTRO diferente** |
| App Password | Una para pruebas | **Otra para producción** |
| Admin Email | Tu email de pruebas | Email oficial |

---

## 🔄 PARTE 5: Actualizar la Aplicación

### Cuando hagas cambios en el código:

1. **Haz commit y push** a GitHub:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push
   ```

2. **En Dockploy (Ambiente de Pruebas)**:
   - Haz clic en **"Redeploy"** o **"Redesplegar"**
   - Espera 2-3 minutos
   - Las migraciones de Prisma se ejecutarán automáticamente

3. **Verifica en Pruebas**:
   - Prueba los cambios
   - Verifica que no haya errores

4. **Si todo está bien, Despliega a Producción**:
   - Ve al ambiente de producción en Dockploy
   - Haz clic en **"Redeploy"**

---

## 🗄️ PARTE 6: Gestión de Bases de Datos

### Ubicación de las Bases de Datos

Cada ambiente tiene su propia base de datos **completamente separada**:

- **PRUEBAS**: `/app/data/db.sqlite` (en contenedor linkd-pruebas)
- **PRODUCCIÓN**: `/app/data/db.sqlite` (en contenedor linkd-produccion)

### Backup de Base de Datos

#### Hacer Backup (desde Dockploy terminal o SSH):

```bash
# Conectar al contenedor
docker exec -it linkd-pruebas sh

# Copiar base de datos al host
docker cp linkd-pruebas:/app/data/db.sqlite ./backup-$(date +%Y%m%d).sqlite

# Descargar desde Dockploy
# (Dockploy tiene una opción de descargar archivos del contenedor)
```

#### Restaurar Backup:

```bash
# Subir archivo a Dockploy
# (Usar interfaz de archivos de Dockploy)

# O copiar desde host
docker cp ./backup-20260120.sqlite linkd-pruebas:/app/data/db.sqlite

# Reiniciar contenedor
docker restart linkd-pruebas
```

### Migrar Datos de Pruebas a Producción

⚠️ **CUIDADO**: Esto sobrescribirá todos los datos de producción.

```bash
# 1. Hacer backup de producción primero
docker cp linkd-produccion:/app/data/db.sqlite ./backup-produccion-antes.sqlite

# 2. Copiar base de datos de pruebas
docker cp linkd-pruebas:/app/data/db.sqlite ./db-pruebas.sqlite

# 3. Copiar a producción
docker cp ./db-pruebas.sqlite linkd-produccion:/app/data/db.sqlite

# 4. Reiniciar producción
docker restart linkd-produccion
```

---

## 🐛 Solución de Problemas

### Problema 1: No recibo correos

**Síntomas**: Al solicitar código de login, no llega ningún correo.

**Solución**:
1. Revisa los logs en Dockploy:
   ```
   Busca: "SMTP" o "Failed to send email"
   ```
2. Verifica en Gmail:
   - App Password correcta (sin espacios)
   - 2FA habilitado
   - Cuenta no bloqueada
3. Revisa variables de entorno:
   - `SMTP_USER` = tu email completo
   - `SMTP_PASS` = App Password de 16 caracteres (sin espacios)
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`

### Problema 2: Error "No such file or directory: db.sqlite"

**Síntomas**: La aplicación no inicia, error de base de datos.

**Solución**:
1. Verifica que el volumen esté montado en `/app/data`
2. Revisa los logs:
   ```
   Busca: "prisma migrate deploy" o "Running migrations"
   ```
3. El script `docker-entrypoint.sh` debería crear la BD automáticamente

### Problema 3: Aplicación no inicia después de desplegar

**Síntomas**: El contenedor se reinicia constantemente.

**Solución**:
1. Revisa los logs completos en Dockploy
2. Busca errores de:
   - Variables de entorno faltantes
   - Errores de Prisma
   - Errores de compilación
3. Verifica que el `JWT_SECRET` esté configurado

### Problema 4: Volumen no persiste datos

**Síntomas**: Después de redesplegar, se pierden todos los datos.

**Solución**:
1. Verifica que el volumen esté configurado como **Persistent**
2. En Dockploy, revisa la configuración de volúmenes
3. El path debe ser: `/app/data` (contenedor) → volumen persistente

---

## 📊 Checklist Final

### Antes de ir a Producción:

- [ ] Ambiente de pruebas funcionando correctamente
- [ ] Login con email funciona (recibes códigos por correo)
- [ ] Puedes crear empresas y empleados
- [ ] Las tarjetas de empleado funcionan (slug único)
- [ ] Modo oscuro/claro funciona bien
- [ ] Logo LINKD aparece correctamente
- [ ] Has probado todas las funcionalidades principales
- [ ] Base de datos persiste después de redesplegar

### Configuración de Producción:

- [ ] JWT_SECRET diferente al de pruebas
- [ ] App Password de Gmail diferente
- [ ] Dominio de producción configurado
- [ ] Certificado SSL activo (HTTPS)
- [ ] Volumen persistente configurado
- [ ] Admin email correcto en `ADMIN_EMAILS`
- [ ] `SMTP_FROM` con dominio apropiado

---

## 📞 Acceso a la Aplicación

### URLs Típicas:

- **Pruebas**: https://linkd-pruebas.tudominio.com
  - Login: `/login`
  - Admin: `/admin`
  - Empleado: `/[slug]` (ej: `/juan-perez`)

- **Producción**: https://linkd.tudominio.com
  - (mismas rutas)

### Credenciales:

- **Email**: El que configuraste en `ADMIN_EMAILS`
- **Código**: Se envía por correo cada vez que inicias sesión
- **Sin contraseña**: El sistema es passwordless, solo códigos de un uso

---

## 🎯 Próximos Pasos Recomendados

1. **Monitoreo**: Configura alertas en Dockploy para errores
2. **Backups**: Programa backups automáticos de la base de datos
3. **Dominio personalizado**: Configura `noreply@tudominio.com` para emails
4. **Analytics**: Considera agregar Google Analytics o similar
5. **SEO**: Configura meta tags para las páginas de empleados

---

¿Necesitas ayuda con algún paso específico? ¡Estoy aquí para ayudarte! 🚀
