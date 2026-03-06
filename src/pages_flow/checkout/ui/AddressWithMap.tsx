"use client";

import { useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { FormLabel, FormError, FormInput } from "@/shared/ui";

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };
const LIBRARIES: ["places"] = ["places"];

interface Props {
  defaultValue?: string;
  defaultLat?: string;
  defaultLng?: string;
  error?: string | null;
}

export function AddressWithMap({ defaultValue, defaultLat, defaultLng, error }: Props) {
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
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(initPos);
  const [addressValue, setAddressValue] = useState(defaultValue ?? "");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  function getGeocoder() {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    return geocoderRef.current;
  }

  function onPlaceChanged() {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const pos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(pos);
      setMarkerPos(pos);
      if (place.formatted_address) {
        setAddressValue(place.formatted_address);
      }
    }
  }

  function onMapClick(e: google.maps.MapMouseEvent) {
    const latLng = e.latLng;
    if (!latLng) return;

    const pos = { lat: latLng.lat(), lng: latLng.lng() };
    setCenter(pos);
    setMarkerPos(pos);

    getGeocoder().geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setAddressValue(results[0].formatted_address);
      }
    });
  }

  const hasError = !!error;

  return (
    <div>
      <FormLabel htmlFor="address">Delivery Address</FormLabel>
      {isLoaded ? (
        <Autocomplete
          onLoad={(ac) => (autocompleteRef.current = ac)}
          onPlaceChanged={onPlaceChanged}
          options={{ componentRestrictions: { country: "ae" } }}
        >
          <FormInput
            id="address"
            name="address"
            type="text"
            value={addressValue}
            onChange={(e) => setAddressValue(e.target.value)}
            placeholder="Street, building, apartment"
            state={hasError ? "error" : "default"}
          />
        </Autocomplete>
      ) : (
        <FormInput
          id="address"
          name="address"
          type="text"
          value={addressValue}
          onChange={(e) => setAddressValue(e.target.value)}
          placeholder="Street, building, apartment"
          state={hasError ? "error" : "default"}
        />
      )}
      <input type="hidden" name="lat" value={markerPos.lat} />
      <input type="hidden" name="lng" value={markerPos.lng} />
      <FormError message={error ?? undefined} />
      {isLoaded && (
        <div className="mt-3 overflow-hidden rounded-xl border border-parchment">
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
