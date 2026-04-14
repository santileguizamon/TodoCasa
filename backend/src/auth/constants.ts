export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'changeme',
    expiresIn: process.env.JWT_EXPIRES_IN || '900s',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'changerefresh',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };