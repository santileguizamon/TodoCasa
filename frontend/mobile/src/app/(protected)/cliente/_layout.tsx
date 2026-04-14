import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SocketProvider } from "@/src/context/socket-context";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

import { obtenerChats } from "@/src/api/chat.api";
import { socket } from "@/src/lib/socket";

export default function ClienteTabsLayout() {
  const [unreadCount, setUnreadCount] = useState(0);

  const cargarNoLeidos = async () => {
    try {
      const res = await obtenerChats();
      const total = Array.isArray(res)
        ? res.reduce(
            (acc, c) => acc + Number(c.noLeidos ?? c._count?.mensajes ?? 0),
            0,
          )
        : 0;
      setUnreadCount(total);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    cargarNoLeidos();
  }, []);

  useEffect(() => {
    const handleActualizado = () => {
      cargarNoLeidos();
    };

    socket.on("chatActualizado", handleActualizado);

    return () => {
      socket.off("chatActualizado", handleActualizado);
    };
  }, []);

  return (
    <SocketProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2563EB",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#D7E3F5",
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="misTrabajos"
          options={{
            title: "Trabajos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="nuevo"
          options={{
            title: "Publicar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="chats/index"
          options={{
            title: "Chats",
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size + 8, height: size + 8 }}>
                <Ionicons name="chatbubble" size={size} color={color} />
                {unreadCount > 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: "#EF4444",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="perfil/index"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="chats/archivados" options={{ href: null }} />
        <Tabs.Screen name="perfil/editar" options={{ href: null }} />
        <Tabs.Screen name="profesional/[id]" options={{ href: null }} />
        <Tabs.Screen name="trabajo/[id]" options={{ href: null }} />
      </Tabs>
    </SocketProvider>
  );
}
