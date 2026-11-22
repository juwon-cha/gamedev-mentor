#!/usr/bin/env node
/* data/_parts/의 묶음 파일을 트랙 파일로 합칩니다. 독립 검수를 통과해 verified가 붙은 문제만 합칩니다.
   사용법: node tools/merge-parts.js track5 [track1 ...]   (인자 없으면 _parts에 있는 모든 트랙) */
const fs = require('fs'), path = require('path');
const dataDir = path.join(__dirname, '..', 'data'), partsDir = path.join(dataDir, '_parts');
const tracks = JSON.parse(fs.readFileSync(path.join(dataDir, 'tracks.json'), 'utf8')).tracks;
const partFiles = fs.existsSync(partsDir) ? fs.readdirSync(partsDir).filter(f => /^track\d+_.+\.json$/.test(f)).sort() : [];
const wanted = process.argv.length > 2 ? process.argv.slice(2) : [...new Set(partFiles.map(f => f.split('_')[0]))];
let failed = false;
for (const id of wanted) {
  const tr = tracks.find(t => t.id === id);
  if (!tr) { console.log(`${id}: tracks.json에 없음`); failed = true; continue; }
  const target = path.join(dataDir, path.basename(tr.file));
  const out = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : { track: id, trackName: '', extraSources: [], problems: [] };
  out.extraSources = out.extraSources || [];
  let added = 0, replaced = 0, skipped = 0;
  for (const f of partFiles.filter(f => f.startsWith(id + '_'))) {
    const part = JSON.parse(fs.readFileSync(path.join(partsDir, f), 'utf8'));
    if (!out.trackName) out.trackName = part.trackName;
    for (const s of part.extraSources || []) {
      const cur = out.extraSources.find(x => x.id === s.id);
      if (!cur) out.extraSources.push(s);
      else if (cur.url !== s.url) { console.log(`${f}: 출처 id 충돌 ${s.id} (${cur.url} ≠ ${s.url})`); failed = true; }
    }
    for (const p of part.problems || []) {
      if (!p.verified) { console.log(`${f}: ${p.id} — 검수 표시(verified) 없음, 건너뜀`); skipped++; continue; }
      const i = out.problems.findIndex(x => x.id === p.id);
      if (i >= 0) { out.problems[i] = p; replaced++; } else { out.problems.push(p); added++; }
    }
  }
  if (failed) continue;
  fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
  console.log(`${id}: 추가 ${added}, 교체 ${replaced}, 건너뜀 ${skipped} → 총 ${out.problems.length}문제 (${path.basename(target)})`);
}
process.exit(failed ? 1 : 0);
