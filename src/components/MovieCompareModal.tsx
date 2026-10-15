import React from 'react';
import { X, Star, DollarSign, TrendingUp, Award, Flame, Trash2 } from 'lucide-react';
import { Movie } from '../types';
import { calculateSuccessScore, getRiskCategory } from '../utils/mlEngine';

interface MovieCompareModalProps {
  movies: Movie[];
  onClose: () => void;
  onRemoveMovie: (movieId: string | number) => void;
  onClearAll: () => void;
}

export const MovieCompareModal: React.FC<MovieCompareModalProps> = ({
  movies,
  onClose,
  onRemoveMovie,
  onClearAll
}) => {
  if (movies.length === 0) return null;

  // Find max values for metric relative visual bars
  const maxRevenue = Math.max(...movies.map(m => m.revenue), 1);
  const maxBudget = Math.max(...movies.map(m => m.budget), 1);
  const maxPopularity = Math.max(...movies.map(m => m.popularity), 1);

  // Highest in each metric
  const highestRatingId = [...movies].sort((a, b) => b.rating - a.rating)[0]?.id;
  const highestRevId = [...movies].sort((a, b) => b.revenue - a.revenue)[0]?.id;
  const highestRoiId = [...movies].sort((a, b) => {
    const roiA = a.budget > 0 ? (a.revenue - a.budget) / a.budget : 0;
    const roiB = b.budget > 0 ? (b.revenue - b.budget) / b.budget : 0;
    return roiB - roiA;
  })[0]?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Side-by-Side Film Comparison Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative analysis of critical appeal, capital intensity, and financial returns.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Selection</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {movies.map(movie => {
            const profit = movie.revenue - movie.budget;
            const roiVal = movie.budget > 0 ? ((profit / movie.budget) * 100).toFixed(1) : '0';
            const risk = getRiskCategory(movie);
            const success = calculateSuccessScore(movie);

            const isRatingWinner = movie.id === highestRatingId;
            const isRevWinner = movie.id === highestRevId;
            const isRoiWinner = movie.id === highestRoiId;

            return (
              <div
                key={movie.id}
                className="rounded-xl bg-[#080c14] border border-white/8 p-4 flex flex-col justify-between space-y-4"
              >
                {/* Title & Remove */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate" title={movie.title}>
                        {movie.title}
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {movie.release_year} · {movie.primary_genre}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveMovie(movie.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs shrink-0"
                      title="Remove from comparison"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Poster Thumbnail */}
                  <div className="mt-3 aspect-[16/9] w-full rounded-lg bg-slate-900 overflow-hidden relative">
                    {movie.poster_path ? (
                      <img
                        src={movie.poster_path}
                        alt={movie.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No image
                      </div>
                    )}
                    <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${risk.badgeColor}`}>
                      {risk.category}
                    </span>
                  </div>
                </div>

                {/* Comparative Metrics Bars */}
                <div className="space-y-3 text-xs font-mono">
                  {/* Rating */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" /> Rating
                      </span>
                      <span className={`font-bold ${isRatingWinner ? 'text-amber-400' : 'text-slate-200'}`}>
                        {movie.rating.toFixed(1)}/10 {isRatingWinner && '👑'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${(movie.rating / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Revenue */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" /> Revenue
                      </span>
                      <span className={`font-bold ${isRevWinner ? 'text-emerald-400' : 'text-slate-200'}`}>
                        ${(movie.revenue / 1e6).toFixed(1)}M {isRevWinner && '👑'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${(movie.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Budget</span>
                      <span className="text-slate-300 font-semibold">
                        ${movie.budget > 0 ? (movie.budget / 1e6).toFixed(1) + 'M' : 'N/A'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-500 rounded-full"
                        style={{ width: `${(movie.budget / maxBudget) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Net Profit</span>
                      <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {profit >= 0 ? `+$${(profit / 1e6).toFixed(1)}M` : `-$${(Math.abs(profit) / 1e6).toFixed(1)}M`}
                      </span>
                    </div>
                  </div>

                  {/* ROI */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-cyan-400" /> ROI
                      </span>
                      <span className={`font-bold ${isRoiWinner ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {roiVal}% ({risk.roiMultiplier}x) {isRoiWinner && '👑'}
                      </span>
                    </div>
                  </div>

                  {/* Success Score */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Success Score</span>
                    <span className="text-amber-400 font-bold">{success.score}/100</span>
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
