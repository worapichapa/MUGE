export type BinColorType = 'yellow' | 'green' | 'blue' | 'red';

export interface PreparationStep {
  title: string;
  detail: string;
  iconType: 'liquid' | 'split' | 'crush' | 'clean' | 'hazard';
}

export interface WasteRecord {
  Waste_ID: string;
  Waste_Name: string;
  Keyword: string; // comma or space separated keywords & synonyms in Thai
  Bin_Color: string; // e.g. "สีเหลือง", "สีเขียว", "สีน้ำเงิน", "สีแดงหรือส้ม"
  Bin_Category: string; // specific compartment or sorting category
  Instruction: string; // short disposal instruction
  // UI metadata
  Category_Group: 'รีไซเคิล' | 'อินทรีย์' | 'ทั่วไป' | 'อันตราย';
  Badge_Tag?: string;
  Preparation_Steps?: PreparationStep[];
  Destination_Box?: string;
  Image_Url?: string;
  Eco_Points?: number;
}

export interface WasteDatabaseStats {
  totalRecords: number;
  source: 'google_sheets' | 'university_verified';
  spreadsheetId?: string;
  sheetName?: string;
  lastSyncTime?: string;
}

export interface AIScanAnalysisResult {
  detectedObject: string;
  material: string;
  condition: string;
  confidence: number;
  matchedRecord: WasteRecord | null;
  alternatives: WasteRecord[];
  isUncertain: boolean;
  clarificationQuestion?: string;
  rawImagePreview?: string;
}
