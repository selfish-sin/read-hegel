import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve('C:/Users/21886/.minimax/sessions/mvs_c7c434fcb8bd4ef4ad2ebfa44ff633d0/workspace/gh-projects/read-hegel');
const IN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/_jobs/w4-2-76.in.json'), 'utf8'));
const outFile = path.join(ROOT, IN.outFile);
const buf = fs.readFileSync(outFile);
const OUT = JSON.parse(buf.toString('utf8'));
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + ' - ' + m); if (!c) fail++; };

// 1 completeness
const inKeys = IN.blocks.map(b => String(b.bi));
const outKeys = Object.keys(OUT.blocks);
ok(inKeys.length === outKeys.length && inKeys.every(k => outKeys.includes(k)), 'blocks complete: ' + inKeys.length + '/' + outKeys.length);

// 2 per-block shape/length
let sentTotal = 0, hCount = 0, pCount = 0;
for (const b of IN.blocks) {
  const o = OUT.blocks[String(b.bi)];
  if (b.k === 'h') {
    hCount++;
    ok(typeof o.en === 'string' && o.en.trim() !== '' && typeof o.zh === 'string' && o.zh.trim() !== '', 'h block ' + b.bi + ' en/zh are non-empty strings');
  } else {
    pCount++;
    const n = b.sents.length; sentTotal += n;
    ok(Array.isArray(o.en) && Array.isArray(o.zh) && o.en.length === n && o.zh.length === n, 'p block ' + b.bi + ' en/zh length === sents (' + n + ')');
    ok(o.en.every(s => typeof s === 'string' && s.trim() !== '') && o.zh.every(s => typeof s === 'string' && s.trim() !== ''), 'p block ' + b.bi + ' no empty strings');
  }
}
console.log('INFO blocks=' + IN.blocks.length + ' h=' + hCount + ' p=' + pCount + ' sents=' + sentTotal);

// 3 policy forbidden scan
const banned = ['唯心主义', '唯心论', '唯心的', '理念', '理想性', '现实主义', '时刻'];
const text = buf.toString('utf8');
for (const w of banned) ok(!text.includes(w), 'no banned term: ' + w);

// 4 no BOM
ok(!(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF), 'no BOM (first bytes ' + Array.from(buf.slice(0, 3)).join(',') + ')');

// 5 glossar
const g = fs.readFileSync(path.join(ROOT, 'data/_jobs/w4-2-76.glossar.csv'), 'utf8');
const gbuf = fs.readFileSync(path.join(ROOT, 'data/_jobs/w4-2-76.glossar.csv'));
ok(g.split(/\r?\n/)[0] === 'de,en,zh,status,note', 'glossar header ok');
ok(!(gbuf[0] === 0xEF && gbuf[1] === 0xBB && gbuf[2] === 0xBF), 'glossar no BOM');
const rows = g.trim().split(/\r?\n/).slice(1);
ok(rows.every(r => { const c = r.split(','); return c.length === 5 && ['ok', 'variante', 'unsicher'].includes(c[3]); }), 'glossar rows 5 cols + valid status (' + rows.length + ' rows)');
// simple traditional-char / stray check on zh output
ok(!/[個們這個裡麼甚麼]/.test(text), 'no traditional/variant chars in output');

console.log(fail === 0 ? 'ALL CHECKS PASSED' : 'FAILURES: ' + fail);
process.exit(fail === 0 ? 0 : 1);
