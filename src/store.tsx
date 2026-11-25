import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedAnime, WatchingAnime } from './types';

type Store = {
  favorites: SavedAnime[];
  watching: WatchingAnime[];
  isFav: (id: number) => boolean;
  isWatching: (id: number) => boolean;
  toggleFav: (a: SavedAnime) => void;
  toggleWatching: (a: SavedAnime) => void;
  setEpisode: (id: number, ep: number) => void;
};

const KEY = 'lunarbloom:v1';
const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<SavedAnime[]>([]);
  const [watching, setWatching] = useState<WatchingAnime[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const d = JSON.parse(raw);
          setFavorites(d.favorites ?? []);
          setWatching(d.watching ?? []);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify({ favorites, watching }));
  }, [favorites, watching, loaded]);

  const isFav = useCallback((id: number) => favorites.some((a) => a.mal_id === id), [favorites]);
  const isWatching = useCallback((id: number) => watching.some((a) => a.mal_id === id), [watching]);

  const toggleFav = (a: SavedAnime) =>
    setFavorites((cur) => (cur.some((x) => x.mal_id === a.mal_id) ? cur.filter((x) => x.mal_id !== a.mal_id) : [a, ...cur]));

  const toggleWatching = (a: SavedAnime) =>
    setWatching((cur) =>
      cur.some((x) => x.mal_id === a.mal_id) ? cur.filter((x) => x.mal_id !== a.mal_id) : [{ ...a, episode: 1 }, ...cur],
    );

  const setEpisode = (id: number, ep: number) =>
    setWatching((cur) =>
      cur.map((x) => (x.mal_id === id ? { ...x, episode: Math.max(0, x.episodes ? Math.min(ep, x.episodes) : ep) } : x)),
    );

  return (
    <Ctx.Provider value={{ favorites, watching, isFav, isWatching, toggleFav, toggleWatching, setEpisode }}>
      {children}
    </Ctx.Provider>
  );
}
