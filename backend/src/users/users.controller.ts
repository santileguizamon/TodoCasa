import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    ForbiddenException,
    BadRequestException,
    Query,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Rol } from '../common/enums';

  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    /**
     * 📌 Obtener todos los usuarios (solo ADMIN)
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Rol.ADMIN)
    @Get()
    async findAll() {
      return this.usersService.findAll();
    }
  
    /**
     * 📌 Obtener mi propio perfil (CLIENTE o PROFESIONAL)
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
      return this.usersService.findOne(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('geocoding')
    async buscarDirecciones(
      @Query('q') q?: string,
      @Query('lat') lat?: string,
      @Query('lng') lng?: string,
      @Query('countryCode') countryCode?: string,
    ) {
      const query = q?.trim();
      if (!query || query.length < 3) return [];

      return this.usersService.buscarDirecciones(query, {
        lat: lat != null ? Number(lat) : undefined,
        lng: lng != null ? Number(lng) : undefined,
        countryCode,
      });
    }
  
    /**
     * 📌 Crear usuario (registro libre)
     */
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
      return this.usersService.create(createUserDto);
    }
  
    /**
     * 📌 Actualizar usuario
     * - Admin puede editar a cualquiera
     * - Cliente/profesional solo puede editar su propio perfil
     */
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
      const userId = Number(id);
  
      // Validar permisos: si no es admin, solo puede actualizar su propio perfil
      if (req.user.rol !== Rol.ADMIN && req.user.userId !== userId) {
        throw new ForbiddenException('No tienes permiso para actualizar este usuario');
      }
  
      return this.usersService.update(userId, updateUserDto);
    }

    // 📍 Actualizar ubicación actual del usuario (profesional o cliente)
  @UseGuards(JwtAuthGuard)
  @Patch('ubicacion')
  async actualizarUbicacion(
    @Body() body: { lat: number; lng: number },
    @Request() req: any,
  ) {
    const { lat, lng } = body;
    if (lat == null || lng == null) {
      throw new BadRequestException('Latitud y longitud son requeridas');
    }

    return this.usersService.actualizarUbicacion(req.user.userId, lat, lng);
  }
  
    /**
     * 📌 Eliminar usuario
     * - Admin puede eliminar a cualquiera
     * - Cliente/profesional solo puede eliminarse a sí mismo
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
      const userId = Number(id);
  
      if (req.user.rol !== Rol.ADMIN && req.user.userId !== userId) {
        throw new ForbiddenException('No tienes permiso para eliminar este usuario');
      }
  
      return this.usersService.remove(userId);
    }

    // 📍 Guardar dirección principal del usuario
    @UseGuards(JwtAuthGuard)
  @Patch('direccion')
  async actualizarDireccion(
    @Body() body: { direccion: string },
    @Request() req: any,
  ) {
      

      if (!body.direccion) {
        throw new BadRequestException(
          'Direccion, latitud y longitud son requeridas'
        );
      }

      return this.usersService.actualizarDireccion(
        req.user.userId,
        body.direccion
      );
    }

  }
  
