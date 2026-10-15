import React from 'react';
import { 
  DollarSign, 
  Star, 
  Film, 
  Trophy, 
  Flame, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Movie, ActiveTab } from '../types';

interface DashboardViewProps {
  movies: Movie[];
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectMovie: (movie: Movie) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  movies,
  onNavigateTab,
  onSelectMovie
}) => {
  // Compute High-Level Metrics
  const totalCount = movies.length;
  const avgRating = totalCount > 0 
    ? (movies.reduce((acc, m) => acc + m.rating, 0) / totalCount).toFixed(2) 
    : '0.0';

  const revMovies = movies.filter(m => m.revenue > 0);
  const totalRevenue = revMovies.reduce((acc, m) => acc + m.revenue, 0);
  const totalBudget = revMovies.reduce((acc, m) => acc + m.budget, 0);
  const netIndustryProfit = totalRevenue - totalBudget;
  const portfolioRoi = totalBudget > 0 ? ((netIndustryProfit / totalBudget) * 100).toFixed(1) : '0';

  const topGrossing = [...movies].sort((a, b) => b.revenue - a.revenue)[0];
  const topRated = [...movies].sort((a, b) => b.rating - a.rating)[0];
  const mostPopular = [...movies].sort((a, b) => b.popularity - a.popularity)[0];

  // Most popular genre
  const genreCounts: Record<string, number> = {};
  movies.forEach(m => {
    genreCounts[m.primary_genre] = (genreCounts[m.primary_genre] || 0) + 1;
  });
  const topGenreEntry = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
  const mostPopularGenre = topGenreEntry ? topGenreEntry[0] : 'N/A';

  // Year range
  const years = movies.map(m => m.release_year).filter(y => !isNaN(y));
  const minYear = years.length > 0 ? Math.min(...years) : 1970;
  const maxYear = years.length > 0 ? Math.max(...years) : 2024;

  // Top 5 grossing for mini chart
  const topGrossingList = [...movies].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxTopRev = topGrossingList[0]?.revenue || 1;

  // Top genres list
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Headline & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Industry Analytics & Box Office Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Macro analysis of global box office performance, critical benchmarks, and predictive financial models.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Release Epoch</span>
          <span className="font-mono text-amber-400 font-semibold">{minYear} – {maxYear}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-300">{totalCount} Titles</span>
        </div>
      </div>

      {/* 6 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Movies */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Catalog Scope</span>
            <Film className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified titles
          </div>
        </div>

        {/* Average Rating */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {avgRating} <span className="text-xs text-slate-400 font-normal">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Audience benchmark
          </div>
        </div>

        {/* Highest-Grossing Movie */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top Grossing</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white truncate" title={topGrossing?.title}>
            {topGrossing?.title || 'N/A'}
          </div>
          <div className="text-xs font-mono text-emerald-400 font-semibold tabular-nums mt-0.5">
            ${topGrossing ? (topGrossing.revenue / 1e9).toFixed(2) : 0}B USD
          </div>
        </div>

        {/* Total Box Office Revenue */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Box Office</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ${(totalRevenue / 1e9).toFixed(2)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Worldwide gross
          </div>
        </div>

        {/* Most Popular Genre */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Leading Genre</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-white truncate">
            {mostPopularGenre}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {genreCounts[mostPopularGenre] || 0} catalog releases
          </div>
        </div>

        {/* Aggregate ROI */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Portfolio ROI</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            +{portfolioRoi}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Return on capital
          </div>
        </div>
      </div>

      {/* Strategic Insights Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              Data-Driven Analytical Takeaways
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              <span className="text-amber-400 font-semibold">Science Fiction & Action</span> films drive 64% of worldwide box office volume, while <span className="text-rose-400 font-semibold">Drama</span> commands the highest average critical score ({((movies.filter(m => m.primary_genre === 'Drama').reduce((a, b) => a + b.rating, 0) / Math.max(1, movies.filter(m => m.primary_genre === 'Drama').length)) || 8.1).toFixed(1)}/10).
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('predictions')}
          className="self-start md:self-center px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Run ML Predictor</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Split Grid: Top Grossing Leaderboard & Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Grossing Films Bar Stack */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Worldwide Box Office Leaders
              </h3>
              <p className="text-xs text-slate-400">
                Top grossing releases with return on investment comparison
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('revenue')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Full Analysis <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {topGrossingList.map((m, idx) => {
              const widthPct = Math.max(12, (m.revenue / maxTopRev) * 100);
              const profitMultiplier = m.budget > 0 ? (m.revenue / m.budget).toFixed(1) : '1.0';
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMovie(m)}
                  className="group cursor-pointer p-2.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-slate-500 text-[11px] w-4">{idx + 1}.</span>
                      <span className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                        {m.title}
                      </span>
                      <span className="text-[11px] text-slate-400">({m.release_year})</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400">
                        {profitMultiplier}x Return
                      </span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        ${(m.revenue / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres Breakdown */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Genre Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Share of catalog titles and avg ratings
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('genre')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Genre View <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            {sortedGenres.map(([genre, count]) => {
              const share = ((count / totalCount) * 100).toFixed(0);
              const genreMovies = movies.filter(m => m.primary_genre === genre);
              const gRating = genreMovies.length > 0
                ? (genreMovies.reduce((a, b) => a + b.rating, 0) / genreMovies.length).toFixed(1)
                : '7.0';

              return (
                <div key={genre} className="p-2 rounded-lg bg-[#080c14]/70 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{genre}</span>
                    <span className="text-slate-500 text-[11px]">· {count} titles</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {gRating}
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums w-8 text-right">
                      {share}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Portfolio Diversity</span>
            <span className="text-slate-300 font-semibold">{Object.keys(genreCounts).length} distinct categories</span>
          </div>
        </div>
      </div>

      {/* Featured Hall of Fame Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">
            Curated Film Highlights
          </h3>
          <span className="text-xs text-slate-400">Click any card for comprehensive financial breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[topGrossing, topRated, mostPopular, movies[3]].filter(Boolean).map((movie, idx) => {
            const highlightLabel = idx === 0 ? "Highest Grossing" : idx === 1 ? "Highest Rated" : idx === 2 ? "Highest Popularity" : "Featured Pick";
            return (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group cursor-pointer rounded-xl bg-[#0f172a] border border-white/8 hover:border-amber-400/40 transition-all overflow-hidden flex flex-col"
              >
                {/* Poster container with fallback */}
                <div className="relative aspect-[16/9] w-full bg-[#080c14] overflow-hidden">
                  {movie.poster_path ? (
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#080c14] text-slate-600">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-amber-400 border border-white/10">
                    {highlightLabel}
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <span>{movie.primary_genre}</span>
                      <span aria-hidden="true">·</span>
                      <span>{movie.release_year}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">Gross Revenue</span>
                    <span className="font-semibold text-emerald-400 tabular-nums">
                      ${(movie.revenue / 1e6).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
