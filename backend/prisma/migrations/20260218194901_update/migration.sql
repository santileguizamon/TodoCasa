/*
  Warnings:

  - Added the required column `tipo` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('SUSCRIPCION', 'VERIFICACION');

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "tipo" "TipoPago" NOT NULL;

-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "direccion" TEXT;
