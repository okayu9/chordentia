#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Known supported qualities
const SUPPORTED = new Set([
  '', 'maj', 'm', 'min', '7', 'maj7', 'm7', 'min7',
  'dim', 'dim7', 'm7b5', 'aug', '+5',
  'sus2', 'sus4', 'sus', '7sus4', '9sus4',
  '6', 'm6', '6/9', 'maj6/9',
  '9', 'maj9', 'm9', 'add9',
  'm11', 'add11', 'add#11',
  '13', 'm13', 'add13', 'add#13',
  'maj7+5', '7+5',
  'omit5', 'm(omit5)', '7omit5', 'maj7omit5', 'm7omit5',
  'omit3', '5', 'maj7(omit3)', '7omit3',
  'sus2omit5', 'sus4omit5', '7sus4omit5',
  '9omit5', 'm9omit5',
  '7b9', '7#9', '7b5', '7alt',
  '7(9)', '7(13)', '7(9,13)', '7(b9,b13)', '7(b5,#9)', '7(#5,b9)',
  '7(#9,#11)', '7(b9,#11)', '7(9,#11,13)',
  'mM7', 'mM9', 'mM11', 'mM13',
  'm7(9)', 'm7(11)', 'm7(9,11)', 'm7b5(11)',
  'maj7(9)', 'maj7(13)', 'maj7(9,13)',
  'aug7(b9)', 'aug9(#11)', 'aug7#9',
  '9b5', '(9)', '(11)', '(13)',
  'add2', 'add4', 'add6'
]);

// Normalization map
const NORM_MAP = {
  'M7': 'maj7', 'M9': 'maj9', '+': 'aug', '69': '6/9',
  'MA7': 'maj7', 'Ma7': 'maj7', '△7': 'maj7', '△': 'maj7',
  'min': 'm', 'min7': 'm7', '-': 'm', '-7': 'm7'
};

function parseChord(chord) {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (match) {
    return { root: match[1], quality: match[2] || '' };
  }
  return null;
}

function normalize(quality) {
  return NORM_MAP[quality] || quality;
}

// Load data
const dataPath = path.join(process.cwd(), 'extracted-chords.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Find unsupported chords
const unsupported = [];
for (const { chord, frequency } of data.allChords) {
  const parsed = parseChord(chord);
  if (parsed) {
    const norm = normalize(parsed.quality);
    if (!SUPPORTED.has(parsed.quality) && !SUPPORTED.has(norm)) {
      unsupported.push({ chord, frequency, quality: parsed.quality });
    }
  }
}

// Sort by frequency
unsupported.sort((a, b) => b.frequency - a.frequency);

console.log('=== 対応していないコードの出現頻度ランキング ===');
console.log('順位  コード例      出現回数  コード品質');
console.log('----------------------------------------');

for (let i = 0; i < Math.min(50, unsupported.length); i++) {
  const { chord, frequency, quality } = unsupported[i];
  console.log(
    (i + 1).toString().padStart(3) + '.  ' +
    chord.padEnd(12) + ' ' +
    frequency.toString().padStart(4) + '回   ' +
    (quality || '(major)')
  );
}

// Group by quality
const qualityGroups = {};
for (const { frequency, quality } of unsupported) {
  const q = quality || '(major)';
  if (!qualityGroups[q]) {
    qualityGroups[q] = { count: 0, total: 0 };
  }
  qualityGroups[q].count++;
  qualityGroups[q].total += frequency;
}

// Sort qualities by total frequency
const sortedQualities = Object.entries(qualityGroups)
  .sort((a, b) => b[1].total - a[1].total);

console.log('\n=== コード品質別の集計 ===');
console.log('コード品質     種類数  総出現回数');
console.log('--------------------------------');

for (let i = 0; i < Math.min(30, sortedQualities.length); i++) {
  const [quality, { count, total }] = sortedQualities[i];
  console.log(
    quality.padEnd(14) + ' ' +
    count.toString().padStart(3) + '種  ' +
    total.toString().padStart(5) + '回'
  );
}

console.log('\n総計: ' + unsupported.length + '種類の未対応コード');
console.log('総出現回数: ' + unsupported.reduce((sum, c) => sum + c.frequency, 0) + '回');