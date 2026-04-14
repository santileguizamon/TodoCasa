import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CrearValoracionDto } from './dto/crear-valoracion.dto';
import { ActualizarValoracionDto } from './dto/actualizar-valoracion.dto';

@Injectable()
export class ValoracionesService {
  constructor(private prisma: PrismaService) {}

  // ✅ Crear nueva valoración (solo clientes, 1 por trabajo)
  async crear(dto: CrearValoracionDto) {
    const cliente = await this.prisma.usuario.findUnique({ where: { id: dto.clienteId } });
    const profesional = await this.prisma.usuario.findUnique({ where: { id: dto.profesionalId } });

    if (!cliente || cliente.rol !== 'CLIENTE')
      throw new ForbiddenException('Solo los clientes pueden dejar valoraciones');
    if (!profesional || profesional.rol !== 'PROFESIONAL')
      throw new NotFoundException('Profesional no encontrado');

    // Verificar que el trabajo sea finalizado y pertenezca al cliente
    const trabajoFinalizado = await this.prisma.trabajo.findFirst({
      where: {
        id: dto.trabajoId,
        clienteId: dto.clienteId,
        estado: 'FINALIZADO',
        ofertas: { some: { profesionalId: dto.profesionalId } },
      },
    });

    if (!trabajoFinalizado)
      throw new ForbiddenException('Solo se puede valorar después de un trabajo finalizado');

    // Evitar duplicados
    const yaValorado = await this.prisma.valoracion.findFirst({
      where: { clienteId: dto.clienteId, profesionalId: dto.profesionalId, trabajoId: dto.trabajoId },
    });
    if (yaValorado) throw new BadRequestException('Ya has valorado este trabajo');

    // Crear valoración
    const nuevaValoracion = await this.prisma.valoracion.create({
      data: {
        clienteId: dto.clienteId,
        profesionalId: dto.profesionalId,
        trabajoId: dto.trabajoId,
        puntaje: dto.puntaje,
        comentario: dto.comentario,
      },
    });

    // Actualizar promedio del profesional
    await this.actualizarPromedioProfesional(dto.profesionalId);

    return nuevaValoracion;
  }

  // 📋 Obtener valoraciones de un profesional
  async obtenerPorProfesional(profesionalId: number) {
    return this.prisma.valoracion.findMany({
      where: { profesionalId },
      include: { cliente: true, trabajo: true },
    });
  }

  // 📋 Obtener valoraciones hechas por un cliente
  async obtenerPorCliente(clienteId: number) {
    return this.prisma.valoracion.findMany({
      where: { clienteId },
      include: { profesional: true, trabajo: true },
    });
  }

  // ✏️ Actualizar una valoración (solo el cliente que la hizo)
  async actualizar(id: number, clienteId: number, dto: ActualizarValoracionDto) {
    const valoracion = await this.prisma.valoracion.findUnique({ where: { id } });
    if (!valoracion) throw new NotFoundException('Valoración no encontrada');
    if (valoracion.clienteId !== clienteId)
      throw new ForbiddenException('No puedes editar esta valoración');

    const actualizada = await this.prisma.valoracion.update({
      where: { id },
      data: dto,
    });

    // Recalcular promedio
    await this.actualizarPromedioProfesional(valoracion.profesionalId);

    return actualizada;
  }

  // 🗑️ Eliminar valoración (solo el cliente que la hizo)
  async eliminar(id: number, clienteId: number) {
    const valoracion = await this.prisma.valoracion.findUnique({ where: { id } });
    if (!valoracion) throw new NotFoundException('Valoración no encontrada');
    if (valoracion.clienteId !== clienteId)
      throw new ForbiddenException('No puedes eliminar esta valoración');

    await this.prisma.valoracion.delete({ where: { id } });

    // Recalcular promedio
    await this.actualizarPromedioProfesional(valoracion.profesionalId);
  }

  // 📊 Calcular y actualizar promedio en el modelo Profesional
  private async actualizarPromedioProfesional(profesionalId: number) {
    const valoraciones = await this.prisma.valoracion.findMany({ where: { profesionalId } });
    const promedio = valoraciones.length
      ? valoraciones.reduce((sum, v) => sum + v.puntaje, 0) / valoraciones.length
      : 0;

    // Nota: El schema no tiene campo reputacion en Profesional
    // Se puede calcular dinámicamente cuando se necesite
  }

  /**
   * 📊 Obtener promedio de valoraciones de un profesional
   */
  async obtenerPromedio(profesionalId: number) {
    const valoraciones = await this.prisma.valoracion.findMany({ where: { profesionalId } });
    if (valoraciones.length === 0) return { promedio: 0, total: 0 };
    
    const promedio = valoraciones.reduce((sum, v) => sum + v.puntaje, 0) / valoraciones.length;
    return { promedio: Math.round(promedio * 10) / 10, total: valoraciones.length };
  }
}
