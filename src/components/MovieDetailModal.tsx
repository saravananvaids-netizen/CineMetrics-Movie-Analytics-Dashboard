import React from 'react';
import { 
  X, 
  Star, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { Movie } from '../types';
import { calculateSuccessScore, getRiskCategory, buildMovieRecommendations } from '../utils/mlEngine';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  allMovies,
  onSelectMovie
}) => {
  if (!movie) return null;

  const profit = movie.revenue - movie.budget;
  const roiPct = movie.budget > 0 ? ((profit / movie.budget) * 100).toFixed(1) : '0';
  const risk = getRiskCategory(movie);
  const success = calculateSuccessScore(movie);
  const recommendations = buildMovieRecommendations(movie, allMovies, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Banner / Backdrop */}
        <div className="relative h-56 sm:h-64 w-full bg-[#080c14] overflow-hidden">
          {movie.backdrop_path || movie.poster_path ? (
            <img
              src={movie.backdrop_path || movie.poster_path}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center brightness-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-[#0f172a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />

          {/* Quick Header Details */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${risk.badgeColor}`}>
                  {risk.category}
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  Success Score: {success.score}/100
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {movie.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span>{movie.release_year}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.genres.join(', ')}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.runtime} mins</span>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-lg font-mono">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{movie.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {movie.vote_count.toLocaleString()} verified ratings
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Financial Breakdown Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Financial & Commercial Performance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#080c14] border border-white/5">
                <span className="text-[11px] text-slate-400">Production Budget</span>
                <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
                  ${movie.budget > 0 ? (movie.budget / 1e6).toFixed(1) + 'M' : 'Undisclosed'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#080c14] border border-white/5">
                <span className="text-[11px] text-slate-400">Worldwide Gross</span>
                <div className="text-base font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                  ${movie.revenue > 0 ? (movie.revenue / 1e6).toFixed(1) + 'M' : 'Undisclosed'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#080c14] border border-white/5">
                <span className="text-[11px] text-slate-400">Net Box Profit</span>
                <div className={`text-base font-bold font-mono tabular-nums mt-0.5 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profit >= 0 ? `+$${(profit / 1e6).toFixed(1)}M` : `-$${(Math.abs(profit) / 1e6).toFixed(1)}M`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#080c14] border border-white/5">
                <span className="text-[11px] text-slate-400">Return on Capital (ROI)</span>
                <div className="text-base font-bold text-cyan-400 font-mono tabular-nums mt-0.5">
                  {movie.budget > 0 ? `${roiPct}% (${risk.roiMultiplier}x)` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Plot Synopsis */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Film Overview
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#080c14]/50 p-3.5 rounded-xl border border-white/5">
              {movie.overview || "No plot synopsis provided for this title."}
            </p>
          </div>

          {/* Success Score & Risk Assessment Dual Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#080c14] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Award className="w-4 h-4" />
                  CineMetrics Success Score
                </span>
                <span className="font-mono">{success.score}/100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Aggregated metric combining critical rating (40%), capital ROI (35%), and audience reach volume (25%).
              </p>
              <div className="pt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-mono border-t border-white/5">
                <div>Rating: {success.ratingComponent}</div>
                <div>ROI: {success.roiComponent}</div>
                <div>Pop: {success.popularityComponent}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080c14] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                  Risk Classification Rationale
                </span>
                <span className="font-mono text-xs">{risk.roiMultiplier}x Budget</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {risk.explanation}
              </p>
            </div>
          </div>

          {/* Similar Movie Recommendations (TF-IDF Match) */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                NLP Content-Based Recommendations (TF-IDF & Cosine Similarity)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map(rec => (
                  <div
                    key={rec.movie.id}
                    onClick={() => onSelectMovie(rec.movie)}
                    className="cursor-pointer p-3 rounded-xl bg-[#080c14] border border-white/5 hover:border-amber-400/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200 truncate">{rec.movie.title}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                          {rec.similarityScore}% match
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rec.movie.primary_genre} · {rec.movie.release_year}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 line-clamp-2">
                      {rec.movie.overview}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
