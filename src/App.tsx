import React, { useState, useEffect } from 'react';
import { Movie, FilterState, ActiveTab, DatasetQualityReport } from './types';
import { INITIAL_MOVIES } from './data/sampleMovies';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MovieExplorerView } from './components/MovieExplorerView';
import { GenreAnalysisView } from './components/GenreAnalysisView';
import { RevenueAnalysisView } from './components/RevenueAnalysisView';
import { RatingsView } from './components/RatingsView';
import { MLPredictionsView } from './components/MLPredictionsView';
import { DataUploadView } from './components/DataUploadView';
import { PythonProjectView } from './components/PythonProjectView';
import { MovieDetailModal } from './components/MovieDetailModal';
import { MovieCompareModal } from './components/MovieCompareModal';
import { getStoredApiKey, searchTMDBMovies } from './utils/tmdbService';

export default function App() {
  // 1. Data State
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [datasetType, setDatasetType] = useState<'curated' | 'uploaded' | 'tmdb_api'>('curated');
  const [auditReport, setAuditReport] = useState<DatasetQualityReport>({
    totalRows: INITIAL_MOVIES.length,
    validRows: INITIAL_MOVIES.length,
    duplicateCount: 0,
    missingFields: {},
    dataHealthScore: 98,
    warnings: []
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // 3. Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedGenres: [],
    yearRange: [1970, 2024],
    minRating: 0.0,
    selectedLanguage: 'all',
    sortBy: 'popularity',
    sortOrder: 'desc',
    onlyProfitable: false
  });

  // 4. Modal States
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [comparedMovies, setComparedMovies] = useState<Movie[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // 5. Check if TMDB API is configured on mount
  useEffect(() => {
    const key = getStoredApiKey();
    if (key) {
      // Optional: Live search or trending fetch if user configured key
    }
  }, []);

  // Filtered movies derived list for header / export
  const filteredMovies = movies.filter(m => {
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      const match = m.title.toLowerCase().includes(q) || m.genres.some(g => g.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterState.selectedGenres.length > 0) {
      const matchGenre = filterState.selectedGenres.some(g => m.genres.includes(g));
      if (!matchGenre) return false;
    }
    if (m.release_year < filterState.yearRange[0] || m.release_year > filterState.yearRange[1]) {
      return false;
    }
    if (m.rating < filterState.minRating) return false;
    if (filterState.selectedLanguage !== 'all' && m.original_language !== filterState.selectedLanguage) return false;
    if (filterState.onlyProfitable && m.revenue <= m.budget) return false;
    return true;
  });

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedGenres: [],
      yearRange: [1970, 2024],
      minRating: 0.0,
      selectedLanguage: 'all',
      sortBy: 'popularity',
      sortOrder: 'desc',
      onlyProfitable: false
    });
  };

  const handleToggleCompareMovie = (movie: Movie) => {
    setComparedMovies(prev => {
      const exists = prev.some(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      } else {
        if (prev.length >= 4) {
          // Keep max 4
          return [...prev.slice(1), movie];
        }
        return [...prev, movie];
      }
    });
  };

  const handleRemoveCompareMovie = (id: string | number) => {
    setComparedMovies(prev => prev.filter(m => m.id !== id));
  };

  const handleClearCompare = () => {
    setComparedMovies([]);
  };

  const handleDatasetUpdate = (newMovies: Movie[], report: DatasetQualityReport) => {
    setMovies(newMovies);
    setAuditReport(report);
    setDatasetType('uploaded');
    handleResetFilters();
  };

  const handleResetToDefault = () => {
    setMovies(INITIAL_MOVIES);
    setDatasetType('curated');
    setAuditReport({
      totalRows: INITIAL_MOVIES.length,
      validRows: INITIAL_MOVIES.length,
      duplicateCount: 0,
      missingFields: {},
      dataHealthScore: 98,
      warnings: []
    });
    handleResetFilters();
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Contract */}
      <Header
        currentDatasetType={datasetType}
        movies={movies}
        filteredMovies={filteredMovies}
        onResetFilters={handleResetFilters}
        onRefreshData={handleResetToDefault}
        searchQuery={filterState.searchQuery}
        onSearchChange={(q) => {
          setFilterState(prev => ({ ...prev, searchQuery: q }));
          if (activeTab !== 'explorer' && activeTab !== 'dashboard') {
            setActiveTab('explorer');
          }
        }}
      />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          moviesCount={movies.length}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              movies={filteredMovies}
              onNavigateTab={setActiveTab}
              onSelectMovie={setSelectedMovie}
            />
          )}

          {activeTab === 'explorer' && (
            <MovieExplorerView
              movies={movies}
              filterState={filterState}
              onFilterChange={setFilterState}
              onSelectMovie={setSelectedMovie}
              comparedMovies={comparedMovies}
              onToggleCompareMovie={handleToggleCompareMovie}
              onOpenCompareModal={() => setShowCompareModal(true)}
              onResetFilters={handleResetFilters}
            />
          )}

          {activeTab === 'genre' && (
            <GenreAnalysisView
              movies={filteredMovies}
            />
          )}

          {activeTab === 'revenue' && (
            <RevenueAnalysisView
              movies={filteredMovies}
              onSelectMovie={setSelectedMovie}
            />
          )}

          {activeTab === 'ratings' && (
            <RatingsView
              movies={filteredMovies}
              onSelectMovie={setSelectedMovie}
            />
          )}

          {activeTab === 'predictions' && (
            <MLPredictionsView
              movies={movies}
              onSelectMovie={setSelectedMovie}
            />
          )}

          {activeTab === 'data-upload' && (
            <DataUploadView
              currentDataset={movies}
              auditReport={auditReport}
              onDatasetUpdate={handleDatasetUpdate}
              onResetToDefault={handleResetToDefault}
            />
          )}

          {activeTab === 'python-project' && (
            <PythonProjectView />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          allMovies={movies}
          onSelectMovie={setSelectedMovie}
        />
      )}

      {showCompareModal && comparedMovies.length > 0 && (
        <MovieCompareModal
          movies={comparedMovies}
          onClose={() => setShowCompareModal(false)}
          onRemoveMovie={handleRemoveCompareMovie}
          onClearAll={handleClearCompare}
        />
      )}
    </div>
  );
}
