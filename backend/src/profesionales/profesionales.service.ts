import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfesionalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfesionalDto) {
    return this.prisma.profesional.create({
      data: {
        idUsuario: dto.id_usuario,
        descripcion: dto.descripcion,
        valorHora: dto.valorHora,
        extraUrgencia: dto.extraUrgencia,

        especialidades: {
          connect: dto.id_especialidades.map(id => ({ id })),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.profesional.findMany({
      include: {
        usuario: true,
        especialidades: true,
      },
    });
  }

  async findOne(idUsuario: number) {
    const profesional = await this.prisma.profesional.findUnique({
      where: { idUsuario },
      include: {
        usuario: true,
        especialidades: true,
      },
    });

    if (!profesional) throw new NotFoundException(`Profesional ${idUsuario} no encontrado`);
    return profesional;
  }

  async tieneSuscripcionActiva(idUsuario: number): Promise<boolean> {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { usuarioId: idUsuario },
    });
  
    if (!suscripcion) return false;
    if (!suscripcion.activa) return false;
    if (suscripcion.fechaFin && new Date(suscripcion.fechaFin) < new Date()) return false;
  
    return true;
  }

  async update(idUsuario: number, dto: UpdateProfesionalDto) {
    return this.prisma.profesional.update({
      where: { idUsuario },
      data: dto,
    });
  }

  async updatePerfil(
    idUsuario: number,
    dto: UpdateProfesionalDto
  ) {
    const profesional = await this.prisma.profesional.findUnique({
      where: { idUsuario },
    });

    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const data: any = {};
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.valorHora !== undefined) data.valorHora = dto.valorHora;
    if (dto.urgencias !== undefined) data.extraUrgencia = dto.urgencias;

    if (dto.id_especialidades) {
      const idsSolicitados = Array.from(
        new Set(dto.id_especialidades.map((id: any) => Number(id))),
      ).filter((id) => Number.isInteger(id) && id > 0);

      if (idsSolicitados.length !== dto.id_especialidades.length) {
        throw new BadRequestException('id_especialidades contiene valores invalidos');
      }

      const existentes = await this.prisma.especialidad.findMany({
        where: {
          id: { in: idsSolicitados },
        },
        select: { id: true },
      });

      const idsExistentes = new Set(existentes.map((e) => e.id));
      const faltantes = idsSolicitados.filter((id) => !idsExistentes.has(id));

      if (faltantes.length > 0) {
        throw new BadRequestException(
          `Especialidades no encontradas: ${faltantes.join(', ')}`,
        );
      }

      data.especialidades = {
        set: idsSolicitados.map((id) => ({ id })),
      };
    }

    try {
      return await this.prisma.profesional.update({
        where: { idUsuario },
        data,
        include: {
          usuario: true,
          especialidades: true,
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2021' || error.code === 'P2022') {
          throw new BadRequestException(
            'La base de datos no esta alineada con el modelo de profesionales/especialidades. Ejecuta prisma db push y reinicia backend.',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'No se pudieron asociar las especialidades por una referencia invalida.',
          );
        }
      }
      throw new InternalServerErrorException(
        'No se pudo actualizar el perfil profesional',
      );
    }
  }

  async remove(idUsuario: number) {
    return this.prisma.profesional.delete({ where: { idUsuario } });
  }

  async obtenerMiPerfil(userId: number) {
    let profesional = await this.prisma.profesional.findUnique({
      where: { idUsuario: userId },
      include: {
        usuario: {
          include: {
            suscripcion: true,
          },
        },
        especialidades: true,
      },
    });

    if (!profesional) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: userId },
      });

      if (!usuario || usuario.rol !== 'PROFESIONAL') {
        return null;
      }

      profesional = await this.prisma.profesional.create({
        data: {
          idUsuario: userId,
          descripcion: '',
          valorHora: 0,
          extraUrgencia: 1.5,
        },
        include: {
          usuario: {
            include: {
              suscripcion: true,
            },
          },
          especialidades: true,
        },
      });
    }

    const suscripcion = profesional.usuario.suscripcion;

    let suscripcionEstado: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION' =
      'SIN_SUSCRIPCION';

    if (suscripcion) {
      const estaActiva =
        suscripcion.activa &&
        (!suscripcion.fechaFin ||
          suscripcion.fechaFin > new Date());

      suscripcionEstado = estaActiva ? 'ACTIVA' : 'VENCIDA';
    }

    return {
      ...profesional,
      suscripcionEstado,
    };
  }



}

