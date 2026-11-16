import { of, lastValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import {
  OmitSensitiveInterceptor,
  omitSensitiveFields,
} from './omit-sensitive.interceptor';

describe('OmitSensitiveInterceptor', () => {
  const fecha = new Date('2024-01-02T03:04:05.000Z');

  const payload = {
    id: 1,
    nombre: 'Ana',
    password: 'hash-secreto',
    refreshTokenHash: 'refresh-secreto',
    cliente: {
      id: 2,
      nombre: 'Cliente',
      telefono: '111',
      password: 'otro-hash',
      creadoEn: fecha,
    },
    items: [
      { id: 3, refreshTokenHash: 'no-mostrar', direccion: 'Calle 1' },
    ],
  };

  it('elimina password y refreshTokenHash en objetos anidados sin tocar Date', () => {
    const limpio = omitSensitiveFields(payload) as any;

    expect(limpio.password).toBeUndefined();
    expect(limpio.refreshTokenHash).toBeUndefined();
    expect(limpio.nombre).toBe('Ana');
    expect(limpio.cliente.password).toBeUndefined();
    expect(limpio.cliente.nombre).toBe('Cliente');
    expect(limpio.cliente.telefono).toBe('111');
    expect(limpio.cliente.creadoEn).toBe(fecha);
    expect(limpio.items[0].refreshTokenHash).toBeUndefined();
    expect(limpio.items[0].direccion).toBe('Calle 1');
    expect(payload.password).toBe('hash-secreto');
  });

  it('limpia la respuesta del interceptor', async () => {
    const interceptor = new OmitSensitiveInterceptor();
    const next: CallHandler = { handle: () => of(payload) };
    const result = (await lastValueFrom(
      interceptor.intercept({} as ExecutionContext, next),
    )) as any;

    expect(JSON.stringify(result)).not.toContain('password');
    expect(JSON.stringify(result)).not.toContain('refreshTokenHash');
    expect(result.cliente.creadoEn).toEqual(fecha);
  });
});
