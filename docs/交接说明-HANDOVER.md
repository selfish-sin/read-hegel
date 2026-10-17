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
| Bd. 4 纽伦堡与海德堡时期著作 | 2/16 分节 · 633 句（w4/0 纽伦堡讲稿·逻辑学；w4/1 自然哲学；上下文包已建） |
| 合计 | **12,443 / 92,117 句 = 13.51%** |

覆盖率另有按段落的数字：3,225 / 17,948 = 17.97%。

**第 34 波刚完成**（2026-10-17）：w4/1「Zweiter Abschnitt Physik」（自然哲学讲稿）**11/13 单元**
177 块 / 280 句。本波**先建自然哲学术语层再开译**：上下文包 entries 127→**141**、forbidden 51→**57**，
新增 `Intelligenz`→理智、`Körper`→物体、`Materie`→物质、`Totalität`→总体性、`Licht`→光、
`Element`→要素、`Gefühl`→感觉、`Affektion`→感受、`Potenz`→潜能、`Erde`→大地、`Waffen`→武器、
`Außereinandersein`→彼此分离、`Beschaffenheit`→性质、`Existenz`→存在。

> **第 34 波三个失败单元**：`w4-1-177`、`w4-1-195` 因**账号 Token Plan 用量上限**（错误码 2067，
> 「当前已达到 Token Plan 用量上限」）失败，非瞬时限流，重派无效；`w4-1-143`／`w4-1-161` 报同一错误
> 但**落盘前已写完文件**（磁盘实测 11/13），已合并入账。剩余 54 句待套餐恢复后续派。
> 判据：失败 ≠ 未落盘，**必须实测磁盘**（本波两个单元报错却已完整落盘）。

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

1. **续派第 34 波剩余 2 单元**（54 句，Token Plan 恢复后）：`w4-1-177`、`w4-1-195`，
   输入文件已在盘（`data/_jobs/w4-1-177.in.json`、`w4-1-195.in.json`），
   跑 `make-jobs --vol w4 --size 25 --prefix wave34b --from 177` 或直接按已有 in.json 重派，
   译完 `merge-trans --jobs data/_jobs/jobs-wave34b.json` 即可增量并入 w4/1。
2. **继续第 4 卷**：`make-jobs --vol w4` 会自动接着 w4/2 往后（上下文包已在手，可直接开译）。
   w4/2 起进入国家、法哲学、义务论讲稿。
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
