import { Movie } from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovieResult {
  id: number;
  title: string;
  release_date: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview: string;
  original_language: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem('cinemetrics_tmdb_key') || '';
  } catch {
    return '';
  }
}

export function saveStoredApiKey(key: string): void {
  try {
    localStorage.setItem('cinemetrics_tmdb_key', key.trim());
  } catch (err) {
    console.warn('Unable to persist API key to localStorage', err);
  }
}

export function mapTMDBToMovie(raw: TMDBMovieResult, detailed = false): Movie {
  const genres = raw.genres 
    ? raw.genres.map(g => g.name)
    : (raw.genre_ids ? raw.genre_ids.map(id => GENRE_MAP[id] || 'General') : ['General']);

  const yearMatch = raw.release_date ? raw.release_date.match(/\b(19\d\d|20\d\d)\b/) : null;
  const release_year = yearMatch ? parseInt(yearMatch[1], 10) : 2023;

  return {
    id: raw.id,
    title: raw.title || 'Untitled Film',
    release_date: raw.release_date || `${release_year}-01-01`,
    release_year,
    genres: genres.length > 0 ? genres : ['General'],
    primary_genre: genres[0] || 'General',
    rating: typeof raw.vote_average === 'number' ? parseFloat(raw.vote_average.toFixed(1)) : 7.0,
    vote_count: raw.vote_count || 100,
    popularity: typeof raw.popularity === 'number' ? parseFloat(raw.popularity.toFixed(1)) : 50.0,
    budget: raw.budget && raw.budget > 0 ? raw.budget : 0,
    revenue: raw.revenue && raw.revenue > 0 ? raw.revenue : 0,
    runtime: raw.runtime || 110,
    original_language: raw.original_language || 'en',
    overview: raw.overview || 'No overview synopsis provided.',
    poster_path: raw.poster_path ? `${IMAGE_BASE_URL}${raw.poster_path}` : '',
    backdrop_path: raw.backdrop_path ? `https://image.tmdb.org/t/p/w1280${raw.backdrop_path}` : undefined,
    source: 'tmdb_api'
  };
}

/**
 * Fetch detailed movie data including budget and revenue from TMDB
 */
export async function fetchTMDBMovieDetails(movieId: number, apiKey: string): Promise<Movie | null> {
  if (!apiKey) return null;
  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB responded with status ${response.status}`);
    }
    const data: TMDBMovieResult = await response.json();
    return mapTMDBToMovie(data, true);
  } catch (err) {
    console.error('Error fetching TMDB movie details:', err);
    return null;
  }
}

/**
 * Search TMDB for movies
 */
export async function searchTMDBMovies(query: string, apiKey: string): Promise<Movie[]> {
  if (!apiKey || !query.trim()) return [];
  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    const data = await response.json();
    const rawList: TMDBMovieResult[] = data.results || [];
    
    // Fetch details for top 5 to obtain budget and revenue
    const detailedList = await Promise.all(
      rawList.slice(0, 6).map(async (item) => {
        const details = await fetchTMDBMovieDetails(item.id, apiKey);
        return details || mapTMDBToMovie(item);
      })
    );

    const remainder = rawList.slice(6, 15).map(item => mapTMDBToMovie(item));
    return [...detailedList, ...remainder];
  } catch (err) {
    console.error('TMDB Search API error:', err);
    throw err;
  }
}

/**
 * Fetch trending movies of the week from TMDB
 */
export async function fetchTrendingTMDB(apiKey: string): Promise<Movie[]> {
  if (!apiKey) return [];
  try {
    const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Trending request failed: ${response.status}`);
    }
    const data = await response.json();
    const rawList: TMDBMovieResult[] = (data.results || []).slice(0, 10);

    // Hydrate financial metrics for the trending movies
    const detailed = await Promise.all(
      rawList.map(async (item) => {
        const full = await fetchTMDBMovieDetails(item.id, apiKey);
        return full || mapTMDBToMovie(item);
      })
    );

    return detailed;
  } catch (err) {
    console.error('Error fetching trending TMDB movies:', err);
    throw err;
  }
}
