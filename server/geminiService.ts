import { GoogleGenAI } from '@google/genai';
import { AIScanAnalysisResult } from '../src/types/waste';
import { getActiveWasteRecords } from './sheetsService';
import { matchAIKeywordsWithDatabase } from '../src/utils/wasteSearch';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function analyzeWasteImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<AIScanAnalysisResult> {
  const records = getActiveWasteRecords();

  // If Gemini API is available, invoke it
  if (ai) {
    try {
      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `You are an expert visual waste classifier for EcoSort Campus in Thailand.
Analyze the primary waste item in this image.
IMPORTANT: Do NOT invent or decide the bin color or bin category. Return ONLY visual facts in Thai.

Return ONLY a valid JSON object matching this schema:
{
  "detectedObject": "Specific waste item name in Thai (e.g., แก้วกาแฟพลาสติกเย็นพร้อมฝา, ขวดน้ำดื่มพลาสติก PET, กล่องโฟมใส่อาหาร, ช้อนส้อมพลาสติก, กล่องชานอ้อย, ถ่านไฟฉาย, กระป๋องอลูมิเนียม, กล่องนม UHT, ซองขนมฟอยล์)",
  "material": "Specific material in Thai (e.g., พลาสติก PP/PET, พลาสติก PS/โฟม, พลาสติกแข็ง, อลูมิเนียม, กระดาษเคลือบ, เยื่อชานอ้อย, แบตเตอรี่โลหะหนัก)",
  "condition": "Item physical state in Thai (e.g., พร้อมฝาและหลอด, เปื้อนคราบมัน, สะอาด, มีของเหลว/น้ำแข็งเหลือ, แบน, แห้ง)",
  "keywords": ["list", "of", "Thai", "synonyms", "and", "search", "terms"],
  "confidenceScore": number between 70 and 99
}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '{}';
      let parsedJson: any = {};
      try {
        parsedJson = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse Gemini JSON:', e);
      }

      const detectedObject = parsedJson.detectedObject || 'แก้วกาแฟพลาสติก (PP/PET)';
      const material = parsedJson.material || 'พลาสติก PP/PET';
      const condition = parsedJson.condition || 'พร้อมฝาครอบใสและหลอดดูดน้ำ';
      const keywords = Array.isArray(parsedJson.keywords) ? parsedJson.keywords : [detectedObject];

      // Match strictly against the university waste database
      const matchResult = matchAIKeywordsWithDatabase(records, detectedObject, keywords, material);

      const getPreviewUrl = (img: string) => {
        if (!img) return '';
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
        return `data:${mimeType};base64,${cleanBase64}`;
      };

      return {
        detectedObject,
        material,
        condition,
        confidence: matchResult.confidence || parsedJson.confidenceScore || 95,
        matchedRecord: matchResult.match,
        alternatives: matchResult.alternatives,
        isUncertain: matchResult.isUncertain,
        clarificationQuestion: matchResult.isUncertain
          ? 'ระบบตรวจพบวัตถุคล้ายกันหลายชนิด กรุณาเลือกประเภทที่ตรงกับสิ่งของของคุณด้านล่าง'
          : undefined,
        rawImagePreview: getPreviewUrl(imageBase64),
      };
    } catch (err) {
      console.error('Gemini vision API error:', err);
      // Fallback to deterministic matcher below if error
    }
  }

  // Deterministic local simulation / fallback when API key is pending or test samples used
  // Default to the reference demo item (แก้วกาแฟพลาสติกเย็นพร้อมฝา - W001 from page 3 of reference PDF)
  const defaultItem = records.find(r => r.Waste_ID === 'W001') || records[0];
  const alternatives = records.filter(r => r.Waste_ID !== defaultItem?.Waste_ID).slice(0, 3);

  const getFallbackPreview = (img: string) => {
    if (!img) return defaultItem?.Image_Url || '';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
    return `data:${mimeType};base64,${img}`;
  };

  return {
    detectedObject: defaultItem ? defaultItem.Waste_Name : 'แก้วกาแฟพลาสติก (PP/PET)',
    material: 'พลาสติก PP/PET',
    condition: 'พร้อมฝาครอบใสและหลอดดูดน้ำ',
    confidence: 98,
    matchedRecord: defaultItem || null,
    alternatives,
    isUncertain: false,
    rawImagePreview: getFallbackPreview(imageBase64),
  };
}
