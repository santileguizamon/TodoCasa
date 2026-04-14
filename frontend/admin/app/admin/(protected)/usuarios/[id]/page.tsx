"use client";

import { useParams, useRouter } from "next/navigation";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

const MOCK_USERS: Record<string, Usuario> = {
  "1": {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan@mail.com",
    rol: "ADMIN",
    activo: true,
  },
  "2": {
    id: "2",
    nombre: "María Gómez",
    email: "maria@mail.com",
    rol: "USER",
    activo: false,
  },
};

export default function UsuarioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const usuario = MOCK_USERS[id];

  if (!usuario) {
    return (
      <div>
        <h1>Usuario no encontrado</h1>
        <button onClick={() => router.push("/admin/usuarios")}>
          Volver
        </button>
      </div>
    );
  }

  const handleDesactivar = () => {
    console.log("Desactivando usuario:", usuario.id);
    alert("Usuario desactivado (mock)");
    // 🔜 PATCH /admin/usuarios/:id/desactivar
  };

  const handleReactivar = () => {
    console.log("Reactivando usuario:", usuario.id);
    alert("Usuario reactivado (mock)");
    // 🔜 PATCH /admin/usuarios/:id/reactivar
  };

  return (
    <div>
      <h1>Detalle de usuario</h1>

      <p>
        <strong>ID:</strong> {usuario.id}
      </p>
      <p>
        <strong>Nombre:</strong> {usuario.nombre}
      </p>
      <p>
        <strong>Email:</strong> {usuario.email}
      </p>
      <p>
        <strong>Rol:</strong> {usuario.rol}
      </p>
      <p>
        <strong>Estado:</strong>{" "}
        {usuario.activo ? "Activo" : "Desactivado"}
      </p>

      <div style={{ marginTop: "16px" }}>
        <button
          onClick={() =>
            router.push(`/admin/usuarios/${usuario.id}/editar`)
          }
        >
          Editar
        </button>

        {usuario.activo ? (
          <button
            style={{ marginLeft: "8px" }}
            onClick={handleDesactivar}
          >
            Desactivar
          </button>
        ) : (
          <button
            style={{ marginLeft: "8px" }}
            onClick={handleReactivar}
          >
            Reactivar
          </button>
        )}

        <button
          style={{ marginLeft: "8px" }}
          onClick={() => router.push("/admin/usuarios")}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
