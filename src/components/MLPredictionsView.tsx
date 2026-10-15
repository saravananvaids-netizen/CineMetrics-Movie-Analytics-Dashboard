import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Sliders, 
  Calculator, 
  TrendingUp, 
  Star, 
  Award, 
  HelpCircle,
  Film,
  CheckCircle2
} from 'lucide-react';
import { Movie, PredictionInput, SuccessScoreWeights } from '../types';
import { trainRevenueModel, predictRevenue, buildMovieRecommendations, calculateSuccessScore } from '../utils/mlEngine';

interface MLPredictionsViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const MLPredictionsView: React.FC<MLPredictionsViewProps> = ({ movies, onSelectMovie }) => {
  const [activeSubTab, setActiveSubTab] = useState<'regression' | 'recommender' | 'scoring'>('regression');

  // 1. Train Regression Model
  const trainedModel = useMemo(() => trainRevenueModel(movies), [movies]);

  // 2. Interactive Prediction Form State
  const [predictionInput, setPredictionInput] = useState<PredictionInput>({
    budget: 85000000,
    genre: 'Science Fiction',
    release_year: 2025,
    runtime: 135,
    popularity_estimate: 75
  });

  const [predictionResult, setPredictionResult] = useState(() => 
    predictRevenue(trainedModel, {
      budget: 85000000,
      genre: 'Science Fiction',
      release_year: 2025,
      runtime: 135,
      popularity_estimate: 75
    })
  );

  const handleRunPrediction = (e: React.FormEvent) => {
    e.preventDefault();
    const res = predictRevenue(trainedModel, predictionInput);
    setPredictionResult(res);
  };

  // 3. Recommender State
  const [selectedRecommenderTitle, setSelectedRecommenderTitle] = useState<string>(
    movies[0]?.title || 'Avatar'
  );

  const targetMovie = movies.find(m => m.title === selectedRecommenderTitle) || movies[0];
  const recommendations = useMemo(() => {
    if (!targetMovie) return [];
    return buildMovieRecommendations(targetMovie, movies, 5);
  }, [targetMovie, movies]);

  // 4. Success Score Custom Weights
  const [weights, setWeights] = useState<SuccessScoreWeights>({
    ratingWeight: 0.40,
    roiWeight: 0.35,
    popularityWeight: 0.25
  });

  const rankedSuccessMovies = useMemo(() => {
    return [...movies]
      .map(m => ({
        movie: m,
        ...calculateSuccessScore(m, weights)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [movies, weights]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-400" />
            Machine Learning & Statistical Insights
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ridge regression box office forecasting, TF-IDF content recommendation, and custom multi-factor scoring.
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#0f172a] rounded-lg border border-white/8 shrink-0">
          <button
            onClick={() => setActiveSubTab('regression')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'regression'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Box Office Regressor
          </button>
          <button
            onClick={() => setActiveSubTab('recommender')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'recommender'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            NLP Recommender
          </button>
          <button
            onClick={() => setActiveSubTab('scoring')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'scoring'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Success Score Model
          </button>
        </div>
      </div>

      {/* TAB 1: REGRESSION MODEL & SIMULATOR */}
      {activeSubTab === 'regression' && (
        <div className="space-y-6">
          {/* Model Health / Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
              <span className="text-xs text-slate-400 font-medium">Model $R^2$ Score</span>
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
                {trainedModel.metrics.r2.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Coefficient of determination</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
              <span className="text-xs text-slate-400 font-medium">Mean Absolute Error (MAE)</span>
              <div className="text-2xl font-bold text-slate-200 font-mono tabular-nums mt-1">
                ${(trainedModel.metrics.mae / 1e6).toFixed(1)}M
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Average prediction error</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
              <span className="text-xs text-slate-400 font-medium">Root Mean Squared (RMSE)</span>
              <div className="text-2xl font-bold text-slate-200 font-mono tabular-nums mt-1">
                ${(trainedModel.metrics.rmse / 1e6).toFixed(1)}M
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Penalty on outlier residuals</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
              <span className="text-xs text-slate-400 font-medium">Train / Test Split</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
                {trainedModel.metrics.trainCount} / {trainedModel.metrics.testCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">80% Train, 20% Evaluation</div>
            </div>
          </div>

          {/* Interactive Concept Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  Film Concept Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure a proposed film release to forecast worldwide box office returns.
                </p>
              </div>

              <form onSubmit={handleRunPrediction} className="space-y-3.5">
                <div>
                  <label className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Proposed Production Budget</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${(predictionInput.budget / 1e6).toFixed(1)}M USD
                    </span>
                  </label>
                  <input
                    type="range"
                    min="5000000"
                    max="350000000"
                    step="5000000"
                    value={predictionInput.budget}
                    onChange={(e) => setPredictionInput({ ...predictionInput, budget: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Primary Genre
                  </label>
                  <select
                    value={predictionInput.genre}
                    onChange={(e) => setPredictionInput({ ...predictionInput, genre: e.target.value })}
                    className="w-full bg-[#080c14] text-xs text-slate-200 py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Drama">Drama</option>
                    <option value="Animation">Animation</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Crime">Crime</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Fantasy">Fantasy</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Runtime (Minutes)
                    </label>
                    <input
                      type="number"
                      min="75"
                      max="220"
                      value={predictionInput.runtime}
                      onChange={(e) => setPredictionInput({ ...predictionInput, runtime: parseInt(e.target.value, 10) || 120 })}
                      className="w-full bg-[#080c14] text-xs text-slate-200 py-2 px-3 rounded-lg border border-white/10 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Release Year
                    </label>
                    <input
                      type="number"
                      min="2024"
                      max="2030"
                      value={predictionInput.release_year}
                      onChange={(e) => setPredictionInput({ ...predictionInput, release_year: parseInt(e.target.value, 10) || 2025 })}
                      className="w-full bg-[#080c14] text-xs text-slate-200 py-2 px-3 rounded-lg border border-white/10 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-rose-950/20"
                >
                  Generate Box Office Forecast
                </button>
              </form>
            </div>

            {/* Prediction Output Results */}
            <div className="lg:col-span-7 p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Forecasted Financial Performance
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    Ridge Regressor ($L_2$)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Projections based on historical budget elasticity and categorical genre priors.
                </p>
              </div>

              {/* Main Predicted Gross Box */}
              <div className="p-5 rounded-xl bg-[#080c14] border border-amber-500/30 text-center space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Expected Worldwide Box Office Gross
                </span>
                <div className="text-3xl md:text-4xl font-bold font-mono text-amber-400 tabular-nums">
                  ${(predictionResult.predictedRevenue / 1e6).toFixed(1)} Million
                </div>
                <div className="text-xs text-slate-400 font-mono pt-1">
                  Confidence Bounds: ${(predictionResult.lowEstimate / 1e6).toFixed(1)}M – ${(predictionResult.highEstimate / 1e6).toFixed(1)}M
                </div>
              </div>

              {/* Financial Returns Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#080c14] border border-white/5">
                  <span className="text-[11px] text-slate-400">Projected Net Profit</span>
                  <div className={`text-xl font-bold font-mono mt-1 ${predictionResult.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {predictionResult.profit >= 0 ? `+$${(predictionResult.profit / 1e6).toFixed(1)}M` : `-$${(Math.abs(predictionResult.profit) / 1e6).toFixed(1)}M`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Worldwide gross minus budget</div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#080c14] border border-white/5">
                  <span className="text-[11px] text-slate-400">Expected ROI Multiplier</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {(predictionResult.predictedRevenue / predictionInput.budget).toFixed(2)}x
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Capital recovery index</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                <span className="text-amber-400 font-semibold">Analytical Disclaimer: </span>
                Regression forecasts are trained on historical performance. Actual theatrical performance depends heavily on marketing spend, star attachments, release calendar competition, and word-of-mouth momentum.
              </div>
            </div>
          </div>

          {/* Model Feature Coefficients */}
          <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Learned Feature Weights (Normalized Regression Coefficients)
            </h3>
            <p className="text-xs text-slate-400">
              Positive coefficients indicate positive drivers for box office revenue; negative coefficients indicate drag.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {trainedModel.metrics.coefficients.map(c => (
                <div key={c.label} className="p-2.5 rounded-lg bg-[#080c14] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate">{c.label}</span>
                  <span className={`font-mono font-bold tabular-nums ${c.weight >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {c.weight >= 0 ? `+${c.weight}` : c.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NLP CONTENT-BASED RECOMMENDER */}
      {activeSubTab === 'recommender' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Natural Language Movie Recommender
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Computes TF-IDF term vectors and Cosine Similarity across plot summaries, genres, and contextual metadata.
                </p>
              </div>

              {/* Target Selection Dropdown */}
              <div className="w-full md:w-72">
                <select
                  value={selectedRecommenderTitle}
                  onChange={(e) => setSelectedRecommenderTitle(e.target.value)}
                  className="w-full bg-[#080c14] text-xs text-white py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400"
                >
                  {movies.map(m => (
                    <option key={m.id} value={m.title}>{m.title} ({m.release_year})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Film Hero Card */}
            {targetMovie && (
              <div className="p-4 rounded-xl bg-[#080c14] border border-amber-500/30 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-20 h-28 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                  {targetMovie.poster_path ? (
                    <img
                      src={targetMovie.poster_path}
                      alt={targetMovie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Query Benchmark Film
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Rating: {targetMovie.rating.toFixed(1)}/10
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">{targetMovie.title} ({targetMovie.release_year})</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {targetMovie.overview}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {targetMovie.genres.map(g => (
                      <span key={g} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top 5 Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              Top 5 Most Semantically Similar Films
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(rec => (
                <div
                  key={rec.movie.id}
                  onClick={() => onSelectMovie(rec.movie)}
                  className="group cursor-pointer p-4 rounded-xl bg-[#0f172a] border border-white/8 hover:border-amber-400/40 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {rec.movie.title}
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        {rec.similarityScore}% Match
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mb-2">
                      {rec.movie.release_year} · {rec.movie.primary_genre} · {rec.movie.rating.toFixed(1)}/10
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {rec.movie.overview}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Worldwide Gross</span>
                    <span className="text-emerald-400 font-semibold">
                      ${(rec.movie.revenue / 1e6).toFixed(1)}M
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM SUCCESS SCORE SIMULATOR */}
      {activeSubTab === 'scoring' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Configurable Movie Success Score Formula
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tune the weight parameters below to re-evaluate the catalog based on your corporate or creative priorities.
              </p>
            </div>

            {/* Sliders for Weights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Critical Rating Weight</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {(weights.ratingWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.ratingWeight}
                  onChange={(e) => setWeights({ ...weights, ratingWeight: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Box Office ROI Weight</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(weights.roiWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.roiWeight}
                  onChange={(e) => setWeights({ ...weights, roiWeight: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Popularity &amp; Reach Weight</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {(weights.popularityWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.popularityWeight}
                  onChange={(e) => setWeights({ ...weights, popularityWeight: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Leaderboard Table based on weights */}
          <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Dynamic Success Score Leaderboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#080c14] text-slate-400 font-semibold border-b border-white/8">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3 text-right">Rating Score</th>
                    <th className="py-2.5 px-3 text-right">ROI Score</th>
                    <th className="py-2.5 px-3 text-right">Popularity Score</th>
                    <th className="py-2.5 px-3 text-right">Composite Success Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                  {rankedSuccessMovies.map(({ movie: m, score, ratingComponent, roiComponent, popularityComponent }, idx) => (
                    <tr
                      key={m.id}
                      onClick={() => onSelectMovie(m)}
                      className="cursor-pointer hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-amber-400 tabular-nums">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">{m.title} ({m.release_year})</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{ratingComponent}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{roiComponent}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{popularityComponent}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400 tabular-nums">
                        {score} / 100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
