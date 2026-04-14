import type { Suscripcion } from '../types';

/**
 * Determina si una suscripción es válida:
 * - Activa
 * - O dentro del período de gracia
 */
export function tieneSuscripcionValida(
  suscripcion: Suscripcion | null,
  diasGracia = 5,
): boolean {
  if (!suscripcion) return false;
  if (!suscripcion.activa) return false;
  if (!suscripcion.fechaFin) return false;

  const ahora = new Date();

  // Fecha fin + días de gracia
  const fechaConGracia = new Date(suscripcion.fechaFin);
  fechaConGracia.setDate(fechaConGracia.getDate() + diasGracia);

  return ahora <= fechaConGracia;
}
