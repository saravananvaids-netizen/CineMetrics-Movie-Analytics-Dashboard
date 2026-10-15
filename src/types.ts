export interface Movie {
  id: string | number;
  title: string;
  release_date: string;
  release_year: number;
  genres: string[];
  primary_genre: string;
  rating: number; // 0 - 10
  vote_count: number;
  popularity: number;
  budget: number; // in USD
  revenue: number; // in USD
  runtime: number; // minutes
  original_language: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  source: 'curated' | 'uploaded' | 'tmdb_api';
}

export interface FilterState {
  searchQuery: string;
  selectedGenres: string[];
  yearRange: [number, number];
  minRating: number;
  selectedLanguage: string;
  sortBy: 'popularity' | 'rating' | 'revenue' | 'budget' | 'release_date' | 'roi';
  sortOrder: 'desc' | 'asc';
  onlyProfitable: boolean;
}

export interface RegressionMetrics {
  r2: number;
  mae: number;
  rmse: number;
  trainCount: number;
  testCount: number;
  coefficients: { feature: string; weight: number; label: string }[];
  intercept: number;
}

export interface PredictionInput {
  budget: number;
  genre: string;
  release_year: number;
  runtime: number;
  popularity_estimate: number;
}

export interface RecommendationResult {
  movie: Movie;
  similarityScore: number;
  sharedGenres: string[];
}

export interface DatasetQualityReport {
  totalRows: number;
  validRows: number;
  duplicateCount: number;
  missingFields: Record<string, number>;
  dataHealthScore: number; // 0 - 100
  warnings: string[];
}

export interface SuccessScoreWeights {
  ratingWeight: number; // default 0.4
  roiWeight: number;    // default 0.35
  popularityWeight: number; // default 0.25
}

export type ActiveTab =
  | 'dashboard'
  | 'explorer'
  | 'genre'
  | 'revenue'
  | 'ratings'
  | 'predictions'
  | 'data-upload'
  | 'python-project';
