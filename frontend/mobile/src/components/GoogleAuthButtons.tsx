import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "../context/auth-context";
import { authStyles as s } from "../styles/auth.styles";

// Inicio de sesión con Google. Este componente SOLO se muestra si
// ENABLE_GOOGLE_LOGIN está activo (ver src/config/features.ts), por eso el hook
// de Google se ejecuta únicamente cuando la función está encendida.
const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ??
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // Reemplazar con el real
const redirectUri = AuthSession.makeRedirectUri({ scheme: "mobile" });

type RolGoogle = "CLIENTE" | "PROFESIONAL";

type Props = {
  submitting: boolean;
  setSubmitting: (valor: boolean) => void;
  onError: (mensaje: string) => void;
};

export default function GoogleAuthButtons({
  submitting,
  setSubmitting,
  onError,
}: Props) {
  const { googleLogin } = useAuth();
  const [pendingGoogleRole, setPendingGoogleRole] = useState<RolGoogle | null>(
    null
  );

  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: "id_token",
      useProxy: true,
    } as any,
    { skipCodeExchange: true } as any
  );

  useEffect(() => {
    const idToken = (response as any)?.params?.id_token;
    if (idToken && pendingGoogleRole) {
      (async () => {
        onError("");
        try {
          setSubmitting(true);
          await googleLogin(idToken, pendingGoogleRole);
        } catch {
          onError("Error al iniciar sesion con Google");
        } finally {
          setSubmitting(false);
          setPendingGoogleRole(null);
        }
      })();
    }
  }, [(response as any)?.params?.id_token, pendingGoogleRole]);

  async function handleGoogleLogin(rol: RolGoogle) {
    setPendingGoogleRole(rol);
    await promptAsync();
  }

  return (
    <View>
      <View style={s.dividerRow}>
        <View style={s.divider} />
        <Text style={s.dividerText}>o continua con</Text>
        <View style={s.divider} />
      </View>

      <TouchableOpacity
        onPress={() => handleGoogleLogin("CLIENTE")}
        disabled={submitting}
        style={s.googleBtn}
      >
        <Text style={s.googleBtnText}>Google (Cliente)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleGoogleLogin("PROFESIONAL")}
        disabled={submitting}
        style={s.googleBtn}
      >
        <Text style={s.googleBtnText}>Google (Profesional)</Text>
      </TouchableOpacity>
    </View>
  );
}
