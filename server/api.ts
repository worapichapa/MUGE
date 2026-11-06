import { Request, Response, Router } from 'express';
import { getActiveWasteRecords, getDatabaseStats, syncFromGoogleSheets } from './sheetsService';
import { searchWaste } from '../src/utils/wasteSearch';
import { analyzeWasteImage } from './geminiService';

export const apiRouter = Router();

// In-memory stats for university campus session
let stats = {
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
};

// GET /api/waste - search and list waste records
apiRouter.get('/waste', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || '';
  const records = getActiveWasteRecords();
  const results = searchWaste(records, query, category);
  res.json({
    total: results.length,
    results,
  });
});

// GET /api/waste/:id - single record
apiRouter.get('/waste/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const records = getActiveWasteRecords();
  const item = records.find(r => r.Waste_ID === id);
  if (!item) {
    return res.status(404).json({ error: 'Waste item not found' });
  }
  res.json(item);
});

// POST /api/waste/scan - analyze image with Gemini and match DB
apiRouter.post('/waste/scan', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const result = await analyzeWasteImage(imageBase64, mimeType || 'image/jpeg');
    res.json(result);
  } catch (err: any) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze image' });
  }
});

// GET /api/database/status
apiRouter.get('/database/status', (_req: Request, res: Response) => {
  res.json(getDatabaseStats());
});

// POST /api/database/sync
apiRouter.post('/database/sync', async (req: Request, res: Response) => {
  const { spreadsheetId, apiKey } = req.body;
  const targetId = spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
  if (!targetId) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุ Google Sheets Spreadsheet ID',
    });
  }

  const result = await syncFromGoogleSheets(targetId, apiKey || process.env.GEMINI_API_KEY);
  res.json(result);
});

// GET /api/stats
apiRouter.get('/stats', (_req: Request, res: Response) => {
  res.json(stats);
});

// POST /api/stats/sort - record sorting
apiRouter.post('/stats/sort', (req: Request, res: Response) => {
  const { wasteName, binColor, ecoPoints = 10 } = req.body;

  stats.totalEcoPoints += ecoPoints;
  stats.itemsSortedToday += 1;
  stats.co2ReductionKg = parseFloat((stats.co2ReductionKg + 0.14).toFixed(2));

  stats.history.unshift({
    id: `h_${Date.now()}`,
    wasteName: wasteName || 'ขยะคัดแยกสำเร็จ',
    binColor: binColor || 'สีทั่วไป',
    timestamp: 'เมื่อสักครู่',
    ecoPoints,
  });

  if (stats.history.length > 20) {
    stats.history = stats.history.slice(0, 20);
  }

  res.json({
    success: true,
    stats,
  });
});
