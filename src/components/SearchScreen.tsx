import React, { useState } from 'react';
import { Search, X, Bell, Info, Camera, MessageCircle, ChevronRight } from 'lucide-react';
import { WasteRecord } from '../types/waste';
import { getBinColorDetails } from '../utils/wasteSearch';

interface SearchScreenProps {
  records: WasteRecord[];
  initialQuery?: string;
  initialCategory?: string;
  onSelectItem: (item: WasteRecord) => void;
  onOpenScan: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  records,
  initialQuery = '',
  initialCategory = 'ทั้งหมด',
  onSelectItem,
  onOpenScan,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [showAdminHelp, setShowAdminHelp] = useState<boolean>(false);

  const categories = [
    'ทั้งหมด',
    'บรรจุภัณฑ์อาหาร',
    'พลาสติก & แก้ว',
    'ขยะอันตราย',
    'ขยะอินทรีย์',
    'ขยะทั่วไป',
  ];

  // Client-side filtering across active single source of truth database
  const filtered = records.filter(item => {
    // Category filter
    if (selectedCategory !== 'ทั้งหมด') {
      if (selectedCategory === 'บรรจุภัณฑ์อาหาร') {
        const matchesFood =
          item.Waste_Name.includes('อาหาร') ||
          item.Waste_Name.includes('กล่อง') ||
          item.Waste_Name.includes('ชานอ้อย') ||
          item.Waste_Name.includes('โฟม') ||
          item.Waste_Name.includes('ช้อน');
        if (!matchesFood) return false;
      } else if (selectedCategory === 'พลาสติก & แก้ว') {
        const matchesPlastic =
          item.Waste_Name.includes('พลาสติก') ||
          item.Waste_Name.includes('PET') ||
          item.Waste_Name.includes('ขวด') ||
          item.Waste_Name.includes('แก้ว');
        if (!matchesPlastic) return false;
      } else if (selectedCategory === 'ขยะอันตราย') {
        if (item.Category_Group !== 'อันตราย' && !item.Bin_Color.includes('แดง') && !item.Bin_Color.includes('ส้ม')) return false;
      } else if (selectedCategory === 'ขยะอินทรีย์') {
        if (item.Category_Group !== 'อินทรีย์' && !item.Bin_Color.includes('เขียว')) return false;
      } else if (selectedCategory === 'ขยะทั่วไป') {
        if (item.Category_Group !== 'ทั่วไป' && !item.Bin_Color.includes('น้ำเงิน')) return false;
      }
    }

    // Query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.Waste_Name.toLowerCase().includes(q) ||
      item.Keyword.toLowerCase().includes(q) ||
      item.Bin_Color.toLowerCase().includes(q) ||
      item.Bin_Category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-28 px-4 pt-3 space-y-3.5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            ค้นหาประเภทขยะ
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อขยะ เช่น แก้วกาแฟ, กล่องข้าว..."
            className="w-full bg-white rounded-2xl border border-slate-200 pl-10 pr-10 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            aria-label="ค้นหาชื่อขยะ"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="ล้างคำค้นหา"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Green Tip Banner matching PDF */}
      <div className="bg-emerald-900 text-white rounded-2xl p-3 flex items-start gap-3 shadow-xs">
        <div className="w-7 h-7 rounded-full bg-emerald-700/80 flex items-center justify-center shrink-0 text-emerald-200 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-emerald-300 tracking-wider">
            KU GREEN TIP
          </div>
          <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
            แยกเศษอาหารและของเหลวก่อนทิ้ง ช่วยให้ขยะนำไปรีไซเคิลได้จริง 100%
          </p>
        </div>
      </div>

      {/* Results Count & Real-time Indicator */}
      <div className="flex items-center justify-between text-xs pt-1 px-1">
        <span className="font-bold text-slate-800">
          ผลการค้นหา ({filtered.length} รายการ)
        </span>
        <span className="text-[10.5px] font-medium text-emerald-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          อัปเดตแบบเรียลไทม์
        </span>
      </div>

      {/* Waste Cards List matching Page 4 */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const colorInfo = getBinColorDetails(item.Bin_Color);
          return (
            <div
              key={item.Waste_ID}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={item.Image_Url || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200'}
                    alt={item.Waste_Name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {item.Badge_Tag && (
                    <div className="inline-block text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1">
                      {item.Badge_Tag}
                    </div>
                  )}

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.Waste_Name}
                  </h3>

                  <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-1">
                    {item.Instruction.split('เท')[0] || item.Instruction}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 self-center" />
              </div>

              {/* Bin Color Pill & Hint */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorInfo.dotClass}`} />
                  <span className="font-bold text-slate-800">
                    {colorInfo.name} • {item.Bin_Category}
                  </span>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl flex items-center justify-between">
                <span>{item.Instruction}</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-slate-500">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              ไม่พบขยะที่ตรงกับ "{searchQuery}"
            </p>
            <p className="text-xs text-slate-500">
              ลองค้นหาด้วยคำอื่น หรือใช้ฟังก์ชันสแกนด้วยภาพ
            </p>
          </div>
        )}
      </div>

      {/* Missing Waste Search Section (Page 4 bottom) */}
      <div className="bg-slate-100/90 rounded-3xl p-4 border border-slate-200/90 space-y-3 mt-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 text-sm font-bold">
            ?
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              ไม่พบขยะที่ต้องการค้นหา?
            </h4>
            <p className="text-[10.5px] text-slate-600 leading-relaxed mt-0.5">
              ระบบฐานข้อมูลขยะ มก. มีการอัปเดตสิ่งของใหม่ทุกสัปดาห์ คุณสามารถขอความช่วยเหลือได้ทันที
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={onOpenScan}
            className="w-full py-2.5 px-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>ถ่ายรูปให้ AI ช่วยดู</span>
          </button>

          <button
            onClick={() => setShowAdminHelp(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>สอบถามแอดมินศูนย์รักษ์สิ่งแวดล้อม</span>
          </button>
        </div>
      </div>

      {/* Admin Help Inquiry Modal */}
      {showAdminHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                ติดต่อศูนย์รักษ์สิ่งแวดล้อม มหาวิทยาลัย
              </h3>
              <button
                onClick={() => setShowAdminHelp(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                ปิด
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              หากมีขยะชนิดพิเศษ สารเคมีจากห้องปฏิบัติการ หรือสิ่งของที่ไม่ระบุในฐานข้อมูล สามารถติดต่อทีมงานสิ่งแวดล้อมได้ที่:
            </p>
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div>📞 เบอร์โทรภายใน: 02-xxx-xxxx ต่อ 1234</div>
              <div>🏢 สถานที่: อาคารศูนย์สิ่งแวดล้อมและความยั่งยืน มหาวิทยาลัย</div>
              <div>📧 อีเมล: ecosort@campus.ac.th</div>
            </div>
            <button
              onClick={() => setShowAdminHelp(false)}
              className="w-full py-2.5 bg-emerald-700 text-white rounded-2xl text-xs font-semibold"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
