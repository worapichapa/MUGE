import React from 'react';
import { Bell, Sparkles, Database } from 'lucide-react';
import { WasteDatabaseStats } from '../types/waste';

interface HeaderProps {
  dbStats: WasteDatabaseStats | null;
  onOpenDbModal: () => void;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ dbStats, onOpenDbModal }) => {
  return (
    <header className="px-5 pt-4 pb-2 bg-white flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
          {/* Leaf / Eco Icon matching PDF */}
          <svg className="w-6 h-6 fill-emerald-600" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-semibold text-slate-800 leading-tight">
              แยกขยะอัจฉริยะ
            </h1>
          </div>
          <p className="text-xs text-slate-500 leading-tight">
            คู่มือคัดแยกขยะเพื่อสิ่งแวดล้อม
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Database Status Button */}
        <button
          onClick={onOpenDbModal}
          className="flex items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="สถานะฐานข้อมูลขยะ"
          aria-label="ตั้งค่าฐานข้อมูล Google Sheets"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">
            {dbStats?.source === 'google_sheets' ? 'Sheets' : 'ฐานข้อมูล มก.'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
        </button>

        {/* Bell notification */}
        <button
          className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
      </div>
    </header>
  );
};
