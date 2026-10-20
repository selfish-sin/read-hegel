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
| Bd. 3 精神现象学 | ✅ **正文 100%**（序言→绝对知识，w3/0–15 正文 15/15 分节 · 4,800 句） |
| Bd. 4 纽伦堡与海德堡时期著作 | **14/16 分节 100%** · 累计 4,733 句（w4/0–13 全 100%；w4/13 海德堡时期著作评述 7 单元 / 28 块 / 203 句**整节译完**） |
| 合计 | **16,543 / 92,117 句 = 17.96%** |

覆盖率另有按段落的数字：5,178 / 17,948 = 28.85%。

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

1. **继续第 4 卷**：`make-jobs --vol w4` 会自动接着 w4/14 往后（上下文包 `data/_jobs/context-w4.json` 468 条已在手，可直接开译）。
   **w4/13 已完成**；下一节 **w4/14「Heidelberger Schriften」续（约 15 单元 / 402 句）**，切片用
   `node scripts/make-jobs.mjs --vol w4 --size 25 --limit 9 --prefix wave49`。
   **`--limit` 只在分节边界检查、节内 flush 不看它**（实测：切 w4/9 传 `--limit 10` 得到 11 单元，正是整节切完才停）。
   **★ 跨节溢出的实测（第 48 波）**：切 w4/13 传 `--limit 9` 实际得到 **units=22 sentences=605**——w4/13 只有 7 单元（203 句），
   多出的 15 个单元（402 句）是 w4/14 的。**处置**：只做 w4/13，把 `jobs-wave48.json` 裁成 7 个 w4/13 单元 id，
   并把多生成的 `w4-14-*.in.json` 删掉（可恢复删除）再提交，别让下一节的切片混进本波。
   **真正的坑（第 43 波）**：目标节已 100% 时别再跑 `make-jobs`——它会滚到下一节、覆盖 `jobs-<prefix>.json` 并多生成一批 `.in.json`；
   跑之前先确认 w4/14 是"第一个未译节"。
   学年结束演辞术语（w4/9 已立：`Programm` 学年报告、`Rede` 演辞、`Oberklasse/Mittelklasse/Unterklasse` 高/中/低年级、
   `Generalkommissariat` 皇家总务署、`allerhöchst` 至高、`gnädigst` 恩霈）w4/10 已沿用并扩充（`Lokation` 名次评定、`Promotion` 升班、
   `Rektorat` 校务委员会、`Katechisation` 教理问答、`Nachtsingkollekte` 夜间唱诗募捐等），w4/11 再扩充（`Realschule` 实科中学、`Lyzeum` 高级中学、
   `Kameralwissenschaft` 官房学、`Humaniora` 人文诸科、`Gutachten` 鉴定书、`Medizinalkomitee` 医学委员会、`Absolutorium` 结业证书），
   w4/12 再扩充（`Normativ` 规章、`Metaphysik` 形而上学、`Kosmologie` 宇宙论、`Ontologie` 本体论、
   `Unterprimärschule` 下级初级学校、`Oberprimärschule` 上级初级学校、`Kollegium` 讲课、`Metrik` 韵律学、
   `Wortweisheit` 咬文嚼字、`Erbauung` 感化、`Übersicht` 概览、`Regierungsrat` 政府参议、`Konversatorium` 讨论课），
   w4/13 再扩充（`Substanz` 实体、`Negation` 否定、`Vermittlung` 中介、`Ding an sich` 自在之物、`Apperzeption` 统觉、
   `causa sui` 自因、`Hamann` 哈曼、`Moralprinzip` 道德原则、`das Positive` 实证、`Jacobi` 雅可比），供 w4/14 直接沿用。
   另注意：**BYOK 子代理月度配额 2026-10-23 23:59 才重置**——在此之前不要派子代理，直接主译；
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
