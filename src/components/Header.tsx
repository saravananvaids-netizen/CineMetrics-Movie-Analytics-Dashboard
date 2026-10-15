import React, { useState } from 'react';
import { Film, Key, RotateCcw, Download, Sparkles, Database } from 'lucide-react';
import { Movie } from '../types';
import { exportMoviesToCSV, generateExecutiveReport } from '../utils/csvParser';
import { getStoredApiKey, saveStoredApiKey } from '../utils/tmdbService';

interface HeaderProps {
  currentDatasetType: 'curated' | 'uploaded' | 'tmdb_api';
  movies: Movie[];
  filteredMovies: Movie[];
  onResetFilters: () => void;
  onRefreshData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDatasetType,
  movies,
  filteredMovies,
  onResetFilters,
  onRefreshData,
  searchQuery,
  onSearchChange
}) => {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [apiSavedMessage, setApiSavedMessage] = useState(false);

  const handleSaveApiKey = () => {
    saveStoredApiKey(apiKeyInput);
    setApiSavedMessage(true);
    setTimeout(() => {
      setApiSavedMessage(false);
      setShowApiKeyModal(false);
      onRefreshData();
    }, 1200);
  };

  const handleExportCSV = () => {
    exportMoviesToCSV(filteredMovies);
  };

  const handleDownloadReport = () => {
    const reportText = generateExecutiveReport(filteredMovies);
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinemetrics_executive_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3.5 bg-[#080c14]/90 backdrop-blur-md border-b border-white/8">
      {/* Zone 1: Wordmark Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg md:text-xl font-bold tracking-tight text-white whitespace-nowrap">
            Cine<span className="text-amber-400">Metrics</span>
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium whitespace-nowrap">
            Movie Analytics Dashboard
          </span>
        </div>
      </div>

      {/* Zone 2: Search and Context */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search films across catalog..."
            className="w-full bg-[#0f172a] text-sm text-slate-200 placeholder-slate-400 rounded-lg px-3.5 py-1.5 border border-white/10 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dataset source indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f172a] border border-white/10 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize">{currentDatasetType === 'curated' ? 'Curated Catalog' : currentDatasetType === 'uploaded' ? 'Custom Dataset' : 'TMDB Live'}</span>
          <span className="text-slate-500 font-mono">({filteredMovies.length}/{movies.length})</span>
        </div>

        {/* TMDB API Key settings button */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
          title="Configure TMDB API Key"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">TMDB API</span>
        </button>

        {/* Reset filters */}
        <button
          onClick={onResetFilters}
          className="p-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-white/10 text-slate-300 transition-colors"
          title="Reset All Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
          title="Download Filtered Movies CSV"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Generate Executive Report */}
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-xs font-semibold text-white shadow-md shadow-rose-950/30 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </div>

      {/* TMDB Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                The Movie Database (TMDB) API Setup
              </h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Enter your free TMDB API Key (v3 auth) to fetch live movie box office data, posters, and releases directly from TMDB servers.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  TMDB v3 API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your 32-character key here..."
                  className="w-full bg-[#080c14] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-2.5 rounded bg-[#080c14]/60 border border-white/5 text-[11px] text-slate-400">
                <span>Don't have a key? </span>
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  Register free at themoviedb.org
                </a>
                <span>. CineMetrics operates with realistic curated data if left blank.</span>
              </div>
            </div>

            {apiSavedMessage && (
              <div className="mb-4 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                API Key saved securely. Initializing live catalog...
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setApiKeyInput('');
                  saveStoredApiKey('');
                  setShowApiKeyModal(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-slate-400 hover:text-white"
              >
                Clear Key
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
