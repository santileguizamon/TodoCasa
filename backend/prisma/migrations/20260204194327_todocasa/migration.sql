-- AlterTable
ALTER TABLE "Notificacion" ADD COLUMN     "trabajoId" INTEGER;

-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "fechaAcordada" TIMESTAMP(3);
