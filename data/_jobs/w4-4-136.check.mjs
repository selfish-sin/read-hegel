import fs from 'node:fs';

const root = 'C:/Users/21886/.minimax/sessions/mvs_c7c434fcb8bd4ef4ad2ebfa44ff633d0/workspace/gh-projects/read-hegel';
const job = JSON.parse(fs.readFileSync(`${root}/data/_jobs/w4-4-136.in.json`, 'utf8'));
const mainPath = `${root}/${job.outFile}`;
const raw = fs.readFileSync(mainPath);
const tr = JSON.parse(raw.toString('utf8'));

let fail = 0;
const ok = (c, m) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };

// 1 BOM
ok(!(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf), '首字节无 BOM');

// 2/3 per-block length + kind + no missing
for (const b of job.blocks) {
  const t = tr.blocks[String(b.bi)];
  if (!t) { ok(false, `块 ${b.bi} 缺失`); continue; }
  if (b.k === 'h') {
    ok(typeof t.en === 'string' && t.en.length > 0 && typeof t.zh === 'string' && t.zh.length > 0,
      `块 ${b.bi} [h] en/zh 为非空字符串`);
  } else {
    ok(Array.isArray(t.zh) && t.zh.length === b.sents.length, `块 ${b.bi} [p] zh.length===sents.length (${t.zh?.length}/${b.sents.length})`);
    ok(Array.isArray(t.en) && t.en.length === b.sents.length, `块 ${b.bi} [p] en.length===sents.length (${t.en?.length}/${b.sents.length})`);
  }
}

// 4 no extra blocks
const jobKeys = job.blocks.map((b) => String(b.bi)).sort();
const trKeys = Object.keys(tr.blocks).sort();
ok(JSON.stringify(jobKeys) === JSON.stringify(trKeys), `块集合一致（输出 ${trKeys.length} 块 / 输入 ${jobKeys.length} 块）`);

// 5 policy forbidden words scan
const banned = ['唯心主义', '唯心论', '唯心的', '理念', '理想性', '现实主义'];
const txt = trKeys.map((k) => [].concat(tr.blocks[k].zh, tr.blocks[k].en).join('\n')).join('\n');
for (const b of banned) ok(!txt.includes(b), `全文无禁词「${b}」`);

// 6 term spot checks
// 术语落地：仅对源文确实出现的德文词要求对应中文词出现
const deAll = job.blocks.map((b) => [].concat(b.sents ?? [], b.text ?? []).join('\n')).join('\n');
const musts = [
  ['Schluß', '推论'], ['Urteil', '判断'], ['Mitte', '中项'], ['Allgemeinheit', '普遍性'],
  ['Besonderheit', '特殊性'], ['Einzelheit', '个别性'], ['Moment', '环节'], ['Vermittlung', '中介'],
  ['Grund', '根据'], ['Bestimmtheit', '规定性'], ['Dasein', '定在'], ['Begriff', '概念'],
  ['Notwendigkeit', '必然性'], ['apodiktisch', '断言式'], ['subsumier', '归摄'],
  ['unentwickelt', '尚未展开'], ['Beschaffenheit', '性质'],
];
for (const [de, zh] of musts) {
  if (!deAll.toLowerCase().includes(de.toLowerCase())) { console.log(`SKIP  源文无「${de}」，不要求「${zh}」`); continue; }
  ok(txt.includes(zh), `术语落地：${de} → ${zh}`);
}

// 7 glossary csv sanity
const g = fs.readFileSync(`${root}/data/_jobs/w4-4-136.glossar.csv`, 'utf8');
ok(g.charCodeAt(0) !== 0xfeff, 'glossar 无 BOM');
const gl = g.trim().split('\n');
ok(gl[0] === 'de,en,zh,status,note', 'glossar 表头正确');
ok(gl.every((l) => l.split(',').length === 5), 'glossar 每行 5 字段');
ok(gl.slice(1).every((l) => /,(ok|variante|unsicher),/.test(l)), 'glossar status 取值合法');

// 8 counts
const pSents = job.blocks.filter((b) => b.k === 'p').reduce((a, b) => a + b.sents.length, 0);
const hBlocks = job.blocks.filter((b) => b.k === 'h').length;
console.log(`\n统计：块 ${job.blocks.length}（h ${hBlocks} / p ${job.blocks.length - hBlocks}），p 句 ${pSents}，h 标题 ${hBlocks}，合计 ${pSents + hBlocks}`);
console.log(`glossar 新词条 ${gl.length - 1}`);
console.log(fail === 0 ? '\nALL ASSERTIONS PASSED' : `\n${fail} ASSERTION(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
