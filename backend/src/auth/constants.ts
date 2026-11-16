import { getJwtRefreshSecret, getJwtSecret } from './jwt.config';

export const jwtConstants = {
  get secret() {
    return getJwtSecret();
  },
  expiresIn: process.env.JWT_EXPIRES_IN || '900s',
  get refreshSecret() {
    return getJwtRefreshSecret();
  },
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
