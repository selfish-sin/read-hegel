// w4-2-235 自查断言
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? '.');
const IN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/_jobs/w4-2-235.in.json'), 'utf8'));
const outPath = path.join(ROOT, IN.outFile);
const buf = fs.readFileSync(outPath);
const OUT = JSON.parse(buf.toString('utf8'));

let fail = 0;
const ok = (name, cond, extra = '') => {
  if (!cond) fail++;
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (extra ? ' | ' + extra : ''));
};

// 1. BOM
ok('文件首字节不是 BOM', !(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), '首字节 0x' + buf[0].toString(16));

// 2. 逐块对齐 + h 块为字符串
const expected = IN.blocks.map((b) => String(b.bi));
const actual = Object.keys(OUT.blocks);
ok('块集合与 in.json 完全一致', JSON.stringify(expected) === JSON.stringify(actual), expected.length + ' 块');

let pCount = 0, hCount = 0, sentTotal = 0;
for (const b of IN.blocks) {
  const key = String(b.bi);
  const t = OUT.blocks[key];
  if (!t) { fail++; console.log('FAIL | 块 ' + key + ' 缺失'); continue; }
  if (b.k === 'h') {
    hCount++;
    ok('块 ' + key + ' 为非空字符串 en/zh',
      typeof t.en === 'string' && typeof t.zh === 'string' && t.en.trim() !== '' && t.zh.trim() !== '',
      `en=${typeof t.en} zh=${typeof t.zh}`);
  } else {
    pCount++;
    sentTotal += b.sents.length;
    ok('块 ' + key + ' zh/en 长度对齐',
      Array.isArray(t.zh) && Array.isArray(t.en) && t.zh.length === b.sents.length && t.en.length === b.sents.length,
      `sents=${b.sents.length} en=${t.en.length} zh=${t.zh.length}`);
    ok('块 ' + key + ' 无空条目',
      t.en.every((x) => typeof x === 'string' && x.trim() !== '') && t.zh.every((x) => typeof x === 'string' && x.trim() !== ''));
  }
}

// 3. 政策禁词全文扫描
const banned = ['唯心主义', '唯心论', '唯心的', '理念', '理想性', '现实主义', '认知', '灵魂', '心灵'];
const all = [];
for (const [k, v] of Object.entries(OUT.blocks)) {
  const push = (s) => all.push([k, s]);
  if (typeof v.en === 'string') push(v.en); else v.en.forEach(push);
  if (typeof v.zh === 'string') push(v.zh); else v.zh.forEach(push);
}
for (const w of banned) {
  const hits = all.filter(([, s]) => s.includes(w));
  ok('禁词「' + w + '」零命中', hits.length === 0, hits.map(([k, s]) => k + ':' + s).join(' | '));
}

// 4. 关键术语落地抽检
const joined = all.map(([, s]) => s).join('\n');
ok('Vernunft→理性 出现', joined.includes('理性'));
ok('Dasein/定在 出现', joined.includes('定在'));
ok('Sein/Nichts/Werden 三词落地', joined.includes('存在') && joined.includes('无') && joined.includes('生成'));
ok('Aufhebung→扬弃 出现', joined.includes('扬弃'));
ok('Verstand→知性 出现（未用理智）', joined.includes('知性') && !joined.includes('理智'));

// 5. 术语草表
const csvPath = path.join(ROOT, 'data/_jobs/w4-2-235.glossar.csv');
const csvBuf = fs.readFileSync(csvPath);
ok('glossar 首字节不是 BOM', !(csvBuf[0] === 0xef && csvBuf[1] === 0xbb && csvBuf[2] === 0xbf));
const csv = csvBuf.toString('utf8').split('\n').filter((l) => l.trim() !== '');
ok('glossar 表头正确', csv[0] === 'de,en,zh,status,note', csv[0]);
ok('glossar 每行 5 列且无英文逗号混入字段', csv.every((l) => l.split(',').length === 5));
ok('glossar status 取值合法', csv.slice(1).every((l) => ['ok', 'variante', 'unsicher'].includes(l.split(',')[3])));

console.log('\n统计：p 块 ' + pCount + ' / h 块 ' + hCount + ' / 句数合计 ' + sentTotal);
console.log(fail === 0 ? '全部断言通过' : fail + ' 条断言失败');
process.exit(fail === 0 ? 0 : 1);
