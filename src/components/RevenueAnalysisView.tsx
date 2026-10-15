import React, { useState } from 'react';
import { TrendingUp, DollarSign, Award, ArrowUpRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Movie } from '../types';
import { getRiskCategory } from '../utils/mlEngine';

interface RevenueAnalysisViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const RevenueAnalysisView: React.FC<RevenueAnalysisViewProps> = ({
  movies,
  onSelectMovie
}) => {
  const [hoveredMovie, setHoveredMovie] = useState<Movie | null>(null);

  // Financial movies with non-zero figures
  const financialMovies = movies.filter(m => m.budget > 0 && m.revenue > 0);
  const totalRev = financialMovies.reduce((a, b) => a + b.revenue, 0);
  const totalBud = financialMovies.reduce((a, b) => a + b.budget, 0);
  const netProfit = totalRev - totalBud;
  const portfolioRoi = totalBud > 0 ? ((netProfit / totalBud) * 100).toFixed(1) : '0';

  // Top 10 grossing
  const top10Grossing = [...financialMovies].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const maxRev = top10Grossing[0]?.revenue || 1;

  // Top ROI Leaderboard
  const topRoiList = [...financialMovies]
    .map(m => ({
      movie: m,
      roiMultiplier: m.revenue / m.budget,
      profit: m.revenue - m.budget
    }))
    .sort((a, b) => b.roiMultiplier - a.roiMultiplier)
    .slice(0, 5);

  // Risk categorization counts
  const riskCounts = {
    blockbuster: 0,
    profitable: 0,
    breakeven: 0,
    deficit: 0
  };

  financialMovies.forEach(m => {
    const mult = m.revenue / m.budget;
    if (mult >= 3.5) riskCounts.blockbuster++;
    else if (mult >= 2.0) riskCounts.profitable++;
    else if (mult >= 1.0) riskCounts.breakeven++;
    else riskCounts.deficit++;
  });

  // Scatter plot geometry
  const maxPlotBudget = 400; // in Millions
  const maxPlotRevenue = 3000; // in Millions

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Box Office & Financial Performance Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing production capital risk, worldwide gross collections, commercial margins, and Return on Investment (ROI).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-[#0f172a] border border-white/10 text-slate-300 font-mono">
            Currency: USD ($ Millions / Billions)
          </span>
        </div>
      </div>

      {/* Financial Snapshot KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Cumulative Box Office</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            ${(totalRev / 1e9).toFixed(2)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {financialMovies.length} reporting titles</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Aggregate Production Capital</span>
          <div className="text-2xl font-bold text-slate-200 font-mono tabular-nums mt-1">
            ${(totalBud / 1e9).toFixed(2)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Declared production spend</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Net Industry Profit Margin</span>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            +${(netProfit / 1e9).toFixed(2)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Gross revenue minus budget</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Portfolio Aggregate ROI</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
            +{portfolioRoi}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Capital efficiency ratio</div>
        </div>
      </div>

      {/* Top 10 Highest-Grossing Movies Worldwide */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Top 10 Highest-Grossing Movies of All Time
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by worldwide box office revenue in millions USD
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Peak: ${((top10Grossing[0]?.revenue || 0) / 1e9).toFixed(2)}B
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {top10Grossing.map((m, idx) => {
            const widthPct = Math.max(10, (m.revenue / maxRev) * 100);
            const budgetPct = (m.budget / maxRev) * 100;
            const profit = m.revenue - m.budget;
            const roiMult = (m.revenue / m.budget).toFixed(1);

            return (
              <div
                key={m.id}
                onClick={() => onSelectMovie(m)}
                className="group cursor-pointer p-2.5 rounded-lg bg-[#080c14]/70 border border-white/5 hover:border-amber-400/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 w-4 font-bold">{idx + 1}.</span>
                    <span className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                      {m.title}
                    </span>
                    <span className="text-slate-400 text-[11px]">({m.release_year})</span>
                    <span className="text-slate-500 text-[11px]">· {m.primary_genre}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs shrink-0">
                    <span className="text-slate-400 text-[11px]">
                      Budget: ${(m.budget / 1e6).toFixed(0)}M
                    </span>
                    <span className="text-cyan-400 font-semibold text-[11px]">
                      {roiMult}x Return
                    </span>
                    <span className="font-bold text-emerald-400 tabular-nums">
                      ${(m.revenue / 1e6).toFixed(1)}M
                    </span>
                  </div>
                </div>

                {/* Comparative bar with budget overlay */}
                <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full z-10 transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-rose-500/80 rounded-full z-20"
                    style={{ width: `${budgetPct}%` }}
                    title={`Budget: $${(m.budget / 1e6).toFixed(1)}M`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Budget vs. Revenue Scatter Plot */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Production Budget vs. Worldwide Revenue Scatter
            </h3>
            <p className="text-xs text-slate-400">
              Points above the diagonal break-even line represent profitable films ($Revenue &gt; Budget$).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Hover points for film details
            </span>
          </div>
        </div>

        {/* Custom SVG Scatter Plot */}
        <div className="relative w-full h-80 bg-[#080c14] rounded-xl border border-white/5 p-4 overflow-hidden">
          {/* Axis Labels */}
          <div className="absolute top-2 left-4 text-[11px] font-mono text-slate-400">
            Worldwide Revenue (USD Millions)
          </div>
          <div className="absolute bottom-2 right-4 text-[11px] font-mono text-slate-400">
            Production Budget (USD Millions) →
          </div>

          <svg viewBox="0 0 800 300" className="w-full h-full">
            {/* Grid Lines */}
            <line x1="50" y1="260" x2="780" y2="260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="50" y1="40" x2="50" y2="260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="50" y1="150" x2="780" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="415" y1="40" x2="415" y2="260" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Break-even line: 1.0x return */}
            <line
              x1="50"
              y1="260"
              x2="780"
              y2="190"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="700" y="180" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
              1.0x Break-Even Line
            </text>

            {/* Movie Plot Points */}
            {financialMovies.map(m => {
              const bM = m.budget / 1e6;
              const rM = m.revenue / 1e6;

              // Map coordinates: Budget 0-400M -> x: 50-760, Revenue 0-3000M -> y: 260-40
              const cx = 50 + (bM / maxPlotBudget) * 710;
              const cy = 260 - (rM / maxPlotRevenue) * 220;

              const isHovered = hoveredMovie?.id === m.id;
              const radius = isHovered ? 8 : Math.max(4, Math.min(10, (m.popularity / 140) * 10));

              const mult = m.revenue / m.budget;
              const pointColor = mult >= 3.5 ? '#f59e0b' : mult >= 2.0 ? '#10b981' : mult >= 1.0 ? '#38bdf8' : '#e11d48';

              return (
                <circle
                  key={m.id}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={pointColor}
                  fillOpacity={isHovered ? 1.0 : 0.75}
                  stroke={isHovered ? '#ffffff' : '#080c14'}
                  strokeWidth={isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredMovie(m)}
                  onClick={() => onSelectMovie(m)}
                />
              );
            })}
          </svg>

          {/* Hover Floating Card */}
          {hoveredMovie && (
            <div className="absolute top-4 right-4 p-3 rounded-lg bg-[#0f172a]/95 border border-amber-400/50 shadow-xl text-xs max-w-xs animate-in fade-in">
              <div className="font-bold text-white text-sm truncate">{hoveredMovie.title}</div>
              <div className="text-[11px] text-slate-400">
                {hoveredMovie.release_year} · {hoveredMovie.primary_genre}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] border-t border-white/10 pt-1.5">
                <div>
                  <span className="text-slate-400">Budget: </span>
                  <span className="text-slate-200">${(hoveredMovie.budget / 1e6).toFixed(1)}M</span>
                </div>
                <div>
                  <span className="text-slate-400">Revenue: </span>
                  <span className="text-emerald-400 font-semibold">${(hoveredMovie.revenue / 1e6).toFixed(1)}M</span>
                </div>
                <div>
                  <span className="text-slate-400">Return: </span>
                  <span className="text-cyan-400 font-semibold">{(hoveredMovie.revenue / hoveredMovie.budget).toFixed(2)}x</span>
                </div>
                <div>
                  <span className="text-slate-400">Rating: </span>
                  <span className="text-amber-400">{hoveredMovie.rating.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Categorization & ROI Champions Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Categories */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Budget vs. Revenue Risk Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Categorization based on industry multiplier thresholds
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-[#080c14] border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-400">Blockbuster Hit (&ge; 3.5x Budget)</div>
                <div className="text-[11px] text-slate-400">High-margin commercial triumphs</div>
              </div>
              <div className="text-base font-bold text-white font-mono tabular-nums">
                {riskCounts.blockbuster} films
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080c14] border border-emerald-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-400">Profitable Asset (2.0x – 3.5x)</div>
                <div className="text-[11px] text-slate-400">Recouped theatrical distribution and P&amp;A marketing</div>
              </div>
              <div className="text-base font-bold text-white font-mono tabular-nums">
                {riskCounts.profitable} films
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080c14] border border-cyan-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-400">Moderate / Break-Even (1.0x – 2.0x)</div>
                <div className="text-[11px] text-slate-400">Covered production cost, thin marketing margin</div>
              </div>
              <div className="text-base font-bold text-white font-mono tabular-nums">
                {riskCounts.breakeven} films
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080c14] border border-rose-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-400">Box Office Deficit (&lt; 1.0x)</div>
                <div className="text-[11px] text-slate-400">Failed to recoup initial production capital</div>
              </div>
              <div className="text-base font-bold text-white font-mono tabular-nums">
                {riskCounts.deficit} films
              </div>
            </div>
          </div>
        </div>

        {/* Top ROI Capital Efficiency Champions */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              ROI Efficiency Champions (Highest Multiple of Budget)
            </h3>
            <p className="text-xs text-slate-400">
              Films generating exceptional multiples relative to production outlay
            </p>
          </div>

          <div className="space-y-2.5">
            {topRoiList.map(({ movie: m, roiMultiplier, profit }) => (
              <div
                key={m.id}
                onClick={() => onSelectMovie(m)}
                className="group cursor-pointer p-3 rounded-lg bg-[#080c14] border border-white/5 hover:border-amber-400/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    {m.title} <span className="text-slate-400 font-normal">({m.release_year})</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Budget: ${(m.budget / 1e6).toFixed(1)}M → Gross: ${(m.revenue / 1e6).toFixed(1)}M
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">
                    {roiMultiplier.toFixed(1)}x Return
                  </div>
                  <div className="text-[10px] text-slate-400">
                    +${(profit / 1e6).toFixed(1)}M Profit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
