export type Anime = {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { jpg: { image_url: string; large_image_url: string } };
  score: number | null;
  episodes: number | null;
  status: string | null;
  year: number | null;
  synopsis: string | null;
  genres: { mal_id: number; name: string }[];
};

// versão enxuta que guardamos no celular
export type SavedAnime = {
  mal_id: number;
  title: string;
  image: string;
  score: number | null;
  episodes: number | null;
};

export type WatchingAnime = SavedAnime & { episode: number };

export type RootStack = {
  Tabs: undefined;
  Details: { id: number; preview?: SavedAnime };
};

export const toSaved = (a: Anime): SavedAnime => ({
  mal_id: a.mal_id,
  title: a.title_english || a.title,
  image: a.images.jpg.large_image_url || a.images.jpg.image_url,
  score: a.score,
  episodes: a.episodes,
});
