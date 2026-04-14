import { useEffect, useRef } from "react";

export function useFormReset<T extends HTMLElement = HTMLElement>(
  onReset: () => void,
) {
  const ref = useRef<T>(null);
  const cb = useRef(onReset);

  useEffect(() => {
    cb.current = onReset;
  });

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const handler = () => cb.current();
    form.addEventListener("reset", handler);
    return () => form.removeEventListener("reset", handler);
  }, []);

  return ref;
}
