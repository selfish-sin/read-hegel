// self-check for w4-4-110 translation unit
import fs from 'node:fs';

const inp = JSON.parse(fs.readFileSync('data/_jobs/w4-4-110.in.json', 'utf8'));
const raw = fs.readFileSync('web/data/trans/w4/4.p110.json');
const out = JSON.parse(raw.toString('utf8'));
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + ' - ' + m); if (!c) fail++; };

let shapeOk = true;
for (const b of inp.blocks) {
  const o = out.blocks[String(b.bi)];
  if (!o) { shapeOk = false; console.log('  missing block', b.bi); continue; }
  if (b.k === 'p') {
    if (!Array.isArray(o.en) || !Array.isArray(o.zh) || o.en.length !== b.sents.length || o.zh.length !== b.sents.length) {
      shapeOk = false; console.log('  bad lengths at', b.bi);
    }
    if (o.en.some(x => typeof x !== 'string' || !x.trim()) || o.zh.some(x => typeof x !== 'string' || !x.trim())) {
      shapeOk = false; console.log('  empty/non-string at', b.bi);
    }
  } else if (typeof o.en !== 'string' || !o.en.trim() || typeof o.zh !== 'string' || !o.zh.trim()) {
    shapeOk = false; console.log('  h block not a nonempty string at', b.bi);
  }
}
ok(shapeOk, '逐块形状：p 块 en/zh 长度===sents.length；h 块为非空字符串');

const inKeys = inp.blocks.map(b => String(b.bi)).sort();
const outKeys = Object.keys(out.blocks).sort();
ok(JSON.stringify(inKeys) === JSON.stringify(outKeys), `所有 ${inp.blocks.length} 块都已写、无多余无遗漏`);

const all = [];
for (const v of Object.values(out.blocks)) {
  (Array.isArray(v.en) ? v.en : [v.en]).forEach(s => all.push(s));
  (Array.isArray(v.zh) ? v.zh : [v.zh]).forEach(s => all.push(s));
}
const text = all.join('\n');
const bad = ['唯心主义', '唯心论', '唯心的', '理念', '理想性', '现实主义', '量子', '反映'];
const hits = bad.filter(w => text.includes(w));
ok(hits.length === 0, `政策禁词全文扫描：命中 ${JSON.stringify(hits)}`);

ok(!(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF), '文件首字节不是 UTF-8 BOM');

const gl = fs.readFileSync('data/_jobs/w4-4-110.glossar.csv', 'utf8').split(/\r?\n/).filter(Boolean);
ok(gl[0] === 'de,en,zh,status,note', '术语草表表头正确');
const badRow = gl.slice(1).filter(l => l.split(',').length !== 5);
ok(badRow.length === 0, `草表每行 5 字段（字段内无英文逗号）：异常行 ${badRow.length}`);

console.log('---');
console.log(`blocks p=${inp.blocks.filter(b => b.k === 'p').length} h=${inp.blocks.filter(b => b.k === 'h').length}`);
console.log(`sentences=${inp.blocks.reduce((a, b) => a + (b.sents ? b.sents.length : 0), 0)}`);
console.log(`glossar new entries=${gl.length - 1}`);
console.log(fail === 0 ? 'ALL ASSERTIONS PASSED' : `${fail} ASSERTION(S) FAILED`);
process.exit(fail ? 1 : 0);
