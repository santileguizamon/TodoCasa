# Agenda, estados del trabajo y superposición de horarios

## Contexto / decisiones de producto

- El **cliente** es quien define fecha y hora del trabajo (tras aceptar la oferta, dentro del chat).
- El acordar sigue pasando por **chat**; el calendario es la herramienta para fijar el "cuándo" sin back-and-forth.
- No se introduce un estado nuevo: `AGENDADO` se **deriva** de `ASIGNADO` + `fechaAcordada` definida.
- Un **turno** tiene duración fija de **90 minutos** (`TrabajosService.DURACION_TURNO_MIN`).
- El profesional puede tener **varios trabajos el mismo día** mientras no ocupen el mismo horario (no se valida "un trabajo por día").
- Un **cliente sí puede tener dos horarios seguidos** (no se valida para clientes).
- El **profesional** requiere más control/verificación que el cliente (identidad, perfil, suscripción).

## Cambios de modelo (Prisma)

> ⚠️ **Restriccion de la tesis: no se modifica el schema ni la base de datos.**
> `cantidadTurnos` NO se persiste; viaja solo como parametro del request para calcular
> el rango del turno nuevo (`1 o 2 x 90 min`). Los trabajos existentes se consideran de
> 1 turno (90 min) al evaluar solapes, ya que su duracion no queda registrada.

```prisma
model Trabajo {
  // ...
  fechaAcordada DateTime?   // se guarda con fecha + hora (timestamp completo)
  // ...  (sin columnas nuevas)
}
```

## Superposición de horarios

Regla implementada en `backend/src/trabajos/trabajos.service.ts` (`definirFechaAcordada`):

1. Solo el cliente dueño del trabajo puede ejecutarla.
2. El trabajo debe estar en estado `ASIGNADO`.
3. `cantidadTurnos` debe ser `1` o `2` (solo define el rango del turno nuevo).
4. Se identifica al profesional asignado vía el `Chat` del trabajo (`chat.profesionalId`).
5. Si el profesional ya tiene otro trabajo `ASIGNADO` con fecha cuyo rango `[inicio, fin)` se **solapa** con el nuevo slot, se lanza `ConflictException`. Cada trabajo existente se tratan como 1 turno (90 min).

No se valida solape para el cliente (puede tener trabajos seguidos).

## Flujo de estado actual (sin cambios)

```
PENDIENTE (cliente publica)
  → ASIGNADO (cliente acepta oferta)
  → AGENDADO = ASIGNADO + fechaAcordada (cliente define fecha/hora+turnos en el chat)
  → PENDIENTE_CONFIRMACION (profesional marca terminado)
  → FINALIZADO (cliente confirma)
  → (Valoración)
```

Cambios extras: `CANCELADO`, `EN_RECLAMO`. Auto-confirmación de `ASIGNADOS` vencidos (>72h) por cron.

## Endpoint

`PATCH /trabajos/:id/fecha-acordada`

```json
{ "fecha": "ISO-8601 con fecha y hora", "cantidadTurnos": 1 }
```

Devuelve el trabajo actualizado.

## Frontend mobile

- **Chat** (`src/app/chat/[trabajoId].tsx`): el calendario pasó de `mode="date"` a `mode="datetime"` (fecha + hora) + selector de turnos (1/2). Solo el cliente puede definir la fecha (`puedeDefinirFecha`).
- **Status card** del chat muestra fecha + hora + turnos.
- **Agenda profesional** (`src/app/(protected)/profesional/agenda.tsx`): cada card ahora muestra la **hora** del `fechaAcordada` y los turnos.
- **Mis trabajos (profesional)** muestra fecha + hora + turnos.

## Design system / diferenciación por rol

- `frontend/mobile/src/theme.ts` define `ROLE_COLORS`:
  - `CLIENTE`: azul (`#2563EB`).
  - `PROFESIONAL`: violeta (`#7C3AED`).
- El dashboard del profesional (`profesional-dashboard.styles.ts`) usa la paleta violeta.
- Los estilos del cliente conservan la paleta azul.

## Pasos de migración (ambiente con dependencias sanas)

> Con la restriccion de tesis **esto ya no se aplica**: no hay migraciones ni cambios de tablas.
> El backend compila tal cual esta (sin regenerar el cliente Prisma, ya que no se agrego ningun campo al modelo).
> De haber instalado deps sanas, alcanza con un `pnpm install` para normalizar `node_modules`.

## Pendiente / próxima iteración

- Aplicar la paleta por rol al resto de pantallas del profesional (agenda, mis trabajos, perfil, etc.).
- (Opcional) Bloquear horarios ocupados en el UI del chat antes de enviar (hoy se resuelve con `ConflictException` en el backend).
- Google Auth para clientes (método de login, sin bypass del onboarding).
- Escrow / Split Payments atado a estado `FINALIZADO` + confirmación del cliente.

## Fase 3c — Señales de confianza en el momento de decisión

Basado en el analisis de mercado (TaskRabbit / Angi: el cliente elige al profesional en 3-4 pasos y la desicion cae en el detalle del trabajo / ofertas):

- **Ofertas recibidas** (`cliente/trabajo/[id].tsx`): antes mostraban "Profesional #123" (anonimo). Ahora:
  - Nombre real del profesional (`Oferta.profesional.usuario`).
  - Badge "Verificado" (verde, icono escudo) si `usuario.verificado`.
  - Rating `★ x.x · N opiniones` (antes solo la calificacion, sin cantidad).
  - Se mantienen hasta 2 comentarios y el boton "Ver perfil".
- **Perfil publico del profesional** (`cliente/profesional/[id].tsx`):
  - Rating con cantidad de opiniones: `★ 4.5 · 12 opiniones`.
  - Badge de verificacion diferenciado: verde/escudo si verificado, ambar/reloj si pendiente.
- **Backend** (`backend/src/ofertas/ofertas.service.ts`): `obtenerPorTrabajo` ahora incluye `profesional.usuario` (nombre + verificado) sin campos nuevos ni cambios de schema.
- Todo frontend-only + 1 include extra; sin migraciones ni cambio de tablas.