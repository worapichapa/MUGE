import { WasteRecord, WasteDatabaseStats } from '../src/types/waste';
import { UNIVERSITY_WASTE_DATABASE } from '../src/data/universityWasteDatabase';

// In-memory cache of waste records
let cachedRecords: WasteRecord[] = [...UNIVERSITY_WASTE_DATABASE];
let activeSource: 'google_sheets' | 'university_verified' = 'university_verified';
let lastSyncTimestamp: string = new Date().toISOString();
let configuredSpreadsheetId: string = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';

/**
 * Returns the active waste records (Single Source of Truth)
 */
export function getActiveWasteRecords(): WasteRecord[] {
  return cachedRecords;
}

/**
 * Returns current database status & stats
 */
export function getDatabaseStats(): WasteDatabaseStats {
  return {
    totalRecords: cachedRecords.length,
    source: activeSource,
    spreadsheetId: configuredSpreadsheetId ? `${configuredSpreadsheetId.slice(0, 6)}...` : undefined,
    sheetName: 'University_Waste_Rules',
    lastSyncTime: lastSyncTimestamp,
  };
}

/**
 * Parses raw 2D array or CSV rows into WasteRecord objects
 * Columns: Waste_ID, Waste_Name, Keyword, Bin_Color, Bin_Category, Instruction
 */
export function parseSheetRows(rows: string[][]): WasteRecord[] {
  if (!rows || rows.length <= 1) return [];

  // Find header indices
  const header = rows[0].map(h => (h || '').trim().toLowerCase());
  const idIdx = header.findIndex(h => h.includes('waste_id') || h.includes('id'));
  const nameIdx = header.findIndex(h => h.includes('waste_name') || h.includes('name') || h.includes('ชื่อ'));
  const kwIdx = header.findIndex(h => h.includes('keyword') || h.includes('คำค้น'));
  const colorIdx = header.findIndex(h => h.includes('bin_color') || h.includes('color') || h.includes('สี'));
  const catIdx = header.findIndex(h => h.includes('bin_category') || h.includes('category') || h.includes('ประเภท'));
  const instIdx = header.findIndex(h => h.includes('instruction') || h.includes('วิธี') || h.includes('คำแนะนำ'));

  const records: WasteRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const wasteId = (row[idIdx >= 0 ? idIdx : 0] || `W${String(i).padStart(3, '0')}`).trim();
    const wasteName = (row[nameIdx >= 0 ? nameIdx : 1] || '').trim();
    if (!wasteName) continue; // Skip empty rows

    const keyword = (row[kwIdx >= 0 ? kwIdx : 2] || '').trim();
    const binColor = (row[colorIdx >= 0 ? colorIdx : 3] || 'สีทั่วไป').trim();
    const binCategory = (row[catIdx >= 0 ? catIdx : 4] || 'ขยะทั่วไป').trim();
    const instruction = (row[instIdx >= 0 ? instIdx : 5] || '').trim();

    // Determine category group
    let categoryGroup: WasteRecord['Category_Group'] = 'ทั่วไป';
    if (binColor.includes('เหลือง')) categoryGroup = 'รีไซเคิล';
    else if (binColor.includes('เขียว')) categoryGroup = 'อินทรีย์';
    else if (binColor.includes('แดง') || binColor.includes('ส้ม')) categoryGroup = 'อันตราย';

    records.push({
      Waste_ID: wasteId,
      Waste_Name: wasteName,
      Keyword: keyword || wasteName,
      Bin_Color: binColor,
      Bin_Category: binCategory,
      Instruction: instruction || 'แยกทิ้งให้ถูกต้องตามสีถังขยะที่ระบุ',
      Category_Group: categoryGroup,
      Badge_Tag: `${binCategory} • ${binColor}`,
    });
  }

  return records;
}

/**
 * Fetches waste records from Google Sheets spreadsheet
 * Uses either Google Sheets API v4 or public/published CSV export
 */
export async function syncFromGoogleSheets(spreadsheetId: string, apiKey?: string): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const sheetId = spreadsheetId.trim();
    if (!sheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    // Try fetching via Google Sheets API or CSV export
    let rows: string[][] = [];

    // Attempt 1: If Google API key or token is available
    if (apiKey) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:F100?key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        rows = json.values || [];
      }
    }

    // Attempt 2: Public or Published CSV export format
    if (rows.length === 0) {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const res = await fetch(csvUrl);
      if (res.ok) {
        const text = await res.text();
        rows = text
          .split('\n')
          .map(line => {
            // Simple CSV line splitter handling quoted strings
            const matches = line.match(/(".*?"|[^",\r]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : [];
          })
          .filter(r => r.length > 0);
      }
    }

    const parsed = parseSheetRows(rows);
    if (parsed.length > 0) {
      cachedRecords = parsed;
      activeSource = 'google_sheets';
      configuredSpreadsheetId = sheetId;
      lastSyncTimestamp = new Date().toISOString();
      return {
        success: true,
        count: parsed.length,
        message: `เชื่อมต่อและดึงข้อมูลจาก Google Sheets สำเร็จ (${parsed.length} รายการ)`,
      };
    } else {
      // Keep verified university database
      return {
        success: false,
        count: cachedRecords.length,
        message: 'ไม่สามารถอ่านแถวข้อมูลจาก Google Sheets ได้ ใช้ฐานข้อมูลมาตรฐานมหาวิทยาลัย',
      };
    }
  } catch (err: any) {
    console.error('Error syncing Google Sheets:', err);
    return {
      success: false,
      count: cachedRecords.length,
      message: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets',
    };
  }
}
