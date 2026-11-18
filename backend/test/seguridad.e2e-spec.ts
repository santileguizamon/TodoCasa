/**
 * Pruebas de seguridad de punta a punta contra un backend corriendo.
 *
 * SOLO contra una base LOCAL de pruebas. Requisitos:
 *   - Backend compilado (npm run build) y levantado en API_URL (por defecto
 *     http://localhost:3000) con CORS_ORIGINS=http://localhost:3001 y
 *     SUSCRIPCION_PRECIO_ARS=11000.
 *   - El backend arrancado con la precarga que simula Mercado Pago
 *     (MP_MOCK_FILE apunta al JSON que comparten la precarga y esta prueba).
 *   - DATABASE_URL apuntando a la misma base local que usa ese backend.
 *
 *   npx jest --config test/jest-e2e.json --runInBand
 */
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { spawn, execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { TrabajosService } from '../src/trabajos/trabajos.service';

const API = process.env.API_URL || 'http://localhost:3000';
const BACKEND_DIR = path.join(__dirname, '..');
const MP_MOCK_FILE = process.env.MP_MOCK_FILE || '';
const MP_PRELOAD = process.env.MP_PRELOAD || '';

const dbHost = new URL(process.env.DATABASE_URL || 'postgresql://x@nohost/x').hostname;
if (!['localhost', '127.0.0.1', '::1'].includes(dbHost)) {
  throw new Error(`Estas pruebas solo corren contra una base local (host actual: ${dbHost})`);
}

const prisma = new PrismaClient();
const sfx = Date.now();
const PASS = 'Clave12345';

type Sesion = { id: number; token: string; email: string };

const http = () => request(API);

function sinDatosSensibles(body: unknown) {
  const txt = JSON.stringify(body ?? null);
  expect(txt).not.toMatch(/"password"/);
  expect(txt).not.toMatch(/"refreshTokenHash"/);
}

async function registrarYLoguear(nombre: string, rol: 'CLIENTE' | 'PROFESIONAL'): Promise<Sesion> {
  const email = `${nombre.toLowerCase()}${sfx}@test.local`;
  await http().post('/auth/register').send({ nombre, email, password: PASS, rol }).expect(201);
  const r = await http().post('/auth/login').send({ email, password: PASS }).expect(200);
  return { id: r.body.user.id, token: r.body.access_token, email };
}

function crearAdmin(email: string, password: string) {
  return execFileSync('node', ['scripts/crear-admin.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, ADMIN_EMAIL: email, ADMIN_PASSWORD: password },
  }).toString();
}

function leerMock() {
  return JSON.parse(fs.readFileSync(MP_MOCK_FILE, 'utf8'));
}
function guardarMock(d: unknown) {
  fs.writeFileSync(MP_MOCK_FILE, JSON.stringify(d, null, 2));
}

/** Arranca otra instancia del backend compilado y espera a que levante o termine. */
function arrancarBackend(env: NodeJS.ProcessEnv, port: number) {
  return new Promise<{ ok: boolean; salida: string; kill: () => void }>((resolve) => {
    const args = MP_PRELOAD ? ['-r', MP_PRELOAD, 'dist/main.js'] : ['dist/main.js'];
    const p = spawn('node', args, { cwd: BACKEND_DIR, env: { ...env, PORT: String(port) } });
    let salida = '';
    let timer: NodeJS.Timeout;
    const fin = (ok: boolean) => {
      clearTimeout(timer);
      resolve({ ok, salida, kill: () => p.kill() });
    };
    p.stdout.on('data', (d) => {
      salida += d;
      if (salida.includes('Servidor corriendo')) fin(true);
    });
    p.stderr.on('data', (d) => (salida += d));
    p.on('exit', () => fin(false));
    timer = setTimeout(() => fin(false), 30000);
  });
}

const auth = (s: { token: string }) => ({ Authorization: `Bearer ${s.token}` });

let cliA: Sesion, cliB: Sesion, p1: Sesion, p2: Sesion, adm: Sesion;
let trabajo: any; // trabajo con dos ofertas
const adminEmail = `admin${sfx}@test.local`;
const adminPass = 'AdminPrueba123';

beforeAll(async () => {
  cliA = await registrarYLoguear('CliA', 'CLIENTE');
  cliB = await registrarYLoguear('CliB', 'CLIENTE');
  p1 = await registrarYLoguear('ProUno', 'PROFESIONAL');
  p2 = await registrarYLoguear('ProDos', 'PROFESIONAL');
  for (const p of [p1, p2]) {
    await prisma.suscripcion.create({
      data: { usuarioId: p.id, nivel: 'BASICO', activa: true, fechaFin: new Date(Date.now() + 30 * 86400000) },
    });
  }
  crearAdmin(adminEmail, adminPass);
  const r = await http().post('/auth/login').send({ email: adminEmail, password: adminPass }).expect(200);
  adm = { id: r.body.user.id, token: r.body.access_token, email: adminEmail };

  const t = await http()
    .post('/trabajos')
    .set(auth(cliA))
    .send({ titulo: 'Canilla', descripcion: 'Pierde', rangoMin: 1000, rangoMax: 5000, clienteId: cliA.id, urgente: false, lat: -34.6, lng: -58.38 })
    .expect(201);
  trabajo = t.body;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('T1 - cuentas ADMIN', () => {
  it('registrarse con rol ADMIN da 400 o 403', async () => {
    const r = await http()
      .post('/auth/register')
      .send({ nombre: 'Malo', email: `malo${sfx}@test.local`, password: PASS, rol: 'ADMIN' });
    expect([400, 403]).toContain(r.status);
    expect(await prisma.usuario.findUnique({ where: { email: `malo${sfx}@test.local` } })).toBeNull();
  });

  it('POST /users sin sesión da 401 y con sesión de cliente da 403', async () => {
    const body = { nombre: 'X', email: `x${sfx}@test.local`, password: PASS, rol: 'ADMIN' };
    await http().post('/users').send(body).expect(401);
    await http().post('/users').set(auth(cliA)).send(body).expect(403);
  });

  it('PUT /users/:id no permite cambiar rol, activo ni verificado', async () => {
    await http()
      .put(`/users/${cliB.id}`)
      .set(auth(cliB))
      .send({ nombre: 'CliB2', rol: 'ADMIN', activo: false, verificado: true, lat: 1, lng: 1 });
    const u = await prisma.usuario.findUnique({ where: { id: cliB.id } });
    expect(u!.rol).toBe('CLIENTE');
    expect(u!.activo).toBe(true);
    expect(u!.verificado).toBe(false);
  });
});

describe('T6 - controles de dueño', () => {
  it('otro cliente recibe 403 en el trabajo, sus ofertas y sus trabajos', async () => {
    await http().get(`/trabajos/${trabajo.id}`).set(auth(cliB)).expect(403);
    await http().get(`/ofertas/trabajo/${trabajo.id}`).set(auth(cliB)).expect(403);
    await http().get(`/trabajos/cliente/id/${cliA.id}`).set(auth(cliB)).expect(403);
  });

  it('el dueño, el admin y un profesional (trabajo pendiente) sí pueden', async () => {
    await http().get(`/trabajos/${trabajo.id}`).set(auth(cliA)).expect(200);
    await http().get(`/trabajos/${trabajo.id}`).set(auth(adm)).expect(200);
    await http().get(`/trabajos/${trabajo.id}`).set(auth(p1)).expect(200);
    await http().get(`/ofertas/trabajo/${trabajo.id}`).set(auth(cliA)).expect(200);
    await http().get(`/ofertas/trabajo/${trabajo.id}`).set(auth(adm)).expect(200);
    await http().get(`/trabajos/cliente/id/${cliA.id}`).set(auth(cliA)).expect(200);
    await http().get(`/trabajos/cliente/id/${cliA.id}`).set(auth(adm)).expect(200);
  });

  it('un profesional no ve las ofertas de un trabajo ajeno', async () => {
    await http().get(`/ofertas/trabajo/${trabajo.id}`).set(auth(p1)).expect(403);
  });
});

describe('T4 - cambiar estado solo admin', () => {
  it('cliente y profesional reciben 403; el admin puede', async () => {
    const t = await http()
      .post('/trabajos')
      .set(auth(cliA))
      .send({ titulo: 'Estado', descripcion: 'x', rangoMin: 1, rangoMax: 10, clienteId: cliA.id, lat: -34.6, lng: -58.38 })
      .expect(201);
    await http().patch(`/trabajos/estado/${t.body.id}`).set(auth(cliA)).send({ estado: 'FINALIZADO' }).expect(403);
    await http().patch(`/trabajos/estado/${t.body.id}`).set(auth(p1)).send({ estado: 'FINALIZADO' }).expect(403);
    const r = await http().patch(`/trabajos/estado/${t.body.id}`).set(auth(adm)).send({ estado: 'CANCELADO' });
    expect(r.status).toBe(200);
    expect(r.body.estado).toBe('CANCELADO');
  });
});

describe('T5 - profesional asignado y finalización', () => {
  it('el cliente no puede finalizar un trabajo pendiente', async () => {
    await http().patch(`/trabajos/${trabajo.id}/finalizar`).set(auth(cliA)).expect(400);
  });

  it('con dos ofertas, solo el profesional aceptado puede marcar terminado', async () => {
    // P2 oferta primero (su oferta queda como ofertas[0])
    await http().post('/ofertas').set(auth(p2)).send({ trabajoId: trabajo.id, monto: 2000 }).expect(201);
    const o1 = await http().post('/ofertas').set(auth(p1)).send({ trabajoId: trabajo.id, monto: 3000 }).expect(201);
    await http().post(`/ofertas/${o1.body.id}/aceptar`).set(auth(cliA)).expect(201);

    await http().patch(`/trabajos/${trabajo.id}/marcar-terminado`).set(auth(p2)).expect(403);
    await http().get(`/trabajos/${trabajo.id}`).set(auth(p1)).expect(200);
    await http().patch(`/trabajos/${trabajo.id}/marcar-terminado`).set(auth(p1)).expect(200);
  });

  it('otro cliente no puede finalizar un trabajo ajeno; el dueño sí, y notifica al asignado', async () => {
    await http().patch(`/trabajos/${trabajo.id}/finalizar`).set(auth(cliB)).expect(403);
    await http().patch(`/trabajos/${trabajo.id}/finalizar`).set(auth(cliA)).expect(200);
    const n = await prisma.notificacion.findMany({ where: { tipo: 'TRABAJO_FINALIZADO', mensaje: { contains: trabajo.titulo } } });
    expect(n.map((x) => x.usuarioId)).toContain(p1.id);
    expect(n.map((x) => x.usuarioId)).not.toContain(p2.id);
  });

  it('cancelar un trabajo FINALIZADO se rechaza', async () => {
    await http().patch(`/trabajos/${trabajo.id}/cancelar`).set(auth(cliA)).expect(400);
  });
});

describe('T2 - ninguna respuesta expone password ni refreshTokenHash', () => {
  it('REST', async () => {
    const chat = await http().get(`/chats/trabajo/${trabajo.id}`).set(auth(cliA)).expect(200);
    const respuestas = await Promise.all([
      http().get(`/trabajos/${trabajo.id}`).set(auth(cliA)),
      http().get(`/chats/${chat.body.id}/mensajes`).set(auth(cliA)),
      http().get('/chats').set(auth(cliA)),
      http().get('/chats').set(auth(p1)),
      http().get('/profesionales').set(auth(cliA)),
      http().get(`/profesionales/${p1.id}`).set(auth(cliA)),
      http().get(`/valoraciones/profesional/${p1.id}`).set(auth(cliA)),
      http().get('/auth/me').set(auth(cliA)),
      http().get('/users/me').set(auth(cliA)),
      http().get('/admin/usuarios').set(auth(adm)),
      http().get('/users').set(auth(adm)),
      http().get('/trabajos/profesional/mis-trabajos').set(auth(p1)),
    ]);
    respuestas.push(chat);
    for (const r of respuestas) {
      expect(r.status).toBeLessThan(300);
      sinDatosSensibles(r.body);
    }
  });

  it('WebSocket (chat y mensajes)', async () => {
    // socket.io-client es dependencia de la app móvil del mismo monorepo
    const { io } = require(require.resolve('socket.io-client', { paths: [path.join(BACKEND_DIR, '../frontend/mobile')] }));

    // Trabajo ASIGNADO entre cliA y p1 para que el gateway de mensajes lo permita
    const t = await http()
      .post('/trabajos')
      .set(auth(cliA))
      .send({ titulo: 'WS', descripcion: 'x', rangoMin: 1, rangoMax: 10, clienteId: cliA.id, lat: -34.6, lng: -58.38 })
      .expect(201);
    const o = await http().post('/ofertas').set(auth(p1)).send({ trabajoId: t.body.id, monto: 5 }).expect(201);
    await http().post(`/ofertas/${o.body.id}/aceptar`).set(auth(cliA)).expect(201);
    const chat = await http().get(`/chats/trabajo/${t.body.id}`).set(auth(cliA)).expect(200);

    // Nota: MensajesGateway (evento enviar_mensaje) no está registrado en ningún
    // módulo, así que el único gateway activo es ChatGateway, que usa la app.
    const s = io(API, { auth: { token: cliA.token }, transports: ['websocket'] });
    const esperar = <T>(evento: string) =>
      new Promise<T>((res, rej) => {
        const t = setTimeout(() => rej(new Error(`sin evento ${evento}`)), 10000);
        s.once(evento, (d: T) => {
          clearTimeout(t);
          res(d);
        });
      });
    try {
      await esperar('connect');
      s.emit('unirseChat', { chatId: chat.body.id });
      await new Promise((r) => setTimeout(r, 300));
      const nuevo = esperar<any>('nuevoMensaje');
      const actualizado = esperar<any>('chatActualizado');
      s.emit('enviarMensaje', { chatId: chat.body.id, remitenteId: cliA.id, contenido: 'hola ws' });
      const m1 = await nuevo;
      const m2 = await actualizado;
      expect(m1.contenido).toBe('hola ws');
      expect(m2.mensaje.contenido).toBe('hola ws');
      sinDatosSensibles(m1);
      sinDatosSensibles(m2);
    } finally {
      s.close();
    }
  });
});

describe('T8 - trabajos urgentes vencidos', () => {
  it('no se puede ofertar sobre un trabajo vencido', async () => {
    const t = await http()
      .post('/trabajos')
      .set(auth(cliA))
      .send({ titulo: 'Urgente', descripcion: 'x', rangoMin: 1, rangoMax: 10, clienteId: cliA.id, urgente: true, lat: -34.6, lng: -58.38 })
      .expect(201);
    await prisma.trabajo.update({ where: { id: t.body.id }, data: { expiraEn: new Date(Date.now() - 60000) } });
    await http().post('/ofertas').set(auth(p1)).send({ trabajoId: t.body.id, monto: 5 }).expect(400);
  });

  it('el proceso horario cancela los urgentes vencidos y deja los vigentes', async () => {
    const vencido = await prisma.trabajo.create({
      data: { clienteId: cliA.id, titulo: 'Vencido', descripcion: 'x', rangoMin: 1, rangoMax: 2, urgente: true, expiraEn: new Date(Date.now() - 1000) },
    });
    const vigente = await prisma.trabajo.create({
      data: { clienteId: cliA.id, titulo: 'Vigente', descripcion: 'x', rangoMin: 1, rangoMax: 2, urgente: true, expiraEn: new Date(Date.now() + 3600000) },
    });
    const service = new TrabajosService(prisma as any, {} as any, {} as any);
    const r = await service.expirarTrabajosUrgentes();
    expect(r.total).toBeGreaterThanOrEqual(1);
    expect((await prisma.trabajo.findUnique({ where: { id: vencido.id } }))!.estado).toBe('CANCELADO');
    expect((await prisma.trabajo.findUnique({ where: { id: vigente.id } }))!.estado).toBe('PENDIENTE');
  });
});

describe('T3 - claves JWT', () => {
  it('tokens firmados con las claves por defecto viejas dan 401', async () => {
    const payload = { userId: adm.id, email: adm.email, rol: 'ADMIN' };
    // Control: el mismo payload firmado con la clave real sí funciona
    const real = new JwtService({ secret: process.env.JWT_SECRET }).sign(payload);
    await http().get('/admin/usuarios').set('Authorization', `Bearer ${real}`).expect(200);
    for (const secret of ['superSecretKey', 'changeme']) {
      const token = new JwtService({ secret }).sign(payload);
      await http().get('/auth/me').set('Authorization', `Bearer ${token}`).expect(401);
      await http().get('/admin/usuarios').set('Authorization', `Bearer ${token}`).expect(401);
    }
  });

  it('el backend no arranca sin JWT_SECRET ni sin JWT_REFRESH_SECRET', async () => {
    for (const falta of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
      // Se define vacía (no se borra): @prisma/client carga backend/.env al importarse
      // y dotenv no pisa variables ya definidas, así la prueba no depende de ese archivo.
      const env = { ...process.env, [falta]: '' };
      const r = await arrancarBackend(env, 3990);
      r.kill();
      expect(r.ok).toBe(false);
      expect(r.salida).toContain(falta);
    }
  });

  it('en producción exige al menos 32 caracteres', async () => {
    const r = await arrancarBackend({ ...process.env, NODE_ENV: 'production', JWT_SECRET: 'corta' }, 3991);
    r.kill();
    expect(r.ok).toBe(false);
    expect(r.salida).toContain('32');
  });
});

describe('T7 - pagos', () => {
  it('el monto lo fija el servidor, no el cliente', async () => {
    const r = await http().post('/pagos').set(auth(p2)).send({ tipo: 'SUSCRIPCION', monto: 1 }).expect(201);
    expect(r.body.pago.monto).toBe(11000);
    const prefs = leerMock().prefs;
    expect(prefs[prefs.length - 1].items[0].unit_price).toBe(11000);
  });

  it('webhook con importe menor al registrado marca el pago como FALLIDO', async () => {
    const r = await http().post('/pagos').set(auth(p2)).send({ tipo: 'SUSCRIPCION', monto: 1 }).expect(201);
    const mock = leerMock();
    mock.payments['pago-bajo'] = { external_reference: r.body.pago.referenciaMP, status: 'approved', transaction_amount: 1 };
    guardarMock(mock);
    await http().post('/pagos/webhook').send({ action: 'payment.updated', data: { id: 'pago-bajo' } }).expect(200);
    expect((await prisma.pago.findUnique({ where: { id: r.body.pago.id } }))!.estado).toBe('FALLIDO');
  });

  it('webhook repetido (y simultáneo) no aplica la suscripción dos veces', async () => {
    const r = await http().post('/pagos').set(auth(p2)).send({ tipo: 'SUSCRIPCION', monto: 1 }).expect(201);
    const mock = leerMock();
    mock.payments['pago-ok'] = { external_reference: r.body.pago.referenciaMP, status: 'approved', transaction_amount: 11000 };
    guardarMock(mock);
    const contar = () => prisma.notificacion.count({ where: { usuarioId: p2.id, mensaje: 'Tu suscripción fue activada correctamente.' } });
    const antes = await contar();
    const body = { action: 'payment.updated', data: { id: 'pago-ok' } };
    await Promise.all([http().post('/pagos/webhook').send(body), http().post('/pagos/webhook').send(body)]);
    const sus1 = await prisma.suscripcion.findUnique({ where: { usuarioId: p2.id } });
    await http().post('/pagos/webhook').send(body).expect(200);
    const sus2 = await prisma.suscripcion.findUnique({ where: { usuarioId: p2.id } });
    expect((await prisma.pago.findUnique({ where: { id: r.body.pago.id } }))!.estado).toBe('COMPLETADO');
    expect(await contar()).toBe(antes + 1);
    expect(sus2!.fechaInicio.getTime()).toBe(sus1!.fechaInicio.getTime());
    expect(sus2!.fechaFin!.getTime()).toBe(sus1!.fechaFin!.getTime());
  });
});

describe('T10 - CORS', () => {
  it('un OPTIONS desde http://localhost:3001 recibe ese origen permitido', async () => {
    const r = await http()
      .options('/auth/login')
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'POST');
    expect(r.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });

  it('con dos orígenes en la lista ambos funcionan y uno ajeno no', async () => {
    const port = 3992;
    const srv = await arrancarBackend({ ...process.env, CORS_ORIGINS: ' http://localhost:3001 , http://panel.test:4000 ,' }, port);
    try {
      expect(srv.ok).toBe(true);
      for (const origin of ['http://localhost:3001', 'http://panel.test:4000']) {
        const r = await request(`http://localhost:${port}`)
          .options('/auth/login')
          .set('Origin', origin)
          .set('Access-Control-Request-Method', 'POST');
        expect(r.headers['access-control-allow-origin']).toBe(origin);
      }
      const ajeno = await request(`http://localhost:${port}`)
        .options('/auth/login')
        .set('Origin', 'http://malicioso.test')
        .set('Access-Control-Request-Method', 'POST');
      expect(ajeno.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      srv.kill();
    }
  });
});

describe('T9 - Google oculto', () => {
  it('POST /auth/google da 404', async () => {
    await http().post('/auth/google').send({ idToken: 'x', rol: 'CLIENTE' }).expect(404);
  });
});

describe('T0 - script crear-admin', () => {
  it('crea un admin, no duplica al repetirlo y permite iniciar sesión', async () => {
    const email = `admin2${sfx}@test.local`;
    crearAdmin(email, 'OtraClave1234');
    crearAdmin(email, 'OtraClave1234');
    expect(await prisma.usuario.count({ where: { email } })).toBe(1);
    expect((await prisma.usuario.findUnique({ where: { email } }))!.rol).toBe('ADMIN');
    const r = await http().post('/auth/login').send({ email, password: 'OtraClave1234' }).expect(200);
    expect(r.body.user.rol).toBe('ADMIN');
  });

  it('rechaza contraseñas de menos de 10 caracteres y --listar no muestra datos sensibles', () => {
    expect(() => crearAdmin(`corta${sfx}@test.local`, 'corta')).toThrow();
    const salida = execFileSync('node', ['scripts/crear-admin.js', '--listar'], { cwd: BACKEND_DIR, env: process.env }).toString();
    expect(salida).toContain(adminEmail);
    expect(salida).not.toMatch(/\$2[aby]\$/);
    expect(salida.toLowerCase()).not.toContain('password');
  });
});

// ---------------------------------------------------------------------------
// Segunda pasada
// ---------------------------------------------------------------------------

/** Trabajo ASIGNADO entre cliA y p1, con su chat. */
async function trabajoAsignado(titulo: string) {
  const t = await http()
    .post('/trabajos')
    .set(auth(cliA))
    .send({ titulo, descripcion: 'x', rangoMin: 1, rangoMax: 10, clienteId: cliA.id, lat: -34.6, lng: -58.38 })
    .expect(201);
  const o = await http().post('/ofertas').set(auth(p1)).send({ trabajoId: t.body.id, monto: 5 }).expect(201);
  await http().post(`/ofertas/${o.body.id}/aceptar`).set(auth(cliA)).expect(201);
  const chat = await http().get(`/chats/trabajo/${t.body.id}`).set(auth(cliA)).expect(200);
  return { trabajo: t.body, chat: chat.body };
}

describe('A - profesional que ofertó y perdió', () => {
  it('puede abrir el trabajo (200); un profesional sin oferta sobre un trabajo no pendiente recibe 403', async () => {
    const t = await http()
      .post('/trabajos')
      .set(auth(cliA))
      .send({ titulo: 'Perdido', descripcion: 'x', rangoMin: 1, rangoMax: 10, clienteId: cliA.id, lat: -34.6, lng: -58.38 })
      .expect(201);
    await http().post('/ofertas').set(auth(p2)).send({ trabajoId: t.body.id, monto: 4 }).expect(201);
    const o1 = await http().post('/ofertas').set(auth(p1)).send({ trabajoId: t.body.id, monto: 5 }).expect(201);
    await http().post(`/ofertas/${o1.body.id}/aceptar`).set(auth(cliA)).expect(201);

    const r = await http().get(`/trabajos/${t.body.id}`).set(auth(p2)).expect(200);
    expect(r.body.id).toBe(t.body.id);
    sinDatosSensibles(r.body);
    // El trabajo perdido aparece en sus "Mis trabajos" y se puede abrir
    const mis = await http().get('/trabajos/profesional/mis-trabajos').set(auth(p2)).expect(200);
    expect(mis.body.map((x: any) => x.id)).toContain(t.body.id);

    const pSin = await registrarYLoguear('ProSin', 'PROFESIONAL');
    await http().get(`/trabajos/${t.body.id}`).set(auth(pSin)).expect(403); // ASIGNADO
    await http().get(`/trabajos/${trabajo.id}`).set(auth(pSin)).expect(403); // FINALIZADO
    // Sigue pudiendo ver trabajos pendientes
    const pendiente = await http()
      .post('/trabajos')
      .set(auth(cliA))
      .send({ titulo: 'Pendiente', descripcion: 'x', rangoMin: 1, rangoMax: 10, clienteId: cliA.id, lat: -34.6, lng: -58.38 })
      .expect(201);
    await http().get(`/trabajos/${pendiente.body.id}`).set(auth(pSin)).expect(200);
  });
});

describe('B - /suscripciones', () => {
  let cliC: Sesion;
  let susId: number;

  beforeAll(async () => {
    cliC = await registrarYLoguear('CliC', 'CLIENTE');
    const s = await prisma.suscripcion.findUnique({ where: { usuarioId: p1.id } });
    susId = s!.id;
  });

  const rutas = () => [
    { m: 'post' as const, url: '/suscripciones', body: { usuarioId: cliB.id, nivel: 'BASICO' } },
    { m: 'get' as const, url: '/suscripciones' },
    { m: 'get' as const, url: `/suscripciones/${susId}` },
    { m: 'patch' as const, url: `/suscripciones/${susId}`, body: { activa: true } },
    { m: 'delete' as const, url: `/suscripciones/${susId}` },
  ];

  it('sin sesión todas dan 401 (también mi-suscripcion)', async () => {
    for (const r of rutas()) {
      const res = await http()[r.m](r.url).send(r.body ?? {});
      expect([r.m, r.url, res.status]).toEqual([r.m, r.url, 401]);
    }
    await http().get('/suscripciones/mi-suscripcion').expect(401);
  });

  it('cliente y profesional reciben 403; mi-suscripcion da 200', async () => {
    for (const s of [cliB, p1]) {
      for (const r of rutas()) {
        const res = await http()[r.m](r.url).set(auth(s)).send(r.body ?? {});
        expect([r.m, r.url, res.status]).toEqual([r.m, r.url, 403]);
      }
      await http().get('/suscripciones/mi-suscripcion').set(auth(s)).expect(200);
    }
    const mia = await http().get('/suscripciones/mi-suscripcion').set(auth(p1)).expect(200);
    expect(mia.body.usuarioId).toBe(p1.id);
  });

  it('un usuario no puede darse una suscripción activa', async () => {
    await http().post('/suscripciones').set(auth(cliB)).send({ usuarioId: cliB.id, nivel: 'PREMIUM' }).expect(403);
    expect(await prisma.suscripcion.findUnique({ where: { usuarioId: cliB.id } })).toBeNull();
    // Y la suscripción de p1 sigue activa (nadie sin permiso pudo cancelarla)
    expect((await prisma.suscripcion.findUnique({ where: { id: susId } }))!.activa).toBe(true);
  });

  it('el administrador puede usarlas', async () => {
    const c = await http().post('/suscripciones').set(auth(adm)).send({ usuarioId: cliC.id, nivel: 'BASICO' }).expect(201);
    const id = c.body.data.id;
    const todas = await http().get('/suscripciones').set(auth(adm)).expect(200);
    expect(todas.body.map((x: any) => x.id)).toContain(id);
    sinDatosSensibles(todas.body);
    await http().get(`/suscripciones/${id}`).set(auth(adm)).expect(200);
    await http().patch(`/suscripciones/${id}`).set(auth(adm)).send({ nivel: 'PREMIUM' }).expect(200);
    const d = await http().delete(`/suscripciones/${id}`).set(auth(adm)).expect(200);
    expect(d.body.activa).toBe(false);
  });
});

describe('C - /mensajes', () => {
  beforeAll(async () => {
    await trabajoAsignado('Mensajes REST');
  });

  it('sin sesión da 401', async () => {
    await http().post('/mensajes').send({ destinatarioId: p1.id, contenido: 'x' }).expect(401);
    await http().get(`/mensajes/conversacion/${cliA.id}/${p1.id}`).expect(401);
    await http().get(`/mensajes/usuario/${cliA.id}`).expect(401);
  });

  it('el remitente guardado es el usuario autenticado aunque el cuerpo diga otro', async () => {
    const r = await http()
      .post('/mensajes')
      .set(auth(cliA))
      .send({ remitenteId: cliB.id, destinatarioId: p1.id, contenido: 'hola rest' })
      .expect(201);
    expect(r.body.data.remitenteId).toBe(cliA.id);
    const m = await prisma.mensaje.findUnique({ where: { id: r.body.data.id } });
    expect(m!.remitenteId).toBe(cliA.id);
    sinDatosSensibles(r.body);
  });

  it('un tercero recibe 403 al leer una conversación ajena; los participantes y el admin pueden', async () => {
    await http().get(`/mensajes/conversacion/${cliA.id}/${p1.id}`).set(auth(cliB)).expect(403);
    await http().get(`/mensajes/usuario/${cliA.id}`).set(auth(cliB)).expect(403);
    const conv = await http().get(`/mensajes/conversacion/${cliA.id}/${p1.id}`).set(auth(p1)).expect(200);
    expect(conv.body.data.some((x: any) => x.contenido === 'hola rest')).toBe(true);
    await http().get(`/mensajes/conversacion/${cliA.id}/${p1.id}`).set(auth(adm)).expect(200);
    await http().get(`/mensajes/usuario/${cliA.id}`).set(auth(cliA)).expect(200);
    await http().get(`/mensajes/usuario/${cliA.id}`).set(auth(adm)).expect(200);
  });

  it('GET /chats/:id/mensajes: un tercero recibe 403', async () => {
    const { chat } = await trabajoAsignado('Chat REST');
    await http().get(`/chats/${chat.id}/mensajes`).set(auth(cliB)).expect(403);
    await http().get(`/chats/${chat.id}/mensajes`).set(auth(p2)).expect(403);
    await http().get(`/chats/${chat.id}/mensajes`).set(auth(cliA)).expect(200);
    await http().get(`/chats/${chat.id}/mensajes`).set(auth(p1)).expect(200);
  });
});

describe('D - WebSocket del chat', () => {
  const { io } = require(require.resolve('socket.io-client', { paths: [path.join(BACKEND_DIR, '../frontend/mobile')] }));
  const abiertos: any[] = [];
  let chat: any;

  beforeAll(async () => {
    chat = (await trabajoAsignado('Chat WS')).chat;
  });
  afterAll(() => abiertos.forEach((s) => s.close()));

  function conectar(opts: any) {
    const s = io(API, { transports: ['websocket'], reconnection: false, ...opts });
    abiertos.push(s);
    return new Promise<{ ok: boolean; s: any; error?: string }>((res) => {
      const t = setTimeout(() => res({ ok: false, s, error: 'timeout' }), 8000);
      s.once('connect', () => {
        clearTimeout(t);
        res({ ok: true, s });
      });
      s.once('connect_error', (e: Error) => {
        clearTimeout(t);
        res({ ok: false, s, error: e.message });
      });
    });
  }
  const ack = (s: any, ev: string, data: any) =>
    new Promise<any>((res) => {
      const t = setTimeout(() => res({ timeout: true }), 8000);
      s.emit(ev, data, (r: any) => {
        clearTimeout(t);
        res(r);
      });
    });
  /** Junta los eventos que llegan desde ahora. */
  const recolectar = (s: any, ev: string) => {
    const lista: any[] = [];
    s.on(ev, (d: any) => lista.push(d));
    return lista;
  };
  const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

  it('sin token, o con token inválido, se rechaza la conexión', async () => {
    const sin = await conectar({});
    expect(sin.ok).toBe(false);
    expect(sin.error).toBe('No autorizado');
    const malo = await conectar({ auth: { token: new JwtService({ secret: 'changeme' }).sign({ userId: cliA.id, rol: 'CLIENTE' }) } });
    expect(malo.ok).toBe(false);
    expect(malo.error).toBe('No autorizado');
    // También acepta la cabecera Authorization
    const cab = await conectar({ extraHeaders: { Authorization: `Bearer ${cliA.token}` } });
    expect(cab.ok).toBe(true);
  });

  it('cliente y profesional del chat intercambian mensajes; el remitente es el del token', async () => {
    const a = (await conectar({ auth: { token: cliA.token } })).s;
    const p = (await conectar({ auth: { token: p1.token } })).s;
    expect((await ack(a, 'unirseChat', { chatId: chat.id })).ok).toBe(true);
    expect((await ack(p, 'unirseChat', { chatId: chat.id })).ok).toBe(true);
    const enP = recolectar(p, 'nuevoMensaje');
    const enA = recolectar(a, 'nuevoMensaje');
    const actP = recolectar(p, 'chatActualizado');

    // cliA manda diciendo ser p1: se guarda como cliA
    const m1 = await ack(a, 'enviarMensaje', { chatId: chat.id, remitenteId: p1.id, contenido: 'de A' });
    expect(m1.remitenteId).toBe(cliA.id);
    const m2 = await ack(p, 'enviarMensaje', { chatId: chat.id, contenido: 'de P' });
    expect(m2.remitenteId).toBe(p1.id);
    await pausa(500);

    expect(enP.map((m) => [m.contenido, m.remitenteId])).toEqual([['de A', cliA.id], ['de P', p1.id]]);
    expect(enA.map((m) => m.contenido)).toEqual(['de A', 'de P']);
    expect(actP.length).toBe(2);
    expect((await prisma.mensaje.findUnique({ where: { id: m1.id } }))!.remitenteId).toBe(cliA.id);
    enP.forEach(sinDatosSensibles);
  });

  it('un usuario ajeno no puede unirse, no recibe mensajes de la sala y no puede escribir', async () => {
    const a = (await conectar({ auth: { token: cliA.token } })).s;
    const b = (await conectar({ auth: { token: cliB.token } })).s;
    const x = (await conectar({ auth: { token: p2.token } })).s;
    await ack(a, 'unirseChat', { chatId: chat.id });

    const rb = await ack(b, 'unirseChat', { chatId: chat.id });
    expect(rb.ok).toBeUndefined();
    expect(rb.error).toBeDefined();
    const nb = recolectar(b, 'nuevoMensaje');
    const ab = recolectar(b, 'chatActualizado');
    const nx = recolectar(x, 'nuevoMensaje');
    const ax = recolectar(x, 'chatActualizado');

    await ack(a, 'enviarMensaje', { chatId: chat.id, contenido: 'privado' });
    const intento = await ack(b, 'enviarMensaje', { chatId: chat.id, remitenteId: cliA.id, contenido: 'intruso' });
    expect(intento.error).toBeDefined();
    await pausa(500);

    expect(nb).toEqual([]);
    expect(ab).toEqual([]);
    expect(nx).toEqual([]);
    expect(ax).toEqual([]);
    expect(await prisma.mensaje.count({ where: { chatId: chat.id, contenido: 'intruso' } })).toBe(0);
  });
});
