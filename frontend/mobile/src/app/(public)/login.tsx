import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Redirect, Link } from "expo-router";
import { useAuth } from "../../context/auth-context";
import { authStyles as s } from "../../styles/auth.styles";

export default function LoginScreen() {
  const { login, user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    if (user.rol === "CLIENTE") {
      return <Redirect href={"/(protected)/cliente" as any} />;
    }
    if (user.rol === "PROFESIONAL") {
      return <Redirect href={"/(protected)/profesional" as any} />;
    }
  }

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
    } catch {
      setError("Credenciales invalidas");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <View style={s.screen}>
      <View style={s.hero}>
        <Text style={s.brand}>TODOCASA</Text>
        <Text style={s.tagline}>Inicia sesion y coordina tu proximo trabajo.</Text>
      </View>

      <View style={s.card}>
        <View style={s.inputBlock}>
          <Text style={s.label}>Email</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[s.input, error ? s.inputError : null]}
          />
        </View>

        <View style={s.inputBlock}>
          <Text style={s.label}>Contrasena</Text>
          <View style={s.passwordWrap}>
            <TextInput
              placeholder="Contrasena"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              secureTextEntry={secure}
              style={[s.input, s.passwordInput, error ? s.inputError : null]}
            />
            <TouchableOpacity
              onPress={() => setSecure(!secure)}
              style={s.toggleBtn}
            >
              <Text style={s.toggleText}>{secure ? "Mostrar" : "Ocultar"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={submitting}
          style={[s.submit, submitting || !email || !password ? s.submitDisabled : null]}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={s.submitText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={s.secondaryRow}>
          <Text style={s.secondaryText}>No tenes cuenta? </Text>
          <Link href={"/(public)/register" as any} asChild>
            <TouchableOpacity>
              <Text style={s.secondaryLink}>Registrate</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={s.bottomAccent}>
        <Text style={s.bottomAccentText}>Pagas solo cuando el trabajo esta terminado.</Text>
      </View>
    </View>
  );
}
