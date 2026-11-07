import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Redirect, Link } from "expo-router";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "../../context/auth-context";
import { authStyles as s } from "../../styles/auth.styles";

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // Reemplazar con el real
const redirectUri = AuthSession.makeRedirectUri({ scheme: 'mobile' });

const [request, response, promptAsync] = AuthSession.useAuthRequest({
  clientId: GOOGLE_CLIENT_ID,
  redirectUri,
  scopes: ['openid', 'profile', 'email'],
  responseType: 'id_token',
  useProxy: true,
}, { skipCodeExchange: true });

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

  const { googleLogin } = useAuth();

  // Effect to handle Google OAuth response
  useEffect(() => {
    if (response?.params?.id_token && pendingGoogleRole) {
      (async () => {
        setError("");
        try {
          setSubmitting(true);
          await googleLogin(response.params.id_token, pendingGoogleRole);
        } catch {
          setError("Error al iniciar sesion con Google");
        } finally {
          setSubmitting(false);
          setPendingGoogleRole(null);
        }
      })();
    }
  }, [response?.params?.id_token]);

  const [pendingGoogleRole, setPendingGoogleRole] = useState<'CLIENTE' | 'PROFESIONAL' | null>(null);

  async function handleGoogleLogin(rol: 'CLIENTE' | 'PROFESIONAL') {
    setPendingGoogleRole(rol);
    await promptAsync();
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

        <View style={s.dividerRow}>
          <View style={s.divider} />
          <Text style={s.dividerText}>o continua con</Text>
          <View style={s.divider} />
        </View>

        <TouchableOpacity
          onPress={() => promptAsync()}
          disabled={submitting}
          style={s.googleBtn}
        >
          <Text style={s.googleBtnText}>
            <span role="img" aria-label="google">🔍</span> Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGoogleLogin('CLIENTE')}
          disabled={submitting}
          style={s.googleBtn}
        >
          <Text style={s.googleBtnText}>
            <span role="img" aria-label="google">🔍</span> Google (Cliente)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGoogleLogin('PROFESIONAL')}
          disabled={submitting}
          style={s.googleBtn}
        >
          <Text style={s.googleBtnText}>
            <span role="img" aria-label="google">🔍</span> Google (Profesional)
          </Text>
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
