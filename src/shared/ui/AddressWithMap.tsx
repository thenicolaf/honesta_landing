"use client";

import { useRef, useState, useEffect } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import {
  FormLabel,
  FormError,
  FormInput,
  FormSelect,
  CopyText,
} from "@/shared/ui";
import { AddressSuggestInput } from "@/shared/ui/AddressSuggestInput";
import { UAE_EMIRATES } from "@/shared/consts";
import { composeAddress } from "@/shared/utils/address";

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };
const LIBRARIES: ["places"] = ["places"];
const FORWARD_GEOCODE_DEBOUNCE = 700;

interface Props {
  defaultEmirate?: string;
  defaultCity?: string;
  defaultArea?: string;
  defaultBuildingName?: string;
  defaultFlatNumber?: string;
  defaultLat?: string;
  defaultLng?: string;
  error?: string | null;
  onEmirateChange?: (emirate: string) => void;
  disabledEmirates?: string[];
}

function extractAddressParts(
  components: google.maps.GeocoderAddressComponent[],
) {
  let emirate = "";
  let city = "";
  let area = "";
  let buildingName = "";
  for (const c of components) {
    if (c.types.includes("administrative_area_level_1")) {
      emirate = c.long_name.replace(/^Emirate of /i, "");
    }
    if (c.types.includes("locality")) {
      city = c.long_name;
    }
    if (
      c.types.includes("sublocality_level_1") ||
      c.types.includes("neighborhood")
    ) {
      area = c.long_name;
    }
    if (!area && c.types.includes("administrative_area_level_2")) {
      area = c.long_name;
    }
    if (c.types.includes("premise") || c.types.includes("establishment")) {
      buildingName = c.long_name;
    }
    if (!buildingName && c.types.includes("route")) {
      buildingName = c.long_name;
    }
  }
  return { emirate, city, area, buildingName };
}

function matchEmirate(raw: string): string {
  const lower = raw.toLowerCase();
  return UAE_EMIRATES.find((e) => e.value.toLowerCase() === lower)?.value ?? "";
}

export function AddressWithMap({
  defaultEmirate = "Dubai",
  defaultCity = "",
  defaultArea = "",
  defaultBuildingName = "",
  defaultFlatNumber = "",
  defaultLat,
  defaultLng,
  error,
  onEmirateChange,
  disabledEmirates,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const initPos = (() => {
    const lat = defaultLat ? parseFloat(defaultLat) : NaN;
    const lng = defaultLng ? parseFloat(defaultLng) : NaN;
    return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : DUBAI_CENTER;
  })();

  const [center, setCenter] = useState(initPos);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(
    initPos,
  );

  const [emirate, setEmirateRaw] = useState(defaultEmirate);
  function setEmirate(value: string) {
    setEmirateRaw(value);
    onEmirateChange?.(value);
  }
  const [city, setCity] = useState(defaultCity);
  const [area, setArea] = useState(defaultArea);
  const [buildingName, setBuildingName] = useState(defaultBuildingName);
  const [flatNumber, setFlatNumber] = useState(defaultFlatNumber);

  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null,
  );
  const mapRef = useRef<google.maps.Map | null>(null);
  const skipForwardGeocodeRef = useRef(false);

  function getGeocoder() {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    return geocoderRef.current;
  }

  function getPlacesService() {
    if (!placesServiceRef.current && mapRef.current) {
      placesServiceRef.current = new google.maps.places.PlacesService(
        mapRef.current,
      );
    }
    return placesServiceRef.current;
  }

  function resolvePlace(
    prediction: google.maps.places.AutocompletePrediction,
    callback: (pos: { lat: number; lng: number }) => void,
  ) {
    const service = getPlacesService();
    if (!service) return;
    service.getDetails(
      { placeId: prediction.place_id, fields: ["geometry"] },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          const pos = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          callback(pos);
        }
      },
    );
  }

  function onCitySelect(
    prediction: google.maps.places.AutocompletePrediction,
  ) {
    skipForwardGeocodeRef.current = true;
    resolvePlace(prediction, (pos) => {
      setCenter(pos);
      setMarkerPos(pos);
    });
  }

  function onAreaSelect(
    prediction: google.maps.places.AutocompletePrediction,
  ) {
    skipForwardGeocodeRef.current = true;
    resolvePlace(prediction, (pos) => {
      setCenter(pos);
      setMarkerPos(pos);
    });
  }

  function onBuildingSelect(
    prediction: google.maps.places.AutocompletePrediction,
  ) {
    skipForwardGeocodeRef.current = true;
    resolvePlace(prediction, (pos) => {
      setCenter(pos);
      setMarkerPos(pos);
    });
  }

  function onMapClick(e: google.maps.MapMouseEvent) {
    const latLng = e.latLng;
    if (!latLng) return;

    const pos = { lat: latLng.lat(), lng: latLng.lng() };
    setCenter(pos);
    setMarkerPos(pos);
    skipForwardGeocodeRef.current = true;

    getGeocoder().geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results?.[0]?.address_components) {
        const extracted = extractAddressParts(results[0].address_components);
        const matched = matchEmirate(extracted.emirate);
        if (matched) setEmirate(matched);
        if (extracted.city) setCity(extracted.city);
        if (extracted.area) setArea(extracted.area);
        if (extracted.buildingName) setBuildingName(extracted.buildingName);
      }
    });
  }

  // Forward geocoding: fields → map (debounced, fallback for manual typing)
  useEffect(() => {
    if (!isLoaded) return;
    if (skipForwardGeocodeRef.current) {
      skipForwardGeocodeRef.current = false;
      return;
    }

    const hasEnough = emirate && (city || area);
    if (!hasEnough) return;

    const timer = setTimeout(() => {
      const query = [buildingName, area, city, emirate, "UAE"]
        .filter(Boolean)
        .join(", ");

      getGeocoder().geocode(
        { address: query, region: "ae" },
        (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const pos = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };
            setCenter(pos);
            setMarkerPos(pos);
          }
        },
      );
    }, FORWARD_GEOCODE_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [emirate, city, area, buildingName, isLoaded]);

  const hasError = !!error;
  const composed = composeAddress({ emirate, city, area, buildingName, flatNumber });

  // Location bias for suggestions based on current marker position
  const locationBias: google.maps.LatLngBoundsLiteral = {
    north: markerPos.lat + 0.3,
    south: markerPos.lat - 0.3,
    east: markerPos.lng + 0.3,
    west: markerPos.lng - 0.3,
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Emirate */}
        <div>
          <FormLabel htmlFor="address-emirate-select">Emirate</FormLabel>
          <FormSelect
            id="address-emirate-select"
            name="_emirate"
            value={emirate}
            onValueChange={setEmirate}
            options={UAE_EMIRATES.map((e) => ({
              ...e,
              disabled: disabledEmirates?.includes(e.value),
            }))}
            placeholder="Emirate"
            state={hasError ? "error" : "default"}
          />
        </div>

        {/* City */}
        <div>
          <FormLabel htmlFor="address-city">City</FormLabel>
          {isLoaded ? (
            <AddressSuggestInput
              id="address-city"
              value={city}
              onChange={setCity}
              onSelect={onCitySelect}
              placeholder="City"
              state={hasError ? "error" : "default"}
              types={["(cities)"]}
              locationBias={locationBias}
            />
          ) : (
            <FormInput
              id="address-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              state={hasError ? "error" : "default"}
            />
          )}
        </div>

        {/* Area */}
        <div>
          <FormLabel htmlFor="address-area">Area</FormLabel>
          {isLoaded ? (
            <AddressSuggestInput
              id="address-area"
              value={area}
              onChange={setArea}
              onSelect={onAreaSelect}
              placeholder="Area / district"
              state={hasError ? "error" : "default"}
              types={["sublocality", "neighborhood"]}
              locationBias={locationBias}
            />
          ) : (
            <FormInput
              id="address-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area / district"
              state={hasError ? "error" : "default"}
            />
          )}
        </div>

        {/* Building Name */}
        <div>
          <FormLabel htmlFor="address-building">Building</FormLabel>
          {isLoaded ? (
            <AddressSuggestInput
              id="address-building"
              value={buildingName}
              onChange={setBuildingName}
              onSelect={onBuildingSelect}
              placeholder="Building name"
              state={hasError ? "error" : "default"}
              types={["establishment"]}
              locationBias={locationBias}
            />
          ) : (
            <FormInput
              id="address-building"
              type="text"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              placeholder="Building name"
              state={hasError ? "error" : "default"}
            />
          )}
        </div>

        {/* Flat Number */}
        <div>
          <FormLabel htmlFor="address-flat">Flat / Villa</FormLabel>
          <FormInput
            id="address-flat"
            type="text"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            placeholder="Flat / villa number"
            state={hasError ? "error" : "default"}
          />
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="emirate" value={emirate} />
      <input type="hidden" name="address" value={composed} />
      <input type="hidden" name="lat" value={markerPos.lat} />
      <input type="hidden" name="lng" value={markerPos.lng} />

      <FormError message={error ?? undefined} />

      {isLoaded && (
        <div className="mt-3 overflow-hidden rounded-xl border border-parchment">
          {composed && (
            <div className="flex items-center justify-between bg-sand/50 px-3 py-2">
              <CopyText
                text={composed}
                className="font-body text-2xs text-earth/70 truncate"
              >
                <span className="truncate">{composed}</span>
              </CopyText>
            </div>
          )}
          <GoogleMap
            center={center}
            zoom={14}
            mapContainerStyle={{ width: "100%", height: "280px" }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: true,
            }}
            onClick={onMapClick}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {markerPos && <Marker position={markerPos} />}
          </GoogleMap>
        </div>
      )}
    </div>
  );
}
