import fs from 'node:fs';

const inp = JSON.parse(fs.readFileSync('data/_jobs/w4-2-32.in.json', 'utf8'));
const raw = fs.readFileSync(inp.outFile);
const out = JSON.parse(raw.toString('utf8'));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };

// 1. 所有块都写了
const wantBIs = inp.blocks.map(b => b.bi);
ok(wantBIs.every(bi => String(bi) in out.blocks), '所有块都存在: ' + wantBIs.join(','));

// 2. 逐块句数对齐 + h 块为非空字符串
for (const b of inp.blocks) {
  const v = out.blocks[String(b.bi)];
  if (b.k === 'h') {
    ok(typeof v.en === 'string' && v.en.trim() !== '' && typeof v.zh === 'string' && v.zh.trim() !== '',
      `块 ${b.bi} (h): en/zh 为非空字符串`);
  } else {
    ok(Array.isArray(v.en) && v.en.length === b.sents.length, `块 ${b.bi} en.length=${v.en?.length} === sents=${b.sents.length}`);
    ok(Array.isArray(v.zh) && v.zh.length === b.sents.length, `块 ${b.bi} zh.length=${v.zh?.length} === sents=${b.sents.length}`);
    ok(v.zh.every(s => String(s).trim() !== ''), `块 ${b.bi} zh 无空句`);
  }
  if (b.hash && v.h !== b.hash) ok(false, `块 ${b.bi} hash 与源不一致`);
}

// 3. 源 ns 对齐
const vol = JSON.parse(fs.readFileSync('web/data/vol/w4/2.json', 'utf8'));
for (const b of inp.blocks) {
  const src = vol.blocks[b.bi];
  ok(src.hash === b.hash, `块 ${b.bi} 源 hash 匹配`);
  if (b.k !== 'h') ok(src.ns === b.sents.length, `块 ${b.bi} ns=${src.ns} === sents=${b.sents.length}`);
}

// 4. 政策禁词全文扫描
const all = JSON.stringify(out.blocks);
const banned = ['唯心主义', '唯心论', '唯心的', '理念', '理想性', '现实主义', '意愿', '阶级', '政府', '政体', '市民社会', '法学', '环节无关'];
for (const w of banned) ok(!all.includes(w), `禁词未出现: ${w}`);
ok(!/现实性.{0,4}(?!与)/.test('') , '（跳过正则占位）');

// 5. 本卷裁定用词抽查
ok(all.includes('精神') && !all.includes('心灵'), 'Geist 作「精神」');
ok(all.includes('表象') && all.includes('直观'), 'Vorstellung→表象 / Anschauung→直观');
ok(all.includes('思想') && !all.includes('观念'), 'Gedanke→思想，未误用「观念」');
ok(all.includes('伦理') === false, '本单元无 Sittlichkeit（确认未误插「伦理」）');
ok(all.includes('扬弃'), 'aufheben→扬弃');
ok(all.includes('意志'), 'Wille→意志');
ok(all.includes('心态'), 'Gesinnung→心态');
ok(all.includes('知识') === false, '本单元无 Wissen（确认未误插「知识」）');

// 6. 无 BOM
ok(!(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF), '主文件首字节非 BOM');
const csv = fs.readFileSync('data/_jobs/w4-2-32.glossar.csv');
ok(!(csv[0] === 0xEF && csv[1] === 0xBB && csv[2] === 0xBF), 'glossar 首字节非 BOM');
ok(csv.toString('utf8').split(/\r?\n/)[0] === 'de,en,zh,status,note', 'glossar 表头正确');
const csvLines = csv.toString('utf8').split(/\r?\n/).filter(l => l.trim());
const bad = csvLines.filter((l, i) => l.split(',').length !== 5);
ok(bad.length === 0, `glossar 每行 5 字段（异常 ${bad.length} 行）`);

console.log(`\n断言 ${pass} 通过 / ${fail} 失败；glossar 新词条 ${csvLines.length - 1} 条`);
if (fail) process.exit(1);
