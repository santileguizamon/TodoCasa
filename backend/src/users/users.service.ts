import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { GeocodingService } from '@/common/services/geocoding.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private geocoding: GeocodingService,) {}

  /**
   * 📌 Obtener todos los usuarios
   */
  async findAll() {
    return this.prisma.usuario.findMany({
      include: { profesional: true, suscripcion: true },
    });
  }

  /**
   * 📌 Obtener un usuario por ID
   */
  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: { profesional: true, suscripcion: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * 📌 Buscar usuario por email (para login)
   */
  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { profesional: true, suscripcion: true },
    });
  }

  /**
   * 📌 Crear usuario (password se encripta automáticamente)
   */
  async create(data: any) {
    const exists = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  /**
   * 📌 Actualizar usuario (password se re-hashea si cambia)
   */
  async update(id: number, data: any) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  /**
   * 📌 Eliminar usuario
   */
  async remove(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.prisma.usuario.delete({
      where: { id },
    });
  }


   // 📍 Actualizar ubicación (profesional o cliente)
   async actualizarUbicacion(userId: number, lat: number, lng: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.usuario.update({
      where: { id: userId },
      data: { lat, lng },
    });
  }

  async actualizarDireccion(
    userId: number,
    direccion: string,
   
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let lat = usuario.lat;
    let lng = usuario.lng;

    try {
      const geo = await this.geocoding.geocode(direccion);
      lat = geo.lat;
      lng = geo.lng;
    } catch {
      // Si el geocoding falla, igual guardamos la direccion y mantenemos lat/lng actuales.
    }

    return this.prisma.usuario.update({
      where: { id: userId },
      data: {
        direccion,
        lat,
        lng,
      },
    });
  }


  async buscarDirecciones(
    query: string,
    options: { lat?: number; lng?: number; countryCode?: string } = {},
  ) {
    return this.geocoding.autocomplete(query, options);
  }

}


