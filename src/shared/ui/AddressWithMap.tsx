"use client";

import { useRef, useState, useEffect } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import {
  FormLabel,
  FormError,
  FormInput,
  FormSelect,
  CopyText,
} from "@/shared/ui";
import { AddressSuggestInput } from "@/shared/ui/AddressSuggestInput";
import { UAE_EMIRATES } from "@/shared/consts";
import { composeAddress, displayAddress } from "@/shared/utils/address";
import { useFormReset } from "@/shared/ui/Form/useFormReset";

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };
const LIBRARIES: ["places"] = ["places"];
const FORWARD_GEOCODE_DEBOUNCE = 700;

export interface AddressFieldErrors {
  emirate?: string;
  city?: string;
  area?: string;
  buildingName?: string;
}

interface Props {
  defaultEmirate?: string;
  defaultCity?: string;
  defaultArea?: string;
  defaultBuildingName?: string;
  defaultFlatNumber?: string;
  defaultLat?: string;
  defaultLng?: string;
  fieldErrors?: AddressFieldErrors | null;
  required?: boolean;
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
  defaultEmirate,
  defaultCity = "",
  defaultArea = "",
  defaultBuildingName = "",
  defaultFlatNumber = "",
  defaultLat,
  defaultLng,
  fieldErrors,
  required = true,
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

  // --- Raw state setters (no cascade) ---
  const resolvedDefaultEmirate = defaultEmirate ?? (required ? "Dubai" : "");
  const [emirate, setEmirateState] = useState(resolvedDefaultEmirate);
  const [city, setCityState] = useState(defaultCity);
  const [area, setAreaState] = useState(defaultArea);
  const [buildingName, setBuildingNameState] = useState(defaultBuildingName);
  const [flatNumber, setFlatNumber] = useState(defaultFlatNumber);

  const resetRef = useFormReset<HTMLDivElement>(() => {
    setEmirateState(resolvedDefaultEmirate);
    setCityState(defaultCity);
    setAreaState(defaultArea);
    setBuildingNameState(defaultBuildingName);
    setFlatNumber(defaultFlatNumber);
    setCenter(initPos);
    setMarkerPos(initPos);
  });

  // Set emirate + notify parent (no cascade, used by resolvePlace & onMapClick)
  function setEmirate(value: string) {
    setEmirateState(value);
    onEmirateChange?.(value);
  }

  // --- Cascade handlers (user-initiated changes) ---

  function handleEmirateChange(value: string) {
    setEmirate(value);
    setCityState("");
    setAreaState("");
    setBuildingNameState("");

    // Geocode to emirate center for visual feedback
    if (isLoaded) {
      skipForwardGeocodeRef.current = true;
      getGeocoder().geocode(
        { address: `${value}, UAE`, region: "ae" },
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
    }
  }

  function handleCityChange(value: string) {
    setCityState(value);
    setAreaState("");
    setBuildingNameState("");
  }

  function handleAreaChange(value: string) {
    setAreaState(value);
    setBuildingNameState("");
  }

  // --- Refs ---

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
      {
        placeId: prediction.place_id,
        fields: ["geometry", "address_components"],
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          const pos = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          if (place.address_components) {
            skipForwardGeocodeRef.current = true;
            const extracted = extractAddressParts(place.address_components);
            const matched = matchEmirate(extracted.emirate);
            if (matched) setEmirate(matched);
            if (extracted.city) setCityState(extracted.city);
            if (extracted.area) setAreaState(extracted.area);
          }

          callback(pos);
        }
      },
    );
  }

  function onCitySelect(prediction: google.maps.places.AutocompletePrediction) {
    skipForwardGeocodeRef.current = true;
    resolvePlace(prediction, (pos) => {
      setCenter(pos);
      setMarkerPos(pos);
    });
  }

  function onAreaSelect(prediction: google.maps.places.AutocompletePrediction) {
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
        skipForwardGeocodeRef.current = true;
        const extracted = extractAddressParts(results[0].address_components);
        const matched = matchEmirate(extracted.emirate);
        if (matched) setEmirate(matched);
        if (extracted.city) setCityState(extracted.city);
        if (extracted.area) setAreaState(extracted.area);
        if (extracted.buildingName)
          setBuildingNameState(extracted.buildingName);
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

  const composed = composeAddress({
    emirate,
    city,
    area,
    buildingName,
    flatNumber,
  });

  // Location bias for suggestions based on current marker position
  const locationBias: google.maps.LatLngBoundsLiteral = {
    north: markerPos.lat + 0.3,
    south: markerPos.lat - 0.3,
    east: markerPos.lng + 0.3,
    west: markerPos.lng - 0.3,
  };

  return (
    <div ref={resetRef}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Emirate */}
        <div className="sm:col-span-2">
          <FormLabel htmlFor="address-emirate-select" required={required}>
            Emirate
          </FormLabel>
          <FormSelect
            id="address-emirate-select"
            name="_emirate"
            value={emirate}
            onValueChange={handleEmirateChange}
            options={UAE_EMIRATES.map((e) => ({
              ...e,
              disabled: disabledEmirates?.includes(e.value),
            }))}
            clearable
            placeholder="Emirate"
            state={fieldErrors?.emirate ? "error" : "default"}
          />
          <FormError message={fieldErrors?.emirate} />
        </div>

        {/* City */}
        <div>
          <FormLabel htmlFor="address-city" required={required}>
            City
          </FormLabel>
          {isLoaded ? (
            <AddressSuggestInput
              id="address-city"
              value={city}
              onChange={handleCityChange}
              onSelect={onCitySelect}
              placeholder="City"
              state={fieldErrors?.city ? "error" : "default"}
              types={["(cities)"]}
              locationBias={locationBias}
            />
          ) : (
            <FormInput
              id="address-city"
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="City"
              state={fieldErrors?.city ? "error" : "default"}
            />
          )}
          <FormError message={fieldErrors?.city} />
        </div>

        {/* Area */}
        <div>
          <FormLabel htmlFor="address-area" required={required}>
            Area
          </FormLabel>
          {isLoaded ? (
            <AddressSuggestInput
              id="address-area"
              value={area}
              onChange={handleAreaChange}
              onSelect={onAreaSelect}
              placeholder="Area / district"
              state={fieldErrors?.area ? "error" : "default"}
              types={["sublocality", "neighborhood"]}
              locationBias={locationBias}
            />
          ) : (
            <FormInput
              id="address-area"
              type="text"
              value={area}
              onChange={(e) => handleAreaChange(e.target.value)}
              placeholder="Area / district"
              state={fieldErrors?.area ? "error" : "default"}
            />
          )}
          <FormError message={fieldErrors?.area} />
        </div>

        {/* Building Name */}
        <div>
          <FormLabel htmlFor="address-building" required={required}>
            Building
          </FormLabel>
          {isLoaded ? (
            <AddressSuggestInput
              id="address-building"
              value={buildingName}
              onChange={setBuildingNameState}
              onSelect={onBuildingSelect}
              placeholder="Building name"
              state={fieldErrors?.buildingName ? "error" : "default"}
              types={["establishment"]}
              locationBias={locationBias}
            />
          ) : (
            <FormInput
              id="address-building"
              type="text"
              value={buildingName}
              onChange={(e) => setBuildingNameState(e.target.value)}
              placeholder="Building name"
              state={fieldErrors?.buildingName ? "error" : "default"}
            />
          )}
          <FormError message={fieldErrors?.buildingName} />
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
          />
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="emirate" value={emirate} />
      <input type="hidden" name="address" value={composed} />
      <input type="hidden" name="lat" value={markerPos.lat} />
      <input type="hidden" name="lng" value={markerPos.lng} />
      <input type="hidden" name="addressCity" value={city} />
      <input type="hidden" name="addressArea" value={area} />
      <input type="hidden" name="addressBuilding" value={buildingName} />

      {isLoaded && (
        <div className="mt-3 overflow-hidden rounded-xl border border-parchment">
          {composed && (
            <div className="flex items-center justify-between bg-sand/50 px-3 py-2">
              <CopyText
                text={displayAddress(composed)}
                className="font-body text-2xs text-earth/70 truncate"
              >
                <span className="truncate">{displayAddress(composed)}</span>
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
