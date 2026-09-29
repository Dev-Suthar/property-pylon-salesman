/**
 * Google Places / Geocoding client.
 * Single place for every Maps web-service call the app makes.
 */
import { CONFIG } from "../config";
import {
  GooglePlaceDetails,
  GooglePlacePrediction,
  ParsedAddress,
  parseAddressComponents,
} from "../utils/addressUtils";

const BASE = "https://maps.googleapis.com/maps/api";
const KEY = CONFIG.GOOGLE_MAPS_API_KEY;

export type LatLng = { latitude: number; longitude: number };

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK") {
      if (data.status !== "ZERO_RESULTS" && __DEV__) {
        console.warn("[places]", data.status, data.error_message);
      }
      return null;
    }
    return data;
  } catch (error) {
    if (__DEV__) console.warn("[places] request failed", error);
    return null;
  }
}

export async function autocompletePlaces(
  input: string,
): Promise<GooglePlacePrediction[]> {
  if (!input || input.trim().length < 2) return [];
  const data = await getJson(
    `${BASE}/place/autocomplete/json?input=${encodeURIComponent(
      input,
    )}&key=${KEY}&types=geocode&components=country:in`,
  );
  return data?.predictions ?? [];
}

export async function getPlaceDetails(
  placeId: string,
): Promise<ParsedAddress | null> {
  const data = await getJson(
    `${BASE}/place/details/json?place_id=${placeId}&key=${KEY}&fields=place_id,formatted_address,geometry,address_components`,
  );
  return data?.result
    ? parseAddressComponents(data.result as GooglePlaceDetails)
    : null;
}

/** Address text -> coordinates. Used when a record has no stored lat/lng. */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  if (!address?.trim()) return null;
  const data = await getJson(
    `${BASE}/geocode/json?address=${encodeURIComponent(
      address,
    )}&region=in&key=${KEY}`,
  );
  const loc = data?.results?.[0]?.geometry?.location;
  return loc ? { latitude: loc.lat, longitude: loc.lng } : null;
}

/** Coordinates -> parsed address. Used by the map pin picker. */
export async function reverseGeocode(
  coords: LatLng,
): Promise<ParsedAddress | null> {
  const data = await getJson(
    `${BASE}/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${KEY}`,
  );
  const first = data?.results?.[0];
  if (!first) return null;
  return {
    ...parseAddressComponents(first as GooglePlaceDetails),
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}
