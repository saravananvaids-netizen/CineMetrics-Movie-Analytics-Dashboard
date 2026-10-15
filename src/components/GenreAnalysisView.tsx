import React, { useState } from 'react';
import { PieChart, BarChart3, Star, DollarSign, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { Movie } from '../types';

interface GenreAnalysisViewProps {
  movies: Movie[];
  onSelectGenreFilter?: (genre: string) => void;
}

export const GenreAnalysisView: React.FC<GenreAnalysisViewProps> = ({ movies }) => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'rating' | 'count'>('revenue');

  // Compute aggregated genre data
  const genreDataMap: Record<string, {
    count: number;
    totalRevenue: number;
    totalBudget: number;
    ratings: number[];
    popularities: number[];
  }> = {};

  movies.forEach(movie => {
    movie.genres.forEach(g => {
      if (!genreDataMap[g]) {
        genreDataMap[g] = { count: 0, totalRevenue: 0, totalBudget: 0, ratings: [], popularities: [] };
      }
      genreDataMap[g].count++;
      genreDataMap[g].totalRevenue += movie.revenue;
      genreDataMap[g].totalBudget += movie.budget;
      genreDataMap[g].ratings.push(movie.rating);
      genreDataMap[g].popularities.push(movie.popularity);
    });
  });

  const genreList = Object.entries(genreDataMap).map(([name, data]) => {
    const avgRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
    const avgPop = data.popularities.reduce((a, b) => a + b, 0) / data.popularities.length;
    const profit = data.totalRevenue - data.totalBudget;
    const avgRoi = data.totalBudget > 0 ? (profit / data.totalBudget) * 100 : 0;

    return {
      name,
      count: data.count,
      totalRevenue: data.totalRevenue,
      totalBudget: data.totalBudget,
      profit,
      avgRoi: Math.round(avgRoi),
      avgRating: parseFloat(avgRating.toFixed(2)),
      avgPopularity: parseFloat(avgPop.toFixed(1))
    };
  });

  // Sort genres based on selected metric
  const sortedGenres = [...genreList].sort((a, b) => {
    if (selectedMetric === 'revenue') return b.totalRevenue - a.totalRevenue;
    if (selectedMetric === 'rating') return b.avgRating - a.avgRating;
    return b.count - a.count;
  });

  const maxRevenue = Math.max(...genreList.map(g => g.totalRevenue), 1);
  const totalMarketRevenue = genreList.reduce((acc, g) => acc + g.totalRevenue, 0);

  // Top rated and top grossing genre
  const topRatedGenre = [...genreList].sort((a, b) => b.avgRating - a.avgRating)[0];
  const topGrossingGenre = [...genreList].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Insights Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-amber-400" />
            Genre Performance & Market Dynamics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing commercial box office gross, audience ratings, and portfolio market shares by film genre.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0f172a] rounded-lg border border-white/8">
          <button
            onClick={() => setSelectedMetric('revenue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedMetric === 'revenue'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setSelectedMetric('rating')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedMetric === 'rating'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Rating
          </button>
          <button
            onClick={() => setSelectedMetric('count')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedMetric === 'count'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Release Volume
          </button>
        </div>
      </div>

      {/* Key Analytical Takeaways Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="text-xs text-slate-400 font-medium">Critical Benchmark Leader</div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {topRatedGenre?.name || 'N/A'}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Highest average critical rating at <span className="font-mono text-white">{topRatedGenre?.avgRating}/10</span> across {topRatedGenre?.count} films.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="text-xs text-slate-400 font-medium">Commercial Revenue Leader</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {topGrossingGenre?.name || 'N/A'}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Generated <span className="font-mono text-white">${topGrossingGenre ? (topGrossingGenre.totalRevenue / 1e9).toFixed(2) : 0}B USD</span> worldwide.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <div className="text-xs text-slate-400 font-medium">Market Diversification</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">
            {genreList.length} Film Genres
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-genre classifications represented across {movies.length} distinct movie records.
          </p>
        </div>
      </div>

      {/* Interactive Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Bar Chart Stack */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Genre Performance Breakdown ({selectedMetric.toUpperCase()})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Aggregated from verified releases
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedGenres.slice(0, 10).map((g, idx) => {
              let pct = 0;
              let displayVal = '';

              if (selectedMetric === 'revenue') {
                pct = Math.max(8, (g.totalRevenue / maxRevenue) * 100);
                displayVal = `$${(g.totalRevenue / 1e9).toFixed(2)}B`;
              } else if (selectedMetric === 'rating') {
                pct = (g.avgRating / 10) * 100;
                displayVal = `${g.avgRating.toFixed(1)} / 10`;
              } else {
                const maxCount = Math.max(...genreList.map(item => item.count), 1);
                pct = Math.max(8, (g.count / maxCount) * 100);
                displayVal = `${g.count} titles`;
              }

              return (
                <div key={g.name} className="p-2 rounded-lg bg-[#080c14]/70 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-4">{idx + 1}.</span>
                      <span className="font-semibold text-white">{g.name}</span>
                      <span className="text-[11px] text-slate-400">({g.count} films)</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {g.avgRating.toFixed(1)}
                      </span>
                      <span className="font-bold text-emerald-400 tabular-nums">
                        {displayVal}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart / Market Share Distribution */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Box Office Market Share
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Relative global box office contribution by major genre
            </p>
          </div>

          {/* SVG Donut */}
          <div className="relative py-4 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
              {(() => {
                const colors = ['#f59e0b', '#e11d48', '#38bdf8', '#10b981', '#a855f7', '#ec4899', '#64748b'];
                const top6 = sortedGenres.slice(0, 6);
                const sumTop = top6.reduce((acc, g) => acc + g.totalRevenue, 0) || 1;
                let accumulated = 0;
                const radius = 60;
                const circumference = 2 * Math.PI * radius;

                return top6.map((g, idx) => {
                  const share = g.totalRevenue / sumTop;
                  const strokeDasharray = `${share * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulated * circumference;
                  accumulated += share;

                  return (
                    <circle
                      key={g.name}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={colors[idx % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all hover:opacity-85"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-slate-400">Total Box Office</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                ${(totalMarketRevenue / 1e9).toFixed(1)}B
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {sortedGenres.slice(0, 6).map((g, idx) => {
              const colors = ['bg-amber-500', 'bg-rose-500', 'bg-sky-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400'];
              const share = ((g.totalRevenue / Math.max(1, totalMarketRevenue)) * 100).toFixed(1);
              return (
                <div key={g.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                    <span className="text-slate-200">{g.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 tabular-nums">{share}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comprehensive Genre Performance Table */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-3">
        <h3 className="text-sm font-bold text-white">
          Comprehensive Genre Analytical Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#080c14] text-slate-400 font-semibold border-b border-white/8">
              <tr>
                <th className="py-2.5 px-3">Genre</th>
                <th className="py-2.5 px-3 text-right">Title Count</th>
                <th className="py-2.5 px-3 text-right">Avg Rating</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                <th className="py-2.5 px-3 text-right">Total Budget</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Avg ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
              {sortedGenres.map(g => (
                <tr key={g.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-white">{g.name}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{g.count}</td>
                  <td className="py-2.5 px-3 text-right text-amber-400 tabular-nums">{g.avgRating.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums">
                    ${(g.totalRevenue / 1e6).toFixed(1)}M
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    ${(g.totalBudget / 1e6).toFixed(1)}M
                  </td>
                  <td className={`py-2.5 px-3 text-right tabular-nums ${g.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {g.profit >= 0 ? `+$${(g.profit / 1e6).toFixed(1)}M` : `-$${(Math.abs(g.profit) / 1e6).toFixed(1)}M`}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400 tabular-nums">
                    +{g.avgRoi}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
