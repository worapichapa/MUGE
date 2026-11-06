import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ScanScreen } from './components/ScanScreen';
import { ScanResultScreen } from './components/ScanResultScreen';
import { SearchScreen } from './components/SearchScreen';
import { StatsScreen } from './components/StatsScreen';
import { DatabaseSyncModal } from './components/DatabaseSyncModal';
import { WasteRecord, WasteDatabaseStats, AIScanAnalysisResult } from './types/waste';
import { UNIVERSITY_WASTE_DATABASE } from './data/universityWasteDatabase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeScreen, setActiveScreen] = useState<'main' | 'scan' | 'result'>('main');

  // Database records (single source of truth)
  const [records, setRecords] = useState<WasteRecord[]>(UNIVERSITY_WASTE_DATABASE);
  const [dbStats, setDbStats] = useState<WasteDatabaseStats | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  // Search screen parameters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('ทั้งหมด');

  // Scan state
  const [scanResult, setScanResult] = useState<AIScanAnalysisResult | null>(null);

  // Stats state
  const [stats, setStats] = useState({
    totalEcoPoints: 120,
    itemsSortedToday: 3,
    co2ReductionKg: 0.42,
    history: [
      {
        id: 'h1',
        wasteName: 'ขวดน้ำดื่มพลาสติก PET',
        binColor: 'สีเหลือง',
        timestamp: '10 นาทีที่แล้ว',
        ecoPoints: 10,
      },
      {
        id: 'h2',
        wasteName: 'กล่องชานอ้อย',
        binColor: 'สีเขียว',
        timestamp: '1 ชั่วโมงที่แล้ว',
        ecoPoints: 10,
      },
      {
        id: 'h3',
        wasteName: 'แก้วกาแฟพลาสติกเย็น',
        binColor: 'สีเหลือง',
        timestamp: '2 ชั่วโมงที่แล้ว',
        ecoPoints: 10,
      },
    ],
  });

  // Load initial database records and status from server
  const loadDatabase = async () => {
    try {
      const [resWaste, resStats, resDbStatus] = await Promise.all([
        fetch('/api/waste'),
        fetch('/api/stats'),
        fetch('/api/database/status'),
      ]);

      if (resWaste.ok) {
        const data = await resWaste.json();
        if (data.results && data.results.length > 0) {
          setRecords(data.results);
        }
      }

      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }

      if (resDbStatus.ok) {
        const dbStatusData = await resDbStatus.json();
        setDbStats(dbStatusData);
      }
    } catch (err) {
      console.warn('API fetch fallback to local university database:', err);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Sync with Google Sheets
  const handleSyncDatabase = async (spreadsheetId?: string) => {
    const res = await fetch('/api/database/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId }),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    await loadDatabase();
  };

  // Switch to Scan Screen
  const handleOpenScan = () => {
    setActiveScreen('scan');
  };

  // When AI scan finishes
  const handleScanComplete = (result: AIScanAnalysisResult) => {
    setScanResult(result);
    setActiveScreen('result');
  };

  // When user clicks an item from Search or Home to view disposal details
  const handleSelectWasteItem = (item: WasteRecord) => {
    const syntheticResult: AIScanAnalysisResult = {
      detectedObject: item.Waste_Name,
      material: item.Badge_Tag || 'วัสดุตามระเบียบมหาวิทยาลัย',
      condition: 'ตรวจสอบตรงกับฐานข้อมูลมหาวิทยาลัย',
      confidence: 99,
      matchedRecord: item,
      alternatives: records.filter(r => r.Waste_ID !== item.Waste_ID).slice(0, 3),
      isUncertain: false,
      rawImagePreview: item.Image_Url,
    };
    setScanResult(syntheticResult);
    setActiveScreen('result');
  };

  // Complete disposal and award EcoPoints
  const handleCompleteDisposal = async (waste: WasteRecord) => {
    try {
      const res = await fetch('/api/stats/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasteName: waste.Waste_Name,
          binColor: waste.Bin_Color,
          ecoPoints: waste.Eco_Points || 10,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      // Local fallback
      setStats(prev => ({
        ...prev,
        totalEcoPoints: prev.totalEcoPoints + 10,
        itemsSortedToday: prev.itemsSortedToday + 1,
        co2ReductionKg: parseFloat((prev.co2ReductionKg + 0.14).toFixed(2)),
      }));
    }
  };

  // Navigation handlers
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'scan') {
      setActiveScreen('scan');
      return;
    }
    setCurrentTab(tab);
    setActiveScreen('main');
  };

  const handleSearchShortcut = (query: string, categoryFilter: string = 'ทั้งหมด') => {
    setSearchQuery(query);
    setSearchCategory(categoryFilter);
    setCurrentTab('search');
    setActiveScreen('main');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800">
      {/* Mobile-first viewport container (Max width 448px, like a real smartphone) */}
      <div className="w-full max-w-md min-h-screen bg-white relative flex flex-col shadow-2xl overflow-x-hidden">
        {/* Top Header shown on main screens */}
        {activeScreen === 'main' && (
          <Header
            dbStats={dbStats}
            onOpenDbModal={() => setIsDbModalOpen(true)}
          />
        )}

        {/* Screen Routing */}
        <main className="flex-1 overflow-y-auto">
          {activeScreen === 'scan' ? (
            <ScanScreen
              onBack={() => setActiveScreen('main')}
              onScanComplete={handleScanComplete}
              onGoToSearch={() => {
                setActiveScreen('main');
                setCurrentTab('search');
              }}
            />
          ) : activeScreen === 'result' && scanResult ? (
            <ScanResultScreen
              result={scanResult}
              onBack={() => setActiveScreen('main')}
              onScanNext={() => setActiveScreen('scan')}
              onCompleteDisposal={handleCompleteDisposal}
              onSelectAlternative={(alt) => {
                setScanResult({
                  ...scanResult,
                  matchedRecord: alt,
                  detectedObject: alt.Waste_Name,
                });
              }}
            />
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeScreen
                  onStartScan={handleOpenScan}
                  onSearchSelect={handleSearchShortcut}
                  onViewStats={() => setCurrentTab('stats')}
                  itemsSortedToday={stats.itemsSortedToday}
                  co2ReductionKg={stats.co2ReductionKg}
                />
              )}

              {currentTab === 'search' && (
                <SearchScreen
                  records={records}
                  initialQuery={searchQuery}
                  initialCategory={searchCategory}
                  onSelectItem={handleSelectWasteItem}
                  onOpenScan={handleOpenScan}
                />
              )}

              {currentTab === 'stats' && (
                <StatsScreen
                  stats={stats}
                  onBackToHome={() => setCurrentTab('home')}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (visible on main screens) */}
        {activeScreen === 'main' && (
          <BottomNav
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Google Sheets / Database Sync Modal */}
        <DatabaseSyncModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          stats={dbStats}
          records={records}
          onSync={handleSyncDatabase}
        />
      </div>
    </div>
  );
}
