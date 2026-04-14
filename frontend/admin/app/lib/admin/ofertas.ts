import { apiFetch } from '../api';

export function fetchAdminOfertas() {
  return apiFetch('/admin/ofertas');
}

export function rechazarOfertaAdmin(id: number) {
  return apiFetch(`/admin/ofertas/${id}/rechazar`, {
    method: 'PATCH',
  });
}
