// Funciones que se pueden encender o apagar sin tocar el resto del código.
// El inicio de sesión con Google está apagado por defecto. Para encenderlo:
// definir EXPO_PUBLIC_ENABLE_GOOGLE_LOGIN=true y cargar un client ID real en
// EXPO_PUBLIC_GOOGLE_CLIENT_ID (el backend también debe habilitar la ruta de Google).
export const ENABLE_GOOGLE_LOGIN =
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";
