import React from 'react';
import { LayoutGrid, Search, ScanLine, BarChart2 } from 'lucide-react';

export type NavTab = 'home' | 'search' | 'scan' | 'stats';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 z-40 flex items-center justify-around shadow-lg">
      {/* Home */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
          currentTab === 'home' ? 'text-emerald-700 font-medium' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="หน้าแรก"
      >
        <LayoutGrid className="w-5 h-5 mb-0.5" />
        <span className="text-[11px]">หน้าแรก</span>
      </button>

      {/* Search */}
      <button
        onClick={() => onTabChange('search')}
        className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
          currentTab === 'search' ? 'text-emerald-700 font-medium' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="ค้นหาประเภทขยะ"
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[11px]">ค้นหา</span>
      </button>

      {/* Scan - Center floating prominent button */}
      <button
        onClick={() => onTabChange('scan')}
        className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
        aria-label="เปิดกล้องสแกนขยะ"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-800 via-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/30 group-active:scale-95 transition-transform border-2 border-white">
          <ScanLine className="w-7 h-7 animate-pulse" />
        </div>
        <span className={`text-[11px] mt-1 font-medium ${currentTab === 'scan' ? 'text-emerald-700' : 'text-slate-500'}`}>
          สแกน
        </span>
      </button>

      {/* Stats */}
      <button
        onClick={() => onTabChange('stats')}
        className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
          currentTab === 'stats' ? 'text-emerald-700 font-medium' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="สถิติและการลดก๊าซเรือนกระจก"
      >
        <BarChart2 className="w-5 h-5 mb-0.5" />
        <span className="text-[11px]">สถิติ</span>
      </button>
    </nav>
  );
};
