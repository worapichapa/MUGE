import React from 'react';
import { Award, Leaf, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { getBinColorDetails } from '../utils/wasteSearch';

interface StatsScreenProps {
  stats: {
    totalEcoPoints: number;
    itemsSortedToday: number;
    co2ReductionKg: number;
    history: Array<{
      id: string;
      wasteName: string;
      binColor: string;
      timestamp: string;
      ecoPoints: number;
    }>;
  };
  onBackToHome: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onBackToHome }) => {
  return (
    <div className="pb-28 px-4 pt-3 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            สถิติและการมีส่วนร่วม
          </h2>
          <p className="text-xs text-slate-500">
            ผลลัพธ์การคัดแยกขยะเพื่อมหาวิทยาลัยสีเขียว
          </p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          <span>{stats.totalEcoPoints} แต้ม</span>
        </div>
      </div>

      {/* Main Impact Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-200">ลดการปล่อยก๊าซเรือนกระจกสะสม</span>
            <Leaf className="w-5 h-5 text-emerald-300" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              -{stats.co2ReductionKg}
            </span>
            <span className="text-sm font-medium text-emerald-200">kg CO₂e</span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.itemsSortedToday / 5) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-100">
            <span>เป้าหมายวันนี้: {stats.itemsSortedToday}/5 ชิ้น</span>
            <span>+10 แต้ม/ชิ้น</span>
          </div>
        </div>
      </div>

      {/* 2 Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-500">คัดแยกถูกต้องวันนี้</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {stats.itemsSortedToday} ชิ้น
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-500">ความแม่นยำเฉลี่ย</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            98.5%
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>ประวัติการคัดแยกล่าสุด</span>
          </h3>
          <span className="text-[10.5px] text-slate-400">
            เรียลไทม์
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.history.map((log) => {
            const colorInfo = getBinColorDetails(log.binColor);
            return (
              <div key={log.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorInfo.dotClass}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {log.wasteName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {log.timestamp} • {colorInfo.name}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +{log.ecoPoints} pt
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onBackToHome}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition-colors"
      >
        กลับสู่หน้าหลัก
      </button>
    </div>
  );
};
