import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EspecialidadesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEspecialidadDto) {
    try {
      return await this.prisma.especialidad.create({
        data: {
          nombre: dto.nombre,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('La especialidad ya existe');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2022'
      ) {
        try {
          const rows = await this.prisma.$queryRaw<
            Array<{ id: number; nombre: string }>
          >(Prisma.sql`
            INSERT INTO "Especialidad" ("nombre")
            VALUES (${dto.nombre})
            RETURNING "id", "nombre"
          `);

          const created = rows[0];
          return {
            id: created.id,
            nombre: created.nombre,
            activa: true,
            categoria: null,
          };
        } catch (rawError: any) {
          if (rawError?.code === '23505') {
            throw new ConflictException('La especialidad ya existe');
          }
          throw rawError;
        }
      }
      throw error;
    }
  }

  async findAll(onlyActive = false) {
    try {
      const rows = await this.prisma.especialidad.findMany({
        where: onlyActive ? { activa: true } : undefined,
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          nombre: true,
          activa: true,
        },
      });

      return rows.map((row) => ({
        ...row,
        categoria: null,
      }));
    } catch {
      const rows = await this.prisma.especialidad.findMany({
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          nombre: true,
        },
      });

      return rows.map((row) => ({
        ...row,
        activa: true,
        categoria: null,
      }));
    }
  }

  async findOne(id: number) {
    let especialidad:
      | {
          id: number;
          nombre: string;
          activa: boolean;
        }
      | {
          id: number;
          nombre: string;
          activa?: boolean;
        }
      | null = null;

    try {
      especialidad = await this.prisma.especialidad.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          activa: true,
        },
      });
    } catch {
      especialidad = await this.prisma.especialidad.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
        },
      });
    }

    if (!especialidad) throw new NotFoundException(`Especialidad ${id} no encontrada`);
    return {
      ...especialidad,
      activa: (especialidad as any).activa ?? true,
      categoria: null,
    };
  }

  async update(id: number, dto: UpdateEspecialidadDto) {
    const exists = await this.findOne(id);
    if (!exists) {
      throw new NotFoundException(`Especialidad ${id} no encontrada`);
    }

    if (dto.nombre !== undefined || dto.activa !== undefined) {
      try {
        await this.prisma.especialidad.update({
          where: { id },
          data: {
            ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
            ...(dto.activa !== undefined ? { activa: dto.activa } : {}),
          },
        });
      } catch (error) {
        if (dto.nombre !== undefined) {
          await this.prisma.especialidad.update({
            where: { id },
            data: { nombre: dto.nombre },
          });
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    return this.prisma.especialidad.delete({ where: { id } });
  }
}
