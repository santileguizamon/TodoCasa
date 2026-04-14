import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { router, Redirect } from "expo-router";
import { useAuth } from "../../context/auth-context";
import { apiFetch } from "../../lib/api";

export default function SuscripcionPendiente() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiFetch(
          "/pagos/usuario/mis-pagos",
          { method: "GET" },
          token
        );

        const pagoActivo = res?.some(
          (p: any) =>
            p.tipo === "SUSCRIPCION" &&
            p.estado === "COMPLETADO"
        );

        if (pagoActivo) {
          clearInterval(interval);

          if (user.rol === "CLIENTE") {
             router.replace("/(protected)/cliente" as any);
          } else {
              router.replace("/(protected)/profesional" as any);
          }
        }
      } catch (err) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [user, token]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        backgroundColor: "#ffffff",
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />

      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          marginTop: 24,
          textAlign: "center",
        }}
      >
        Estamos confirmando tu suscripción
      </Text>

      <Text
        style={{
          marginTop: 12,
          color: "#6B7280",
          textAlign: "center",
        }}
      >
        Esto puede tardar unos segundos.  
        No cierres la aplicación.
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/")}
        style={{
          marginTop: 30,
          padding: 12,
        }}
      >
        <Text style={{ color: "#2563EB" }}>
          Cancelar y volver
        </Text>
      </TouchableOpacity>
    </View>
  );
}
