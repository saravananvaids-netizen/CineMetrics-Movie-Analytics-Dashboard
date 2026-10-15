import React from 'react';
import { 
  LayoutDashboard, 
  Film, 
  PieChart, 
  TrendingUp, 
  Star, 
  BrainCircuit, 
  UploadCloud, 
  Code2,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  moviesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  moviesCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Executive Dashboard',
      description: 'KPIs & Global Summary',
      icon: LayoutDashboard
    },
    {
      id: 'explorer' as ActiveTab,
      label: 'Movie Explorer',
      description: 'Search, Filter & Compare',
      icon: Film,
      badge: moviesCount
    },
    {
      id: 'genre' as ActiveTab,
      label: 'Genre Analysis',
      description: 'Market Share & Trends',
      icon: PieChart
    },
    {
      id: 'revenue' as ActiveTab,
      label: 'Revenue & Box Office',
      description: 'ROI & Financial Risk',
      icon: TrendingUp
    },
    {
      id: 'ratings' as ActiveTab,
      label: 'Ratings & Audience',
      description: 'Distributions & Correlation',
      icon: Star
    },
    {
      id: 'predictions' as ActiveTab,
      label: 'ML Predictions & AI',
      description: 'Ridge Regressor & TF-IDF',
      icon: BrainCircuit
    },
    {
      id: 'data-upload' as ActiveTab,
      label: 'Dataset & Auditor',
      description: 'CSV Ingestion & Health',
      icon: UploadCloud
    },
    {
      id: 'python-project' as ActiveTab,
      label: 'Python Code & Viva',
      description: 'Full Streamlit & ML Code',
      icon: Code2
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#080c14] border-r border-white/8 flex flex-col justify-between p-3.5 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div>
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Cinema Intelligence
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/15 to-rose-600/15 text-white border border-amber-500/30 font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <div className="text-xs font-medium leading-none mb-1 truncate text-slate-100">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-none truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined ? (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status info card */}
      <div className="mt-4 p-3 rounded-xl bg-[#0f172a] border border-white/8 text-xs">
        <div className="text-[11px] font-semibold text-slate-300 mb-1">
          CineMetrics ML Engine
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
          Ridge regression ($L_2$) & TF-IDF natural language recommendation active.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2">
          <span>Catalog Scope</span>
          <span className="font-mono text-amber-400 tabular-nums">{moviesCount} Titles</span>
        </div>
      </div>
    </aside>
  );
};
