-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'PROFESIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "NivelSuscripcion" AS ENUM ('BASICO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "EstadoTrabajo" AS ENUM ('PENDIENTE', 'ASIGNADO', 'PENDIENTE_CONFIRMACION', 'FINALIZADO', 'CANCELADO', 'EN_RECLAMO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "EstadoVerificacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('OFERTA_ACEPTADA', 'NUEVO_MENSAJE', 'TRABAJO_FINALIZADO', 'SUSCRIPCION_POR_VENCER');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "rol" "Rol" NOT NULL DEFAULT 'CLIENTE',
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesional" (
    "idUsuario" INTEGER NOT NULL,
    "descripcion" TEXT,
    "valorHora" DOUBLE PRECISION NOT NULL,
    "extraUrgencia" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Especialidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nivel" "NivelSuscripcion" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "rangoMin" DOUBLE PRECISION NOT NULL,
    "rangoMax" DOUBLE PRECISION NOT NULL,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "estado" "EstadoTrabajo" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "radioKm" DOUBLE PRECISION DEFAULT 10,

    CONSTRAINT "Trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oferta" (
    "id" SERIAL NOT NULL,
    "trabajoId" INTEGER NOT NULL,
    "profesionalId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Oferta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "trabajoId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "profesionalId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "remitenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "enviadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valoracion" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "profesionalId" INTEGER NOT NULL,
    "trabajoId" INTEGER NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "comentario" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Valoracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodo" TEXT,
    "referenciaMP" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verificacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estado" "EstadoVerificacion" NOT NULL DEFAULT 'PENDIENTE',
    "comprobante" TEXT,
    "verificadaEn" TIMESTAMP(3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EspecialidadToProfesional" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidad_nombre_key" ON "Especialidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_usuarioId_key" ON "Suscripcion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_trabajoId_key" ON "Chat"("trabajoId");

-- CreateIndex
CREATE UNIQUE INDEX "Valoracion_trabajoId_key" ON "Valoracion"("trabajoId");

-- CreateIndex
CREATE UNIQUE INDEX "Verificacion_usuarioId_key" ON "Verificacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "_EspecialidadToProfesional_AB_unique" ON "_EspecialidadToProfesional"("A", "B");

-- CreateIndex
CREATE INDEX "_EspecialidadToProfesional_B_index" ON "_EspecialidadToProfesional"("B");

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacion" ADD CONSTRAINT "Verificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspecialidadToProfesional" ADD CONSTRAINT "_EspecialidadToProfesional_A_fkey" FOREIGN KEY ("A") REFERENCES "Especialidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspecialidadToProfesional" ADD CONSTRAINT "_EspecialidadToProfesional_B_fkey" FOREIGN KEY ("B") REFERENCES "Profesional"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
