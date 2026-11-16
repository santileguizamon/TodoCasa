# Crear un administrador

Script manual para dar de alta el primer administrador o promover un usuario existente. No se ejecuta al arrancar el servidor.

Hay que correrlo desde la carpeta `backend/`, con `DATABASE_URL` (y `DIRECT_URL` si Prisma lo exige) ya definidas en el entorno. No guarda credenciales en el código.

## PowerShell

```powershell
$env:ADMIN_EMAIL="correo@ejemplo.com"; $env:ADMIN_PASSWORD="una-clave-larga"; node scripts/crear-admin.js
```

Nombre opcional:

```powershell
$env:ADMIN_NOMBRE="Administrador"
```

## Bash

```bash
ADMIN_EMAIL=correo@ejemplo.com ADMIN_PASSWORD=una-clave-larga node scripts/crear-admin.js
```

## Desde npm

```bash
npm run crear-admin
```

Las variables de entorno tienen que estar definidas antes.

## Listar administradores

```bash
node scripts/crear-admin.js --listar
```

Muestra solo id, nombre y email. No modifica la base.

## Promover y cambiar la contraseña

Si el email ya existe, el script lo deja como ADMIN, activo y verificado, sin cambiar la contraseña. Para reemplazarla:

```bash
node scripts/crear-admin.js --cambiar-password
```

El email debe tener formato válido y la contraseña al menos 10 caracteres. Se puede ejecutar varias veces: no duplica usuarios.
