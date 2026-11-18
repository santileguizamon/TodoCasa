# Migraciones pendientes

Las migraciones de `prisma/migrations` no reproducen todo `schema.prisma`. En una base creada solo con `prisma migrate deploy` (como hace `start:prod`) faltan estas columnas y la app falla con errores 500 en trabajos, chats y especialidades.

Esto se documenta para resolverlo en otra etapa: **no se modificó ninguna migración ni el schema.**

## Cómo se obtuvo

Contra una base PostgreSQL local vacía usada como shadow database (nunca la de producción):

```
npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url postgresql://postgres:postgres@localhost:5432/todocasa_shadow --script
```

## Diferencias encontradas

| Modelo | Cambio que falta | Definición en `schema.prisma` |
|---|---|---|
| `Chat` | columna `archivadoCliente` | `Boolean @default(false)` |
| `Chat` | columna `archivadoProfesional` | `Boolean @default(false)` |
| `Especialidad` | columna `activa` | `Boolean @default(true)` |
| `Especialidad` | columna `categoria` | `String?` |
| `Trabajo` | columna `categoria` | `String?` |
| `Profesional` | valor por defecto de `extraUrgencia` | `@default(1.5)` (la migración no tiene default) |

No faltan tablas ni enumeraciones: todas las del schema están en alguna migración.

## SQL que generaría Prisma

```sql
ALTER TABLE "Chat" ADD COLUMN "archivadoCliente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archivadoProfesional" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Especialidad" ADD COLUMN "activa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "categoria" TEXT;

ALTER TABLE "Profesional" ALTER COLUMN "extraUrgencia" SET DEFAULT 1.5;

ALTER TABLE "Trabajo" ADD COLUMN "categoria" TEXT;
```

## A tener en cuenta al resolverlo

La base de producción probablemente ya tiene estas columnas (se habrán creado con `prisma db push`). Antes de agregar una migración nueva, comparar contra producción: si ya existen, la migración se tiene que marcar como aplicada con `prisma migrate resolve --applied <nombre>` en vez de ejecutarla, o fallará por columnas duplicadas.
