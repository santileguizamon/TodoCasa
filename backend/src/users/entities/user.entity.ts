export class User {
    id: number;
    name: string;
    email: string;
    password: string; // se guarda el hash, nunca el texto plano
    role: 'admin' | 'empleado' | 'profesional';
    description?: string; // solo se usa si el user es profesional
    createdAt: Date;
    updatedAt: Date;
  }
  