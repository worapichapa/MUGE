import { WasteRecord } from '../types/waste';

/**
 * Normalizes text for Thai and English comparison.
 * Removes extra whitespaces and lowers ASCII characters.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Splits keyword field into individual tokens/keywords
 */
export function parseKeywords(keywordField: string): string[] {
  if (!keywordField) return [];
  return keywordField
    .split(/[,/|;\n]+/)
    .map(k => k.trim())
    .filter(Boolean);
}

/**
 * Searches waste records by Thai query and optional category filter
 */
export function searchWaste(
  records: WasteRecord[],
  query: string,
  categoryFilter?: string
): WasteRecord[] {
  const cleanQuery = normalizeText(query);

  let filtered = records;
  if (categoryFilter && categoryFilter !== 'ทั้งหมด') {
    filtered = filtered.filter(item => {
      if (categoryFilter === 'บรรจุภัณฑ์อาหาร') {
        return (
          item.Waste_Name.includes('อาหาร') ||
          item.Waste_Name.includes('กล่อง') ||
          item.Waste_Name.includes('ชานอ้อย') ||
          item.Waste_Name.includes('โฟม') ||
          item.Waste_Name.includes('ช้อน')
        );
      }
      if (categoryFilter === 'พลาสติก & แก้ว') {
        return (
          item.Waste_Name.includes('พลาสติก') ||
          item.Waste_Name.includes('PET') ||
          item.Waste_Name.includes('ขวด') ||
          item.Waste_Name.includes('แก้ว')
        );
      }
      if (categoryFilter === 'ขยะอันตราย') {
        return item.Category_Group === 'อันตราย' || item.Bin_Color.includes('แดง') || item.Bin_Color.includes('ส้ม');
      }
      if (categoryFilter === 'ขยะอินทรีย์') {
        return item.Category_Group === 'อินทรีย์' || item.Bin_Color.includes('เขียว');
      }
      if (categoryFilter === 'ขยะทั่วไป') {
        return item.Category_Group === 'ทั่วไป' || item.Bin_Color.includes('น้ำเงิน');
      }
      return item.Category_Group === categoryFilter || item.Bin_Category.includes(categoryFilter);
    });
  }

  if (!cleanQuery) {
    return filtered;
  }

  // Score each item based on match quality
  const scored = filtered.map(item => {
    let score = 0;
    const normName = normalizeText(item.Waste_Name);
    const keywords = parseKeywords(item.Keyword);

    // Exact name match
    if (normName === cleanQuery) {
      score += 100;
    } else if (normName.startsWith(cleanQuery)) {
      score += 60;
    } else if (normName.includes(cleanQuery)) {
      score += 40;
    }

    // Keyword match
    for (const kw of keywords) {
      const normKw = normalizeText(kw);
      if (normKw === cleanQuery) {
        score += 80;
      } else if (normKw.startsWith(cleanQuery)) {
        score += 45;
      } else if (normKw.includes(cleanQuery) || cleanQuery.includes(normKw)) {
        score += 30;
      }
    }

    // Partial character matching for Thai query tokens
    const queryTokens = cleanQuery.split(' ').filter(Boolean);
    if (queryTokens.length > 1) {
      for (const token of queryTokens) {
        if (normName.includes(token)) score += 15;
        for (const kw of keywords) {
          if (normalizeText(kw).includes(token)) score += 10;
        }
      }
    }

    return { item, score };
  });

  return scored
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}

/**
 * Matches AI visual recognition tokens and detected name against the university waste database.
 * Never invents bin color or disposal category!
 */
export function matchAIKeywordsWithDatabase(
  records: WasteRecord[],
  detectedName: string,
  keywords: string[] = [],
  material?: string
): {
  match: WasteRecord | null;
  confidence: number;
  alternatives: WasteRecord[];
  isUncertain: boolean;
} {
  const normDetected = normalizeText(detectedName);
  const allSearchTerms = [normDetected, ...keywords.map(normalizeText)].filter(Boolean);

  const scored = records.map(record => {
    let score = 0;
    const normName = normalizeText(record.Waste_Name);
    const recordKeywords = parseKeywords(record.Keyword).map(normalizeText);

    // Direct match with detected name
    if (normName === normDetected) {
      score += 90;
    } else if (normName.includes(normDetected) || normDetected.includes(normName)) {
      score += 50;
    }

    // Match against AI extracted keywords
    for (const term of allSearchTerms) {
      if (!term) continue;
      if (normName.includes(term) || term.includes(normName)) {
        score += 35;
      }
      for (const kw of recordKeywords) {
        if (kw === term) {
          score += 40;
        } else if (kw.includes(term) || term.includes(kw)) {
          score += 25;
        }
      }
    }

    // Material matching
    if (material) {
      const normMat = normalizeText(material);
      if (normName.includes(normMat) || record.Keyword.includes(normMat)) {
        score += 20;
      }
    }

    return { record, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 25) {
    return {
      match: null,
      confidence: 0,
      alternatives: scored.slice(0, 3).map(s => s.record),
      isUncertain: true,
    };
  }

  // Determine confidence (capped at 98% like the UI screenshot)
  const confidence = Math.min(98, Math.max(70, Math.round((best.score / 130) * 100)));
  const isUncertain = confidence < 75;

  return {
    match: best.record,
    confidence,
    alternatives: scored.slice(1, 4).filter(s => s.score > 20).map(s => s.record),
    isUncertain,
  };
}

/**
 * Returns color hex and badge styling for university bin colors
 */
export function getBinColorDetails(binColor: string): {
  colorKey: 'yellow' | 'green' | 'blue' | 'red';
  dotClass: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  name: string;
} {
  const norm = (binColor || '').toLowerCase();
  if (norm.includes('เหลือง') || norm.includes('yellow')) {
    return {
      colorKey: 'yellow',
      dotClass: 'bg-amber-500',
      badgeBg: 'bg-amber-100 text-amber-900',
      badgeText: 'text-amber-800',
      borderClass: 'border-amber-300',
      name: 'ถังสีเหลือง',
    };
  }
  if (norm.includes('เขียว') || norm.includes('green')) {
    return {
      colorKey: 'green',
      dotClass: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-900',
      badgeText: 'text-emerald-800',
      borderClass: 'border-emerald-300',
      name: 'ถังสีเขียว',
    };
  }
  if (norm.includes('น้ำเงิน') || norm.includes('blue') || norm.includes('ฟ้า')) {
    return {
      colorKey: 'blue',
      dotClass: 'bg-blue-600',
      badgeBg: 'bg-blue-100 text-blue-900',
      badgeText: 'text-blue-800',
      borderClass: 'border-blue-300',
      name: 'ถังสีน้ำเงิน',
    };
  }
  // red / orange / hazard
  return {
    colorKey: 'red',
    dotClass: 'bg-rose-600',
    badgeBg: 'bg-rose-100 text-rose-900',
    badgeText: 'text-rose-800',
    borderClass: 'border-rose-300',
    name: 'ถังสีแดง/ส้ม',
  };
}
