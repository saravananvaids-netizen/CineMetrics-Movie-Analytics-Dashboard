import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Star, 
  DollarSign, 
  Film, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Columns,
  Eye,
  TrendingUp
} from 'lucide-react';
import { Movie, FilterState } from '../types';
import { getRiskCategory } from '../utils/mlEngine';

interface MovieExplorerViewProps {
  movies: Movie[];
  filterState: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onSelectMovie: (movie: Movie) => void;
  comparedMovies: Movie[];
  onToggleCompareMovie: (movie: Movie) => void;
  onOpenCompareModal: () => void;
  onResetFilters: () => void;
}

export const MovieExplorerView: React.FC<MovieExplorerViewProps> = ({
  movies,
  filterState,
  onFilterChange,
  onSelectMovie,
  comparedMovies,
  onToggleCompareMovie,
  onOpenCompareModal,
  onResetFilters
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Derive unique genres and languages
  const allGenresSet = new Set<string>();
  const allLanguagesSet = new Set<string>();

  movies.forEach(m => {
    m.genres.forEach(g => allGenresSet.add(g));
    if (m.original_language) allLanguagesSet.add(m.original_language);
  });

  const availableGenres = Array.from(allGenresSet).sort();
  const availableLanguages = Array.from(allLanguagesSet).sort();

  // Apply filters
  const filtered = movies.filter(movie => {
    // Search query
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchGenre = movie.genres.some(g => g.toLowerCase().includes(q));
      const matchOverview = movie.overview.toLowerCase().includes(q);
      if (!matchTitle && !matchGenre && !matchOverview) return false;
    }

    // Genre filter
    if (filterState.selectedGenres.length > 0) {
      const hasMatch = filterState.selectedGenres.some(g => movie.genres.includes(g));
      if (!hasMatch) return false;
    }

    // Year range
    if (movie.release_year < filterState.yearRange[0] || movie.release_year > filterState.yearRange[1]) {
      return false;
    }

    // Min rating
    if (movie.rating < filterState.minRating) {
      return false;
    }

    // Language
    if (filterState.selectedLanguage !== 'all' && movie.original_language !== filterState.selectedLanguage) {
      return false;
    }

    // Only profitable
    if (filterState.onlyProfitable && movie.revenue <= movie.budget) {
      return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let diff = 0;
    if (filterState.sortBy === 'popularity') diff = b.popularity - a.popularity;
    else if (filterState.sortBy === 'rating') diff = b.rating - a.rating;
    else if (filterState.sortBy === 'revenue') diff = b.revenue - a.revenue;
    else if (filterState.sortBy === 'budget') diff = b.budget - a.budget;
    else if (filterState.sortBy === 'release_date') diff = b.release_year - a.release_year;
    else if (filterState.sortBy === 'roi') {
      const roiA = a.budget > 0 ? (a.revenue - a.budget) / a.budget : 0;
      const roiB = b.budget > 0 ? (b.revenue - b.budget) / b.budget : 0;
      diff = roiB - roiA;
    }
    return filterState.sortOrder === 'asc' ? -diff : diff;
  });

  const handleGenreToggle = (genre: string) => {
    onFilterChange(prev => {
      const exists = prev.selectedGenres.includes(genre);
      const updated = exists 
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre];
      return { ...prev, selectedGenres: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Movie Explorer & Film Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter, search, inspect financial profiles, and compare film performance.
          </p>
        </div>

        {/* Compare Movies Floating Trigger */}
        {comparedMovies.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            <Columns className="w-3.5 h-3.5" />
            <span className="font-semibold">{comparedMovies.length} movies selected</span>
            <button
              onClick={onOpenCompareModal}
              className="ml-2 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
            >
              Compare Side-by-Side
            </button>
          </div>
        )}
      </div>

      {/* Control Bar: Search & Primary Filters */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Filter by title, keywords, or plot..."
              className="w-full bg-[#080c14] text-xs text-slate-200 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filterState.sortBy}
              onChange={(e) => onFilterChange(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full bg-[#080c14] text-xs text-slate-200 py-2 px-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400"
            >
              <option value="popularity">Sort by: Popularity</option>
              <option value="rating">Sort by: Rating (Critique)</option>
              <option value="revenue">Sort by: Worldwide Gross</option>
              <option value="budget">Sort by: Production Budget</option>
              <option value="roi">Sort by: Financial ROI</option>
              <option value="release_date">Sort by: Release Year</option>
            </select>
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="px-2 py-2 rounded-lg bg-[#080c14] border border-white/10 text-xs text-slate-300 hover:text-white"
              title="Toggle Ascending/Descending"
            >
              {filterState.sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {/* Language Dropdown */}
          <div className="md:col-span-2">
            <select
              value={filterState.selectedLanguage}
              onChange={(e) => onFilterChange(prev => ({ ...prev, selectedLanguage: e.target.value }))}
              className="w-full bg-[#080c14] text-xs text-slate-200 py-2 px-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Language: All</option>
              {availableLanguages.map(l => (
                <option key={l} value={l}>Language: {l.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Toggle Advanced Filters & Reset */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
                showAdvancedFilters
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-[#080c14] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Sliders</span>
            </button>
            <button
              onClick={onResetFilters}
              className="p-2 rounded-lg bg-[#080c14] border border-white/10 text-slate-400 hover:text-white"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Genre Interactive Filter Chips */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Filter by Genre (Click to toggle)
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, selectedGenres: [] }))}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterState.selectedGenres.length === 0
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-[#080c14] text-slate-300 hover:bg-slate-800 border border-white/10'
              }`}
            >
              All Genres
            </button>
            {availableGenres.map(g => {
              const isSelected = filterState.selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => handleGenreToggle(g)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-[#080c14] text-slate-300 hover:bg-slate-800 border border-white/10'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Sliders (Year & Rating & Profitability) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Release Year Range */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Release Year Range</span>
                <span className="font-mono text-amber-400">
                  {filterState.yearRange[0]} – {filterState.yearRange[1]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1970"
                  max="2024"
                  value={filterState.yearRange[0]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onFilterChange(prev => ({
                      ...prev,
                      yearRange: [Math.min(val, prev.yearRange[1]), prev.yearRange[1]]
                    }));
                  }}
                  className="w-full accent-amber-500"
                />
                <input
                  type="range"
                  min="1970"
                  max="2024"
                  value={filterState.yearRange[1]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onFilterChange(prev => ({
                      ...prev,
                      yearRange: [prev.yearRange[0], Math.max(val, prev.yearRange[0])]
                    }));
                  }}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Minimum Rating</span>
                <span className="font-mono text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {filterState.minRating.toFixed(1)}+ / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={filterState.minRating}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onFilterChange(prev => ({ ...prev, minRating: val }));
                }}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Profitable Only Toggle */}
            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterState.onlyProfitable}
                  onChange={(e) => onFilterChange(prev => ({ ...prev, onlyProfitable: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span>Only Profitable Releases (Revenue &gt; Budget)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-mono text-slate-200 font-bold">{filtered.length}</span> of {movies.length} titles
        </div>
        <div>
          Select up to 4 films for side-by-side metric comparison
        </div>
      </div>

      {/* Movies Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0f172a] border border-white/8 space-y-3">
          <Film className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No films found matching criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms, broadening the release year range, or clearing active genre filters.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(movie => {
            const isCompared = comparedMovies.some(m => m.id === movie.id);
            const risk = getRiskCategory(movie);

            return (
              <div
                key={movie.id}
                className="group relative rounded-xl bg-[#0f172a] border border-white/8 hover:border-amber-400/40 transition-all flex flex-col justify-between overflow-hidden shadow-sm"
              >
                {/* Poster & Badges Container */}
                <div 
                  onClick={() => onSelectMovie(movie)}
                  className="cursor-pointer relative aspect-[2/3] w-full bg-[#080c14] overflow-hidden"
                >
                  {movie.poster_path ? (
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-[#080c14] text-slate-500 text-center">
                      <Film className="w-10 h-10 mb-2 opacity-40" />
                      <span className="text-xs font-semibold text-slate-400">{movie.title}</span>
                    </div>
                  )}

                  {/* Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/60 pointer-events-none" />

                  {/* Rating Top-Right */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>

                  {/* Release Year Top-Left */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-slate-300">
                    {movie.release_year}
                  </div>

                  {/* Risk Badge Bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${risk.badgeColor}`}>
                      {risk.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                      {risk.roiMultiplier}x
                    </span>
                  </div>
                </div>

                {/* Card Content & Action Strip */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div onClick={() => onSelectMovie(movie)} className="cursor-pointer">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {movie.title}
                    </h3>

                    {/* Unboxed metadata tags per design constitution */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 line-clamp-1">
                      <span>{movie.primary_genre}</span>
                      <span aria-hidden="true">·</span>
                      <span>{movie.runtime} min</span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase">{movie.original_language}</span>
                    </div>

                    {/* Revenue & Budget Metrics */}
                    <div className="mt-2.5 pt-2 border-t border-white/5 grid grid-cols-2 gap-1 text-[11px] font-mono">
                      <div>
                        <div className="text-slate-400 text-[10px]">Budget</div>
                        <div className="text-slate-200 font-semibold tabular-nums">
                          ${movie.budget > 0 ? (movie.budget / 1e6).toFixed(1) + 'M' : 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px]">Worldwide Box</div>
                        <div className="text-emerald-400 font-semibold tabular-nums">
                          ${movie.revenue > 0 ? (movie.revenue / 1e6).toFixed(1) + 'M' : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Compare & Quick View Bar */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => onToggleCompareMovie(movie)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        isCompared ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isCompared ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>Compare</span>
                    </button>

                    <button
                      onClick={() => onSelectMovie(movie)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
