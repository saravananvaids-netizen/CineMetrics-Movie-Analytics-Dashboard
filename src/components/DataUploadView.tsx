import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import { Movie, DatasetQualityReport } from '../types';
import { parseCSV, validateAndConvertCSV, exportMoviesToCSV, generateExecutiveReport } from '../utils/csvParser';

interface DataUploadViewProps {
  currentDataset: Movie[];
  auditReport: DatasetQualityReport;
  onDatasetUpdate: (newMovies: Movie[], report: DatasetQualityReport) => void;
  onResetToDefault: () => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({
  currentDataset,
  auditReport,
  onDatasetUpdate,
  onResetToDefault
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, rows } = parseCSV(text);
        if (headers.length === 0 || rows.length === 0) {
          setUploadStatus("Error: The uploaded CSV file appears empty or corrupt.");
          return;
        }

        const { movies: parsedMovies, report } = validateAndConvertCSV(headers, rows);
        onDatasetUpdate(parsedMovies, report);
        setUploadStatus(`Success! Ingested ${parsedMovies.length} valid film records.`);
      } catch (err: any) {
        setUploadStatus(`Upload error: ${err.message || 'Failed to parse CSV file.'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-amber-400" />
            Dataset Management &amp; Health Auditor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload custom movie CSV files, validate schema integrity, and export standardized analytics datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset to Curated Sample</span>
          </button>
          <button
            onClick={() => exportMoviesToCSV(currentDataset)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Health Audit Report Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Dataset Health Score</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {auditReport.dataHealthScore} / 100
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Automated quality index</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Active Records</span>
          <div className="text-2xl font-bold text-slate-200 font-mono tabular-nums mt-1">
            {auditReport.validRows}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Validated movie entities</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Duplicates Deduplicated</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
            {auditReport.duplicateCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Identical titles purged</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-white/8">
          <span className="text-xs text-slate-400 font-medium">Missing Field Cells</span>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            {Object.values(auditReport.missingFields).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Safely imputed with defaults</div>
        </div>
      </div>

      {/* Drag & Drop Upload Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 ${
          dragActive
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-white/15 bg-[#0f172a]/70 hover:border-white/25'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Drag &amp; drop a CSV dataset here</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Supports fields such as <code className="text-slate-300">title</code>, <code className="text-slate-300">release_date</code>, <code className="text-slate-300">genre</code>, <code className="text-slate-300">rating</code>, <code className="text-slate-300">budget</code>, <code className="text-slate-300">revenue</code>, and <code className="text-slate-300">popularity</code>.
          </p>
        </div>

        <div>
          <label className="inline-block px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors">
            <span>Browse CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {uploadStatus && (
          <div className="pt-2 text-xs font-semibold text-emerald-400 animate-in fade-in">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Warnings & Schema Compliance */}
      {auditReport.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Dataset Schema Notices</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            {auditReport.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Dataset Preview Table */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-white/8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            Live Ingested Dataset Preview (First 15 Titles)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total {currentDataset.length} rows loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#080c14] text-slate-400 font-semibold border-b border-white/8">
              <tr>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Primary Genre</th>
                <th className="py-2.5 px-3 text-right">Rating</th>
                <th className="py-2.5 px-3 text-right">Budget ($)</th>
                <th className="py-2.5 px-3 text-right">Revenue ($)</th>
                <th className="py-2.5 px-3 text-right">Popularity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {currentDataset.slice(0, 15).map(m => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-white">{m.title}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{m.release_year}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">{m.primary_genre}</td>
                  <td className="py-2.5 px-3 text-right text-amber-400 tabular-nums">{m.rating.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    ${m.budget > 0 ? (m.budget / 1e6).toFixed(1) + 'M' : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums">
                    ${m.revenue > 0 ? (m.revenue / 1e6).toFixed(1) + 'M' : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{m.popularity.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
