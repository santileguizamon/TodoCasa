import { View, ActivityIndicator, Text, Image } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../context/auth-context";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Cuando tengas el logo lo activás */}
        {/*
        <Image
          source={require("../assets/logo.png")}
          style={{ width: 140, height: 140, marginBottom: 30 }}
          resizeMode="contain"
        />
        */}

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#1E3A8A",
            marginBottom: 20,
          }}
        >
          TODOCASA
        </Text>

        <ActivityIndicator size="large" color="#2563EB" />

        <Text
          style={{
            marginTop: 16,
            fontSize: 14,
            color: "#6B7280",
          }}
        >
          Cargando experiencia...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href={"/(public)/login" as any} />;
  }

  if (user.rol === "CLIENTE") {
    return <Redirect href={"/(protected)/cliente" as any} />;
  }

  if (user.rol === "PROFESIONAL") {
    return <Redirect href={"/(protected)/profesional" as any} />;
  }

  return null;
}


