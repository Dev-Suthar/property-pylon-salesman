import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MapPinOff, Navigation } from "lucide-react-native";
import { theme } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { radius } from "../../theme/layout";
import { geocodeAddress, LatLng } from "../../services/places";
import { darkMapStyle } from "./mapStyle";
import MapPin from "./MapPin";

interface PropertyMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  /** Geocoded when coordinates are missing (older records). */
  address?: string | null;
  title?: string;
  height?: number;
  style?: ViewStyle;
}

const toNum = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

export const openInMaps = ({ latitude, longitude }: LatLng, label?: string) => {
  const q = encodeURIComponent(label || `${latitude},${longitude}`);
  const url =
    Platform.OS === "ios"
      ? `https://maps.google.com/?q=${q}&ll=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${q})`;
  Linking.openURL(url).catch(() =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)
  );
};

/** Static-feeling location card: dark Google map, cream pin, "Directions" chip. */
export default function PropertyMap({
  latitude,
  longitude,
  address,
  title,
  height = 190,
  style,
}: PropertyMapProps) {
  const stored =
    toNum(latitude) !== null && toNum(longitude) !== null
      ? { latitude: toNum(latitude)!, longitude: toNum(longitude)! }
      : null;
  const [coords, setCoords] = useState<LatLng | null>(stored);
  const [loading, setLoading] = useState(!stored && !!address);

  useEffect(() => {
    if (stored) {
      setCoords(stored);
      return;
    }
    if (!address) return;
    let cancelled = false;
    setLoading(true);
    geocodeAddress(address)
      .then((c) => !cancelled && setCoords(c))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, address]);

  return (
    <View style={[styles.frame, { height }, style]}>
      {coords ? (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            customMapStyle={darkMapStyle}
            initialRegion={{ ...coords, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
            region={{ ...coords, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
            liteMode={Platform.OS === "android"}
            onPress={() => openInMaps(coords, address || title)}
          >
            <Marker coordinate={coords} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <MapPin size={36} />
            </Marker>
          </MapView>
          <Pressable style={styles.chip} onPress={() => openInMaps(coords, address || title)}>
            <Navigation size={13} color="#0D0D0D" />
            <Text style={styles.chipText}>Directions</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.empty}>
          {loading ? (
            <ActivityIndicator color={theme.blue400} />
          ) : (
            <>
              <MapPinOff size={22} color={theme.mutedForeground} />
              <Text style={[typography.bodySm, { marginTop: 6 }]}>Location not available</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.glassBorder,
    backgroundColor: "#121212",
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  chip: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.xs,
    backgroundColor: theme.cream,
  },
  chipText: { ...typography.overline, color: "#0D0D0D" },
});
