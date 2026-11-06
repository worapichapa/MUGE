import React, { useState } from 'react';
import { X, Database, RefreshCw, CheckCircle, AlertTriangle, Table } from 'lucide-react';
import { WasteDatabaseStats, WasteRecord } from '../types/waste';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WasteDatabaseStats | null;
  records: WasteRecord[];
  onSync: (spreadsheetId?: string) => Promise<void>;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  stats,
  records,
  onSync,
}) => {
  const [spreadsheetInput, setSpreadsheetInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'preview'>('info');

  if (!isOpen) return null;

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setMessage(null);
    try {
      await onSync(spreadsheetInput.trim() || undefined);
      setMessage('ซิงค์ข้อมูลเรียบร้อยแล้ว ฐานข้อมูลเป็น Single Source of Truth ล่าสุด');
    } catch (err: any) {
      setMessage(err?.message || 'การซิงค์ล้มเหลว กรุณาตรวจสอบการเข้าถึงสเปรดชีต');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ฐานข้อมูลขยะมหาวิทยาลัย
              </h3>
              <p className="text-[10.5px] text-slate-500">
                Single Source of Truth (Google Sheets & API)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'info'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            การเชื่อมต่อ Google Sheets
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>ดูตาราง 6 คอลัมน์ ({records.length})</span>
          </button>
        </div>

        {activeTab === 'info' ? (
          <div className="space-y-3.5">
            {/* Status box */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  แหล่งข้อมูลปัจจุบัน:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10.5px]">
                  {stats?.source === 'google_sheets' ? 'Google Sheets เชื่อมต่ออยู่' : 'ฐานข้อมูลมาตรฐานมหาวิทยาลัย'}
                </span>
              </div>
              <div className="text-[11px] text-emerald-800">
                จำนวนรายการในฐานข้อมูล: <span className="font-bold">{records.length} ชิ้น</span>
              </div>
              {stats?.lastSyncTime && (
                <div className="text-[10px] text-emerald-700">
                  อัปเดตล่าสุด: {new Date(stats.lastSyncTime).toLocaleTimeString('th-TH')}
                </div>
              )}
            </div>

            {/* Google Sheets Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Google Sheets Spreadsheet ID
              </label>
              <input
                type="text"
                value={spreadsheetInput}
                onChange={(e) => setSpreadsheetInput(e.target.value)}
                placeholder="เช่น 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50"
              />
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                สเปรดชีตต้องมีหัวตาราง 6 คอลัมน์ตามระเบียบ:
                <br />
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono text-slate-700">
                  Waste_ID, Waste_Name, Keyword, Bin_Color, Bin_Category, Instruction
                </code>
              </p>
            </div>

            {message && (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-medium">
                {message}
              </div>
            )}

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'ซิงค์ข้อมูลจาก Google Sheets เดี๋ยวนี้'}</span>
            </button>
          </div>
        ) : (
          /* Table preview of 6 columns */
          <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-2xl">
            <table className="w-full text-[10.5px] text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                <tr>
                  <th className="p-2 border-b">Waste_ID</th>
                  <th className="p-2 border-b">Waste_Name</th>
                  <th className="p-2 border-b">Bin_Color</th>
                  <th className="p-2 border-b">Bin_Category</th>
                  <th className="p-2 border-b">Keyword</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.Waste_ID} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-medium text-slate-500">{r.Waste_ID}</td>
                    <td className="p-2 font-semibold text-slate-800">{r.Waste_Name}</td>
                    <td className="p-2 text-slate-700">{r.Bin_Color}</td>
                    <td className="p-2 text-slate-700">{r.Bin_Category}</td>
                    <td className="p-2 text-slate-500 max-w-[120px] truncate">{r.Keyword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
