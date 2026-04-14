import { apiFetch } from '../lib/api';
import { AuthResponse } from './auth-types';

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function me(token: string) {
  return apiFetch('/auth/me', {}, token);
}

export async function register(
  nombre: string,
  email: string,
  password: string,
  rol: 'CLIENTE' | 'PROFESIONAL',
) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password, rol }),
  });
}


