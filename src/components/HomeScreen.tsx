import React from 'react';
import { Camera, Search, Mic, ChevronRight, Recycle, Leaf, Trash2, AlertTriangle, Coffee } from 'lucide-react';

interface HomeScreenProps {
  onStartScan: () => void;
  onSearchSelect: (query: string, categoryFilter?: string) => void;
  onViewStats: () => void;
  itemsSortedToday: number;
  co2ReductionKg: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartScan,
  onSearchSelect,
  onViewStats,
  itemsSortedToday,
  co2ReductionKg,
}) => {
  const quickTags = [
    { label: 'แก้วพลาสติก', icon: '☕', query: 'แก้วพลาสติก' },
    { label: 'กล่องชานอ้อย', icon: '🍱', query: 'กล่องชานอ้อย' },
    { label: 'ขวด PET', icon: '🥤', query: 'ขวด PET' },
    { label: 'แบตเตอรี่', icon: '🔋', query: 'แบตเตอรี่' },
  ];

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 max-w-md mx-auto">
      {/* Greeting and Smart Station Badge */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            สวัสดี ร่วมสร้างพื้นที่สีเขียว
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ทิ้งให้ถูกต้อง สร้างมหาวิทยาลัยยั่งยืน
          </p>
        </div>
        <div className="bg-amber-100 text-amber-900 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-amber-200">
          <span>จุดบริการอัจฉริยะ</span>
          <span>👋</span>
        </div>
      </div>

      {/* AI SMART SCAN 2.0 Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-lg shadow-emerald-900/20">
        {/* Subtle decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-10 -top-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-medium tracking-wide mb-2.5">
            <span className="text-amber-300">✨</span>
            <span>AI SMART SCAN 2.0</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">
            สแกนแยกขยะทันที
          </h3>
          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-[90%] mb-4 font-light">
            ถ่ายภาพหรือส่องกล้อง ระบบจะบอกถังขยะและวิธีจัดการใน 1 วินาที
          </p>

          <button
            onClick={onStartScan}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] text-emerald-800 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            aria-label="แตะเพื่อเปิดกล้องสแกน"
          >
            <Camera className="w-5 h-5 text-emerald-700" />
            <span>แตะเพื่อเปิดกล้องสแกน</span>
            <span>📸</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div
          onClick={() => onSearchSelect('')}
          className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-3 flex items-center gap-3 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
          role="searchbox"
          tabIndex={0}
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 flex-1 select-none">
            พิมพ์ชื่อขยะ เช่น แก้วกาแฟ, กล่องข้าว...
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSearchSelect('แก้วกาแฟ');
            }}
            className="text-slate-400 hover:text-emerald-600 transition-colors"
            aria-label="ค้นหาด้วยเสียง"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Tag Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {quickTags.map((tag) => (
          <button
            key={tag.label}
            onClick={() => onSearchSelect(tag.query)}
            className="shrink-0 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
            aria-label={`ค้นหา ${tag.label}`}
          >
            <span>{tag.icon}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>

      {/* Daily Eco Mission Card */}
      <div
        onClick={onViewStats}
        className="bg-white rounded-2xl border border-slate-200/90 p-3.5 flex items-center justify-between shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 relative">
            <Leaf className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800">
                ภารกิจรักษ์วันนี้
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                {itemsSortedToday} ชิ้น
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              คุณช่วยลดก๊าซเรือนกระจก <span className="font-semibold text-emerald-700">CO₂e -{co2ReductionKg} kg</span>
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Waste Bin Classification System (5 Types) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">
              II
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              ระบบถังขยะแยกประเภท
            </h3>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            5 ประเภท
          </span>
        </div>

        {/* 2x2 Grid of Waste Bins */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: ถังเหลือง - ขยะรีไซเคิล */}
          <div
            onClick={() => onSearchSelect('', 'ขยะรีไซเคิล')}
            className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3 relative hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                ถังเหลือง
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                ขยะรีไซเคิล
              </h4>
              <p className="text-[10px] text-slate-600 leading-tight">
                ขวด PET ใส, กระป๋องอลูมิเนียม, กล่องกระดาษ
              </p>
            </div>
          </div>

          {/* Card 2: ถังเขียว - ขยะอินทรีย์ */}
          <div
            onClick={() => onSearchSelect('', 'ขยะอินทรีย์')}
            className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3 relative hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                ถังเขียว
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                ขยะอินทรีย์
              </h4>
              <p className="text-[10px] text-slate-600 leading-tight">
                เศษอาหาร, ผักผลไม้, ภาชนะชานอ้อยแท้
              </p>
            </div>
          </div>

          {/* Card 3: ถังน้ำเงิน - ขยะทั่วไป */}
          <div
            onClick={() => onSearchSelect('', 'ขยะทั่วไป')}
            className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-3 relative hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-blue-900 bg-sky-200/80 px-2 py-0.5 rounded-full">
                ถังน้ำเงิน
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                ขยะทั่วไป
              </h4>
              <p className="text-[10px] text-slate-600 leading-tight">
                ซองขนมฟอยล์, ทิชชู่เปื้อน, พลาสติกปนเปื้อน
              </p>
            </div>
          </div>

          {/* Card 4: ถังส้ม/แดง - ขยะอันตราย */}
          <div
            onClick={() => onSearchSelect('', 'ขยะอันตราย')}
            className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3 relative hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded-full">
                ถังส้ม/แดง
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                ขยะอันตราย
              </h4>
              <p className="text-[10px] text-slate-600 leading-tight">
                ถ่านไฟฉาย, หลอดไฟ, E-waste, สเปรย์
              </p>
            </div>
          </div>
        </div>

        {/* Special Tip Banner: Coffee Cup */}
        <div
          onClick={() => onSearchSelect('แก้วกาแฟ')}
          className="bg-blue-50/90 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between hover:bg-blue-100/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  จุดคัดแยกแก้วกาแฟเย็น
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                  แนะนำพิเศษ
                </span>
              </div>
              <p className="text-[10.5px] text-slate-600 mt-0.5">
                เทน้ำแข็งทิ้ง ➜ แยกหลอด ➜ ปลดฝา ➜ ซ้อนแก้ว ลดพื้นที่
              </p>
            </div>
          </div>
          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-400">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
