"use client";

import { useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import {
  FormLabel,
  FormError,
  FormInput,
  FormSelect,
  CopyText,
} from "@/shared/ui";
import { UAE_EMIRATES } from "@/shared/consts";
import { composeAddress } from "@/shared/utils/address";

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };
const LIBRARIES: ["places"] = ["places"];
const AUTOCOMPLETE_OPTIONS = { componentRestrictions: { country: "ae" } };

interface Props {
  defaultEmirate?: string;
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
  let area = "";
  let buildingName = "";
  for (const c of components) {
    if (c.types.includes("administrative_area_level_1")) {
      emirate = c.long_name.replace(/^Emirate of /i, "");
    }
    if (
      c.types.includes("locality") ||
      c.types.includes("sublocality_level_1")
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
  return { emirate, area, buildingName };
}

function matchEmirate(raw: string): string {
  const lower = raw.toLowerCase();
  return UAE_EMIRATES.find((e) => e.value.toLowerCase() === lower)?.value ?? "";
}

export function AddressWithMap({
  defaultEmirate = "Dubai",
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
  const [area, setArea] = useState(defaultArea);
  const [buildingName, setBuildingName] = useState(defaultBuildingName);
  const [flatNumber, setFlatNumber] = useState(defaultFlatNumber);

  const areaAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(
    null,
  );
  const buildingAutocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  function getGeocoder() {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    return geocoderRef.current;
  }

  function applyPlace(
    place: google.maps.places.PlaceResult,
    target: "area" | "building",
  ) {
    if (place.geometry?.location) {
      const pos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(pos);
      setMarkerPos(pos);
    }

    if (place.address_components) {
      const extracted = extractAddressParts(place.address_components);
      const matched = matchEmirate(extracted.emirate);
      if (matched) setEmirate(matched);
      if (extracted.area) setArea(extracted.area);
      if (extracted.buildingName) setBuildingName(extracted.buildingName);
    }

    if (target === "building" && place.name) {
      setBuildingName(place.name);
    }
  }

  function onAreaPlaceChanged() {
    const place = areaAutocompleteRef.current?.getPlace();
    if (place) applyPlace(place, "area");
  }

  function onBuildingPlaceChanged() {
    const place = buildingAutocompleteRef.current?.getPlace();
    if (place) applyPlace(place, "building");
  }

  function onMapClick(e: google.maps.MapMouseEvent) {
    const latLng = e.latLng;
    if (!latLng) return;

    const pos = { lat: latLng.lat(), lng: latLng.lng() };
    setCenter(pos);
    setMarkerPos(pos);

    getGeocoder().geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results?.[0]?.address_components) {
        const extracted = extractAddressParts(results[0].address_components);
        const matched = matchEmirate(extracted.emirate);
        if (matched) setEmirate(matched);
        if (extracted.area) setArea(extracted.area);
        if (extracted.buildingName) setBuildingName(extracted.buildingName);
      }
    });
  }

  const hasError = !!error;
  const composed = composeAddress({ emirate, area, buildingName, flatNumber });

  const areaInput = (
    <FormInput
      id="address-area"
      type="text"
      value={area}
      onChange={(e) => setArea(e.target.value)}
      placeholder="Area / district"
      state={hasError ? "error" : "default"}
    />
  );

  const buildingInput = (
    <FormInput
      id="address-building"
      type="text"
      value={buildingName}
      onChange={(e) => setBuildingName(e.target.value)}
      placeholder="Building name"
      state={hasError ? "error" : "default"}
    />
  );

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

        {/* Area */}
        <div>
          <FormLabel htmlFor="address-area">Area</FormLabel>
          {isLoaded ? (
            <Autocomplete
              onLoad={(ac) => (areaAutocompleteRef.current = ac)}
              onPlaceChanged={onAreaPlaceChanged}
              options={AUTOCOMPLETE_OPTIONS}
            >
              {areaInput}
            </Autocomplete>
          ) : (
            areaInput
          )}
        </div>

        {/* Building Name */}
        <div>
          <FormLabel htmlFor="address-building">Building</FormLabel>
          {isLoaded ? (
            <Autocomplete
              onLoad={(ac) => (buildingAutocompleteRef.current = ac)}
              onPlaceChanged={onBuildingPlaceChanged}
              options={AUTOCOMPLETE_OPTIONS}
            >
              {buildingInput}
            </Autocomplete>
          ) : (
            buildingInput
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
          >
            {markerPos && <Marker position={markerPos} />}
          </GoogleMap>
        </div>
      )}
    </div>
  );
}
