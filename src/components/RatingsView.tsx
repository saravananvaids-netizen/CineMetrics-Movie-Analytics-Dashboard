import React, { useState } from 'react';
import { Star, BarChart2, Flame, Award, HelpCircle } from 'lucide-react';
import { Movie } from '../types';
import { computeCorrelationMatrix } from '../utils/mlEngine';

interface RatingsViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const RatingsView: React.FC<RatingsViewProps> = ({ movies, onSelectMovie }) => {
  const [hoveredCorr, setHoveredCorr] = useState<{ featA: string; featB: string; val: number } | null>(null);

  // 1. Rating Distribution Histogram Bins (bins: 3.0-4.0, 4.0-5.0, 5.0-6.0, 6.0-7.0, 7.0-8.0, 8.0-9.0, 9.0-10.0)
  const bins = [
    { label: '3.0 - 4.9', min: 3.0, max: 4.99, count: 0 },
    { label: '5.0 - 5.9', min: 5.0, max: 5.99, count: 0 },
    { label: '6.0 - 6.9', min: 6.0, max: 6.99, count: 0 },
    { label: '7.0 - 7.4', min: 7.0, max: 7.49, count: 0 },
    { label: '7.5 - 7.9', min: 7.5, max: 7.99, count: 0 },
    { label: '8.0 - 8.4', min: 8.0, max: 8.49, count: 0 },
    { label: '8.5 - 10.0', min: 8.5, max: 10.0, count: 0 },
  ];

  movies.forEach(m => {
    for (const b of bins) {
      if (m.rating >= b.min && m.rating <= b.max) {
        b.count++;
        break;
      }
    }
  });

  const maxBinCount = Math.max(...bins.map(b => b.count), 1);

  // 2. Correlation Matrix
  const { features, matrix } = computeCorrelationMatrix(movies);

  // 3. Top-Rated Titles
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8);

  // 4. Quadrant Classification (Crowd Pleaser vs Critic Darling)
  const medianRating = 7.7;
  const medianPop = 75;

  const quadrants = {
    blockbusterDarling: movies.filter(m => m.rating >= medianRating && m.popularity >= medianPop).length,
    criticDarling: movies.filter(m => m.rating >= medianRating && m.popularity < medianPop).length,
    popPhenom: movies.filter(m => m.rating < medianRating && m.popularity >= medianPop).length,
    niche: movies.filter(m => m.rating < medianRating && m.popularity < medianPop).length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            Critical Reception & Audience Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing rating distributions, audience popularity correlation, and critical consensus.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Evaluated against <span className="font-mono text-amber-400 font-semibold">{movies.length} verified film records</span>
        </div>
      </div>

      {/* Top 8 Highest-Rated Titles & Quadrant Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Rated Leaderboard */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Highest-Rated Masterpieces (Critic Consensus)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Min 1,000 votes</span>
          </div>

          <div className="space-y-2">
            {topRated.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => onSelectMovie(m)}
                className="group cursor-pointer p-2.5 rounded-lg bg-[#080c14]/70 border border-white/5 hover:border-amber-400/40 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-slate-500 font-bold text-xs w-4">{idx + 1}.</span>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {m.title}
                    </h4>
                    <div className="text-[10px] text-slate-400">
                      {m.release_year} · {m.primary_genre} · {m.vote_count.toLocaleString()} votes
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span className="text-[11px] text-emerald-400">
                    ${(m.revenue / 1e6).toFixed(0)}M Gross
                  </span>
                  <div className="px-2 py-0.5 rounded bg-black/60 border border-amber-400/30 text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {m.rating.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant Analysis (Crowd Pleaser vs Critic Darling) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Critical vs. Audience Quadrants
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Intersection between audience popularity and critical acclaim
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-[#080c14] border border-amber-500/30">
              <div className="text-xs font-bold text-amber-400">Universal Triumph</div>
              <div className="text-[10px] text-slate-400 mt-0.5">High Rating &amp; High Popularity</div>
              <div className="text-xl font-bold font-mono text-white mt-2 tabular-nums">
                {quadrants.blockbusterDarling} <span className="text-xs text-slate-500 font-normal">films</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080c14] border border-cyan-500/30">
              <div className="text-xs font-bold text-cyan-400">Critic's Darling</div>
              <div className="text-[10px] text-slate-400 mt-0.5">High Rating &amp; Modest Reach</div>
              <div className="text-xl font-bold font-mono text-white mt-2 tabular-nums">
                {quadrants.criticDarling} <span className="text-xs text-slate-500 font-normal">films</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080c14] border border-rose-500/30">
              <div className="text-xs font-bold text-rose-400">Pop Phenomenon</div>
              <div className="text-[10px] text-slate-400 mt-0.5">High Popularity &amp; Divided Critique</div>
              <div className="text-xl font-bold font-mono text-white mt-2 tabular-nums">
                {quadrants.popPhenom} <span className="text-xs text-slate-500 font-normal">films</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080c14] border border-white/10">
              <div className="text-xs font-bold text-slate-300">Cult &amp; Niche</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Moderate Reach &amp; Rating</div>
              <div className="text-xl font-bold font-mono text-white mt-2 tabular-nums">
                {quadrants.niche} <span className="text-xs text-slate-500 font-normal">films</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2">
            Median thresholds: <span className="font-mono text-white">{medianRating}/10</span> rating and <span className="font-mono text-white">{medianPop}</span> popularity index.
          </div>
        </div>
      </div>

      {/* Rating Distribution Histogram */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            Rating Distribution Histogram
          </h3>
          <p className="text-xs text-slate-400">
            Frequency distribution of titles across 10-point scale bins
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48 bg-[#080c14] p-4 rounded-xl border border-white/5">
          {bins.map(b => {
            const heightPct = Math.max(8, (b.count / maxBinCount) * 100);
            return (
              <div key={b.label} className="h-full flex flex-col justify-end items-center gap-2 group">
                <span className="text-[11px] font-mono font-bold text-amber-400 tabular-nums">
                  {b.count}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md group-hover:brightness-110 transition-all duration-300"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] font-mono text-slate-400 text-center whitespace-nowrap">
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7x7 Pearson Correlation Matrix Heatmap */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              Pearson Correlation Matrix (Numerical Attributes)
            </h3>
            <p className="text-xs text-slate-400">
              $r = +1.0$ (strong positive association), $r = -1.0$ (strong negative association)
            </p>
          </div>
          {hoveredCorr && (
            <div className="text-xs font-mono px-3 py-1 rounded bg-[#080c14] border border-white/10 text-amber-400">
              {hoveredCorr.featA} ↔ {hoveredCorr.featB}: <span className="font-bold">{hoveredCorr.val}</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-400 font-semibold bg-[#080c14] border border-white/5">
                  Attributes
                </th>
                {features.map(f => (
                  <th key={f} className="p-2 text-center text-slate-300 font-semibold bg-[#080c14] border border-white/5 whitespace-nowrap">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={features[i]}>
                  <td className="p-2 font-medium text-slate-200 bg-[#080c14] border border-white/5 whitespace-nowrap">
                    {features[i]}
                  </td>
                  {row.map((val, j) => {
                    // Color mapping based on r value:
                    // val == 1.0 -> deep gold
                    // val > 0.5 -> emerald green
                    // val > 0 -> soft cyan
                    // val < 0 -> rose red
                    let bgStyle = 'bg-slate-800 text-slate-300';
                    if (i === j) {
                      bgStyle = 'bg-amber-500/25 text-amber-300 font-bold';
                    } else if (val >= 0.6) {
                      bgStyle = 'bg-emerald-500/30 text-emerald-300 font-bold';
                    } else if (val >= 0.3) {
                      bgStyle = 'bg-teal-500/20 text-teal-200';
                    } else if (val >= 0) {
                      bgStyle = 'bg-slate-800/80 text-slate-300';
                    } else {
                      bgStyle = 'bg-rose-500/25 text-rose-300 font-semibold';
                    }

                    return (
                      <td
                        key={j}
                        onMouseEnter={() => setHoveredCorr({ featA: features[i], featB: features[j], val })}
                        onMouseLeave={() => setHoveredCorr(null)}
                        className={`p-2 text-center font-mono tabular-nums border border-white/5 transition-colors cursor-default ${bgStyle}`}
                      >
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
