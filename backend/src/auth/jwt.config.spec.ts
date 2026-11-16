import { getJwtRefreshSecret, getJwtSecret } from './jwt.config';

describe('jwt.config', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env = env;
  });

  it('falla con un mensaje claro si falta JWT_SECRET', () => {
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
  });

  it('falla con un mensaje claro si falta JWT_REFRESH_SECRET', () => {
    expect(() => getJwtRefreshSecret()).toThrow(/JWT_REFRESH_SECRET/);
  });

  it('en produccion exige al menos 32 caracteres', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'demasiado-corta';
    expect(() => getJwtSecret()).toThrow(/32/);
  });

  it('devuelve el secreto cuando esta definido', () => {
    process.env.JWT_SECRET = 'secreto-de-desarrollo';
    expect(getJwtSecret()).toBe('secreto-de-desarrollo');
  });
});