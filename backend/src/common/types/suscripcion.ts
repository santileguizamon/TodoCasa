export interface Suscripcion {
  id: number;
  usuarioId: number;
  nivel: 'BASICO' | 'PREMIUM';
  activa: boolean;
  fechaInicio: Date;
  fechaFin: Date | null;
}
