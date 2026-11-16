/**
 * Alta o promoción de un administrador.
 * Se ejecuta a mano: node scripts/crear-admin.js
 * No imprime contraseñas ni hashes.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 10;

function fallo(mensaje) {
  const error = new Error(mensaje);
  error.codigoSalida = 1;
  throw error;
}

async function listar(prisma) {
  const admins = await prisma.usuario.findMany({
    where: { rol: 'ADMIN' },
    select: { id: true, nombre: true, email: true },
    orderBy: { id: 'asc' },
  });

  if (admins.length === 0) {
    console.log('No hay administradores.');
    return;
  }

  for (const admin of admins) {
    console.log(`${admin.id}\t${admin.nombre}\t${admin.email}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const listarSolo = args.includes('--listar');
  const cambiarPassword = args.includes('--cambiar-password');

  const prisma = new PrismaClient();

  try {
    if (listarSolo) {
      await listar(prisma);
      return;
    }

    const email = (process.env.ADMIN_EMAIL || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';
    const nombre = (process.env.ADMIN_NOMBRE || 'Administrador').trim() || 'Administrador';

    if (!email || !EMAIL_RE.test(email)) {
      fallo(
        'ADMIN_EMAIL es obligatorio y debe tener un formato de correo válido. No se modificó la base.',
      );
    }

    if (!password || password.length < 10) {
      fallo(
        'ADMIN_PASSWORD es obligatoria y debe tener al menos 10 caracteres. No se modificó la base.',
      );
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
      const data = {
        rol: 'ADMIN',
        activo: true,
        verificado: true,
      };

      if (cambiarPassword) {
        data.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
      }

      await prisma.usuario.update({
        where: { id: existente.id },
        data,
      });

      console.log(
        cambiarPassword
          ? `Usuario ${existente.id} promovido a administrador y contraseña actualizada.`
          : `Usuario ${existente.id} promovido a administrador. La contraseña no se modificó.`,
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const creado = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        rol: 'ADMIN',
        activo: true,
        verificado: true,
      },
      select: { id: true, nombre: true, email: true },
    });

    console.log(
      `Administrador creado: id=${creado.id} nombre=${creado.nombre} email=${creado.email}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error && error.message ? error.message : 'Error al ejecutar crear-admin.');
  process.exit(error && error.codigoSalida ? error.codigoSalida : 1);
});
