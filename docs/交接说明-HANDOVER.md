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
node scripts/serve.mjs --port 8788      # 本地静态服务（gzip）
# 浏览器打开 http://127.0.0.1:8788/
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
| Bd. 3 精神现象学 | ✅ **正文 100%**（序言→绝对知识，w3/0–15 正文 15/15 分节 · 4,800 句） |
| Bd. 4 纽伦堡与海德堡时期著作 | 5/16 分节 · 1,777 句（w4/0 逻辑学、w4/1 自然哲学、w4/2 国家篇、w4/3 本质范畴、w4/4 逻辑学第二种尝试 **均 100%**） |
| 合计 | **13,587 / 92,117 句 = 14.75%** |

覆盖率另有按段落的数字：3,992 / 17,948 = 22.24%。

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

1. **继续第 4 卷**：`make-jobs --vol w4` 会自动接着 w4/4 往后（上下文包已在手，可直接开译）。
   **w4/4 已完成**；下一节 w4/5「C. Schlüsse der Relation」（关系范畴的推论）、
   w4/6「B. Ursache」（原因），w4/7「Erster Abschnitt Rechtslehre」才是法权学说。
   注意 `Ursache`→原因、`Substanz`→实体、`Akzidenz`→偶性、`Gesetz`→规律 的区分；
   推论节术语（中项/极端/前提/单称·特称判断等）已在 context-w4 条目 199 条内。
   另注意：**子代理若再报配额类错误（2067 或 monthly quota），不要立即重派**——
   先判因，额度不恢复的（monthly quota）直接改由主代理译，参照第 37 波 251/264 的做法。
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
5. **w4 后续分节的术语待裁定**：`merge-glossar` 已并入 380 条，其中宗教讲稿（w4/8-9）、
   学校报告与演讲（w4/10-12）、海德堡政治评论（w4/13-15）尚未开译，裁定时沿用 `context-w4.json`。

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
   走 `http://127.0.0.1:8788` 的 CDP。服务没起时它们**不报错，而是全部显示 ✗ 且 `pairs=0 / errors=0`**——
   极易误判成"新译的章渲染坏了"。先 `node scripts/serve.mjs --port 8788` 再跑。
9. **`make-jobs.mjs` 的 `--limit` 是分节粗截断，不是单元数**：`--limit 13` 实测切出 24 个单元
   （整节切完才停）。别按参数名字面意思规划波次规模。另外**不要把 `--help` 当参数传**，
   它会被当成 prefix，误生成一波任务文件并**覆盖同名 tracked 文件**
   （本次就覆盖并删掉了上游跟踪的 `data/_jobs/jobs-wave1.json`，靠 `git checkout --` 恢复）。
