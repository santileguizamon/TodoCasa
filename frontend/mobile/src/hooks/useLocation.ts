import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocation = async () => {
    try {
      setLoading(true);

      // Pedir permisos
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado");
        setLoading(false);
        return;
      }

      // Obtener ubicación actual
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      setErrorMsg("No se pudo obtener la ubicación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    errorMsg,
    loading,
    refreshLocation: getLocation,
  };
};
