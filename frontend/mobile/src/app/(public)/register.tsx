import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { Redirect, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../../context/auth-context";
import { register } from "../../auth/auth.service";
import { iniciarPago } from "../../pagos/pagos.service";
import { authStyles as s } from "../../styles/auth.styles";

export default function RegisterScreen() {
  const { login: loginContext, user } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"CLIENTE" | "PROFESIONAL">("CLIENTE");

  const [secure, setSecure] = useState(true);
  const [error, setError] = useState("");
  const [debugError, setDebugError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    if (user.rol === "CLIENTE") {
      return <Redirect href={"/(protected)/cliente" as any} />;
    }
    return <Redirect href={"/(protected)/profesional" as any} />;
  }

  async function handleRegister() {
    setError("");
    setDebugError("");

    if (!nombre || !email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setSubmitting(true);

      await register(nombre, email, password, rol);
      const auth = await loginContext(email, password);

      if (rol === "PROFESIONAL") {
        try {
          const pago = await iniciarPago(auth.access_token);

          if (pago?.init_point) {
            await WebBrowser.openBrowserAsync(pago.init_point);
            router.replace("/(public)/suscripcion-pendiente" as any);
            return;
          }
        } catch (paymentErr) {
          console.error("Payment init error:", paymentErr);
          Alert.alert(
            "Registro completado",
            "La cuenta profesional se creo, pero no se pudo iniciar el pago ahora. Podes regularizar la suscripcion desde tu perfil."
          );
        }

        router.replace("/(protected)/profesional" as any);
        return;
      }

      router.replace("/(protected)/cliente" as any);
    } catch (err) {
      console.error("Register error:", err);
      setError(getRegisterErrorMessage(err));
      setDebugError(getRegisterDebugMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={s.screen}>
      <View style={s.hero}>
        <Text style={s.brand}>Crear cuenta</Text>
        <Text style={s.tagline}>Unite a TODOCASA en segundos.</Text>
      </View>

      <View style={s.card}>
        <View style={s.inputBlock}>
          <Text style={s.label}>Nombre</Text>
          <TextInput
            placeholder="Nombre completo"
            placeholderTextColor="#9CA3AF"
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              setError("");
            }}
            style={[s.input, error ? s.inputError : null]}
          />
        </View>

        <View style={s.inputBlock}>
          <Text style={s.label}>Email</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
            style={[s.input, error ? s.inputError : null]}
          />
        </View>

        <View style={s.inputBlock}>
          <Text style={s.label}>Contrasena</Text>
          <View style={s.passwordWrap}>
            <TextInput
              placeholder="Contrasena"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secure}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError("");
              }}
              style={[s.input, s.passwordInput, error ? s.inputError : null]}
            />

            <TouchableOpacity onPress={() => setSecure(!secure)} style={s.toggleBtn}>
              <Text style={s.toggleText}>{secure ? "Mostrar" : "Ocultar"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.inputBlock}>
          <Text style={s.label}>Tipo de cuenta</Text>
          <View style={s.roleRow}>
            {["CLIENTE", "PROFESIONAL"].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRol(r as any)}
                style={[
                  s.roleCard,
                  rol === r ? s.roleCardActive : s.roleCardInactive,
                ]}
              >
                <Text
                  style={[
                    s.roleText,
                    rol === r ? s.roleTextActive : s.roleTextInactive,
                  ]}
                >
                  {r === "CLIENTE" ? "Cliente" : "Profesional"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        {debugError ? (
          <Text selectable style={[s.errorText, { color: "#94A3B8" }]}>
            {debugError}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={submitting}
          style={[s.submit, submitting ? s.submitDisabled : null]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.submitText}>Registrarse</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getRegisterErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const raw = err.message?.trim();
    if (!raw) return "Error al registrarse";

    if (raw.toLowerCase().includes("network request failed")) {
      return "No se pudo conectar con el servidor. Verifica API_URL y backend.";
    }

    try {
      const parsed = JSON.parse(raw) as {
        message?: string | string[];
      };

      if (Array.isArray(parsed?.message) && parsed.message.length > 0) {
        return parsed.message.join(", ");
      }

      if (typeof parsed?.message === "string" && parsed.message) {
        return parsed.message;
      }
    } catch {
      // Fallback
    }

    return raw;
  }
  return "Error al registrarse";
}

function getRegisterDebugMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message || "Error sin mensaje";
  }
  return typeof err === "string" ? err : JSON.stringify(err);
}
