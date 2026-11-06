import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, HelpCircle, Droplet, Split, Trash, AlertCircle } from 'lucide-react';
import { AIScanAnalysisResult, WasteRecord } from '../types/waste';
import { getBinColorDetails } from '../utils/wasteSearch';

interface ScanResultScreenProps {
  result: AIScanAnalysisResult;
  onBack: () => void;
  onScanNext: () => void;
  onCompleteDisposal: (waste: WasteRecord) => void;
  onSelectAlternative: (record: WasteRecord) => void;
}

export const ScanResultScreen: React.FC<ScanResultScreenProps> = ({
  result,
  onBack,
  onScanNext,
  onCompleteDisposal,
  onSelectAlternative,
}) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  const matched = result.matchedRecord;
  const binColorInfo = matched ? getBinColorDetails(matched.Bin_Color) : null;

  const handleFinish = () => {
    if (matched && !hasCompleted) {
      setHasCompleted(true);
      onCompleteDisposal(matched);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-3 bg-white flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-slate-800">
          ผลการวิเคราะห์ขยะ
        </h2>

        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Detection Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative flex items-center justify-center">
            <img
              src={result.rawImagePreview || matched?.Image_Url || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300'}
              alt={result.detectedObject}
              onError={(e) => {
                const target = e.currentTarget;
                if (matched?.Image_Url && target.src !== matched.Image_Url) {
                  target.src = matched.Image_Url;
                } else {
                  target.src = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300';
                }
              }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>AI {result.confidence}% วิเคราะห์เรียบร้อย</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 truncate">
              {matched ? matched.Waste_Name : result.detectedObject}
            </h3>

            <p className="text-xs text-slate-500 truncate mt-0.5">
              {result.condition || result.material || 'พร้อมฝาครอบใสและหลอดดูดน้ำ'}
            </p>
          </div>
        </div>

        {/* If matched record exists */}
        {matched ? (
          <>
            {/* Major Recommendation Banner (Primary Focus) */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/90 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs ${binColorInfo?.badgeBg}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${binColorInfo?.dotClass}`} />
                  <span>{binColorInfo?.name} • {matched.Bin_Category.split('&')[0].trim()}</span>
                </div>
              </div>

              <div className="mt-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  ประเภทการทิ้งหลัก
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {matched.Bin_Category}
                </h4>
              </div>

              {/* Destination Compartment Box */}
              <div className="mt-4 bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <Trash className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-500">
                    ช่องทิ้งปลายทาง
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    ทิ้งลง: {matched.Destination_Box || matched.Bin_Category}
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Steps Before Disposal */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  วิธีเตรียมก่อนหย่อนทิ้ง
                </h4>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ใช้เวลา 5 วินาที
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {matched.Preparation_Steps && matched.Preparation_Steps.length > 0 ? (
                  matched.Preparation_Steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        {step.iconType === 'liquid' ? (
                          <Droplet className="w-4 h-4" />
                        ) : (
                          <Split className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {step.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        1. คำแนะนำการทิ้ง
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {matched.Instruction}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Missing in DB notification */
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                ไม่พบข้อมูลในฐานข้อมูลขยะของมหาวิทยาลัย
              </h4>
              <p className="text-xs text-rose-700 mt-1">
                ระบบจะไม่คาดเดาประเภทถังขยะเองตามระเบียบมหาวิทยาลัย กรุณาเลือกรายการที่ใกล้เคียงหรือสอบถามเจ้าหน้าที่
              </p>
            </div>
          </div>
        )}

        {/* Correction Link */}
        <div className="text-center pt-1">
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="text-xs text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1 font-medium underline underline-offset-4"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ผลลัพธ์ไม่ตรงกับขยะของคุณ? แตะเพื่อแก้ไข</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleFinish}
            disabled={hasCompleted}
            className={`w-full py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              hasCompleted
                ? 'bg-slate-200 text-slate-600'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/25 active:scale-[0.99]'
            }`}
            aria-label="ทิ้งเรียบร้อยแล้ว รับ 10 EcoPoints"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{hasCompleted ? 'บันทึกเรียบร้อยแล้ว' : 'ทิ้งเรียบร้อยแล้ว (+10 EcoPoints)'}</span>
            <span>🎉</span>
          </button>

          <button
            onClick={onScanNext}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            aria-label="สแกนชิ้นต่อไป"
          >
            <span>สแกนชิ้นต่อไป</span>
          </button>
        </div>
      </div>

      {/* Alternative Selection Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                เลือกขยะที่ตรงกับของคุณ
              </h3>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ปิด
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ฐานข้อมูลมหาวิทยาลัยมีรายการที่คล้ายกันดังนี้:
            </p>

            <div className="space-y-2">
              {result.alternatives && result.alternatives.length > 0 ? (
                result.alternatives.map((alt) => (
                  <button
                    key={alt.Waste_ID}
                    onClick={() => {
                      onSelectAlternative(alt);
                      setShowCorrectionModal(false);
                    }}
                    className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {alt.Waste_Name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {alt.Bin_Color} • {alt.Bin_Category}
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">
                      เลือก
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  ไม่พบรายการทางเลือกเพิ่มเติม
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
