"use client";

import { useRef, useState, useEffect } from "react";
import { FormInput } from "@/shared/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/DropdownMenu";

const DEBOUNCE_MS = 300;

interface AddressSuggestInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (prediction: google.maps.places.AutocompletePrediction) => void;
  placeholder?: string;
  state?: "default" | "error";
  types?: string[];
  locationBias?: google.maps.LatLngBoundsLiteral;
  disabled?: boolean;
}

export function AddressSuggestInput({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  state = "default",
  types,
  locationBias,
  disabled,
}: AddressSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [open, setOpen] = useState(false);

  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  function getService() {
    if (!serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }
    return serviceRef.current;
  }

  function fetchSuggestions(input: string) {
    if (!input.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const request: google.maps.places.AutocompletionRequest = {
      input,
      componentRestrictions: { country: "ae" },
    };
    if (types?.length) request.types = types;
    if (locationBias) request.locationBias = locationBias;

    getService().getPlacePredictions(request, (predictions, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        predictions
      ) {
        setSuggestions(predictions);
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
  }

  function handleClear() {
    onChange("");
    setSuggestions([]);
    setOpen(false);
  }

  function handleSelect(
    prediction: google.maps.places.AutocompletePrediction,
  ) {
    onChange(prediction.structured_formatting.main_text);
    onSelect(prediction);
    setOpen(false);
  }

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <DropdownMenu
      open={open && suggestions.length > 0}
      onOpenChange={setOpen}
      className="block"
    >
      <FormInput
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        state={state}
        disabled={disabled}
        autoComplete="off"
        clearable={!disabled && !!value}
        onClear={handleClear}
      />

      <DropdownMenuContent className="left-0 right-0 max-h-60">
        {suggestions.map((p) => (
          <DropdownMenuItem
            key={p.place_id}
            onClick={() => handleSelect(p)}
            className="flex-col items-start gap-0.5"
          >
            <span className="font-medium text-earth">
              {p.structured_formatting.main_text}
            </span>
            {p.structured_formatting.secondary_text && (
              <span className="text-2xs text-earth/50">
                {p.structured_formatting.secondary_text}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
