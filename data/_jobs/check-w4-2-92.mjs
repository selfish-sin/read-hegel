import fs from 'node:fs';

const inp = JSON.parse(fs.readFileSync('data/_jobs/w4-2-92.in.json', 'utf8'));
const raw = fs.readFileSync(inp.outFile);
const out = JSON.parse(raw.toString('utf8'));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };

// 1. 块齐全
const wantBIs = inp.blocks.map(b => b.bi);
ok(wantBIs.every(bi => String(bi) in out.blocks), '全部 21 块都写了: ' + wantBIs.length + ' 块');
ok(Object.keys(out.blocks).length === wantBIs.length, '无多余块: ' + Object.keys(out.blocks).length);

// 2. 逐块句数对齐 + hash + 源 ns
let sents = 0;
for (const b of inp.blocks) {
  const v = out.blocks[String(b.bi)];
  ok(Array.isArray(v.en) && v.en.length === b.sents.length, `块 ${b.bi} en.length=${v.en.length} === sents=${b.sents.length}`);
  ok(Array.isArray(v.zh) && v.zh.length === b.sents.length, `块 ${b.bi} zh.length=${v.zh.length} === sents=${b.sents.length}`);
  if (b.sents.length) ok(v.zh.every(s => String(s).trim() !== ''), `块 ${b.bi} zh 无空句`);
  ok(v.h === b.hash, `块 ${b.bi} hash 与源一致`);
  sents += b.sents.length;
}
console.log(`INFO 总句数 ${sents}；总块数 ${wantBIs.length}`);

const vol = JSON.parse(fs.readFileSync('web/data/vol/w4/2.json', 'utf8'));
for (const b of inp.blocks) {
  const src = vol.blocks[b.bi];
  ok(src.hash === b.hash, `块 ${b.bi} 源 hash 匹配`);
  ok(src.ns === b.sents.length, `块 ${b.bi} 源 ns=${src.ns} === sents=${b.sents.length}`);
}

// 3. 政策禁词全文扫描（任务书清单）
const all = JSON.stringify(out.blocks);
const banned = ['唯心主义', '唯心论', '唯心的', '理念', '理想性', '现实主义', '政府', '意愿', '个人', '主观', '市民社会', '阶级', '法学'];
for (const w of banned) ok(!all.includes(w), `禁词未出现: ${w}`);

// 4. 本单元关键术语抽查
ok(all.includes('扬弃') && !all.includes('取消'), 'aufheben→扬弃（未写“取消”）');
ok(all.includes('现象') && !all.includes('假象'), 'Erscheinung→现象（未用假象）');
ok(all.includes('概念') && !/概念.{0,0}观念/.test(all), 'Begriff→概念');
ok(all.includes('定在'), 'Dasein→定在');
ok(all.includes('知性') && !all.includes('理智'), 'Verstand→知性（未用理智）');
ok(all.includes('物质') && !all.includes('质料'), 'Materie→物质（未用质料）');
ok(all.includes('规定') && !all.includes('规定性'), 'Bestimmung→规定');
ok(all.includes('量'), 'Quantität→量');

// 5. 无 BOM
ok(!(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF), '主文件首字节非 BOM');
const csvRaw = fs.readFileSync('data/_jobs/w4-2-92.glossar.csv');
ok(!(csvRaw[0] === 0xEF && csvRaw[1] === 0xBB && csvRaw[2] === 0xBF), 'glossar 首字节非 BOM');
const csvLines = csvRaw.toString('utf8').split(/\r?\n/).filter(l => l.trim());
ok(csvLines[0] === 'de,en,zh,status,note', 'glossar 表头正确');
ok(csvLines.slice(1).every(l => l.split(',').length === 5), 'glossar 每行 5 字段（英文逗号未混入 note）');
ok(csvLines.slice(1).every(l => ['ok', 'variante', 'unsicher'].includes(l.split(',')[3])), 'glossar status 取值合法');

console.log(`\n断言 ${pass} 通过 / ${fail} 失败；glossar 新词条 ${csvLines.length - 1} 条`);
if (fail) process.exit(1);
