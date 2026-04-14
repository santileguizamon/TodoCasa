import { apiFetch } from '../api';

export function fetchAdminTrabajos() {
  return apiFetch('/admin/trabajos');
}
