function leerSecreto(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. El servidor no puede firmar ni validar tokens sin ella.`,
    );
  }

  if (process.env.NODE_ENV === 'production' && valor.length < 32) {
    throw new Error(
      `${nombre} debe tener al menos 32 caracteres cuando NODE_ENV es production.`,
    );
  }

  return valor;
}

export function getJwtSecret(): string {
  return leerSecreto('JWT_SECRET');
}

export function getJwtRefreshSecret(): string {
  return leerSecreto('JWT_REFRESH_SECRET');
}
