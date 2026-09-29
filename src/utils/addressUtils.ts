export type GooglePlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

export type GooglePlaceDetails = {
  place_id: string;
  formatted_address: string;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
};

export type ParsedAddress = {
  address: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
};

export function parseAddressComponents(details: GooglePlaceDetails): ParsedAddress {
  const formattedAddress = details.formatted_address || "";
  const addressComponents = details.address_components || [];

  const parsed: ParsedAddress = { address: formattedAddress };
  const location = details.geometry?.location;
  if (location) {
    parsed.latitude = location.lat;
    parsed.longitude = location.lng;
  }

  const getComponent = (types: string[]) =>
    addressComponents.find((comp) =>
      types.some((type) => comp.types.includes(type)),
    );

  const postalCode = getComponent(["postal_code"]);
  if (postalCode) parsed.pincode = postalCode.long_name;

  const state = getComponent(["administrative_area_level_1"]);
  if (state) parsed.state = state.long_name;

  const city = getComponent(["locality", "administrative_area_level_2"]);
  if (city) parsed.city = city.long_name;

  const area = getComponent([
    "sublocality",
    "sublocality_level_1",
    "neighborhood",
  ]);
  if (area) {
    parsed.area = area.long_name;
  } else if (formattedAddress) {
    const parts = formattedAddress.split(",");
    if (parts.length > 0) parsed.area = parts[0].trim();
  }

  return parsed;
}
