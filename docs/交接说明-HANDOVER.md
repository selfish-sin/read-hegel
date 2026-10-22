# 交接说明（换一台电脑继续做）

> 先读这三份，再动手：`docs/术语政策-TERMINOLOGY-POLICY.md`（译名最高权威）、
> `docs/项目日志-PROJECT-LOG.md`（历史与踩过的坑）、本文件（怎么跑）。

## 一、环境准备

| 项目 | 要求 |
|---|---|
| Node.js | 18+（本项目**零依赖**，没有 npm install 这一步；实测 v24） |
| git | 任意近期版本 |
| SSH 密钥 | `~/.ssh/id_ed25519_ismism`（身份 `ismism-learner`）+ `id_ed25519_ismism.pub` |
| 浏览器 | 本地阅读器用；`scripts/check.mjs` 走 Edge/Chrome 的 CDP 做验收 |

**从 GitHub 取回**：

```bash
git clone git@github.com:ismism-learner/read-hegel.git
cd read-hegel
```

若 SSH 报错或推错地方，检查是否**明确指定了身份**（关键，容易踩）：

```bash
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_ismism -o IdentitiesOnly=yes' git push origin main
```

> 不加 `IdentitiesOnly=yes` 时，SSH 可能先用另一把 `id_ed25519`（那是 `UGcraft/UGcraft-hall-of-fame`
> 的部署密钥），于是推到一个毫不相干的仓库。

## 二、跑起来

```bash
node scripts/serve.mjs --port 8860      # 本地静态服务（gzip）
# 浏览器打开 http://127.0.0.1:8860/
```

页面：`/`（书架，12 卷）→ `reader.html?v=<卷>&c=<分片>&lay=tri|mono`。
阅读器内：`EN` 按钮或 `e` 键切换英文栏；布局按钮在三栏 / 德中 / 纯德之间切换。

## 三、目录地图

```
web/                      前端（原生 ES 模块，无构建步骤）
  index.html reader.html  书架 / 阅读器
  assets/                 base.css library.css reader.css util.js search.js library.js reader.js
  data/manifest.json      12 卷 360 分片索引
  data/vol/<vol>/<n>.json 分片：{v,i,t,cr,blocks:[{k:'h'|'p'|'fn', x, hash, ns, ...}]}
  data/trans/<vol>/<n>.json  译文：{blocks:{"<块号>":{h,en:[],zh:[]}}}   ← 你译的东西在这里
  data/trans/index.json   覆盖率索引
scripts/
  lib/sentences.mjs       ★ 分句器（build 与翻译共用，改它必须重跑 build + 全套验收）
  build.mjs fetch-hegel.mjs serve.mjs
  make-jobs.mjs merge-trans.mjs trans-index.mjs validate.mjs integrity.mjs
  qa-trans.mjs            ★ 零成本质检（对齐/漏否定/重复片段/术语符合性）
  check-policy.mjs        ★ 政策守卫（违反退出码 1）
  make-review-jobs.mjs apply-review-patches.mjs show-review-diff.mjs   ← 逐章审校
  make-family-jobs.mjs apply-family-patches.mjs apply-families.mjs normalize-context.mjs
  fix-term.mjs add-term.mjs push-family-policy.mjs push-authority-order.mjs push-reader-rules.mjs
  check.mjs sweep.mjs     CDP 验收（单页 / 全卷）
  verify-hover-sweep.mjs verify-paragraph-align.mjs verify-coverage.mjs audit-sentences.mjs
  agents/PROMPTS.md       各阶段提示词模板
  workflows/WORKFLOW-SCRIPTS.md  ★ workflow 工具的脚本模板（翻译/建包/审校/词族修复）
glossary/hegel_glossar.csv    共享词表（de,en,zh,status,note）
glossary/hegel_families.csv   ★ 词族表（政策机器可读版）
data/_jobs/                   任务载荷 + 卷级上下文包 context-<vol>.json（术语权威）
data/_research/               豆瓣批评摘要、架构调研记录
data/_raw/                    德文底本 HTML（52 MB，构建输入）
docs/                         本文件、术语政策、项目日志
```

## 四、继续翻译：完整循环

```bash
# 1) 切片（按时间顺序取未译部分；--vol 可限定某一卷）
node scripts/make-jobs.mjs --size 25 --limit 12 --prefix wave30
#    → data/_jobs/jobs-wave30.json 与 data/_jobs/<unit>.in.json

# 2) 在会话里用 workflow 工具并行翻译（子代理上限 8，故每批 6；提示词见 scripts/agents/PROMPTS.md）
#    每个单元一个代理，提示词要求：读 data/_jobs/context-<vol>.json，遵守政策与词族规则

# 3) 合并与校验（合并是幂等的；哈希不符会按块号重新盖章，不会静默丢活）
node scripts/merge-trans.mjs
node scripts/trans-index.mjs        # 必须 0 不一致

# 4) 零成本质检 + 政策守卫
node scripts/qa-trans.mjs > /tmp/qa.txt     # ⚠️ 不要用管道截断，会杀掉进程导致报告不完整
node scripts/check-policy.mjs               # 必须 exit 0

# 5) 逐章审校（一个代理约 30 句，只修明确缺陷）
node scripts/make-review-jobs.mjs --vol w3 --chunk 7 --size 30
#    → workflow 派发审校代理（提示词见 PROMPTS.md 的 review 段）
node scripts/apply-review-patches.mjs --apply
mv data/_jobs/rev-*.out.json data/_jobs/_applied/     # ★ 务必归档，否则会被重复套用
node scripts/show-review-diff.mjs --vol w3 --chunk 7  # 逐条回查德文后再决定是否保留
```


### ★ 第 54 波已收官：w5/4「c. Die Endlichkeit ＋ C. Die Unendlichkeit」批 1 —— 第 5 卷第 5 节（进行中）

**w5/4 批 1 已译完：5 单元 / 42 块 / 126 句**（该节 chunk 共 71 块＝61 正文段 + 9 标题 + 1 个 fn 编者块按契约不译；243 句中已译 126 句，已译块为 bi0–bi41）。全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 块 | 句 | 内容 |
|---|---|---|---|---|
| b1 | w5-4-0 / w5-4-10 | 20 | 51 | bi0「c. Die Endlichkeit」有限性＋引言（bi1–2：事物的有限、有限性带来的哀痛与它的自嘲）；bi3「α. Die Unmittelbarkeit der Endlichkeit」有限性的直接性（bi4–7，含 `ns=0` 空段 bi7）；bi8「β. Die Schranke und das Sollen」界限与应然（bi9–17）；bi18「Anmerkung」注解（bi19：应然在哲学里的新角色与道德） |
| b2 | w5-4-20 / w5-4-24 | 13 | 50 | bi20–bi25 注解续（「你能够，因为你应当」、围绕界限与应然的两种偏见、莱布尼茨的单子与「纸片」式设定、应然自身仍属有限）；bi26「γ. Übergang des Endlichen in das Unendliche」有限者向无限者的过渡（bi27）；bi28「C. Die Unendlichkeit」无限性（bi29–33：无限者作为绝对者的新定义，及 a) 肯定者作为有限者的否定／b) 与有限者的相互规定／c) 二者的自我扬弃作为一个过程） |
| b3 | w5-4-33 | 9 | 25 | bi34「a. Das Unendliche überhaupt」无限者一般（bi35–37：无限者是否定之否定、有限者在无限者中消失）；bi38「b. Wechselbestimmung des Endlichen und Unendlichen」有限者与无限者的相互规定（bi39–41，至「无限者与有限者在质的规定上互为它者」） |

**w5/4 批 1 收官（整节尚未译完）。** 覆盖率 19.93% → **20.07%**（18,361 → 18,487 / 92,117 句；段落 5,606 → 5,640 / 17,948 = 31.42%；标题 533 → 541 / 2,847）。第 5 卷 1,050 → **1,176 句（13.2%）**，**分节进度 5/38**（w5/0–w5/3 整节 100%）。

> **★ 本节剩余边界**：bi42–bi69（28 块 / 117 句）尚未译——bi42–bi50 是「b. Wechselbestimmung」后半（有限者与无限者的相互规定如何展开为一个过程），bi51 是标题「c. Die affirmative Unendlichkeit」肯定的无穷性，bi52–bi69 是该节正文；bi70 是 fn 编者块，按契约不译。**判据：分节名要看块内的 `k="h"` 标题，不要信 `chunk.t`。**

- **★ 本波最关键裁定：`Schranke` 与 `Grenze` 的中文分工**（沿用 wave53 裁定 ⑨）：
  - `Grenze` 一律作「**界限**」；`Schranke` 默认也作「**界限**」——依据：context-w5 条目已写「本卷两者均作界限」＋共享词表同值＋**w5/1、w5/2 已入库 5 处先例均作「界限」**。
  - **仅 4 句**（bi10[2]、bi10[3]、bi10[4]、bi11[0]——德文把二者显式对举或等同处）作「**界限、限度**」；先例＝w4/5 bi120「一个界限或者说一个限度」。
  - **理由**：若全篇作「界限」，这 4 句会变成「这个界限既是界限」的同义反复，中文读不出对举。w5/1–w5/3 已入库的 5 处「界限」**未改动**。
- **★ 术语层（context-w5）**：entries 132 → **133**（+1：`Moralität`→**道德**，全库 193 句 0 miss）、styleGuide 22 → **24**（+2：wave54 分义裁定 + 门务记录）。
  - `Endlichkeit`→有限性、`Unendlichkeit`→无限性、das Endliche→有限者、das Unendliche→无限者、`Sollen`→应然——全库均有存量异例（12 / 18 / 2 / 31 句等），按 wave46 纪律**只作分义登记、不入 entries**（入表会给已入库章节制造 minor 噪音）。
  - `das Affirmative` 在本节与 `das Negative`（否定者）对举处作「**肯定者**」；w5/2 bi30[7] 的「肯定方面」属关系／方面义，是分义，不入 entries。
- **★ 机器门**（复用 `data/_jobs/_gate_w53.mjs`）：5 单元 / 42 块 / 126 句 → **0 critical / 0 major / 0 minor**（dntChecks 5 / termChecks 301）。**门禁查出的 9 处真缺陷已全部修掉**：
  - `Vereinigung`「结合」→「**统一**」（卷级裁定，与 w5/0–w5/3 一致）；
  - `Anderssein`「他者」→「**他在**」（bi10[1]、bi20[3]，wave53 已定「他在」）；
  - `Identität`「同一」→「**同一性**」（bi27[9]，与同节其余处统一）；
  - `Etwas`「有限者」→「**某物**」（bi11[3]，`Etwas` 恒作「某物」，不作「有限者」）；
  - `das Affirmative`「肯定方面」→「**肯定者**」（bi4[1]、bi4[2]、bi4[5]、bi5[4]、bi5[5]、bi5[6]）；
  - doNotTranslate「1.」「2.」漏字面 → bi27[4] / bi27[6] 照录编号；
  - `Ansichsein` 误作「自身内存在」→ bi40[6] 改「**自在存在**」（与 `Insichsein`＝自身内存在严格分开）。
- **★ 逐句回源（126 句全读，导出 DE/EN/ZH 三列 + zh/de 长度比扫描）**：只有 1 条低比句 bi22[1]，人工确认无漏译；另修 4 处：bi35[2]（`er` 指无限者、`Gemüt`→「内心」）、bi5[1]（「das Sein der Endlichkeit」→「**有限性的存在**」）、bi25[3]（`Befriedigung`→「满足自己」）、bi22[9]（英文收紧，en/de 词数比 1.64 → 1.36）。
  **沿用第 53 波教训**：门只保证「没写错字」，不保证「没写漏」和「与前文同词同译」——本波 13 处缺陷里机器门抓到 9 处、逐句回源再抓 4 处。
- **★ QA 读数（基线实测，不是估的）**：全库 **2,551 → 2,558**（critical 0 / major 234→235 / minor 2,317→2,323）。**逐卷：w1 +0、w2 +0、w3 +0、w4 +0**，净增的 7 条全部来自 w5/4 本节——**本波改 context-w5（132→133 条）＋共享词表（+6 行）对存量章节零净影响**。
  w5/4 分节 7 条**逐条回源，0 真缺陷**：`Nichts` 规则被 `Nichtsein` 前缀命中 **6 条**（分义误报，命中处德文是 `das Nichtsein`／`ein Nichtsein`，中文作「非存在」）、`wirklich` 加强义 **1 条**（w5/4#6[2]「真正地解决」，体系义仍作「现实」——列入待裁决 ③）。
  **待办延续**：`qa-trans.mjs` 至今没有机器门那套 ENTRIES_EXEMPT 分义豁免，`Nichts`／`Nichtsein` 全库 22+ 条误报每轮重复报警；给它补齐要改共享脚本、影响 12 个卷，本波未动，建议列独立工作项。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；validate 仍 20 处存量 misnested（w2/w3/w5，与本波无关）；**浏览器实测（端口 8860）w5/4 pairs=71/71、missing=56/56、mismatch=0、emptyZh/emptyEn=29/29、jsErr=0 → OK**（已译 42 块 / 未译 28 块 / ns=0 1 块）；回归 w5/3、w4/15、w3/0、w1/0 全 OK（**failures=0**）；固定 8 页回归 **8/8**。
  - ★ **验收脚本首跑 FAIL 是脚本自己的期望公式不对，不是译文坏**：`web/assets/reader.js` 的渲染规则有三种情形（未译正文块＝2 格 is-missing+空；**未译标题块＝空但不带 is-missing**；**已译 `ns=0` 块＝2 格 is-missing+空**），旧公式没建模后两种。改脚本后通过，**译文一字未改**。
- **可复现性**：3 个构建脚本（`_build_w54a.mjs` / `_build_w54b.mjs` / `_build_w54c.mjs`）重建 5 个 part 文件 → `merge-trans.mjs`（42 块，0 hash 重打）→ `trans-index.mjs` ALIGNMENT OK；**重建产物与入库 `web/data/trans/w5/4.json` 逐块逐字一致**（same=42 / diff=0 / missing=0）。
- **共享词表**：**净增 6 行**（`data/_jobs/w5-4-b1.glossar.csv`）：`Räsoneurs`→理性主义者、`Nicht-Endliche`→非有限者、`verendlicht`→有限化、`Nichtselendes`→非自身者、`Schlecht-Unendliche`→坏的无限者、`Wechselbestimmung`→相互规定。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一批**：**w5/4 批 2 = w5-4-42 / w5-4-49 / w5-4-54 / w5-4-62 / w5-4-68**（5 单元 / 28 块 / 117 句，bi42–bi69），吃完后 **w5/4 整节 100%**（只剩 bi70 的 fn 按契约不译）。**切片已入库**：`data/_jobs/jobs-wave54.json`（18 单元＝w5/4 的 10 单元 + w5/5 的 8 单元）＋ **w5/4 的 10 个 `w5-4-*.in.json` 全部入库**（含本波已译的 5 个与下一批的 5 个）。
  **★ 跨节溢出的 `w5-5-*.in.json`（8 个）本波不入库**（照第 48 波处置：只做目标节）——下一批直接用已入库的 w5-4-42/49/54/62/68 即可，**不要重跑 `make-jobs` 重切 w5/4**（会把 bi0–bi41 再切一遍、白做一遍）。
- **★ 待裁决（未擅自改动已入库的 w1–w4 与 w5/0–w5/3）**：
  ① **★ 本波新增**：`Schranke` 是否全卷统一——「全卷＝限度」需回改 w5/1、w5/2 的 5 处；「全卷＝界限」需回改本节 4 处。本轮采用「默认界限 + 4 句『界限、限度』」的双轨。
  ② **★ 本波新增**：`Wechselbestimmung` 在 w2/1 的存量「交互规定」是否改为「相互规定」（1 句）。
  ③ **★ 本波新增**：`wirklich` 的加强义「真正」（bi6[2]「真正地解决」）是否改「现实」（全库 wirklich 家族 576 句中 466 句作「现实」）。
  ④ **待办延续**：`qa-trans` 是否补机器门那套 ENTRIES_EXEMPT 分义豁免（可消全库 22+ 条 `Nichts`／`Nichtsein` 误报；属共享脚本改动，影响 12 个卷，**本波未动**）。
  ⑤ （沿用第 53 波 ①–⑫，未决）`Eigenschaft`／`Attribut`／`Beschaffenheit` 三词撞名；`das Negative`／`das Positive` 的「否定者／肯定者」分义；`Negation der Negation` bi54[0] 的字面歧义；`das Andere` 四种用字；w4「完满」vs w5「完善」；`Gleichheit mit sich selbst`「与自身的同一」vs「等同」；12 个不入表词的存量异例；共享词表 `Natur`／`Element`／`Zufälliges` 主条对齐；`Wissenschaft`→「学问」w1–w4 约 34 句；`Vorstellung`→「看法」w4 2 句；w5/0 `verschieden` 混用。

### ★ 第 53 波已收官：w5/3「C. Werden 收尾 ＋ 第二章〈Das Dasein〉开篇」整块 **100%** —— 第 5 卷第 4 节

**w5/3 已整块译完：12 单元 / 102 块 / 313 句**（该节 chunk 共 102 块＝89 正文段 + 13 标题，无 fn；313 句全部译出）。全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 块 | 句 | 内容 |
|---|---|---|---|---|
| b1 | w5-3-0 / w5-3-9 / w5-3-20 / w5-3-34 | 43 | 113 | 「C. Werden」收尾（b. Momente des Werdens 存在的环节、c. Aufheben des Werdens 扬弃成为、注解）＋ 第二章开篇（A. Dasein als solches 定在本身 / a. Dasein überhaupt / b. Qualität 质 及其注解） |
| b2 | w5-3-43 / w5-3-53 / w5-3-59 / w5-3-70 | 35 | 109 | b. Qualität 注解续 ＋ c. Etwas 某物（对「实在」概念与上帝概念的批评）＋ B. Die Endlichkeit 有限性 ＋ a. Etwas und ein Anderes 某物与他物 |
| b3 | w5-3-78 / w5-3-86 / w5-3-93 / w5-3-100 | 24 | 91 | b. Bestimmung, Beschaffenheit und Grenze 规定·性质·界限（自在之物、有限者的界限，线／面／点） |

**w5/3 整块收官。** 覆盖率 19.59% → **19.93%**（18,048 → 18,361 / 92,117 句；段落 5,517 → 5,606 / 17,948 = 31.23%；标题 533 / 2,847）。第 5 卷 737 → **1,050 句（11.8%）**，**分节进度 4/38**。

> **★ 本节的真实边界（别被标题骗了）**：w5/3 的 chunk 标题是源文分块的副产物「Anmerkung 4」（分块器取最近的前置标题），**不是节名**。实际内容＝前 21 块（bi0–20，64 句）是第一章「C. Werden」的收尾，后 81 块（bi21–101，249 句）才是**第二章「Das Dasein」（定在）**的开篇，一直走到 B.b「Bestimmung, Beschaffenheit und Grenze」为止；第二章在 w5/4 继续。**判据：分节名要看块内的 `k="h"` 标题，不要信 `chunk.t`。**

- **★ 逐句回源（机器门与 QA 都报 0 的那一半）：验收后补做全库「Negation der Negation」／「否定者」用字对扫，又抓出并修掉 5 处真缺陷**——机器门 0 critical/0 major、QA 的 19 条全是误报，这 5 处两个门都报不出来：
  - **bi92[5]**「das Insichsein des Etwas als Negation der Negation」原作「作为否定的否定**者**的某物」→「作为否定之否定的某物」（「否定者」＝被否定者／否定之人，与「否定之否定」根本不是一回事；同章 bi54[6]／bi54[9]／bi55[0]／bi56[0]／bi61[2] 五处先例均作「否定之否定」，全库先例 w2/11#3、w4/5#155 亦同）。
  - **bi92[6]**「als Negation der Negation」→「作为否定之否定」（与 bi56[0] 同构）。
  - **bi95[2]**「die Negation der Negation」→「否定之否定」（与 bi54[9] 德文完全相同）。
  - **bi45[0]**「ein Inbegriff aller Negationen」原作「一切否定者的总汇」→「一切否定的总汇」（Negationen 是名词，与同句「alles Bestimmte」→「一切被规定者」不同构）。
  - **bi48[0]**「die auf die Negation reflektierende Realität」原作「反思着否定者的实在性」→「反思着否定的实在性」（同句前半 Negation 已译「否定」）。
  → 改动精确落在 **bi45 / bi48 / bi92 / bi95 四个块**；重跑全链后机器门与 QA 读数**完全不变**（说明修的是真问题、且没碰出新问题）。
  **教训：「Negation der Negation」这类固定术语必须全库对扫**——机器门查「禁用词有没有出现」、QA 查「某个德文词对应的中文有没有出现」，两者都只查「在不在」，不查「该在的有没有被写歪」；多一个「者」照样放行。
- **★ 术语层（context-w5）**：entries 97 → **132**（**+35 条纯新增，0 删除、0 改判**）、styleGuide 15 → **22**（+7）。新增 35 条包括：`Ansichsein`→自在存在、`Sein-für-Anderes`→为他存在、`Anundfürsichsein`→自在自为、`Anderssein`→他在、`Unterschiedenheit`→差别、`Nichtsein`→非存在、`Nichtseiende`→非存在者、`Affirmation`→肯定、`Inbegriff`→总汇、`Vollkommenheit`→完善、`Das Bestimmte`→被规定者、`Eigenschaft`→属性、`Attribut`→属性、`Beschaffenheit`→性质、`Grenze`→界限、`Negation`→否定、`Widerspruch`→矛盾、`Linie`→线、`Fläche`→面、`Sinnlichkeit`→感性、`Vernunft`→理性、`Fülle`→充盈、`Unruhe`→不安、`Verhältnis`→关系、`Eins`→一、`Aufheben`→扬弃、`Zufälliges`→偶然者、`Insichsein`→自身内存在、`Macht`→力量、`Substantialität`→实体性、`Realitäten`→实在性、`Entstehen`→产生、`Vergehen`→消逝 等。
  - ★ **`Insichsein`＝自身内存在，与 `Ansichsein`＝自在存在严格分开**（共享词表 row1133 政策，w5/1 存量先例 bi6[1]）：本波把 8 处误作「自在存在」的回改为「自身内存在」，EN 层仍作 being-in-itself（与 w5/1 一致）。
  - ★ **`Eigenschaft`＝属性、`Attribut`＝属性、`Beschaffenheit`＝性质** 三词撞名的分义（本轮定案，见待裁决 ①）。
  - ★ **`Unterschiedenheit`＝差别**（与 `Unterschied` 同值、与 `Verschiedenheit` 相异分工），本波据此把 5 处「差异性」回改为「差别」。
- **★ 机器门判据修正 1 处**：doNotTranslate 的**标签型字面量**（a) b) c) α) β) γ)）改用**词边界**判据（`dntHit()`）——否则会命中词内字串（实测 w5-3-93 bi97[1]「innerhalb)」里的「b)」被误判为缺枚举标签，报成 critical）。按纪律配 3 例自检 → **31 例全 PASS**（原 28 例 + 3 例）。
- **★ QA 读数（基线是实测的，不是估的）**：全库 **2,532 → 2,551**（critical 0 / major 233→234 / minor 2,299→2,317）。**逐卷：w1 +0、w2 +0、w3 +0、w4 +0**，净增的 19 条全部来自 w5/3 本节——**本波改 context-w5（97→132 条）＋共享词表（+13 行）对存量章节零净影响**（w5 用自己的 context 包、其余卷用共享词表，两套规则互不串扰；这也是「先量基线再报数」的必要）。
  w5/3 分节 19 条（1 major + 18 minor）**逐条回源，0 真缺陷，全为分义误报**：`Nichts` 被 `Nichtsein`／`Nichtdasein` 前缀命中 **14 条**、`Dasein` 神学日常义（#43[0]「上帝存在的本体论证明」）1 条、`Allgemeinheit` 分义（#54[2]「普遍者」）1 条、`Moment` 机械力矩（#19[8]「杠杆的机械力矩」）1 条、`Wissenschaft` 书名《哲学百科全书》（#19[8]）1 条、`Sein` 物主代词（#32[3]「它的中介」）1 条。
  **待办延续**：`qa-trans.mjs` 至今没有机器门那套 ENTRIES_EXEMPT 分义豁免，故上述分义每轮都会重复报警；给它补齐需改共享脚本、影响 12 个卷，本波未动，建议列独立工作项。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；validate 仍 20 处存量 misnested（w2/w3/w5，与本波无关；w5/3 b18 是源文底本自身的标签不配对）；**w5/3 浏览器实测（端口 8860）pairs=102、pairHead=13、pairFull=0、zhSent=313=enSent=313、mismatch=0、JS errors=0，状态栏「本节 89/89 段已译 · 313/313 句 · 全书已译 5,606 段 / 18,361 句」**（emptyZh/emptyEn 各 1，来自源文 `ns=0` 空段落，按合同如实留空）；固定 8 页回归 **8/8**。
- **可复现性**：3 个构建脚本（`_build_w53a.mjs` / `_build_w53b.mjs` / `_build_w53c.mjs`）重建 12 个 part 文件 → `merge-trans.mjs`（102 块，0 hash 重打）→ `trans-index.mjs` ALIGNMENT OK；**重建产物与入库 `web/data/trans/w5/3.json` 逐块逐字一致**（same=102 / diff=0 / missing=0）。
- **共享词表**：**净增 13 行**（`w5-3-b1` 11 条 + `b2` 10 条 + `b3` 20 条共 41 条候选，去重后实际新增 13 条：`Nichtseiende`、`Affirmation`、`Temperieren`、`Bestimmungslose`、`Das Bestimmte`、`Andere`、`Realitäten`、`Enzyklopädie der philosophischen Wissenschaften`、`Negation`、`Linie`、`Fläche`、`Fülle`、`Unruhe`）。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一批**：**w5/4**（`c. Die Endlichkeit`，约 10 单元）——切片 `node scripts/make-jobs.mjs --vol w5 --size 25 --limit 12 --prefix wave54`。**★ 波次号说明**：仓库编号是 52 → 53 连续（wave52 文档写「下一批 prefix wave53」，`jobs-wave53.json` 即本波），故下一波是 **wave54**；压缩摘要里写的 wave55 与仓库自身记录矛盾，按仓库记录取 wave54。
- **★ 待裁决（未擅自改动已入库的 w1–w4 与 w5/0–w5/2）**：
  ① **`Eigenschaft`／`Attribut`／`Beschaffenheit` 三词撞名**：本轮定为 属性／属性／性质（依据：共享词表主条 ok + 全库 110 句「属性」对 7 句「性质」+ w5/0 bi14[6] 先例；w4 先例与 w5 存量 3 处一致作「性质」）。**建议维持本轮定案，并请共享词表补记 `Beschaffenheit` 的「性质」变体**。
  ② **★ 本波新增（实测有据）**：`das Negative`／`das Positive`／`Negation` 的「否定者／肯定者」vs「否定／肯定」分义未定——context-w5 条目与共享词表都写「das Negative＝否定、Negation＝否定」，但 w5 卷实际用字是 **否定 135 : 否定者 14**（w5/3 4 处否定者、2 处肯定者），w3／w4 也有大量「否定者」。**建议按「形容词名词化 → 者、抽象名词 → 否定」立规**（与全库多数先例相容），再统一回改 w5/0、w5/2、w3、w4 的存量异例——**本波只修了同句自相矛盾的两处，未动跨卷存量**。
  ③ **★ 本波新增**：`Negation der Negation` 的中文定译——同章 5 处 + 全库先例（w2/11#3、w4/5#155）作「否定之否定」，本波已把 w5/3 的 3 处异例统一；**bi54[0]「die erste Negation der Negation」的字面歧义仍未定**（本波按「第一个否定的否定」译出，德文本身可解作「第一个否定」或「否定之否定」）。
  ④ `das Andere` 在 w5/0–2 的「他者／他物／它者／别的东西」四种用字是否统一回改「他者」。
  ⑤ w5/2 bi17[3]（已统一为「差别」）与 bi21[2]（已统一为「属性」）两处存量是否确认。
  ⑥ w4「完满」与 w5「完善」跨卷不一致是否统一。
  ⑦ 共享词表 `Beschaffenheit` 主条「属性」(ok) vs w4/w5「性质」的修正建议（与 ① 同源，建议合并处理）。
  ⑧ `Gleichheit mit sich selbst` 共享专条「与自身的同一」vs w3/w4「等同」的口径。
  ⑨ 12 个不入表词的存量异例（Mitte／Punkt／Raum／Anfang／Element／Körper／Natur／Sollen／Erfüllung／Erscheinung／Gegenstand／Selbständigkeit）是否统一。
  ⑩ `qa-trans` 的 `Nichts` 规则是否加 `Nichtsein` 豁免（可消全库 22 条误报、基线下移 22；属共享脚本改动，影响 12 个卷，**本波未动**）。
  ⑪ 共享词表 `Natur`（本性/自然）、`Element`（要素/元素）、`Zufälliges`（偶然的东西/偶然者）三处主条与卷内用字的对齐。
  ⑫ （沿用上波）`Wissenschaft`→「学问」w1–w4 约 34 句；`Vorstellung`→「看法」w4 2 句；w5/0 形容词 `verschieden` 3 句「不同于／不同」与 2 句「相异」混用。

### ★ 第 52 波已收官：w5/2「Erster Abschnitt Bestimmtheit (Qualität)」（第一节·规定性（质））整节 **100%** —— 第 5 卷第 3 节收官

**w5/2 已整节译完：9 单元 / 52 块 / 246 句**（该节 chunk 共 53 块＝42 正文段 + 1 个 `ns=0` 空段落 + 9 标题 + 1 个 fn 编者块按契约不译；246 句全部译出）。全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 块 | 句 | 内容 |
|---|---|---|---|---|
| b1 | w5-2-0 / w5-2-16 / w5-2-20 / w5-2-23 / w5-2-29 | 33 | 129 | 存在与无的同一性；命题与概念的展开；雅各布对康德自我意识之 a priori 综合的批评；从存在到无的过渡 |
| b2 | w5-2-33 / w5-2-38 / w5-2-42 / w5-2-48 | 19 | 117 | 巴门尼德与斯宾诺莎的断点；柏拉图《巴门尼德篇》的辩证法；无的规定性（黑暗与寒冷＝光与温暖的缺席） |

**w5/2 整节收官。** 覆盖率 19.33% → **19.59%**（17,802 → 18,048 / 92,117 句；段落 5,474 → 5,517 / 17,948 = 30.74%）。第 5 卷 491 → **737 句（8.3%）**，**分节进度 3/38**。

- **★ 逐句回源（批 2 全 117 句逐句读）修 20 处**：术语漂移 12 处（`Etwas` 作「有者」6 处→「某物」；`Vereinigung`／`Einigung` 作「合一」2 处→「统一」；`Tautologie` 作「重言式」1 处→「同义反复」；`Gedankending` 作「思维物」1 处→「思想物」；`Nichts` 自由改写 2 处→「无」；`Einheit` 作「合为一体」1 处→「相统一」）；**引号跨段失衡 3 处**（bi38[2]–bi38[7]、bi41[2]–bi41[3] 两处雅各布长引，改为「首段开、末段闭」）；措辞 5 处（bi38[16]「思惟掉」→「在思惟中消除」、bi51[1]「他们」→「它们」、bi41[0]「被规定的东西」→「被规定者」、bi36[0] 去「现在」、bi26[0]「直接联系」→「直接联结」）。
- **★ 一处「体例误判」已自查回滚（教训）**：中途曾按「中文「」≡德文 `»…«`」把 17 处标斜体强调的中文引号全部删掉；逐节重验后**已入库的 w5/0、w5/1 共 500 句里有 43 处正是用「」标德文斜体强调**（w5/0 18/23、w5/1 25/27），故全部回滚。**根因：`bi` 是「节内块号」，跨节混用同一张 DE/ZH 对照表会撞键**——第 56/59/60 号探针因此误判了体例基线。**判据：任何用字／体例自检都必须按「逐节配对」做**（`w5-<chunk>-<unit>.in.json` ↔ `web/data/trans/w5/<chunk>.json`）。
- **★ 术语层（context-w5）**：entries 88 → **97**（+9）、styleGuide 12 → **15**（+3）。新增／改判 9 条：`Etwas`→某物、`Vereinigung`→统一、`Einigung`→统一、`Verbindung`→联结、`Kopula`→系词、`Ungetrenntheit`→不可分离性、`Untrennbarkeit`→不可分性、`Affirmatives`→肯定者、`Veränderliches`→可变的。
  - ★ **`Vereinigung`／`Einigung` 在本卷作「统一」**（共享词表主条作「结合」／「合一」）：依据是 **w5/0 bi14[4]、w5/1 bi33[4]、w5/1 bi37[1] 的已入库先例均作「统一」**（如 w5/0「die Vereinigung Entgegengesetzter」已作「对立者的统一」），且 w5/2 三处与 `Einheit`（统一）同指同一概念；已在 context-w5 登记理由（卷级包优先级高于共享词表）。
  - ★ **`Untrenn-` 族与 `ungetrennt-` 族严格分开**：`Untrennbares`（不可分者，w5/0）＋`Untrennbarkeit`（不可分性，w5/1 bi6[0] 已入库先例）对 `ungetrennt`（不可分离的，共享词表）＋`Ungetrenntheit`（不可分离性）——本波原把两者译反，已改正 3 处。
- **★ 机器门新增 ENTRIES_EXEMPT 分义豁免 1 条**（`Objekt` 名词「客体」与 `das Objektive`「客观者」分开），配 2 例自检 → **23 例全 PASS**；两批机器门均 **0 critical / 0 major / 0 minor**（9 单元 / 52 块 / 246 句 / termChecks 484 / dntChecks 9）。
- **分义与误报（不改译文，已逐条登记进 context-w5 的 styleGuide）**：qa 对 w5 报 **15 条（major 6 / minor 9）＝存量 8 条 ＋ 本波 7 条，0 条真缺陷**。本波 7 条全为误报：`wirklich` 词族（分义：真正／实际上，w5/2#17）、`Sein` 作物主代词（#17）、`Nichts` 被 `Nichtsein` 前缀命中（#20、#47）、`Dasein` 神学日常义「上帝的存在」（#21、#46）、`Objekt` 被 `das Objektive` 词干命中（#50）。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；validate 仍 20 处存量 misnested（w2/w3/w5，与本波无关）；**w5/2 浏览器实测（端口 8860）pairs=53、mismatch=0、zhSent=246=enSent=246、jsErr=0，状态栏「本节 43/43 段已译 · 246/246 句」**（`missing=2 / emptyZh=1 / emptyEn=1` 全部来自源文 `ns=0` 的空段落 bi5，按合同如实留空，与 w4/12、w4/14 同一渲染行为）；固定 8 页回归 **8/8**。
- **可复现性**：2 个构建脚本（`_build_w52a.mjs` / `_build_w52b.mjs`）重建 9 个 part 文件 → `merge-trans.mjs`（52 块）→ `trans-index.mjs` ALIGNMENT OK；重建产物与入库 `web/data/trans/w5/2.json` 同源。
- **共享词表**：**+29 条**（`data/_jobs/w5-2-b1.glossar.csv` 12 条 ＋ `w5-2-b2.glossar.csv` 17 条），另 `Kopula` 由 `unsicher` 升为 `ok`（「连系词」→「系词」：w1–w4 已入库 9 处 ＋ w5/2 1 处均作「系词」，0 miss）。**未入表的**：`Verbindung`（w1–w4 共 165 处用字不统一）、`Kälte`／`Abwesenheit`／`Taler`（各在 w1–w4 有 miss）——按 wave46 纪律，全库用字不一致的词只记 context-w5 分义、不入共享词表。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一批**：**w5/3**（切片 `node scripts/make-jobs.mjs --vol w5 --size 25 --limit 12 --prefix wave53`）。
- **★ 待裁决（沿用上波清单，未擅自改动已入库的 w1–w4）**：① `Wissenschaft`→「学问」w1–w4 约 34 句；② `Vorstellung`→「看法」w4 2 句；③ 共享词表主条与本卷用法的五处分叉；④ w5/0 形容词 `verschieden` 3 句作「不同于／不同」与 2 句作「相异」混用（w5/1 已统一为「相异的」，w5/0 是否回拉待定）；⑤ **本波新增：w1–w4 的 `Etwas` 共 35 处，24 处作「某物」、11 处另译——抽查多为日常义复合词（`Etwas Göttliches`＝某种神圣的东西、`Etwas anderes`＝另一回事），不属逻辑学「某物」义，是否有逻辑义漏用待人工确认**。


### ★ 第 51 波续：w5/1「Allgemeine Einteilung der Logik」（逻辑学的一般划分）整节 **100%** —— 第 5 卷第 2 节收官

**w5/1 已整节译完：8 单元 / 59 块 / 192 句**（该节 chunk 共 60 块＝55 正文 + 4 标题 + 1 个 fn 按契约不译；192 句全部译出）。全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 块 | 句 | 内容 |
|---|---|---|---|---|
| b5 | w5-1-0 / w5-1-8 / w5-1-20 | 26 | 84 | 逻辑学的一般划分（概念的演绎·划分的性质·康德哲学的先验转向·「我」作为纯粹知识） |
| b6 | w5-1-26 / w5-1-33 / w5-1-40 | 19 | 79 | 开端的奠基（绝对真理必是结果·往前行进即回到根据·逻辑推进的基本要求） |
| b7 | w5-1-45 / w5-1-57 | 14 | 29 | 智性直观与开端（存在的一般划分·质—量—度三联·康德范畴的非常规排列） |

**w5/1 整节收官。** 覆盖率 19.12% → **19.33%**（17,610 → 17,802 / 92,117 句；段落 5,419 → 5,474 / 17,948 = 30.50%）。第 5 卷 299 → **491 句（5.5%）**，**分节进度 2/38（w5/0、w5/1 均已完成）**。

- **★ 「质—量—度」三联的译法定案（本波最有价值的术语发现）**：w4《尼伦堡文集》里的《哲学百科全书》（w4/5）就是同一材料的早期稿，且已入库——**「Die Größe oder Quantität」作「量，或量」**、「Die Größe ist entweder kontinuierlich oder diskret」作「量要么是连续的，要么是离散的」、「Das Maß ist ein spezifisches Quantum」作「度是一个特定的量数」。据此定案：**Qualität＝质、Quantität＝量、Größe＝量、Quantum＝量数、Maß＝度、Relation＝关系、Modalität＝模态**（Maß 在 w1/w3 的伦理、法律语境作「尺度」、Größe 在物理量语境作「大小」，均属分义）。前四个词写进 context-w5 的 **entries**（已做全库用字对扫、0 miss）；**Größe 与 Maß 只进 styleGuide 分义、不入条目表**，以免给已入库章节制造 minor 噪音。
- **★ 机器门新增 ENTRIES_EXEMPT 分义豁免（4 条，各配自检用例）**：Sein 作物主代词「他的」、Subjektiv 族（主观者／主观的）不按 Subjekt 判、unterscheiden 派生形（Unterscheiden／Unterscheidung）不按 Unterschied 判、Nichtsein（非存在）不按 Nichts 判。**任何门判据改动都必须配自检用例**，现 17 例全 PASS。
- **★ 逐句回源（机器门抓不到的那一半）**：批 5 修 11 处，其中 **bi7[6] 是整段漏译**（「Dieses Tun sollte aber nicht mehr Bewußtsein genannt werden…」后半段整段丢失，机器门 0 FAIL 也照样漏——门只保证「没写错字」、不保证「没写漏」）；批 6 修 4 处，其中 **bi28[3] 漏译「mit Freiheit」**；批 7 修 0 处（29 句回源全过）。
- **★ QA 抓出 1 条真缺陷并已修（批 6 的遗留）**：**bi44[3]「Die wirkliche Entwicklung der Wissenschaft」原译「科学的实际发展」→ 改「科学的现实发展」**。依据：w5/1 bi8[2]「der wirkliche Fortschritt」已作「哲学的现实推进」，且全库 wirklich→「现实」515 句占压倒多数（「实际」仅 12 句）。**教训：每批合并后必须跑 qa-trans**——批 6 当时漏跑，批 7 跑时才暴露；修法走「重跑构建脚本 → merge-trans」（merge 按块键增量合并，不影响其他块）。
- **分义与误报（不改译文，已逐条登记进 context-w5 的 styleGuide）**：qa 对 w5 报 **8 条，全为误报**——`Dasein` 神学日常义「上帝的存在」（w5/0#3）、bi35[0] 短句 zh/de 比 0.20（w5/0#35）、bi44[6]「ohne Hülle」译「脱去外壳」而无显式否定（w5/0#44）、源文把「Wissenschaft」误断为「Wissen schaft」（w5/0#54）、**「Sein Hauptgedanke」作物主代词「他的主要想法」（w5/1#7）**、**「das Subjektive」主观族 2 处（w5/1#10、w5/1#57）**、**「Nichtsein」被「Nichts」前缀命中（w5/1#36）**。**0 条真缺陷**。
  ★ **待办（不影响本波交付）**：`qa-trans.mjs` 尚无机器门那套 ENTRIES_EXEMPT 分义豁免，故上述分义每轮都会重复报警；给它补齐需改共享脚本、影响 12 个卷，本波未动，建议列为独立工作项。
- **★ 源文讹字（登记待勘，未改源文）**：w5/1 bi55[1] 源文作「**Ober** die Abweichung…」，据上下文应为「Über」（同段其余各处均作 Über）。按「不增补原文没有的内容」的契约，译文按义译出「关于这一划分与范畴通常排列方式之间的偏离」，**源文未动**。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w5/1 浏览器实测（端口 8860）pairs=60 = expected 60、missing=0、mismatch=0、emptyZh=0、emptyEn=0、jsErr=0**（整节译完，渲染零缺口）；回归页 w5/0（65/65）、w4/15（81/81）、w3/0（74/74）、w1/0（70/70）全 OK；固定 8 页回归 **8/8**。
- **可复现性**：3 个构建脚本（`_build_w51e.mjs` / `_build_w51f.mjs` / `_build_w51g.mjs`）重建 8 个 part 文件 → `merge-trans.mjs` → `trans-index.mjs` ALIGNMENT OK；重建产物与入库 `web/data/trans/w5/1.json` 同源。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一批**：**w5/2**（切片 `node scripts/make-jobs.mjs --vol w5 --size 25 --limit 12 --prefix wave52`）。w5 共 38 分片 / 8,925 句，本波收掉 2/38（491 句）；按当前节奏（每轮约 190 句）仍需数十轮；w5 是本项目最长的卷。
- **★ 待裁决（沿用上波清单，未擅自改动已入库的 w1–w4）**：① `Wissenschaft`→「学问」w1–w4 约 34 句；② `Vorstellung`→「看法」w4 2 句；③ 共享词表主条与本卷用法的五处分叉；④ **w5/0 形容词 `verschieden` 有 3 句作「不同于／不同」与 2 句作「相异」混用**，w5/1 已统一为「相异的」，w5/0 是否回拉待定。

### ★ 第 51 波已完成：w5/0「Erster Teil. Die objektive Logik」（《大逻辑》第一部分·客观逻辑）序言与导言 整节 **100%** —— **第 5 卷开卷并收官首节**

**第 51 波（2026-10-21）译完 w5/0 全节 11 单元 / 64 块 / 299 句**（w5/0 全节 65 块 / 299 句，本波覆盖 **100%**；其中 1 个 fn 块 bi64 按契约不译、5 个标题块照译），全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 块 | 句 | 内容 |
|---|---|---|---|---|
| b1 | w5-0-0 / w5-0-8 / w5-0-14 | 17 | 80 | 第一版序言（形而上学的没落·康德的外显学说·逻辑学自身的命运）、第二版序言（知性与理性·意识的推进·概念的内在发展）、论语言与思维形式·逻辑的「超自然」·极性范畴 |
| b2 | w5-0-17 / w5-0-20 | 10 | 55 | 序言之续（思维规定不能只当作形式·概念的内在发展·健康理性对学校法则的反感）、导言（逻辑学作为科学只能从事情本身开始·柏拉图七易其稿·1831 年 11 月 7 日柏林） |
| b3 | w5-0-27 / w5-0-37 / w5-0-42 | 20 | 84 | 序言之续（思维与客体·关于逻辑的实在性·批判哲学与后来的观念论·逻辑学为何被轻视）、导言（逻辑科学之概念的演绎·柏拉图式辩证法·康德抬高辩证法·思辨的最难一面） |
| b4 | w5-0-47 / w5-0-53 / w5-0-60 | 17 | 80 | 导言收尾（康德称赞逻辑学·两千年的精神劳作·逻辑学必须改造·方法与概念的体系）、逻辑学与语法的两种看点·逻辑学是影子的王国·思维获得独立自主 |

**w5/0 整节收官。** 覆盖率 18.79% → **19.12%**（17,311 → 17,610 / 92,117 句；段落 5,360 → 5,419 / 17,948 = 30.19%）。第 5 卷 0 → **299 句（3.4%）**，**分节进度 1/38（w5/0 完成）**。

- **★ 新建 w5 术语层 `data/_jobs/context-w5.json`**（第 5 卷首次建包）：**entries 84 条 / forbidden 30 条 / doNotTranslate 26 条 / styleGuide 10 条**。风格规则首条即「权威顺序（不可颠倒）」，并含「词根一致」条款（check-policy 的两条硬性检查均通过）。
  - ★ **入表前先做「用字对扫」，只把能在本卷一致落地的词写进 entries**：`Wissenschaft`→科学（共享词表明写「不作『学术』」，本波据此把 7 处「学问/学术」改回「科学」）、`System`→体系（共享词表定译）、`Moment`→环节、`Verschiedenheit`→相异 与 `Unterschied`→差别 严格分工、`Identität`→同一性、`Totalität`→总体性、`Dasein`→定在、`Geist`→精神、`Begriff`→概念、`Vorstellung`→表象。
  - ★ **按 wave46 教训，以下三类**不**入条目表**（入表会给全卷制造 minor 噪音），只记 styleGuide 分义：① `Leben`（序言里是日常义「生活」，仅第二部分第三章标题与体系语境作「生命」）；② `Ursache`（「Ursache genug」＝「有充分理由」，固定短语不适用「原因」）；③ `Form`（QA 的词条正则 `Form[a-z]{0,3}` 会把 **Formeln（公式）** 一并命中，故 `Form`＝形式、`Formel`＝公式 二者只登记分义、不做机器约束）；④ `Objekt` 与 `Allgemeinheit` 保留在表内但本波译文一律遵其词根（「利益的对象」→「利益的客体」、「das Allgemeine / die Allgemeinheiten」→「普遍性」）。
- **★ 本波真实修掉的缺陷 6 类（机器门与 QA 各出一半，不是 QA 噪音）**：
  1. **整段漏译（最重的一处）**：w5-0-17 bi18[6] 把「so ungerecht es ist zu verkennen, daß sie ihr Feld in der Erkenntnis haben … und zugleich, daß sie wesentliches Material für das Denken der Vernunft sind」整条插入语漏掉——机器门靠 `Vernunft`→理性 的禁译规则当场抓到（ZH 里有「知性」而无「理性」）。
  2. **中文里残留英文单词**：w5-0-17 bi16[9]「这类情感与精神的 **determinations** 向我们显现出来」→ 改「诸规定」。
  3. **DNT 命中处理**：`z.B.`（无空格写法）触发 `B.` 的 DNT 字面，机器门的豁免规则只认「z. B.」带空格 → 豁免正则改为 `z\.\s*B\.`（本波 3 处命中，全部为合法豁免）。
  4. **政策词族回改**：bi16[4]「与亚里士多德上述**看法**相抵触」→ **表象**（Vorstellung 词族，机器门 major）；bi3[3]「上帝的存在的证明」按 w4/12、w4/13 已入库先例作「上帝的**存在**」（神学日常义，**登记为分义误报**）。
  5. **用字回改 7 处**：`Logik`→逻辑学 3 处、`Denken`→思维 1 处、`Wissenschaft`→科学 7 处、`Zweck`→目的 1 处、`Wahrheit`→真理性 1 处、`Bestimmung`→诸规定 1 处、`Vorstellung`→总体表象 1 处、`Objekt`→客体 1 处、`Allgemeinheit`→普遍性 3 处。
  6. **否定词漏译**：bi25[2]「ohne weiteres anzuwenden」译作「径直运用」缺否定，改「无须多言地运用」（QA 报 major）。
- **分义与误报（不改译文，已逐条登记进 context-w5 的 styleGuide）**：本波 qa 对 w5 报 **27 条 → 修后 8 条 → 修后 1 条**。最终剩下的 1 条是 `Dasein`→禁「存在」：**神学日常义「上帝的存在」**，与 w4 已入库的 2 条同类（w4/12 bi25[3]、w4/13 bi8[12]），按分义登记、机器门设豁免，**0 条真缺陷**。
- **术语层（共享词表）**：**+27 条新译名**（`data/_jobs/w5-0-b1.glossar.csv` → `merge-glossar.mjs`）：rationale Psychologie 理性心理学、natürliche Theologie 自然神学、Allerheiligstes 至圣所、exoterisch 外显的、Hirngespinste 头脑的幻影、Endursachen 终极原因、medianische Ursachen 中介原因、Gärung 发酵、Systematisierung 体系化、Formalisismus 形式主义、Erwerbung 获取、Muße 闲暇、Denkform 思维形式、Denkverhältnisse 思维关系、Partikel 虚词、Augment 增音前缀、Flexionszeichen 屈折标记、Substantiv 名词、Verb 动词、Polarität 极性、Untrennbares 不可分者、Abbreviatur 缩略词、Epitom 概括、Immanenz/immanent 内在性/内在的、Erschließen 推演、Empirismus 经验主义。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w5/0 浏览器实测（端口 8860）pairs=65 = expected 65（64 已译块＋1 fn）、missing=0、mismatch=0、emptyZh=0、emptyEn=0、jsErr=0**（整节译完，渲染零缺口；批 3 前该页的 missing=74／emptyZh=37 全部来自未译块）；回归页 w4/15（81/81）、w3/0（74/74）、w1/0（70/70）全 OK；固定 8 页回归 **8/8**。
- **★ 批 3 / 批 4（w5/0 收官）追加记录**：
  - **机器门判据升级（本波最有价值的结构性改进）**：① 禁译判定由「中文含宜译词即跳过」改为**按德文出现次数与中文宜译词次数比对**——原规则会漏掉同一句里第二次误译（例：bi35[2]「Realität…Realität」首处作「实在性」、次处误作「现实性」，因句中已含「实在性」而被整体跳过）；② **补上 entries 一词一译检查**（此前只有 `qa-trans.mjs` 有、机器门没有，这是真缺口）；③ 判据改动另以 **8 例自检脚本**（`_gate_selftest.mjs`）回归，确认既抓得住目标缺陷、又不误报正确译法。
  - **本波真实修掉的缺陷 17 类（机器门 + 逐句回源 + 跨卷用字对扫三方合力）**：Realität 误作「现实性」2 处、Objekt 误作「对象」3 处、Vorstellung 误作「看法」2 处、real 词族误作「现实的」2 处、Wesen 误作「本性」1 处、Denkbestimmung 误作「思维的规定」2 处、Zweck 误作「有意」1 处、Inhalt 误作「充实」1 处、Verschiedenheit 误作「不同」1 处、Unterschied 误作「差异」1 处、Methode 误作「办法」1 处、Realitäten 误作「现实」1 处、「她」用于抽象概念 1 处、简繁误写「規定」1 处、**漏译 1 处**（bi60[6]「die Wahrheit zu enthüllen」漏「真理」）、wahrhaft 误作「真实认识」1 处、Wissenschaft 同句内两译 2 处。
  - **★ 术语层方向性错误已纠正**：context-w5 的 `Existenz` 禁译规则原写成「禁『存在』宜『定在』」，**方向反了**——共享词表、`qa-trans.mjs` 的 `BUILTIN_FORBIDDEN` 与已入库实测三处证据一致（w1–w4 共 105 句 `Existenz` 中 **104 句作「存在」、0 句作「实存」**），已改为「禁『定在』宜『存在』」。同时补入 `Materie` 条目与禁译（禁「质料」宜「物质」，w4 已入库先例），并把 styleGuide 里与共享词表冲突的「das System＝系统」改为「体系」。
  - **分义与误报（不改译文，已逐条登记进 context-w5 的 styleGuide）**：qa 对 w5 报 **4 条，全为误报**——`Dasein` 神学日常义「上帝的存在」、bi35[0] 短句 zh/de 比 0.20（中文天然只有德文的 0.23–0.30，整块一致即无漏译）、bi44[6]「ohne Hülle」译「脱去外壳」而无显式否定、bi54[1] 源文把「Wissenschaft」误断为「Wissen schaft」致 entries 规则误报。
- **可复现性**：4 个构建脚本（`_build_w51a.mjs` / `_build_w51b.mjs` / `_build_w51c.mjs` / `_build_w51d.mjs`）重建 11 个 part 文件 → `merge-trans.mjs`（64 块）→ `trans-index.mjs` ALIGNMENT OK；重建产物与入库 `web/data/trans/w5/0.json` 同源。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一批**：**w5/1（8 单元 / 192 句，任务文件 `data/_jobs/w5-1-{0,8,20,26,33,40,45,57}.in.json` 已切好）**。**注意**：w5 共 38 分片 / 8,925 句，本波收掉 1/38（299 句）；按当前节奏（每轮约 135 句）需数十轮；w5 是本项目最长的卷。
- **★ 跨卷待裁决清单（本波查出，**未**擅自改动已入库的 w1–w4，留给下一波/用户裁决）**：
  1. **`Wissenschaft`→「学问」**：w1–w4 已入库 34 句含「学问」而无「科学」、另 7 句同句兼有。抽样确认至少 3 句是 1:1 对应 `Wissenschaft`（w1/0 b9、w1/6 b1、w1/11 b37），其余多为 `Gelehrsamkeit/gelehrt` 的正当译法。共享词表定 `Wissenschaft`＝科学、不作「学术」，本波已把 w5/0 的 2 处（同句内两译）改齐。**是否全库拉平需逐句回源甄别约 34 句，建议列为独立工作项**。
  2. **`Vorstellung`→「看法」**：w4/11 b37、w4/15 b21 共 2 句（w4/13、w4/15 另有「设想」已作为分义登记在案）。共享词表明定「表象」，w4 包**未**登记「看法」这一分义。**建议或统一为「表象」（与 w5 的做法一致），或补登记分义**。
  3. **共享词表主条与本卷用法的五处分叉**：`Sinn`＝意味／本卷「感觉」、`Willkür`＝任意／本卷「任性」、`Stoff`＝质料／本卷「材料」、`Ausdruck`＝说法／本卷「表达」、`Anstoß`＝推动力／本卷「阻碍」。已在共享词表**追加同源并存条目**、并在本卷 styleGuide 登记分义，**未改动已入库卷**；跨卷拉平与否待裁决。

### ★ 第 50 波已收官：w4/15「2. [Beurteilung der] Verhandlungen in der Versammlung der Landstände des Königreichs Württemberg im Jahr 1815 und 1816」（符腾堡王国等级议会评述·**续篇**）整节 **100%** —— **第 4 卷收官**

**第 50 波（2026-10-21）一次做完 w4/15 整节 14 单元 / 80 块 / 366 句**（含 7 个 `ns=0` 空段落，如实输出 `en: []` / `zh: []`；另有 1 个 fn 块 bi80 按契约不译），全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 块 | 句 | 内容 |
|---|---|---|---|---|
| b1 | 0 / 8 / 14 / 21 / 26 | 32 | 143 | 旧宪法的认真程度、形式法原则、王家宪法与等级议会的对立、第五个预备条款 |
| b2 | 32 / 39 / 44 / 47 / 55 | 30 | 141 | 文书吏之弊的发现与批判、格明根报告、格里辛格意见书、等级议会的最后通牒 |
| b3 | 62 / 69 / 74 / 79 | 18 | 82 | 「一位一票」之争、休会与散会、新宪法草案与六条款的落幕 |

**w4/15 整节 14 单元 / 80 块 / 366 句已全部译完。** 覆盖率 18.40% → **18.79%**（17,311 / 92,117 句；段落 5,360 / 17,948 = 29.86%）。第 4 卷 5,135 → **5,501 句（100%）**，**分节进度 16/16 —— 第 4 卷（Nürnberger und Heidelberger Schriften 1808–1817）整卷收官**。

- **★ 首轮机器门 7 条真缺陷已修**：6 条 EN 侧缺 DNT 日期点号（u62 bi64[0]、u62 bi68[3]、u69 bi69[5]、u74 bi74[4]、u74 bi77[7]、u74 bi77[9]）＋ 1 条 `Verstand` 误作「理智」（u69 bi70[4]→「知性」）。
- **★ 体例裁定①：德式日期点号**（先例考证 w4/10–w4/14 全库统计）——点号**不是文体特征**，只为保住 DNT 字面 `1.` / `2.` / `3.`；**日号末位为 1/2/3 时 EN 与 ZH 两侧都保留点号，否则两侧都不带**（w4/14 先例：「3 月 22. 日」有点、「3 月 15 日」无点）。本节 29 处带点 / 71 处不带，EN/ZH 完全对称。
- **★ 体例裁定②：编者方括号**（先例考证 w4/10–w4/14：110 处中两侧同弃 24 / 两侧同留 73 / 仅一侧 9，后者以纯语法插入为主）——**实词编者补入（专名、实词）EN/ZH 两侧都保留、中文侧译出内容并用半角方括号；纯语法插入（冠词、连词、介词、动词变位、断词连字符）两侧都弃**。本节 12 处实测：两侧同留 5 / 两侧同弃 7 / **不对称 0**（据此修 4 处：u14 bi20[8]、u32 bi35[6]、u55 bi58[4] 删 EN 侧语法括号；u44 bi46[4] 中文侧补 `[分支]`）。
- **★ 用字对扫（全卷 de→zh 统计）又查出并修 17 处**：bi77[4]/[5] **主句归属错位** 1 处（主句「der Unwille gegen Schreiberei-Unfug laut geworden」被提前放进 [4]，[5] 只剩引文残片 → qa 报 zh/de 0.22、en/de 0.22 两条 major，已把主句移回 [5]）；**「宪制」违反硬禁** 3 处（bi58[4]「内在宪制」→「内在宪法」；bi27[2]「宪制与立法上的安排」→「宪章与立法上的安排」；bi70[0]「宪章契约」→「宪法契约」——机器门只查「政体」抓不到「宪制」，须靠人工回源）；用字不一致 6 处（`Prinzipal`「中坚」→「头目」、`Landplage`「盘剥」→「灾祸」、`Schreiberei`「文书吏事务/这件事」→「文书吏衙门」×3）；**漏译地名「（来自）阿伦」2 处**（bi21[0]、bi9[7]）；EN 收紧 2 处（bi30[0]、bi77[5]）。
- **★ 补齐 `ns=0` 空段落 bi78**：现行 `make-jobs.mjs` 第 46 行会跳过零句块（`if (b.k === 'p' && !sents.length) return;`），导致 bi78（`<p> </p>`，hash `ztntfp9zlo`）没进任何 job 单元，w4 段落覆盖卡在 2522/2523。已把该块补进 `w4-15-74.in.json` 与构建脚本，以 `en: []` / `zh: []` 如实落盘（与 wave49 的 8 个空段落同一处理）→ w4 段落 **2523/2523 = 100%**。**后续分节若遇 `ns=0` 块，须同样手动补进 job 文件。**
- **分义与误报（不改译文，已逐条登记进 context-w4 的 wave50 分义）**：本节 qa 报 **190 条（major 23 / minor 167）**。
  23 条 major **全部为分义误报或规则性例外，0 条真缺陷**：`Vorstellung` 词族 10（本节 Vorstellung 一律行政语境的「想法/看法/设想/陈述」，非《精神现象学》的「表象」）＋ 小写 `wirklich` 词族 9（承 wave47／wave49 分义，「真正/事实上」不带「现实」字根）＋ `Idee` 词族 1（bi20[6]「科塔博士先生思想」＝思想，非观念）＋ 长度比 2（bi37[0] 拉丁引文 zh/de 1.34；bi42[4] 德文分词计数 en/de 1.62）＋ 否定词 1（bi44[5]「很难」被误判为缺否定）。
  167 条 minor 全是共享词表一致性提示（分义：Interesse→利害关系 10、Vorstellung→表象 10、Mitte→中项 9、Rede→演辞 9、Übel→恶 8、Verhältnis→关系 7、Klasse→班级 7、Darstellung→表述 6、Folge→后果 6、Tätigkeit→行动 5、Vortrag→讲授 5、Erläuterung→诠释 5…）——本节是行政/政治语汇，与《精神现象学》取向的词表规则天然冲突。
- **术语层**：共享词表 **+46 条**（`data/_jobs/w4-15-b1.glossar.csv`），其中 `Prinzipal`／`Gerichtsschreiber` 由 `unsicher` 升为 `ok`（全卷 0 miss 已验证），`Konkurrenz` **保留 `unsicher`**（w4/14 3 处作「竞争」、w4/15 2 处作「同意」，全局词表单一 zh 不能两义同包）。
  context-w4：**entries 468 → 503（+35 条）**，另 2 条既有条目加注 wave50 分义（`Vorstellung`、`Vortrag`）＋ 1 条 styleGuide 记录（新定术语清单、两条体例裁定、门务记录）。
  ★ **与 wave46 教训的差异**：wave46 一次加 13 条条目使全卷 QA minor 从 874 涨到 1,294（+420）；本波 35 条**逐条先做全卷用字对扫、确认 0 miss 后才写入**，QA minor 前后均为 1,396（w4 卷），新增告警 **0**。
  ★ 仍按既定体例**不入条目表**的（因全卷用字不一致、写入会给已入库章节制造 minor）：`Landtag`（w4/14 3 处另译）、`Konsulent`（w4/10「法律顾问」）、`Amtsschreiber`（w4/14「文书官」）、`Schreiberei`（机构义/活动义两译）、`Konkurrenz`（两义）、`Gleich`（w4/14 的 das Gleichgewicht 同形异义）——全部记入 styleGuide。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w4/15 浏览器实测（端口 8860）pairs=81 = expected 81（80 译块＋1 fn）、mismatch=0、emptyZh=7、emptyEn=7、missing=14、jsErr=0**（missing/empty 全部来自 7 个 `ns=0` 空段落，合同规定如实留空，与已验收的 w4/12、w4/14 同一渲染行为）；w4/14（104/104）、w4/13（29/29）、w4/12（58/58）复测通过；固定 8 页回归 **8/8**。
- **可复现性**：5 个构建脚本重建 14 个 part 文件 → `merge-trans.mjs`（80 块）→ `trans-index.mjs` ALIGNMENT OK；重建产物与入库 `web/data/trans/w4/15.json` 同源。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一节**：w4 全部 16 节已 100% 完结，**第 4 卷整卷收官**；下一卷为 **w5（Wissenschaft der Logik，《逻辑学》，38 个分片）**，切片 `node scripts/make-jobs.mjs --vol w5 --size 25 --limit 10 --prefix wave51`（**`--limit` 是单元数上限**，但循环按分片推进，一次通常会吃完整片；目标节已 100% 时会滚到下一节并覆盖 `jobs-<prefix>.json`，第 48 波踩过）。


### ★ 第 49 波已收官：w4/14「2. [Beurteilung der] Verhandlungen in der Versammlung der Landstände des Königreichs Württemberg im Jahr 1815 und 1816」（符腾堡王国等级议会 1815/1816 年审议评述）整节 **100%**

**第 49 波（2026-10-20）一次做完 w4/14 整节 15 单元 / 103 块 / 402 句**（含 8 个 `ns=0` 空段落，如实输出 `en: []` / `zh: []`；另有 1 个 fn 块按契约不译），全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元（块区间） | 内容 |
|---|---|---|
| b1 | 0 / 8（bi 0–17） | 评述缘起：德意志君主国的完成、符腾堡等级议会审议的公布、33 期史料的编纂；马基雅维利与罗马元老院 |
| b2 | 18 / 25（bi 18–30） | 国王的主动权与等级议会的陈情权、选举法与官吏排除、两院制比较、议员的社会来源 |
| b3 | 31 / 39（bi 31–45） | 投票资格的心理预期与担保、旧等级议会的法权、宪法的补充与林普堡伯国的臣属关系 |
| b4 | 46 / 56（bi 46–60） | 等级会议与「真实的世界情势」、契约／政权与法院、委员会的国库与薪俸 |
| b5 | 61 / 68（bi 61–74） | 教派与信仰之争、百年不正义与实定法权（「权利不会丧失」）、对宪章的敌意 |
| b6 | 75（bi 75–78） | 「魔鬼代言人」的义务、宪章的公布与形式 |
| b7 | 79 / 84 / 91 / 100（bi 79–102） | 王室决议与形式之争、少数派的抗议、宪章文本的批评与结论 |

**w4/14 整节 15 单元 / 103 块已全部译完。** 覆盖率 17.96% → **18.40%**（16,543 → 16,945 / 92,117 句；段落 5,178 → 5,280 / 17,948 = 29.42%）。第 4 卷 4,733 → 5,135 句（93.3%），**分节进度 15/16**。

- **切片**：沿用第 48 波切出的 15 个 `data/_jobs/w4-14-*.in.json` 与 `jobs-wave49.json`（本节 15 单元 = 402 句）。上一会话留下残局（5 个单元已落盘），本会话主译其余 10 个单元（268 句）。
- **★ 本波修正 18 处**（机器门 0 FAIL 之后、QA 之前做的回源核对与政策复核；全部已改并同步 patch 7 个构建脚本，重建后与入库文件**逐块 103/103 一致**）：
  - **`Geist` 1 处**：bi65[0]「in allen Geistern」原作「心灵」，按 context-w4（Geist＝精神，禁「心灵」「灵魂」）改回「精神」——与 wave48 的同类修正一致。
  - **`Wirklichkeit` 1 处**：bi6[5]「eine fünfundzwanzigjährige Wirklichkeit」原作「实际」，按本条（名词本体带「现实」根）改为「现实」——**全卷 71 处大写名词里唯一漏根的一处**（其余 70 处均带「现实」）。
  - **同句自撞 2 处**：bi19[0] 同一句里「陈情」同时译了 `Vorstellungen` 与 `Vortrag`，已把 `Vortrag` 改为「呈递」，拆开撞词（`Vorstellung` ＝向国王呈递的「陈情」，`Vortrag` ＝「呈递」）。
  - **小写 `wirklich` 13 处：未改**。context-w4 的 `Wirklichkeit` 条目已登记 wave47 分义——小写 `wirklich` 日常义「真正／确实」不带「现实」字根，属词族规则的**词形误报，不改**；本波一度按词族表把这 13 处统一改成「现实」，回源核对后确认与已登记分义冲突，已全部回退并登记进 context-w4（全卷 w4/0–13 同型 22 处，惯例一致）。
  - 另：`Ständeversammlung` 误作「等级议会」7 处 → 改「等级会议」（与 `Landstände`＝等级议会严格分开）；德式日期「22. März」「3. April」等 6 处按 DNT 逐字保留（中文侧保留日号点号，如「3 月 22. 日」）；bi100[0]「目的的的」重复助词改写；EN 词数比失衡 1 处重分配残句；误植英文 1 处、多余「政权更迭」→「政府更迭」1 处、字面误字 1 处。
- **术语层**：共享词表 **无新增**（Staat＝国家、Verfassung＝宪法、Konstitution＝宪章、Ständeversammlung＝等级会议、Reichsstände＝帝国等级、Regierung＝政府、Materie＝物质、Nationalehre＝民族荣誉 等均已在表；`Landstände` 共享词表作「地方等级」，本卷按 context-w4 作「等级议会」）；context-w4 **条目数保持 468 条不变**，**4 条既有条目加注 wave49 分义**（Vorstellung／Vortrag／Wirklichkeit／Geist）＋ 2 条 styleGuide 记录（新定术语清单、wave49 门务记录）。
- **QA 与误报**：w4 整卷 1,054 → **1,304** 条（critical 0 / major 60 → **75** / minor 994 → 1,229）；本节 **250** 条（minor 235 / major 15）。15 条 major **全是词族误报**：小写 `wirklich` 13 条（承 wave47 已登记分义，词形误报）＋ `Vorstellung` 2 条（`Vorstellung` 作向国王呈递的「陈情」义，与 wave47「看法」／wave48「设想」同类分义），均已逐条登记进 context-w4。
  minor 多为分义提醒与低权威词表陈旧条目：Interesse→利害关系 19、Rede→演辞 19、Grund→根据 13、Macht→威力 12、Verhältnis→关系 11、Mitte→中项 9（`Mittel` 词形误报，context-w4 早已登记）等。
  **机器门 GATE OK（0 FAIL / 177 WARN）**（15 单元全量），WARN 全是中文破折号与德文「 - 」的排版差及同句跨词条容忍。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；
  validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w4/14 浏览器实测（端口 8860）pairs=104 = expected 104（103 译块＋1 fn）、jsErr=0、页面中文 33 万字、残留 HTML 标签 0**；相邻分节 w4/13（29/29）、w4/12（58/58）复测通过；固定 8 页回归 **8/8**。
- **可复现性**：合并后重建 7 个构建脚本的 16 个 part 文件，与入库 `web/data/trans/w4/14.json` **逐块比对 103/103 一致、0 差异**；8 个 `ns=0` 空段落（bi 4/21/37/47/54/63/67/89）全部以 `en: []` / `zh: []` 如实落盘，fn 块（bi 103）不译。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。
- **下一节：w4/15**（第 4 卷最后一节，81 块 / 366 句 / 1 个 fn 块）——本节续完，符腾堡等级议会评述也就收官；切片 `--limit 9 --prefix wave50`（注意第 48 波的教训：目标节已 100% 时 `make-jobs` 会滚到下一节并覆盖 `jobs-<prefix>.json`）。

### ★ 第 48 波已收官：w4/13「Heidelberger Schriften」（海德堡时期著作评述）整节 **100%**

**第 48 波（2026-10-21）一次做完 w4/13 整节 7 单元 / 28 块 / 203 句**（本节无空段落；另有 1 个 fn 块按契约不译），全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 内容 |
|---|---|---|
| b1 | 0 / 7 | 书目评述（雅可比《文集》第三卷 1816）与所收诸篇提要 |
| b2 | 9 / 13 | 雅可比体系评述：理性·道德原则·亚里士多德的责备 |
| b3 | 17 / 21 | 实体与否定·自由即人格性·主体—客体 |
| b4 | 25 | 致费希特的信·哈曼·实证宗教与德性的分歧 |

**w4/13 整节 7 单元 / 28 块已全部译完。** 覆盖率 17.74% → **17.96%**（16,340 → 16,543 / 92,117 句；段落 5,153 → 5,178 / 17,948 = 28.85%）。第 4 卷 4,530 → 4,733 句（86.0%），**分节进度 14/16**。

- **切片**：`node scripts/make-jobs.mjs --vol w4 --size 25 --limit 9 --prefix wave48` → units=22 sentences=605，**跨节溢出到 w4/14**（w4/13 只有 7 单元 0/7/9/13/17/21/25 = 203 句；w4/14 有 15 个单元 = 402 句）：本波只做 w4/13 的 7 个单元，w4/14 的 15 个单元留给第 49 波；`data/_jobs/jobs-wave48.json` 已裁为 7 个 w4/13 单元 id，多生成的 `w4-14-*.in.json`（15 个）已删（可恢复删除）。
- **★ 本波逐句回源复核后修正 25 处**（机器门 0 FAIL 之后、QA 之前做的回源核对，全部已改并同步 patch 5 个构建脚本，重建后与入库文件逐字一致）：
  - **`das Positive` 宗教义 2 处**：原作「积极者」（读起来像"行为者"），改为「实证」——跨卷先例 w1「实证宗教」「实证的东西」＋共享词表 `Positive Religion＝实证宗教`；同节立法义（bi18[6]「bloß statuarische Gesetz」）仍作「实定」、抽象肯定—否定义作「肯定」，三义已登记。
  - **`Geist` 5 处**：bi6[5]／bi21[4]／bi23[0]／bi26[0]／bi27[10] 原作「心灵」，按本条（Geist＝精神，禁「心灵」「灵魂」）全部改回「精神」。
  - **漏译 1 处**：bi14[5]「das bloße Sollen … ist ebenso geistlos」原译把「同样是无精神的」整句吞掉——已补回「无精神的」并重排句序。
  - **`Wissen` 5 处**：bi8[12]／bi8[13]／bi11[7]／bi27[10] 原作「认识」、bi14[4] 原作「学问」，按本条（Wissen＝知识，与 Erkenntnis＝认识分开）统一改回「知识」。
  - **`Persönlichkeit` 7 处**：bi7[5]／bi7[6]／bi7[7]／bi8[4]／bi17[7]／bi26[1]／bi27[10] 原作「人格」，按 w4/7 同卷先例（概念义＝人格性）改为「人格性」；bi27[0] 具体个人义仍作「人格」。
  - **`Idee` 1 处**：bi25[7]「Mit der Idee des Geistes」原作「把精神理解为…」，把术语整条吞掉——已改回「以精神（作为在我之中的这一见证者）的观念」。
  - **`begreifendes Erkennen` 1 处**：bi23[0] 原作「可理解的认识」，按 w4/2 同卷先例（「科学是以概念把握绝对精神的认识」）改为「以概念把握的认识」。
  - **`Macht` 1 处**：bi18[2] 原作「力量」，按本条支配义改回「威力」。
  - **`Gefühl` 1 处**：bi7[1] 原作「情绪」（与 Laune 撞词），改回「感觉」。
  - **句序 1 处**：bi26[0] 把德文让步从句倒到主句之前，读起来自相矛盾——已重排。
- **术语层**：共享词表 **+8 条新译名**（Ding an sich 自在之物／Apperzeption 统觉／Hamann 哈曼／Moralprinzip 道德原则／causa sui 自因／Benedictus 本尼迪克特／das Positive（in der Religion）实证／Idealist 理想主义者）；
  context-w4 **条目数保持 468 条不变**，**40 条既有条目加注 wave48 分义** ＋ 2 条 styleGuide 记录（新定术语清单、wave48 门务记录）。
- **QA 与误报**：w4 整卷 1,087 → **1,054** 条（critical 0 / major 73 → **60** / minor 994）；本节 117 → **86** 条（major 17 → **4**）。剩下的 4 条 major **全是词族误报**：`Dasein` 神学日常义「上帝的存在」（不作「定在」）1 条 ＋ `Vorstellung`／`vorgestellt` 作「设想」义 3 条（与 wave47「一致的看法／公众的想法」同类分义），均已逐条登记。
  minor 多为分义提醒：Natur→本性 9、Gesetz→法律 6、Erscheinung→现象 5、Gewißheit→确定性 5、Leben→生命 4、Unbestimmte→不定者 4、Wirklichkeit→现实性 3、Sphäre→领域 3、Äußerung→表现 3 等。
  **机器门 GATE OK（0 FAIL / 66 WARN）**（分片门），WARN 全是中文破折号与德文「 - 」的排版差及同句跨词条容忍。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；
  validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w4/13 浏览器实测（端口 8860）pairs=29 = expected 29（28 译块＋1 fn）、mismatch=0、emptyZh=0、emptyEn=0、jsErr=0**（本节无 `ns=0` 空段落，故 missing 全 0）；相邻分节 w4/12（58/58）、w4/11（78/78）、w4/10（54/54）复测通过；固定 8 页回归 **8/8**。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。


### ★ 第 47 波已收官：w4/12「2. Bericht über das Gymnasialschuljahr 1811/12」＋「3. Über den Vortrag der Philosophie auf Gymnasien」＋「4. Über den Vortrag der Philosophie auf Universitäten」（1811/12 学年报告·文科中学与大学的哲学讲授）整节 **100%**

**第 47 波（2026-10-20）一次做完 w4/12 整节 8 单元 / 57 块 / 192 句**（含 1 个空段落 bi55，如实输出 `en: []` / `zh: []`；另有 1 个 fn 块按契约不译），全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 内容 |
|---|---|---|
| b1 | 0 / 6 | 1811/12 学年报告：学校与公众的期望·语文与历史·地理与游历·哲学作为预备科学·百科全书与三门科学·美学的位置 |
| b2 | 22 / 27 | 形而上学的空缺与二律背反·上帝存在证明与康德批判·自然哲学·思辨地思考作为教学目的·文科学研究的地位与前言 |
| b3 | 33 / 38 | 方法（II. Methode）·文科中学哲学教学的多余性之争·致尼特哈默的信·语文学与教父的释经 |
| b4 | 48 / 54 | 施莱格尔与先验哲学讲演·1816 年致普鲁士王国政府参议的信·结语 |

**w4/12 整节 8 单元 / 57 块已全部译完。** 覆盖率 17.53% → **17.74%**（16,340 / 92,117 句；段落 5,153 / 17,948 = 28.71%）。第 4 卷 4,530 / 5,501 句（82.3%），**分节进度 13/16**。

- **切片**：`node scripts/make-jobs.mjs --vol w4 --size 25 --limit 9 --prefix wave47` → units=15 sentences=395，**跨节溢出到 w4/13**（w4/12 只有 8 单元）：本波只做 w4/12 的 8 个单元（0/6/22/27/33/38/48/54，192 句），w4/13 的 7 个单元留给第 48 波；`data/_jobs/jobs-wave47.json` 已裁为 8 个 w4/12 单元 id，多生成的 `w4-13-*.in.json` 已删。
- **术语层**：共享词表 **+7 条新译名**（Metaphysik 形而上学／Kosmologie 宇宙论／Ontologie 本体论／Unterprimärschule 下级初级学校／Oberprimärschule 上级初级学校／Metrik 韵律学／Wortweisheit 咬文嚼字——**均用官方分句器核过全书命中率 100%** 才入表，命中率不足的 Kollegium／Salbaderei／Normativ／Erbauung／Idiosynkrasie／Übersicht 一律不入表，避免给后面的卷制造噪音）；
  context-w4 **条目数保持 468 条不变**，**24 条既有条目加注 wave47 分义** ＋ 2 条 styleGuide 记录（新定术语清单、wave47 门务记录）。
- **★ 本波跨节回改 3 处（统一 Normativ＝规章）**：w4/12 全节 5 处 Normativ 作「规章」，但 w4/10 作「最高法令」、w4/11 作「规定」——已回改为「至高的规章」「规章，……」「一般规章所确定的那种关系」；同步 patch 了 wave45/wave46 的构建脚本，**重建后与入库文件逐字一致、只有这 3 句变化**（可复现性已验证）。
- **真缺陷 2 处（已修）**：`Wissen`（知识）漏了词根——「der Trieb nach Wissen」原作「求知的冲动」，改为「追求知识的冲动」；
  `Erkenntnis`（认识）与同句 `Kenntnis`（知识）混用——「die Forderung bestimmter Erkenntnisse」原作「特定知识的要求」，改为「特定认识的要求」。
- **分义与误报（不改译文，已逐条登记进 context-w4 的 wave47 分义）**：本波 45 条（major 5 / minor 40）全是术语一致度提醒——Klasse→班级 6（低/中/高年级）、Interesse→利害关系 6（兴趣/利害/意义三义）、Natur→本性 6（自然/性质/本性三分）、Mitte→中项 4（**Mittel 子串误报**）、Gesichtspunkt→观点 2（着眼点）、Grund→根据 2（理由/缘故）、Folge→后果 2（结果/结论）、Verschiedenheit→相异 2（差异）、Mittel→手段 1、Eigentum→财产 1（广义「占有」）、Person→人格 1（Personal 子串）、Sein→存在 1（Seine 子串）、Zweck→目的 1、Verseicherung→断言 1、Anspruch→要求权 1、Wissen→知识 1、Erkenntnis→认识 1 等；
  major 5 条**全是词族误报**：4 条 `wirklich` 日常义（真正/确实，不带「现实」字根）＋ 1 条 `Dasein` 神学日常义「vom Dasein Gottes」→「上帝的存在」（不作「定在」）。
  **机器门 GATE OK（0 FAIL / 43 WARN）**（分片门），WARN 全是中文破折号与德文「 - 」的排版差及同句跨词条容忍。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；
  validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w4/12 浏览器实测（端口 8860）pairs=58 = expected 58（57 译块＋1 fn）、mismatch=0、jsErr=0**；
  missing=2 / emptyZh=1 / emptyEn=1 **全部来自唯一的 `ns=0` 空段落**（合同规定如实留空，与已验收的 w4/8、w4/9、w4/11 同一渲染行为）；回改过的 w4/10（pairs=54/54）与 w4/11（pairs=78/78）同步复测通过；固定 8 页回归 **8/8**。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。


### ★ 第 46 波已收官：w4/11「5. Rede zum Schuljahrabschluß am 2. September 1813」＋「III. Gutachten / 1. Gutachten über die Stellung des Realinstituts zu den übrigen Studienanstalten」（1813 学年结束演辞＋实科学校地位鉴定书）整节 **100%**

**第 46 波（2026-10-19）一次做完 w4/11 整节 9 单元 / 77 块 / 231 句**（含 1 个空段落，如实输出 `en: []` / `zh: []`；另有 1 个 fn 块按契约不译），全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 内容 |
|---|---|---|
| b1 | 0 / 10 | 1813 演辞：学年末回顾与「学校无历史」之福·法律与制度的可变与不变·教师更替与青年之成长·班级晋升与国家公务·文科中学与本行学问·古典时代的中间位置·整体生命与精神 |
| b2 | 20 / 24 | 青年教育与国民小学的弊病·私人努力与国家规制·二十余年变迁与时代信心·教养与家庭自由·奖赏与新一代 |
| b3 | 37 / 41 | 鉴定书正文：神学法学医学之预备必要·古语与官房学·实科学校学生的构成·实科中学与预科中学·各行业去向·共同授课三案与纪律问题·实科学校与中学的关系 |
| b4 | 50 / 61 | 商业与实科学校的中间层·专门学校的三种节省方案·两校共同科目与合班授课之弊·四年课程与升学的空缺 |
| b5 | 70 | 预备关系与空缺·入学条件·签署 |

**w4/11 整节 9 单元 / 77 块已全部译完。** 覆盖率 17.28% → **17.53%**（16,148 / 92,117 句；段落 5,102 / 17,948 = 28.43%）。第 4 卷 4,338 / 5,501 句（78.9%），**分节进度 12/16**。

- **切片**：`node scripts/make-jobs.mjs --vol w4 --size 25 --limit 9 --prefix wave46` → units=9 sentences=231，**正好整节切完**（`--limit` 只在分节边界检查、节内 flush 不看它）。
- **术语层**：共享词表 **+65 条新译名**（Realschule 实科中学／Lyzeum 高级中学／Mittelanstalt 中级学校／Kameralwissenschaft 官房学／Kameralfache 官房事务／
  Kameralstellen 官房职位／Humaniora 人文诸科／Generalkommissariat 皇家总务署／Rektorat 校务委员会／Kadettenhaus 军校／Forstinstitut 林业学校／
  Medizinalkomitee 医学委员会／Absolutorium 结业证书／Gutachten 鉴定书／Klassenlehrer 班主任／Volksschule 公立小学／Berufswissenschaft 本行学问／
  Militärstand 军人身份／Gewerbsstand 手工业者阶层／Privatwillkür 私人任意 等）；
  context-w4 **条目数保持 468 条不变**，**17 条既有条目加注 wave46 分义** ＋ 3 条 styleGuide 记录（新定术语清单、Generalkommissariat 译名更正、wave46 门务记录）。
- **★ 本波踩到的两个坑（写在这里给下一轮）**：
  1. **源句里以「 - 」分段的两段式长句**——bi21[6]（"Es tritt ein Zeitpunkt ein … - Einrichtungen, bei denen …"）与 bi60[0]（"Da die Gymnasialanstalt … - Was die besonderen Lehrer …"）
     在源数据里是**一条**译文位（`ns` 只算 1），却含两段。首轮只译了后半段，机器门立刻报出 zh/de 长度比 0.07 与 0.20 才发现。
     **判据：凡源句内出现「 - 」，中文必须把两段都译出来，破折号照位置下**。
  2. **doNotTranslate「1.」与「S.」的字面命中**——处方日期「München, 1. Aug.」的「1.」按字符命中（英中都必须保留德式写法）；
     Reg. Bl. 引用里的「S.」（Seite）也必须逐字保留，中文侧另补「年」（Reg. Bl. 1809 年，S. 1332）才能满足「中文非空」判据。两点都已写进 context-w4 的 styleGuide。
- **真缺陷 4 处（已修）**：`Wirklichkeit`（现实性词族）误译成「实在性」（实在性属 Realität 词族），已改回「现实性」；
  `Es ist wahr` 的「诚然」不含词根「真」，改为「这是真的」；
  两处 `Vorstellung`（bi10[1]「基本观念」、bi13[0]「根本观念」）误用了「观念」——「观念」是 Idee 词族的专属译名、
  Vorstellung 一律「表象」，已改回「基本表象」，并把两处「基本／根本」译法不一统一掉。
- **分义与误报（不改译文，已逐条登记）**：本波 121 条 minor 全是术语一致度提醒——Rektor→校长 17（Rektorat＝校务委员会）、
  Leben→生命 12、Mitte→中项 8（**Mittel 子串误报**）、Grund→根据 5、Interesse→利害关系 5（利益／兴趣两义）、Natur→本性 5、
  Gesetz→法律 3（同卷 wave45 已定：避「法律」作「法则」）、Anspruch→要求权 3、Teilnahme→关切 3、Anschauung→直观 3（考察义作「观照」）、
  Glück→幸运 3、Zweck→目的 3、Klasse→班级 3、Bedürfnis→需要 3、Unterschied→差别 3 等；
  新增 major 6 条**全是词族误报**：4 条 `wirklich` 日常义（不带「现实」字根，与卷内既有同类）＋ 2 条 `Vorstellung`＝看法／想法义（非「表象」，已登记 wave46 分义）。
  **机器门 GATE OK（0 FAIL / 67 WARN）**（分片门）；合并入库后再对正式文件跑一遍终门 **0 FAIL / 10 WARN**，
  WARN 全部是中文破折号与德文「 - 」的排版差、以及同句跨词条容忍（政府／灵魂／教育／学科 都是同句内另一个德文词的合法译名，非本词违规）。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；
  validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w4/11 浏览器实测（端口 8860）pairs=78 = expected 78、mismatch=0、jsErr=0**；
  missing=2 / emptyZh=1 / emptyEn=1 **全部来自唯一的 `ns=0` 空段落**（合同规定如实留空，与已验收的 w4/8、w4/9 同一渲染行为，非本轮回归）；固定 8 页回归 **8/8**。
- **★ 方法论教训：往 context-w4 加新条目会放大全卷 QA 噪音**——本波一度加了 13 条新条目，QA 的 minor 立刻从 874 涨到 1,294
  （+420，**波及全卷所有含该词的句子**，不只是 w4/11）。已改为**只给既有条目加注分义、条目数保持 468 不变**，
  新术语的定译改由**共享词表 + styleGuide** 承载（两者都不产生噪音），minor 回到 874。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。

### ★ 第 45 波已收官：w4/10「3. Rede zum Schuljahrabschluß am 14. September 1810」＋「4. Rede zum Schuljahrabschluß am 2. September 1811」（两篇学年结束演辞）整节 **100%**

**第 45 波（2026-10-19）一次做完 w4/10 整节 9 单元 / 53 块 / 220 句**（本节无空段落），三批全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 句数 | 内容 |
|---|---|---|---|
| b1 | 0 / 6 / 9 | 83 | 1810 演辞：学校的历史与第二学年的进展·班级序列与统一·宗教课引入与预科班·教理问答与公共礼拜·军队操练作为教养手段·教师勤勉与学生私下用功 |
| b2 | 16 / 23 / 32 | 80 | 品性训育与教养之分·纪律与家庭教育的分工·校舍修缮·佩耶钱币收藏与矿物标本室·夜唱募捐与助学基金·教师待遇与人事变动·名次评定·1811 演辞：纪律与伦理教养的直接关系·伦理概念须早教之辩 |
| b3 | 38 / 44 / 52 | 57 | 学校/家庭/世界的三分·公共生活与从属·评定的相对性·入学年限与家长义务·学校设施与藏品·学年评语与表彰 |

**w4/10 整节 9 单元 / 53 块已全部译完。** 覆盖率 17.04% → **17.28%**（15,917 / 92,117 句；段落 5,029 / 17,948 = 28.02%）。第 4 卷 4,107 / 5,501 句（74.7%），**分节进度 11/16**。

- **切片**：`node scripts/make-jobs.mjs --vol w4 --size 25 --limit 9 --prefix wave45` → units=9 sentences=220，**正好整节切完**（`--limit` 只在分节边界检查、节内 flush 不看它）。
- **术语层**：共享词表 **+76 条新译名**（Lokation 名次评定／Promotion 升班／Fortgangsplatz 升迁名次／Jahreszensur 年度评分／
  Generalkommissariat 皇家总务署／Rektorat 校务委员会／Katechisation 教理问答／Nachtsingkollekte 夜间唱诗募捐／
  Schulsammlung 学校募捐／Experimentalphysik 实验物理学／Kosmographie 宇宙学／Deklamieren 公开朗诵／
  Nationalgarde 国民卫队／Privatfleiß 私下勤勉／Kreuzer 克鲁采／Gulden 古尔登 等）；context-w4 条目数不变（**468 条**），
  **21 条条目加注 wave45 分义** ＋ 1 条 styleGuide 门务记录。
- **真缺陷 3 处（已修）**：
  1. **「目的+的+的」中文自碰撞 × 2**（bi16[2]、bi27[0]）——「目的」这个词本身以「的」结尾，**任何「目的的」都会撞车**；
     改「对这一目的本身所抱的利害关系」「显示出为达致某一目的之直接意图」才躲开（用「之」字连接是本项目既定改法）。
  2. **bi36[2]**：同句含 Bildung 与 Erziehung，译文只有「教育」没有「教养」→ 门判 forbidden Bildung→教育；补「使人独立自主的教养」后过门。
- **分义与误报（不改译文，已逐条登记）**：本波 55 条 minor 全是术语一致度提醒——Leben→生命 8（家庭/学校/公共生活等具体生活方式语境）、
  Studienanstalt→高等学府 7（中等学校语境作「学校」）、Mitte→中项 6（**Mittel 子串误报**）、Person→人格 5（日常义「年长者／特殊的人」＋ Personal 子串）、
  Teilnahme→关切 3（该条 unsicher，备选「参与」）、Anspruch→要求权 3（「占用／要求负责」义）、Kenntnis→知识 3、
  Bildung→教养 3（Formation 义作「养成」）、Gefühl→感觉 2（「尊重感」）、Gesetz→法律 2（同句有 Recht，避免「法律」触发禁译词）、
  Macht→威力 2、Zweck→目的 2、Tätigkeit→行动 2 等；新增 major 4 条**全是 `wirklich` 词族日常义误报**（「真正」不带「现实」字根），
  与卷内既有 11 条同类。**机器门 GATE OK（0 FAIL / 5 WARN）**，5 条 WARN 是同句跨词条容忍（bi8[6]、bi36[2]、bi45[4] 各含
  Bildung＋Erziehung，「教养」「教育」按词条分工共存）。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / validate / integrity / verify-coverage / audit-sentences 全 exit 0；
  validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；**w4/10 浏览器实测（端口 8860）pairs=54 = expected 54、
  missing=0、mismatch=0、emptyZh=0、emptyEn=0、jsErr=0**；固定 8 页回归 **8/8**。
- **★ 本波新踩的坑（写在这里给下一轮）**：**处方日期里的「1.」**——「der den 11. November im Jahr 1761」中的「11.」会被
  doNotTranslate 词条「1.」按字符命中（子串），于是**英中都必须保留原德式日期写法**（EN「11. November 1761」／中「1761 年 11.11」）；
  改写成「1761年11月11日」会被门判「doNotTranslate missing」。已写进 context-w4 的 styleGuide。同段的「z. B.」命中「B.」，
  按门规则以「z. A.」～「z. C.」例程豁免，不必改译文。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。

### ★ 第 44 波已收官：w4/9「Die geistige Religion」（精神宗教＋两个片段＋附录教学报告＋两篇演辞）整节 **100%**

**第 44 波（2026-10-19）一次做完 w4/9 整节 11 单元 / 239 块 / 276 句**（含 2 个空段落，如实输出 `en: []` / `zh: []`），四批全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 句数 | 内容 |
|---|---|---|---|
| b1 | 0 / 19 / 45 | 78 | §19–§32 精神宗教定义·恐惧与爱的宗教·上帝是绝对能动性·艺术诗艺使命·神谱/变形记/摹本·护佑与道德信仰·自然的外在/内在合目的性 |
| b2 | 65 / 91 / 140 | 77 | §33–§34 命运与护佑·悲剧歌队残段·两个片段（精神学说/数学一页纸：空间时间定在与维度）·附录教学报告 1808/09–1812/13·申克校长五十周年祝寿演辞开篇 |
| b3 | 194 / 202 / 215 | 79 | 祝寿演辞主体与尾段（师道·光·典范·幸运）·1809 学年结束演辞（王恩·司法与教育·德语国民性）·中等班与姊妹学校 |
| b4 | 224 / 232 | 45 | 古典语言即营养与形式·疏离与离心冲动·语法＝入门哲学·科目表·时间占比·毕业赠言·授奖辞 |

**w4/9 整节 11 单元 / 239 块已全部译完。** 覆盖率 16.74% → **17.04%**（15,697 / 92,117 句；段落 4,978 / 17,948 = 27.74%）。第 4 卷 3,887 / 5,501 句（70.7%），**分节进度 10/16**。

- **`--limit` 语义实测确认（消除旧记录的含混）**：`make-jobs` 只在**分节边界**检查 `units.length >= LIMIT`，
  节内 flush 不看 limit——所以切 w4/9 传 `--limit 10` 得到 `units=11`（整节切完才停），这正是交接说明
  写"切 w4/9 传 `--limit 10`"能整节切全的原因。下一节 w4/10（220 句 ≈ 9 单元）传 `--limit 9` 即可。
- **unit 91 曾漏译块 113–139（27 块，真缺陷），b2 自查发现后补全**——合并后务必按块号对账。
- **术语层**：共享词表 **+23 条新译名**（Rede 演辞／Programm 学年报告／Oberklasse 高年级／Theogonie 神谱／
  Metamorphosen 变形记／Abbild 摹本／Lebendigkeit 生机／Antaeus 安泰俄斯／Zensur 考语 等，4 条 unsicher 待裁）；
  context-w4 **464 → 468 条**（新条：Rede、Programm、Oberklasse；修正 Zusammenhang 主译「关联」）＋ 17 条分义/误报登记。
- **真缺陷修复（两轮 qa 回查）**：
  - 第一轮：`的的` 重字 × 6（「合目的的生成」「计划与目的的思想」「目的的核」等中文自我碰撞，改「合目的生成」「目的这一思想」「目的之核」）；
    `Tätigkeiten`→行动（承 context-w4 Tätigkeit 条）、`Einigung`→合一 与 `Einigkeit`→一致 分工、
    `Gemeinde`→教团、`Kultus` 制度义→礼拜、`Dasein Gottes`→上帝的定在。
  - 第二轮（按既有锁条拉平）：`Gewißheit`→确定性、`Darstellung`→表现（宗教语境）／表述（逻辑语境）、
    `Leben`→生命（世界与生命·生命之功业·最初的生命）、`Interesse`→利害关系、`Tugend`→美德、`Glück`→幸运、
    `Gottesverehrung`→敬神、`Dämon`→精灵（共享词表既锁）、`Zusammenhang`→关联（**回查发现我自己新写的上下文条目与既有先例冲突——错条目会反过来指向自己的译文，这正是 wave38 教训的再现；先把条目改对，再拉平译文**）。
  - **归属误报不改译文（门与 qa 均逐条核实）**：同句 `Existenz`/`Sein`/`Seele`/`Regierung`/`Ideen` 的合法汉字被
    Dasein/Geist/Staat/Begriff 条命中；`Mitte` 命中 `Mittel`（手段）；`Sein` 命中系动词与 `Seiner Exzellenz`；
    演辞日常义 Moment（时刻）、Körper（灵魂与身体）、Gefühl（幸福的感觉）；`gesetz` 宗教语境「法则」；
    空块 zh/en 长度比 0.21（中文天然比例，按块横向比）。
- **验收全绿**：trans-index **ALIGNMENT OK**；check-policy / integrity / verify-coverage / audit-sentences 全 exit 0；
  validate 仍 20 处存量 misnested（w2/w3/w5，与新译无关）；w4/9 浏览器实测（端口 8860）
  **pairs=240 = expected 240（239 译块 + 1 fn 块）、emptyZh=0、emptyEn=0、mismatch=0、jsErr=0**；固定 8 页回归 **8/8**。
- **残句与标记保护到位**：§ 标记（`§ [19]`、`§ [25]87)`、`§92)`）、脚注号（`90)`、`88)`、`96)`）、
  方括号编者补（`[festsetzt]`、`[feiern]`、`[ist,]`、`[für mich noch]`）原样保留；提纲残句照残句译，不合并、不补谓语。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。

### ★ 第 43 波已收官：w4/8「I. Pflichten gegen sich」（对自己·家庭·国家·他人的义务＋宗教学说）整节 **100%**

**第 43 波（2026-10-20）一次做完 w4/8 整节 15 单元 / 371 句**（含 5 个空段落，如实输出 `en: []` / `zh: []`），四批全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 句数 | 内容 | 提交 |
|---|---|---|---|---|
| b1 | 0 / 7 / 15 | 78 | §41–§45 自我义务·教养两面·规定职业 | `1a33b6e` |
| b2 | 19 / 37 / 51 | 80 | §46–§52 美德·家庭·国家义务·§53–§58 国家与公民·§59–§64 正直·真实性·诽谤 | `c1b38f5` |
| b3 | 63 / 70 / 84 | 81 | §63–§66 伪善·善恶不善三分·§67–§70 友谊·精明·客气·§71–§79 道德法则·上帝·恶与和解 | `68128e1` |
| b4 | 99 / 120 / 140 / 159 / 177 / 194 | 132 | §80 敬拜·宗教学说手稿残篇（中等与上层阶级的宗教·宗教导论·论上帝的概念·论宗教） | `5f34f89` |

**w4/8 整节 15 单元 / 371 句已全部译完。** 覆盖率 16.35% → **16.74%**（15,421 / 92,117 句；段落 4,806 / 17,948 = 26.78%）。第 4 卷 3,611 / 5,501 句（65.6%），**分节进度 9/16**。

下一节 **w4/9 尚未切片**：`node scripts/make-jobs.mjs --vol w4 --size 25 --limit 10 --prefix wave44`（`--limit` 是分节数不是单元数；**切 w4/9 时才传 `--limit 10`**——第 43 波曾误传 `--limit 9`，把 jobs-wave43.json 覆盖成 w4/9 的内容并多生成 11 个 `w4-9-*.in.json`，靠 `git checkout --` 还原 + `rm`（可恢复删除）清场）。

> **★ 本波新增的三条坑，写在这里给下一轮**：
> 1. **上下文包的字段名写错会让禁译检查静默失效，机器门崩了先查数据层。** `context-w4.json` 的 forbidden 数组里有 3 条
>    （`Quantum` / `Anderssein` / `Etwas`）把 `forbidden` 字段写成了 `forbid`，于是**从第 43 波 b1 起这三条禁译词一直没被检查**，
>    直到 b4 的 gate 按 `f.forbidden.replace(...)` 直接崩（`Cannot read properties of undefined (reading 'replace')`）才暴露。
>    **如果 gate 没崩而是跳过，漏网的禁译词永远查不出来**——所以门报「缺字段」类错误时，先怀疑上下文包的数据，别先改 gate。
>    修复后重跑前三批 gate：零 FAIL，无漏网。
> 2. **前三批的补丁要改 build 脚本再重跑，不能只改合并产物。** 本波 b4 验收时在前三批（unit 0–84）查出 10 处同卷两译
>    （`Übereinstimmung` 一致/相合、`Kenntnis` 认识/知识、`Interesse` 兴趣/利害关系、`Bedürfnis` 需求/需要、
>    `Einzelwesen`、`Ausschließung`、`Einzelheit`、`Dienst`、`Folge`、`Natur`），全部改 `_build_w43_{1,2,3}.mjs` 后
>    重跑 build + merge。**merge 会消费 p 文件，但增量合并只更新改动的块，不需要重新生成全部 15 个单元。**
> 3. **`qarange` 第一个参数是 chunk 号，不是卷号。** 我误传 4 查到 chunk 4 的存量问题，差点当成自己新译的缺陷；
>    **块号与句号对不上（单句块报 sentence 1/3）就是传错参数的信号。**

- **验收（全绿）**：trans-index **ALIGNMENT OK**；check-policy / integrity / verify-coverage /
  audit-sentences 全 exit 0；validate 仍只有 20 处存量 misnested（w2/w3/w5，与新译无关）；
  w4/8 浏览器实测 **pairs=197 = expected 197（196 译块 + 1 fn 块）**、errors=0、
  emptyZh=0、emptyEn=0、mismatch=0；固定 8 页回归 **8/8**。
  （固定 8 页**不含 w4/8**，用 `data/_jobs/_dom_w42.mjs w4:8` 单独验。）
- **qa：w4/8 全节 70 条全部核实为误报或已登记分义**：`Wesen`⇒存在者（context-w4 例外条）、
  `Mitte` 误命中 `Mittel`、`Körper` 身体（人身义，自我保存语境）、副词 `wirklich` 要「现实」（全卷 33 处存量）、
  `Person`⇒君主本人/他人其人（b2 裁定）、`Wahrheit`⇒真相/真话（b2 分义）、`Interesse`⇒国家利益（制度层分义）、
  `Kultus`⇒崇拜（行为义分义）、`Versicherung`⇒确信（宗教语境分义）、`zur Folge haben`⇒导致（context-w4 分义条）、
  zh/en 长度比 0.20（中文天然比例，按块横向比）。**一条译文都没为消警告而改。**
- **术语层**：共享词表 b4 登记 43 条**全部已存在**（`merge-glossar` added 0——共享词表是全库 2,696 行的术语库，
  不是本项目从零积累的，de 键命中率高是正常的，别当 bug）；context-w4 **436 → 464 条**（+28 新条 +8 分义 note），
  并修复 3 条 forbidden 字段名。b4 新裁定：
  `Gottesdienst` **敬拜**（与 `Kultus` 制度义礼拜/行为义崇拜三分，避免撞车）／
  `Weltseele` 世界灵魂（同句 `Geist` 作精神）／`Emanation` 流溢／`Theodizee` 神义论／
  `Akzidens` 偶性／`Glückseligkeit` 至福（w4/6 已确立）／`Versenkung` 沉浸／
  `Einigkeit` 一致 与 `Einigung` 合一 分开／`Übereinstimmung` 相合（与 `Einigkeit` 分译）／
  `Schicksal` 命运／`Vorsehung` 护佑／`sittliche Mächte` 伦理力量／`Geisterwelt` 精神世界。
- **远端**：本波四批推到 fork（selfish-sin/read-hegel）main（`5f34f89`）；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。

### ★ 第 42 波已收官：w4/7「Erster Abschnitt Rechtslehre」（法权学说）整节 **100%**

**第 42 波（2026-10-19）一次做完 w4/7 整节 15 单元 / 427 句**，四批全部由主代理翻译（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）：

| 批次 | 单元 | 句数 | 内容 | 提交 |
|---|---|---|---|---|
| b1 | 0 / 12 / 21 / 30 | 116 | §1–§12 法·人格·强制·占有·财产 | `3dc777e` |
| b2 | 36 / 45 / 51 | 99 | §13–§20 不可让渡之物·契约四型·意思表示·民法/刑法·民事诉讼·同态复仇 | `acbb666` |
| b3 | 59 / 69 / 78 | 92 | §21 报复与刑罚·§22–24 国家/家庭·§25 自然状态·§26–28 法律·政府·政体四分 | `f07b72d` |
| b4 | 84 / 97 / 106 / 111 / 118 | 122 | §29–31 国家法与万国法·§32–33 责任与义务·§34–38 心态/快乐/幸福主义·§39–40 义务四分 | `94ef48e` |

**w4/7 整节 15 单元 / 427 句已全部译完。** 覆盖率 15.89% → **16.35%**（15,060 / 92,117 句；段落 4,620 / 17,948 = 25.74%）。第 4 卷 3,250 / 5,501 句（59.1%），**分节进度 8/16**。

下一节 **w4/8 尚未切片**：`node scripts/make-jobs.mjs --vol w4 --size 25 --limit 9 --prefix wave43`（`--limit` 是分节数不是单元数；**不要把 `--help` 当参数传**，会被当 vol 名误生成同名任务文件并覆盖已入库的 jobs-wave1.json）。

> **★ 本波新增的三条坑，写在这里给下一轮**：
> 1. **禁译检查必须按句归属，不能按块扫。** 一开始按块扫，`Recht`（禁「法律」）在块 83 报了 1 次真问题
>    （我把 `Regierungsverfassung` 译成了禁译的「政体」，已改「宪法形式」），但同时制造了 3 条假警报：
>    同句里的「法律」其实来自 `Gesetz`、「政府」来自 `Regierung`、`Mitte` 误命中 `Mittel`。
>    **改成逐句对位后假警报全消、真问题照样抓到**，粒度收紧是净收益。
> 2. **控制台会把重复的汉字吞掉，必须按字节查。** 结构门的「的的」检查报出「献身于更高目的**的的**可能性」，
>    但 `console.log` / `JSON.stringify` 打印出来都只有一个「的」——PS 5.1 的 GBK 控制台把相邻同字合并显示了。
>    **用 `codePointAt` 逐字打印才看得见**。凡是靠眼睛读中文找缺陷，都要意识到这一层。
>    顺带踩到第二个：「以…为目的的学说」天然含「的的」，改成「**目的之学说**」才躲开。
> 3. **共享词表与 context-w4 会在同一个词上打架，以量定胜负要落进 context-w4。** `Vereinigung` 在 context-w4 里
>    有两条冲突条目（「结合」与「统一」），实测 w4 已译部分 **统一 123 处 vs 结合 33 处、联结 49 处**，
>    本波已把 base 条合并成「统一」并写明理由。**每次发现同一 de 键有两个 zh，先数全卷用量再改裁定。**

- **验收（全绿）**：trans-index **ALIGNMENT OK**；check-policy / integrity / verify-coverage /
  audit-sentences 全 exit 0；validate 仍只有 20 处存量 misnested（w2/w3/w5，与新译无关）；
  w4/7 浏览器实测 **pairs=121 = expected 121（全部正文块已译 + 标题块 + 0 fn）**、errors=0、
  emptyZh=0、emptyEn=0、mismatch=0（每个 .pair 内的中英字符多重集逐一比对）；
  w4/6 作对照组同跑 **pairs=303 = expected 303**；固定 8 页回归 **8/8**。
  （固定 8 页**不含 w4/7**，本波用 `data/_jobs/_dom_w42.mjs` 单独验；页面 URL 是
  `/reader.html?v=w4&c=7&lay=tri`，选择器是 **`.pair`**（不是 `.zh`/`.en`）——
  我第一次写成 `/read.html` + `.zh` 直接得到 pairs=0，差点误判成译文坏了。
  **pairs=0 一律先当「服务没测到东西」处理，别当译文结论。** PowerShell 会吞 `--expr` 的内层引号，必须走 .mjs 包装。）
- **qa 全卷 major 160 条**；本波四批新报的逐条核实后**真缺陷 14 处已修**，其余全部是**系统性误报**：
  副词 `wirklich`／`in Wahrheit` 被门按词族强制要「现实」/「真」（全卷 33 处存量）；
  `Mitte`（中项）误命中 `Mittel`（手段）、`Subjekt`（主体）误命中 `Subjektiv`（主观的，同一条 forbidden 已注明二者分开）；
  `natürliches Wesen` / `vernünftiges Wesen` 作「存在者」（context-w4 既有例外条）；
  `der Natur` 作「自然」而非「本性」；`Staaten`（复数）作「各国」；
  `Vereinigung` 报「结合」是共享词表旧行、已被 context-w4 覆盖为「统一」。
  **另有一条 major 是 zh/en 长度比 0.20**——中文天然只有英文的 0.23–0.30，全块一致、无漏译，
  **这类比值告警要按块横向比，不能按单句绝对阈值判**。
- **术语层**：共享词表 **+41 条**（b2 +20、b3 +21）；context-w4 **319 → 375 条**。
  新裁定里最要紧的几条：
  `Veräußerung` 让渡（压过共享词表的「转让」，因 `unveräußerlich` ＝不可让渡的 同根）／
  `Erläuterung` **诠释**（styleGuide 第 15 条；我批内一度写「解释」，且共享词表同名行也作「解释」，已一并更正）／
  `Persönlichkeit` 人格性 与 `Person` 人格 严格分开、`rechtliche Person` 法律人格（复合词例外）／
  `Schuldigkeit` 责任 与 `Pflicht` 义务 严格分开、`Rechtsschuldigkeit` 法权责任 与 `Rechtspflicht` 法权义务 分开／
  `Wollen`（动名词）意愿 vs `Wille/Willens`（名词）意志——本节 bi31 早已确立，b4 门又报了一次／
  `Gesetz` **分义**：国家立法义＝法律（§26–28）、自然律义＝规律（§17）／
  `Thron` **分义**：权位＝王位（王位更迭）vs 座位＝宝座／
  `Vergnügen` 快乐 与 `Glückseligkeit` 至福 的分工（w4/6 bi299 已确立，本波正式登记；共享词表「幸福」一行在本卷作废）／
  `Staaten` 各国／`Vereinigung` 统一（合并冲突条目）。
- **远端**：本波四批推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）main 仍固定在 `f8cd477`，未动。

### ★ 第 41 波已收官：w4/6「B. Ursache」（原因）整节 **100%**

**第 39 波 24 单元已全部入库；第 40 波（2026-10-19）续做 12 单元 / 341 句**（w4/6 累计 **556 / 658 句**）：

| 波次 | 单元 | 句数 | 内容 |
|---|---|---|---|
| wave39 b1 | 0 / 20 / 42 / 59 | 111 | §68–75 原因与效果、C. Wechselwirkung 相互作用 |
| wave39 b2 | 78 / 102 / 118 / 138 | 104 | 二律背反录（I–IV 号）；第三部分「概念」开篇、判断的质/量/关系/模态 |
| wave40 b1 | 164 / 184 / 203 / 221 | 107 | §121–128 推论·目的·观念；III. Idee；法权学说导论 §1–§12 |
| wave40 b2 | 228 / 232 / 239 / 244 | 117 | 经验论注释＋意识/思维＋理论与实践能力＋行动 |
| wave40 b3 | 251 / 257 / 262 / 269 | 117 | §10–§18 冲动·本能·反思的三个层级·自由·归责 |
| wave41 | 276 / 285 / 291 / 297 | 102 | §19–§24 形式自由/绝对自由·意志的教育·法与道德·幸福与至福 |

**w4/6 整节 24 单元 / 658 句已全部译完。** 覆盖率 15.17% → **15.89%**（14,633 / 92,117 句）。

下一节 **w4/7 尚未切片**：用 `make-jobs.mjs --vol w4 --size 25 --limit 8 --prefix wave42` 起（`--limit` 是分节数不是单元数；**不要把 `--help` 当参数传**，会被当 vol 名误生成同名任务文件并覆盖已入库的 jobs-wave1.json）。
wave40–41 **全部由主代理翻译**（BYOK 子代理月度配额 2026-10-23 23:59 才重置，全程不派子代理）。

> **★ 两条本项目特有的坑，写在这里给下一轮**：
> 1. **「质料」不是全库违禁，只在 w4 违禁。** 共享词表 Materie→质料（为与 Form 成对），
>    **只有 context-w4.json 覆盖成「物质」**；w1/w2/w3 的卷级包里**没有**这条禁则。
>    本波全库扫描出 98 处「质料」，其中 86 处在 w1/w2/w3——**那些是正解，改了就是制造错误**。
>    同理 Körper 禁「身体」只限 w4 的 Körper 名词，Leib 与 körperlich 保留「身体」。
>    **动手前先按权威序反查一遍禁则属于哪一层。**
> 2. **逐块结构门必须跑在 merge 之前。** 本波 P = s => [s, s] 这个辅助函数写错
>    （返回两元素数组），会让所有「§ NN」行对不上 ns；还有标题块 k=h 被我写成了数组。
>    合并后这两类问题只能靠 merge-trans 报 reject，改起来成本高得多。

- **验收**：trans-index ALIGNMENT OK；check-policy / integrity / verify-coverage /
  audit-sentences 全 exit 0；validate 仍只有 20 处存量 misnested（w2/w3/w5，与新译无关）；
  w4/6 浏览器实测 **pairs=303 = expected 303（全部正文块已译 + 24 标题块 + 1 fn）**、
  errors=0、emptyZh=0、emptyEn=0；固定 8 页回归 **8/8**。
  （固定 8 页**不含 w4/6**，本波另用 data/_jobs/_dom_w40.mjs 单独验了该节；
  PowerShell 会吞掉 --expr 里的内层引号，必须走 .mjs 包装脚本 spawn scripts/check.mjs。）
- **qa 全卷 major 151 条**；本波新报的 3 条已全修，其余逐条核实为**系统性误报**：
  副词 wirklich／in Wahrheit 被门按词族强制要「现实」/「真」（全卷 29 + 42 处）、
  Mitte（中项）规则误命中 Mittel（手段）、Bestimmtheit 误命中 Unbestimmtheit、
  Nichts 误命中 Nichtsein、以及 § 引用块因 zh.length > 12 触发「Chinese without CJK」
  （该判据是长度阈值不是模式，全卷 9 处存量同类在 w1/w2）。**不要为了消警告改译文。**
- **排产**：已排每 5 小时一轮的续做任务（首次 2026-10-19 02:20）。任务书写明
  **「残局优先」**（先看 git status 收上一轮的尾）与 **「不派子代理」**（BYOK 月度配额
  2026-10-23 才重置）。
- **远端**：本波推到 fork（selfish-sin/read-hegel）main；origin（ismism-learner）未动。

### 验收（每次改动数据或分句器后都跑）

```bash
node scripts/verify-coverage.mjs          # 覆盖率独立重算并与站内索引比对
node scripts/verify-hover-sweep.mjs       # 多章悬停联动（句数 de=zh=en、下划线、下沉）
node scripts/verify-paragraph-align.mjs   # 逐段对齐（段落+标题+脚注 每块一行）
node scripts/sweep.mjs --per 2            # 全卷浏览器普查，0 JS 错误
node scripts/audit-sentences.mjs          # 并句检查（真实并句应为 0）
```

## 五、当前状态（交接时）

| 卷 | 状态 |
|---|---|
| Bd. 1 早期著作 | ✅ 22/22 节 · 3,740 句 |
| Bd. 2 耶拿著作 | ✅ 15/15 节 · 3,270 句 |
| Bd. 3 精神现象学 | ✅ **正文 100%**（序言→绝对知识，w3/0–15 正文 15/15 分节 · 4,800 句；全块 4,800/4,959 句 = 96.8%，未译部分为编者附庸） |
| Bd. 4 纽伦堡与海德堡时期著作 | ✅ **16/16 分节 100%** · 5,501 句（w4/0–15 全 100%，第 4 卷整卷收官于第 50 波） |
| Bd. 5 《大逻辑》 | **5/38 分节** · 1,176 句（13.2%）：w5/0–w5/3 整节 100%；w5/4「c. Die Endlichkeit ＋ C. Die Unendlichkeit」批 1 已译 42/71 块（126/243 句） |
| 合计 | **18,487 / 92,117 句 = 20.07%**（第 54 波收官时） |

覆盖率另有按段落的数字：5,640 / 17,948 = 31.42%（标题 541 / 2,847）。

**第 38 波刚完成**（2026-10-17）：w4/5 **15 单元 / 258 块 / 388 句全分节 100%**，覆盖率 14.75% → **15.17%**。
本节内容跨两段：前 4 单元收尾 1809/10 逻辑学（关系推论 → 概念的实现 → 观念论开篇），
104 块之后跳入 **1810/11《中等阶级的逻辑》**（`7. Logik für die Mittelklasse`，含导论与存在论本体论：
存在/无/生成 → 定在/界限 → 自为存在/一与多 → 量/度 → 本质/现象/物 → 关系/力 → 实体/偶性/现实性）。

> **★ 本波全部 15 个单元由主代理翻译**：子代理的 BYOK 月度配额要到 2026-10-23 才重置
> （第 37 波记录的错误类型）。主译的质量门与 worker 完全一致（结构对齐 + 句级违禁词 + DNT 逐字保留），
> 但**术语裁定要靠自己回查权威序**——本波 47 条 qa 标记里 4 条 major，逐一判读后修掉 1 处真违禁
> （`Realität` 名词被译成「现实性」）＋ 6 处实质缺陷，**其余全是词形/词性误报**
> （`Seine`≠`Sein`、`verhält sich` 是动词、`Im Unterschiede von` 是介词、`Nichtsein`≠`Nichts`、
> `Mittel`「手段」≠`Mitte`「中项」、短讲稿片段的长度比）。

> **本波最重要的术语裁定（三组易混对）**：
> - **`Identität`→同一**（w4 卷内 106 处「同一」对 11 处「同一性」；「同一性」是 w2 理论文体的用法，不引入本卷）。
> - **`Verschiedenheit`→相异 与 `Unterschied`→差别 严格分工**（前者与共享词表 `Verschchiedene=相异` 一致）。
>   写上下文包时我一度把两者都写成「差别」，qc 立刻揪出本波内 3 处自相矛盾——**新术语入包后要用 qa 回查一遍**。
> - **`Totalität`→总体性 / `Allheit`→全体性 / `Ganzes`→整体** 三者分开：`Totalität` 严禁「全体」，
>   而 `Allheit`（全部性）是另一个德文词，可作「全体性」；`das Ganze` 一律「整体」（w4 已有 46 处）。
>   另 `Schranke`→界限（讲稿中与 `Grenze` 并提同译）。

> **`Realität` 词根硬要求（qa 家族守卫会拦）**：名词 `Realität`=实在性（禁「现实性」），
> 形容词 `realen` 也须守「实在」词根（「实在的规定」），而 `wirklich` 才作「现实的」。
> **验收全绿**：trans-index ALIGNMENT OK、check-policy exit 0、validate/integrity/verify-coverage/
> audit-sentences 全 exit 0；w4/5 浏览器实测 **pairs=259**（258 译块＋1 fn）、**388 句三语全渲染**、
> missing/mismatch/空中文/JS 错误全 0；固定 8 页回归 8/8。术语层 entries 199 → **260**。
> qa 剩余 31 条全部已判读登记（多为上述误报类别）。

> **★ 端口被别的会话占用会伪装成「译文把阅读器弄坏了」**：本波 8860 被一个 `pythonw.exe` 占着，
> 根路径仍返回 200，但 `reader.html` 404、`verify-paragraph-align` 全页 `pairs=0 / errors=2`。
> **判据：先看计数列——`pairs=0` 说明根本没测到东西**，不是内容有问题。换个空闲端口重起服务即可。
> 已把 `verify-paragraph-align.mjs` 的硬编码 `8860` 改为读环境变量 `HEGEL_READER_PORT`（默认仍是 8860）。

**第 37 波刚完成**（2026-10-17）：w4/4「[Neuer Ansatz] Logik」（第二种尝试·逻辑学，1809/10 讲稿）

**第 37 波刚完成**（2026-10-17）：w4/4「[Neuer Ansatz] Logik」（第二种尝试·逻辑学，1809/10 讲稿）
**15 单元 / 286 块 / 369 句全分节 100%**，覆盖率 14.35% → **14.75%**。本节走完判断逻辑
（质的/量的/关系的/模态的判断）→ 推论逻辑（E-B-A / A-E-B / B-A-E 三形式与归纳、类比）。

> **★ 本波起子代理有第二种失败模式：BYOK 月度配额耗尽**（`w4-4-251`／`w4-4-264` 报
> "exceeded the monthly usage quota … reset at 2026-10-23"，与 wave34/35 的账号 Token Plan
> 上限 2067 是两回事）。该错误**不会短时间恢复**（要等到 10-23），立即重派必再失败。
> 处置：这 2 个单元改由**主代理直接翻译**（同节有 `4.p136.json` 平行先例可循），
> 产出与机器自检标准与 worker 完全一致。其余 13 单元由子代理完成。
> 另：`w4-4-110` 任务报 failed **但磁盘已完整落盘**（第 N 次验证「失败 ≠ 未落盘」）——
> 实测 26/26 块结构与 ns 全对齐，直接合并未重译。**判据永远是以磁盘为准**。

> **本波最重要的术语裁定：`Gleichheit`→等同、`Ungleichheit`→不等同**（共享词表 ③），
> 覆盖卷内先例的「相等／不相等」（④）。块 49/53/130 原循词表作「等同」，
> 而 p85/p110/214/251 循 sibling 先例作「相等」——**用户政策的权威序是
> 词族政策 > 卷级上下文包 > 共享词表 > 通行译名，同卷先例不在权威序内**（最多算第四档
> 「通行译名＋同卷先例」），故合并后把 10 处「相等」拉平回词表译法。
> 同类拉平还有：`Tugend` 德性→美德、`Natur`「规定了的自然」→「规定了的本性」、
> `Angemessenheit` 三译并存（适切性／相称／相宜）→ **相宜**（同块 p136 先例＋已入册＋块内多数）。
> **教训：worker 有权在 glossar 里登记"从卷内先例"的偏离，但主代理合并时必须按权威序复核**——
> 这类偏离若当时不拦，会在同一分节里留下两种译法。

> **逻辑学术语层已入上下文包**：entries 141 → **199**（`Schluß`→推论、`Schlußsatz`→推论句、
> `Prämisse`→前提、`Obersatz/Untersatz`→大/小前提、`Extrem`→极端、`Mitte`→中项、
> `das Einzelne/Besondere/Allgemeine`→个别者/特殊者/普遍者、`Inhärenz`→固有、
> `subsumieren`→归摄、`Angemessenheit`→相宜、`assertorisch/problematisch/apodiktisch`→
> 断言的/有问题的/断言式的、`singuläres/partikuläres/unendliches/identisches Urteil`→
> 单称/特称/无限/同一判断、`Reflexionsprädikat`→反思谓词、`Folge`→后果、`Größe`→量、
> `Figur`→格、`Satz`→命题 等）。w4/5 起的关系范畴（`Ursache`→原因、`Substanz`→实体、
> `Akzidenz`→偶性）可直接沿用。
> 两条已登记例外：`Wesen` 实体义作「存在者」（上下文包条例外含单数 `endliches Wesen`）；
> `Erde` 天文类比义作「地球」（地质学义仍是「大地」）。

> **全套验收全绿**：trans-index ALIGNMENT OK、check-policy exit 0、validate/integrity/
> verify-coverage/audit-sentences 全 exit 0；w4/4 浏览器实测 **pairs=287**（286 译块＋1 个 fn 块）、
> **369 句三语全渲染**、missing/mismatch/空中文/JS 错误全 0；固定 8 页回归 8/8。
> qa-trans critical 0；w4/4 余 5 条全部已裁定（#43 英译长度比良性、#71 `Figur` 日常义
> 「形状」误报、#270 `Wesen` 实体义例外、#285 `Erde` 天文义例外）。

**第 36 波刚完成**（2026-10-17）：w4/3「2. Dialektik der Kategorien des Wesens」**14 单元 / 235 块 / 354 句全分节 100%**，
覆盖率 13.96% → **14.35%**。本节跨本质范畴辩证法 → 判断逻辑 → 意识诸阶段（感觉/知觉/自我意识/主人与奴隶/理性）。
质检密度 **0.0282 条/句，仅全库均值的 1/3**（12 条 → 修正后 10 条），零违禁词命中。
修 1 处真缺陷：`b28` `einfache Materie` 译「质料」→ 按上下文包裁定改「物质」，
并把这条亚里士多德式本体论的语境张力登记进 `Materie` 的 note（`Materialität` 才作质料）。
另 1 条 major（`b179` 英译略长）三语核对为误报。

**第 35 波刚完成**（2026-10-17）：w4/2「III. Der Staat (Realer Geist)」国家篇 **16 单元 / 287 块 / 387 句全分节 100%**。
覆盖率 13.54% → **13.96%**。本波质检密度 **0.0413 条/句，不足全库均值（0.0861）的一半**，
6 条 major 逐条三语核对后确认**全是误报**（残句切分伪影 ×1、中文简洁导致的长度比 ×4、`wirklich` 作「真正的」非「实在的」×1）。
另登记 2 条违禁词误报为上下文包例外：`Mittelklasse`→中产阶级（`Stände` 的「阶级」禁译不适用于此）、
`Seelenlehre`→灵魂学说（「灵魂」留给 `Seele`，禁的是把 `Geist` 译成灵魂）。

> **★ 本 Session 子代理并发上限实测 = 4**（不是 8）。派第 5 个即报 `SUBAGENT_CONCURRENCY_LIMIT`。
> 16 单元的波次必须**轮转补派**：保持 4 个在跑，每完成一个补一个。此前几波都是「每批 4 个」
> 恰好在限内，一直没暴露；wave35 派 8 个时被拒 4 个才发现。
> 另：16 个 worker 里只有 4 个留下 `build-w4-2-*.mjs` 构建脚本（其余直接写 JSON），
> 未留脚本不代表没译——**仍以磁盘分片为准**。

**第 34 波完成**（2026-10-17）：w4/1「Zweiter Abschnitt Physik」（自然哲学讲稿）**全分节 100%**
（13 单元 / 22 块补充 / 314 句全量；199 个可译块全部译出，块 199 为 k="fn" 编者注不译）。
先建自然哲学术语层再开译：上下文包 entries 127→**141**、forbidden 51→**57**，
新增 `Intelligenz`→理智、`Körper`→物体、`Materie`→物质、`Totalität`→总体性、`Licht`→光、
`Element`→要素、`Gefühl`→感觉、`Affektion`→感受、`Potenz`→潜能、`Erde`→大地、`Waffen`→武器、
`Außereinandersein`→彼此分离、`Beschaffenheit`→性质、`Existenz`→存在。

> **第 34 波配额事件（已解决）**：`w4-1-177`、`w4-1-195` 曾因**账号 Token Plan 用量上限**（错误码 2067）
> 失败；`w4-1-143`／`w4-1-161` 报同一错误但**落盘前已写完文件**（磁盘实测 11/13）。
> 配额恢复后 2 个单元已补译合并，**w4/1 全分节 100% 完成**。
> 判据：**失败 ≠ 未落盘，必须实测磁盘**（本波两个单元报错却已完整落盘，另有第三次：
> bg_239e68dd 的 task final result 只到翻译草稿，但磁盘文件已完整）。

> **第 34 波质检密度 0.0893 条/句**（32 条 → 修复后 25 条），接近全库均值 0.0874。
> 逐条核查后**修掉 6 处真缺陷**：`#23` wirkliche Individualität 误作「实在的」（应「现实的」）；
> `#141` wirkliche Stufe 误作「真正阶段」（应「现实阶段」）；`#102` Person 在神学语境误作
> 「神中的一个人」（应「神性中的一位位格」）；`#102` Vorstellung 意译丢失词根（补回「表象」）；
> `#165` 两处 Gefühl 误作「感受」（与 Affektion 撞车，改回「感觉」）。
> 另统一 `Intelligenz` 同词两译（2 处「理智」／2 处「智力」→ 一律「理智」）。

> **守卫误报 6 条已逐条登记为例外**（不必再复核）：`#46` organischer Körper＝有机身体（人类学语境）；
> `#96` höheren Geistern＝更高精灵（神秘学复数）；`#155` 实为 `reell`（实在的）被按 Realität 家族误报；
> `#72`／`#93` 英译自然长于德文（ratio 阈值）；`#96` 短句长度比 0.21（非漏译）。
> **判据**：机器报 major 不等于有缺陷，先看三语对照再决定改不改。

> **w4 关键裁定**：`Recht`→权利（法）；`Landstände`→等级议会（79 次，共享词表「地方等级」在此卷作废）；
> `Staatsgesellschaft`→国家社会（本卷 5 次，而 `bürgerliche Gesellschaft` 实测 **0 次**，故未收录）；
> `Ideenlehre`→观念论（黑格尔自己的学说，覆盖共享词表柏拉图义「理念论」）；
> `Quantum`→量数（禁「量子」假朋友，与 `Quantität`→量 严格分译）；`Etwas`→某物；
> `Gymnasium`→文科中学（禁「体育馆」）、`Kultus`→礼拜（禁「文化」）、`Disziplin`→纪律（禁「学科」）。
> **自然哲学层**（第 34 波新增）：`Intelligenz`→理智（与 Verstand 知性／Vernunft 理性构成主观精神三分，
> 不取「智力」）；`Körper`→物体与 `Materie`→物质、`Organismus`→有机体三分；
> `Gefühl`→感觉与 `Affektion`→感受严格分开；`Element`→要素（**例外**：四元素土水火气义作「元素」）；
> `Potenz`→潜能（**例外**：unorganische Potenzen 作「诸种力」）；`Totalität`→总体性
> （**例外**：物理语境「导回整体统一体」作意译）。

> **第 4 卷文体提示**：w4 是**哲学讲稿／学监报告／政治评论**，不是 w3 那种体系著作。
> 大量 1 句的范畴定义（讲稿提纲式省略照译，不替作者补谓语），术语按 `context-w4.json`。
> w4/1 另有**编者引述的精神病病例长段**（如 #102：尿淹城、大麦粒、玻璃脚），残句照残句译，
> 其中 `Person` 在神学语境（神性中的位格）与法权语境（人格）须分开。

> **worker 自述一律以磁盘为准**（已实测两次）：第 33 波 build-context worker 自述为凑条目上限
> 「裁剪掉」`Freiheit`，磁盘实测该词在册且必需术语 19/19 全覆盖。

> **关于 Bd. 3 的编者附庸（有意不译）**：w3/15 末尾的传记年表（bi25-26，126 句）与
> w3/16「Lektürehinweise」书目（33 句）是 Suhrkamp 版编者附庸，不是黑格尔正文，保留德文原文。
> 与 fn 编者校注的处理同层（见 §六 版权三层）。若日后要补，需把 126 句表格块手工拆单元——
> make-jobs 会把它并进一个 146 句超单元，违背流水线 25-30 句契约。

### 远端布局（重要）

| remote | 指向 |
|---|---|
| `origin` | `git@github.com:ismism-learner/read-hegel.git`（原仓库，**私有**） |
| `fork` | `git@github.com:selfish-sin/read-hegel.git`（本次工作推送到这里） |

推送走 `fork`：`git push fork main`。SSH 身份约束见下文 §七。

> **origin 的真实状态（第 34 波核实，纠正此前误记）**：原仓库 main 停在 `f8cd477`
> 「补上交接缺口：workflow 工具的脚本模板」（2026-10-14，即**第 29 波**节点），
> 既未前进也未被重写。fork 从该点接续，`git rev-list --count f8cd477..HEAD` = 6
> （wave30–34），是干净的 fast-forward，无分叉。
> **不要把本地／fork 的 HEAD 当成 origin 的 HEAD**——此前记录「origin HEAD = 64b7dc8」有误，
> 64b7dc8 是 fork/本地的第 33 波交接提交。若日后要回哺原仓库，需先从 origin fetch 再比差异。

### 下一步（按优先级）

1. **继续第 5 卷**：w5/4 批 2 ＝ 单元 **w5-4-42 / w5-4-49 / w5-4-54 / w5-4-62 / w5-4-68**
   （5 单元 / 28 块 / 117 句，覆盖 bi42–bi69），吃完后 **w5/4 整节 100%**（只剩 bi70 的 fn 编者块，按契约不译）。
   切片已入库：`data/_jobs/jobs-wave54.json`（18 单元＝w5/4 的 10 单元 + w5/5 的 8 单元）＋ **w5/4 的 10 个 `w5-4-*.in.json` 全部入库**（含下一批的 5 个）；**`w5-5-*.in.json` 属跨节溢出，本波不入库**（照第 48 波处置：只做目标节）；
   **第 54 波只做了前 5 个单元**（w5-4-0 / 10 / 20 / 24 / 33）。**★ 下一批直接用已入库的 w5-4-42/49/54/62/68 即可，别重跑 `make-jobs` 重切 w5/4**（会把 bi0–bi41 再切一遍、白做一遍）。
   **`--limit` 只在分节边界检查、节内 flush 不看它**（实测：切 w4/9 传 `--limit 10` 得到 11 单元，正是整节切完才停）。
   **★ 跨节溢出的实测（第 48 波）**：切 w4/13 传 `--limit 9` 实际得到 units=22 sentences=605——w4/13 只有 7 单元（203 句），
   多出的 15 个单元（402 句）是下一节的。**处置**：只做目标节，把 `jobs-<prefix>.json` 裁到目标节的单元 id，
   并把多生成的下一节 `.in.json` 删掉（可恢复删除）再提交。
   **真正的坑（第 43 波）**：目标节已 100% 时别再跑 `make-jobs`——它会滚到下一节、覆盖 `jobs-<prefix>.json` 并多生成一批 `.in.json`；
   跑之前先确认目标节是"第一个未译节"。
   **★ BYOK 子代理月度配额 2026-10-23 23:59 才重置**——在此之前不要派子代理，直接主译；
   若报 `monthly usage quota` 不重派；若报 `Token Plan 用量上限 (2067)` 属账号级可稍后重派一次。
2. **未审校章节**：w1（22 节）、w2（15 节）整卷尚未逐章审校——它们译于词族政策之前，
   可用 `make-review-jobs` 分批补审；也可用 `apply-families.mjs` 先做一次词族归一。
   w3/13–w3/15（宗教章与绝对知识章）也尚未逐章审校。
3. **遗留待复核**：约 17 处词族断裂、约 10 处背靠背重复（经核实多为原文复沓）、
   以及 `qa-trans.mjs` 末尾列出的可疑词条。
4. **w3/13–w3/15 的术语草表**尚未人工过目（`merge-glossar.mjs` 已把新条目并入
   `glossary/hegel_glossar.csv`，`status=unsicher` 的条目集中在宗教章与绝对知识章：
   `Entzweiung`、`Verklärung`、`Menschwerdung`、`Begeistung`、`Erstehen`、`vindizieren`、
   `Kelch`、`Einsame` 等；另有 `Wesenheit` 一处 wave32 用了「本质性」（variante，
   偏离共享词表「实质性」），待统一）。
5. **w4 后续分节的术语待裁定**：`merge-glossar` 已并入 380 条，其中宗教讲稿（w4/9）、
   学校报告与演讲（w4/10-12）已开译，海德堡政治评论（w4/13 已译、w4/14-15 尚未开译），裁定时沿用 `context-w4.json`。

## 六、仓库里**没有**的东西（有意排除）

| 排除项 | 原因 | 需要时怎么办 |
|---|---|---|
| `data/_backup/`（35 MB） | 重建前的整库快照，仅为回滚保险；当前状态完整，无需随仓库迁移 | 换机器后不需要；要留档可自行压缩另存 |
| `data/_jobs/_applied/` | 已并入正文的补丁文件（留下会导致重复套用） | 无需恢复 |

其余一律在仓库里，包括：**第一代架构的旧译文**（`data/_archive/`，如 `w3-0-v1.json`）、
任务载荷与卷级上下文包（`data/_jobs/`）、调研与批评摘要（`data/_research/`）、
全部脚本与验收工具（`scripts/`）、词表与词族表（`glossary/`）、以及 `docs/` 下这三份文档。

## 七、容易踩的坑（都真实发生过）

1. **别用管道截断**看质检输出（`| Select-Object -First N`）：Node 进程会在写报告前被杀，
   拿到的是过期报告，曾据此得出错误结论。
2. **改分句器必须重跑全套验收**：`build.mjs` → `audit-sentences` → `validate` → `trans-index` →
   `verify-hover-sweep`。分句器曾因底本畸形嵌套标签把整段并成一句（659 块）。
3. **审校代理的改动不是权威**：逐条回查德文再决定；曾有一处把盐的 `scharf` 由"咸"改成"辛辣"。
   补丁应用后必须归档到 `data/_jobs/_applied/`。
4. **术语规则按卷生效**：不要拿《逻辑学》的术语表去要求 1795 年的早期文稿。
5. **政策 > 通行译名**：`唯心主义`、`理念` 这类通行译名与政策冲突时，一律以政策为准
   （`check-policy.mjs` 会拦）。
6. **版权**：黑格尔文字公有领域；编者校注（`fn` 块，263 块）另属一层。
   公开部署前跑 `node scripts/build.mjs --drop-editorial`（已实测：263 → 0，正文与句数不变）。
7. **PowerShell 5.1 限制**：不支持 `ForEach-Object -Parallel` 与三元 `? :`；`node -e` 里的引号
   易被吞（复杂脚本请写成文件再跑）；`>` 重定向默认 UTF-16LE，读回时要处理 BOM。
8. **CDP 类验收脚本要先起本地服务**：`verify-paragraph-align.mjs`、`verify-hover-sweep.mjs`
   走 `http://127.0.0.1:8860` 的 CDP。服务没起时它们**不报错，而是全部显示 ✗ 且 `pairs=0 / errors=0`**——
   极易误判成"新译的章渲染坏了"。先 `node scripts/serve.mjs --port 8860` 再跑。
9. **`make-jobs.mjs` 的 `--limit` 是分节粗截断，不是单元数**：`--limit 13` 实测切出 24 个单元
   （整节切完才停）。别按参数名字面意思规划波次规模。另外**不要把 `--help` 当参数传**，
   它会被当成 prefix，误生成一波任务文件并**覆盖同名 tracked 文件**
   （本次就覆盖并删掉了上游跟踪的 `data/_jobs/jobs-wave1.json`，靠 `git checkout --` 恢复）。
