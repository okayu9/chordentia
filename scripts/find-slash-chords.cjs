#!/usr/bin/env node

/**
 * Find all slash chords in the dataset to understand what exists
 */

const fs = require('fs');
const path = require('path');

function extractChordsFromFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const chords = [];
    
    // Extract chord names from onclick attributes
    const CHORD_REGEX = /onclick="javascript:popupImage\('\/cd\/([^.]+)\.png'/g;
    let match;
    
    while ((match = CHORD_REGEX.exec(content)) !== null) {
      const rawChord = match[1];
      let chord = decodeURIComponent(rawChord)
        .replace(/&quot;/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      
      // Skip non-chord elements
      if (chord.length > 0 && /^[A-G]/.test(chord) && !chord.includes('>') && !chord.includes('<')) {
        chords.push(chord);
      }
    }
    
    return chords;
  } catch (error) {
    return [];
  }
}

function findSlashChords() {
  const sampleDir = path.join(process.cwd(), 'sample');
  const files = fs.readdirSync(sampleDir);
  
  console.log('🔍 すべての分数コード（/を含むコード）を検索中...\n');
  
  const slashChords = {};
  const augSlashChords = {};
  let processedCount = 0;
  let totalSlashChords = 0;
  
  for (const file of files) {
    if (file.startsWith('.')) continue;
    
    const filePath = path.join(sampleDir, file);
    const chords = extractChordsFromFile(filePath, file);
    
    for (const chord of chords) {
      if (chord.includes('/')) {
        slashChords[chord] = (slashChords[chord] || 0) + 1;
        totalSlashChords++;
        
        // Check for aug-related slash chords
        if (chord.toLowerCase().includes('aug') || chord.includes('+')) {
          augSlashChords[chord] = (augSlashChords[chord] || 0) + 1;
        }
      }
    }
    
    processedCount++;
    if (processedCount % 1000 === 0) {
      console.log(`処理済み: ${processedCount}曲...`);
    }
  }
  
  const sortedSlashChords = Object.entries(slashChords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);
    
  const sortedAugSlashChords = Object.entries(augSlashChords)
    .sort((a, b) => b[1] - a[1]);
  
  console.log(`\n📊 分析完了: ${processedCount}曲から ${Object.keys(slashChords).length}種類の分数コードを発見`);
  console.log(`総出現回数: ${totalSlashChords}回\n`);
  
  console.log('=== 最も使われる分数コード（上位50） ===');
  for (const [chord, count] of sortedSlashChords) {
    console.log(`${chord}: ${count}回`);
  }
  
  console.log('\n=== augまたは+を含む分数コード ===');
  if (sortedAugSlashChords.length > 0) {
    for (const [chord, count] of sortedAugSlashChords) {
      console.log(`${chord}: ${count}回`);
    }
  } else {
    console.log('augまたは+を含む分数コードは見つかりませんでした');
  }
  
  // Show some examples of slash chords with different root qualities
  console.log('\n=== 分数コードの種類別サンプル ===');
  const examples = {};
  for (const chord of Object.keys(slashChords)) {
    const slashIndex = chord.indexOf('/');
    const rootPart = chord.substring(0, slashIndex);
    const bassPart = chord.substring(slashIndex + 1);
    
    // Extract quality from root part
    const match = rootPart.match(/^[A-G][#b]?(.*)$/);
    const quality = match ? match[1] : '';
    
    if (!examples[quality]) {
      examples[quality] = [];
    }
    if (examples[quality].length < 3) {
      examples[quality].push(chord);
    }
  }
  
  for (const [quality, chords] of Object.entries(examples)) {
    const displayQuality = quality === '' ? '(major)' : quality;
    console.log(`${displayQuality}: ${chords.join(', ')}`);
  }
}

if (require.main === module) {
  findSlashChords();
}