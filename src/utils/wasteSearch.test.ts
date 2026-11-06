import test from 'node:test';
import assert from 'node:assert/strict';
import { searchWaste, matchAIKeywordsWithDatabase, normalizeText, parseKeywords } from './wasteSearch';
import { WasteRecord } from '../types/waste';

const mockDatabase: WasteRecord[] = [
  {
    Waste_ID: 'W001',
    Waste_Name: 'แก้วกาแฟพลาสติกเย็น (พร้อมฝา)',
    Keyword: 'แก้วกาแฟ, แก้วพลาสติก, ฝาแก้ว, หลอด, PP, PET, แก้วชานม, แก้วน้ำ',
    Bin_Color: 'สีเหลือง',
    Bin_Category: 'ขยะรีไซเคิล & แก้วสะอาด',
    Instruction: 'เทน้ำแข็งและของเหลวออกให้หมดก่อนทิ้ง แยกหลอดลงถังทั่วไป',
    Category_Group: 'รีไซเคิล',
  },
  {
    Waste_ID: 'W002',
    Waste_Name: 'กล่องโฟมใส่อาหาร (เปื้อนคราบมัน)',
    Keyword: 'กล่องโฟม, โฟม, ถาดโฟม, โฟมเปื้อน, กล่องข้าวโฟม',
    Bin_Color: 'สีน้ำเงิน',
    Bin_Category: 'ขยะทั่วไป',
    Instruction: 'เคาะเศษอาหารลงถังเศษอาหารก่อน ทิ้งลงถังทั่วไป',
    Category_Group: 'ทั่วไป',
  },
  {
    Waste_ID: 'W003',
    Waste_Name: 'ขวดน้ำดื่มพลาสติก PET (ขวดใส)',
    Keyword: 'ขวดน้ำ, ขวด PET, ขวดพลาสติกใส, ขวดน้ำดื่ม, ฝาขวด',
    Bin_Color: 'สีเหลือง',
    Bin_Category: 'ขยะรีไซเคิล & แก้วสะอาด',
    Instruction: 'เทน้ำออก แกะฉลาก และบิดขวดให้แบนเพื่อประหยัดพื้นที่',
    Category_Group: 'รีไซเคิล',
  },
  {
    Waste_ID: 'W004',
    Waste_Name: 'กล่องชานอ้อย / กล่องย่อยสลายได้',
    Keyword: 'กล่องชานอ้อย, กล่องย่อยสลาย, ภาชนะชีวภาพ, กล่องข้าวชานอ้อย',
    Bin_Color: 'สีเขียว',
    Bin_Category: 'ขยะอินทรีย์ / ย่อยสลายได้',
    Instruction: 'เทเศษอาหารออกให้เกลี้ยงก่อนทิ้ง ย่อยสลายได้',
    Category_Group: 'อินทรีย์',
  },
  {
    Waste_ID: 'W005',
    Waste_Name: 'ถ่านไฟฉาย / แบตเตอรี่เก่า',
    Keyword: 'ถ่านไฟฉาย, แบตเตอรี่, ถ่านอัลคาไลน์, ถ่านกระดุม, แบตมือถือ',
    Bin_Color: 'สีแดงหรือส้ม',
    Bin_Category: 'ขยะอันตราย',
    Instruction: 'แยกใส่ถังขยะอันตราย ห้ามทิ้งปะปนกับขยะประเภทอื่น',
    Category_Group: 'อันตราย',
  },
];

test('normalizeText handles whitespace and Thai strings', () => {
  assert.equal(normalizeText('  แก้วกาแฟ   เย็น '), 'แก้วกาแฟ เย็น');
  assert.equal(normalizeText('PET Bottle'), 'pet bottle');
});

test('parseKeywords parses comma and slash delimited strings', () => {
  const result = parseKeywords('ขวดน้ำ, ขวด PET / ฝาขวด');
  assert.deepEqual(result, ['ขวดน้ำ', 'ขวด PET', 'ฝาขวด']);
});

test('searchWaste finds exact and partial Thai matches', () => {
  const coffeeResults = searchWaste(mockDatabase, 'กาแฟ');
  assert.equal(coffeeResults.length, 1);
  assert.equal(coffeeResults[0].Waste_ID, 'W001');

  const petResults = searchWaste(mockDatabase, 'PET');
  assert.ok(petResults.length >= 2);

  const foamResults = searchWaste(mockDatabase, 'โฟม');
  assert.equal(foamResults[0].Waste_ID, 'W002');
  assert.equal(foamResults[0].Bin_Color, 'สีน้ำเงิน');
});

test('searchWaste filters by category', () => {
  const organic = searchWaste(mockDatabase, '', 'ขยะอินทรีย์');
  assert.equal(organic.length, 1);
  assert.equal(organic[0].Waste_ID, 'W004');
  assert.equal(organic[0].Bin_Color, 'สีเขียว');
});

test('matchAIKeywordsWithDatabase matches detected image keywords to university database', () => {
  const matchResult = matchAIKeywordsWithDatabase(
    mockDatabase,
    'แก้วกาแฟพลาสติก',
    ['แก้วกาแฟ', 'ฝาครอบ', 'หลอด'],
    'พลาสติก PP'
  );

  assert.ok(matchResult.match !== null);
  assert.equal(matchResult.match?.Waste_ID, 'W001');
  assert.equal(matchResult.match?.Bin_Color, 'สีเหลือง');
  assert.equal(matchResult.match?.Bin_Category, 'ขยะรีไซเคิล & แก้วสะอาด');
  assert.ok(matchResult.confidence >= 80);
});

test('matchAIKeywordsWithDatabase returns uncertain when object is unknown', () => {
  const matchResult = matchAIKeywordsWithDatabase(
    mockDatabase,
    'วัตถุไม่ทราบชนิดแปลกประหลาดxyz',
    ['未知']
  );

  assert.equal(matchResult.match, null);
  assert.equal(matchResult.isUncertain, true);
});
