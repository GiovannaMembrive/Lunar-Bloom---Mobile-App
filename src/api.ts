import { Anime } from './types';

// AniList: API pública de animes (GraphQL), sem necessidade de chave
const URL = 'https://graphql.anilist.co';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const cache = new Map<string, unknown>();

// Campos que pedimos para cada anime
const FIELDS = `
  idMal
  title { romaji english }
  coverImage { extraLarge large }
  averageScore
  episodes
  status
  seasonYear
  startDate { year }
  description(asHtml: false)
  genres
`;

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const key = query + JSON.stringify(variables);
  if (cache.has(key)) return cache.get(key) as T;

  let lastError = 'Não foi possível falar com a API.';
  for (let attempt = 0; attempt < 3; attempt++) {
    // se a API não responder em 15s, desiste desta tentativa
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) {
        lastError = res.status === 429 ? 'Muitas requisições. Aguarde um instante.' : `A API está instável (erro ${res.status}).`;
        await sleep(1500);
        continue;
      }
      const json = await res.json();
      if (json.errors?.length) throw new Error(json.errors[0].message || 'Erro na API.');
      cache.set(key, json.data);
      return json.data as T;
    } catch (e: any) {
      clearTimeout(timer);
      if (e?.name === 'AbortError') lastError = 'A API demorou demais para responder.';
      else if (e instanceof TypeError || /fetch|network/i.test(e?.message ?? '')) lastError = 'Sem conexão com a internet.';
      else throw e;
      await sleep(800);
    }
  }
  throw new Error(lastError);
}

// Converte o formato da AniList para o formato usado no app
type Raw = {
  idMal: number | null;
  title: { romaji: string | null; english: string | null };
  coverImage: { extraLarge: string | null; large: string | null };
  averageScore: number | null;
  episodes: number | null;
  status: string | null;
  seasonYear: number | null;
  startDate: { year: number | null };
  description: string | null;
  genres: string[] | null;
};

const clean = (html: string | null) =>
  html ? html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim() : null;

const normalize = (r: Raw): Anime => ({
  mal_id: r.idMal as number,
  title: r.title.romaji || r.title.english || 'Sem título',
  title_english: r.title.english,
  images: {
    jpg: {
      image_url: r.coverImage.large || r.coverImage.extraLarge || '',
      large_image_url: r.coverImage.extraLarge || r.coverImage.large || '',
    },
  },
  score: r.averageScore ? r.averageScore / 10 : null,
  episodes: r.episodes,
  status: r.status,
  year: r.seasonYear ?? r.startDate?.year ?? null,
  synopsis: clean(r.description),
  genres: (r.genres ?? []).map((name, i) => ({ mal_id: i, name })),
});

const hasId = (r: Raw) => r.idMal != null;

// Seleção fofinha: IDs do MyAnimeList (a AniList também guarda esse ID)
export const CURATED_IDS = [
  52991, // Sousou no Frieren
  54492, // Kusuriya no Hitorigoto
  48736, // Sono Bisque Doll wa Koi wo Suru
  6045, // Kimi ni Todoke
  42897, // Horimiya
  38680, // Fruits Basket (2019)
  853, // Ouran High School Host Club
  33352, // Violet Evergarden
  4081, // Natsume Yuujinchou
  34798, // Yuru Camp
];

export async function getCurated(): Promise<Anime[]> {
  const d = await gql<{ Page: { media: Raw[] } }>(
    `query($ids:[Int]){ Page(perPage: 25){ media(idMal_in:$ids, type: ANIME){ ${FIELDS} } } }`,
    { ids: CURATED_IDS },
  );
  return d.Page.media
    .filter(hasId)
    .map(normalize)
    .sort((a, b) => CURATED_IDS.indexOf(a.mal_id) - CURATED_IDS.indexOf(b.mal_id));
}

export async function getAnime(id: number): Promise<Anime> {
  const d = await gql<{ Media: Raw }>(
    `query($id:Int){ Media(idMal:$id, type: ANIME){ ${FIELDS} } }`,
    { id },
  );
  return normalize(d.Media);
}

export async function searchAnime(q: string): Promise<Anime[]> {
  const d = await gql<{ Page: { media: Raw[] } }>(
    `query($q:String){ Page(perPage: 20){ media(search:$q, type: ANIME, isAdult: false, sort: POPULARITY_DESC){ ${FIELDS} } } }`,
    { q },
  );
  return d.Page.media.filter(hasId).map(normalize);
}

export async function getSeasonNow(): Promise<Anime[]> {
  const now = new Date();
  const m = now.getMonth();
  const season = m < 3 ? 'WINTER' : m < 6 ? 'SPRING' : m < 9 ? 'SUMMER' : 'FALL';
  const d = await gql<{ Page: { media: Raw[] } }>(
    `query($season:MediaSeason, $year:Int){ Page(perPage: 25){ media(season:$season, seasonYear:$year, type: ANIME, isAdult: false, sort: POPULARITY_DESC){ ${FIELDS} } } }`,
    { season, year: now.getFullYear() },
  );
  return d.Page.media.filter(hasId).slice(0, 12).map(normalize);
}
