"use client";

import {
  createContext,
  useContext,
  useEffect,
  useOptimistic,
  useRef,
  useSyncExternalStore,
  startTransition,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  getFavoritesFromDb,
  addFavoriteToDb,
  removeFavoriteFromDb,
} from "@/lib/favoritesDb";

// ─── External favorites store ──────────────────────────────────────────────────

const EMPTY: string[] = [];
let _favorites: string[] = EMPTY;
let _isHydrated = false;
const _listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

function getSnapshot() {
  return _favorites;
}
function getServerSnapshot(): string[] {
  return EMPTY;
}

function getHydratedSnapshot() {
  return _isHydrated;
}
function getHydratedServerSnapshot() {
  return false;
}

function setStore(favorites: string[]) {
  _favorites = favorites;
  _isHydrated = true;
  _listeners.forEach((l) => l());
}

function resetStore() {
  _favorites = EMPTY;
  _isHydrated = false;
  _listeners.forEach((l) => l());
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface FavoritesContextValue {
  favorites: string[];
  isHydrated: boolean;
  isAuthenticated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string | null;
}) {
  const favorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const [optimisticFavorites, addOptimistic] = useOptimistic(
    favorites,
    (state, { id, add }: { id: string; add: boolean }) =>
      add ? [...state, id] : state.filter((f) => f !== id),
  );

  const supabaseRef =
    useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    resetStore();
    if (userId) {
      const supabase = createSupabaseBrowserClient();
      supabaseRef.current = supabase;
      getFavoritesFromDb(supabase).then(setStore);
    } else {
      supabaseRef.current = null;
      setStore([]);
    }
  }, [userId]);

  function toggleFavorite(id: string) {
    if (!userId || !supabaseRef.current) return;
    const add = !_favorites.includes(id);
    startTransition(() => {
      addOptimistic({ id, add });
      if (add) {
        setStore([..._favorites, id]);
        addFavoriteToDb(supabaseRef.current!, userId, id);
      } else {
        setStore(_favorites.filter((f) => f !== id));
        removeFavoriteFromDb(supabaseRef.current!, userId, id);
      }
    });
  }

  return (
    <FavoritesContext
      value={{
        favorites: optimisticFavorites,
        isHydrated,
        isAuthenticated: !!userId,
        isFavorite: (id) => optimisticFavorites.includes(id),
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
