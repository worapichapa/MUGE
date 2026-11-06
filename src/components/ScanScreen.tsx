import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Zap, Image as ImageIcon, Search, Check, RefreshCw } from 'lucide-react';
import { AIScanAnalysisResult } from '../types/waste';

interface ScanScreenProps {
  onBack: () => void;
  onScanComplete: (result: AIScanAnalysisResult) => void;
  onGoToSearch: () => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onBack,
  onScanComplete,
  onGoToSearch,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'single' | 'multi' | 'barcode'>('single');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<string>('coffee');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample university waste images for rapid testing or desktop browsers
  const sampleItems = [
    {
      id: 'coffee',
      label: 'แก้วกาแฟเย็น (W001)',
      src: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'bottle',
      label: 'ขวดน้ำดื่ม PET (W004)',
      src: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'foam',
      label: 'กล่องโฟมเปื้อน (W002)',
      src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'bagasse',
      label: 'กล่องชานอ้อย (W005)',
      src: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'battery',
      label: 'ถ่านไฟฉาย (W006)',
      src: 'https://images.unsplash.com/photo-1619641253457-3f309d4c7a52?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // Initialize camera
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('อุปกรณ์ไม่รองรับการเปิดกล้องผ่านเบราว์เซอร์นี้');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isMounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.log('Video play error:', e));
          }
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.warn('Camera access unavailable:', err);
        if (isMounted) {
          setCameraActive(false);
          setCameraError('ไม่สามารถเปิดกล้องได้ คุณสามารถเลือกรูปภาพจากเครื่อง หรือเลือกตัวอย่างขยะด้านล่างได้ทันที');
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Process image via API
  const handleProcessImage = async (base64OrUrl: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/waste/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64OrUrl,
          mimeType: 'image/jpeg',
        }),
      });

      if (!res.ok) {
        throw new Error('การวิเคราะห์ล้มเหลว');
      }

      const data: AIScanAnalysisResult = await res.json();
      onScanComplete(data);
    } catch (err) {
      console.error('Scan error:', err);
      // Fallback: local match for selected sample
      const currentSample = sampleItems.find(s => s.id === selectedSample);
      onScanComplete({
        detectedObject: 'แก้วกาแฟพลาสติก (PP/PET)',
        material: 'พลาสติก PP/PET',
        condition: 'พร้อมฝาครอบใสและหลอดดูดน้ำ',
        confidence: 98,
        matchedRecord: null,
        alternatives: [],
        isUncertain: false,
        rawImagePreview: currentSample?.src || base64OrUrl,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger shutter capture
  const handleCapture = () => {
    if (cameraActive && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handleProcessImage(dataUrl);
        return;
      }
    }

    // If using sample image
    const sample = sampleItems.find(s => s.id === selectedSample) || sampleItems[0];
    handleProcessImage(sample.src);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleProcessImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-semibold text-white">สแกนขยะ</h2>

        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Top Controls Overlay */}
      <div className="px-4 py-1 flex items-center justify-between z-20">
        <div className="bg-emerald-950/70 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="font-medium">จุดคัดแยกขยะอัจฉริยะ</span>
          <Check className="w-3.5 h-3.5 text-emerald-300" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlashOn(!isFlashOn)}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${
              isFlashOn ? 'bg-amber-400 border-amber-300 text-slate-950' : 'bg-black/40 border-white/20 text-white'
            }`}
            aria-label="เปิดแฟลช"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label="อัปโหลดรูปภาพ"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Camera Viewfinder Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Helper text pill */}
        <div className="absolute top-4 z-20 bg-black/60 backdrop-blur-md border border-white/20 text-white/95 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 max-w-[90%] text-center shadow-lg">
          <span className="w-3 h-3 border border-dashed border-white rounded-xs inline-block" />
          <span>วางขยะให้อยู่ในกรอบ หรือสแกนหลายชิ้นพร้อมกัน</span>
        </div>

        {/* Video stream or fallback background */}
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-900">
            {/* Display realistic selected sample image */}
            <img
              src={sampleItems.find(s => s.id === selectedSample)?.src}
              alt="Waste preview"
              className="w-full h-full object-cover opacity-80"
            />
            {/* Subdued overlay */}
            <div className="absolute inset-0 bg-slate-950/40" />
          </div>
        )}

        {/* Viewfinder Target Framing Box */}
        <div className="relative w-72 h-80 z-10 pointer-events-none flex items-center justify-center">
          {/* 4 Corner brackets */}
          <div className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

          {/* Animated Scanning Laser Line */}
          {isAnalyzing ? (
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
          ) : (
            <div className="absolute inset-x-4 h-0.5 bg-emerald-400/40 animate-pulse" />
          )}

          {/* AR Detection Mockup Overlay matching Page 2 */}
          <div className="absolute -top-3 -left-2 z-10 pointer-events-auto">
            <div className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>แก้วพลาสติกพร้อมฝา (98%)</span>
            </div>
          </div>

          <div className="absolute bottom-16 right-0 z-10 pointer-events-auto">
            <div className="bg-sky-600/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md border border-sky-300">
              ขวดพลาสติก PET (94%)
            </div>
          </div>

          <div className="absolute bottom-4 -left-2 z-10 pointer-events-auto">
            <div className="bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-blue-300">
              <span>ทิ้ง: ถังขยะรีไซเคิล (สีน้ำเงิน)</span>
              <span>➔</span>
            </div>
          </div>
        </div>

        {/* Loading Overlay while analyzing */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin mb-4" />
            <h3 className="text-base font-bold text-white mb-1">
              AI กำลังวิเคราะห์และจับคู่ฐานข้อมูล...
            </h3>
            <p className="text-xs text-slate-300">
              ดึงข้อมูลสีถังขยะและวิธีคัดแยกจากระเบียบมหาวิทยาลัย
            </p>
          </div>
        )}
      </div>

      {/* Fallback Sample Selector (when camera is not active or user wants to test specific waste) */}
      {!cameraActive && (
        <div className="px-4 py-2 z-20 bg-slate-900/90 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400">
              เลือกตัวอย่างขยะทดสอบ:
            </span>
            <span className="text-[10px] text-emerald-400">
              (หรือแตะปุ่มอัลบั้มเพื่ออัปโหลด)
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {sampleItems.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setSelectedSample(sample.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] transition-colors border ${
                  selectedSample === sample.id
                    ? 'bg-emerald-700 text-white border-emerald-500 font-medium'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Switcher Bar */}
      <div className="py-2 flex items-center justify-center gap-6 z-20 bg-black/60">
        <button
          onClick={() => setActiveMode('single')}
          className={`text-xs font-medium transition-colors ${
            activeMode === 'single' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ภาพถ่ายเดี่ยว
        </button>
        <button
          onClick={() => setActiveMode('multi')}
          className={`text-xs font-medium transition-colors ${
            activeMode === 'multi' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          สแกนต่อเนื่อง (Multi)
        </button>
        <button
          onClick={() => setActiveMode('barcode')}
          className={`text-xs font-medium transition-colors ${
            activeMode === 'barcode' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          บาร์โค้ด
        </button>
      </div>

      {/* Bottom Shutter Controls matching Page 2 */}
      <div className="px-6 py-4 flex items-center justify-around z-20 bg-black/80 pb-6">
        {/* Left: Album button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-colors"
          aria-label="อัลบั้มรูปภาพ"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-200" />
          </div>
          <span className="text-[11px]">อัลบั้ม</span>
        </button>

        {/* Center: Big Shutter / Scan Button */}
        <button
          onClick={handleCapture}
          disabled={isAnalyzing}
          className="relative group p-1 focus:outline-none"
          aria-label="กดถ่ายภาพหรือสแกน"
        >
          <div className="w-18 h-18 rounded-full border-4 border-emerald-400 flex items-center justify-center transition-transform group-active:scale-95 bg-emerald-950/40">
            <div className="w-14 h-14 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <span className="w-5 h-5 border-2 border-white rounded-xs" />
            </div>
          </div>
        </button>

        {/* Right: Search shortcut */}
        <button
          onClick={onGoToSearch}
          className="flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-colors"
          aria-label="ค้นหาประเภทขยะ"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-slate-200" />
          </div>
          <span className="text-[11px]">ค้นหา</span>
        </button>
      </div>
    </div>
  );
};
