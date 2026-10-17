import fs from 'node:fs';

const root = 'C:/Users/21886/.minimax/sessions/mvs_c7c434fcb8bd4ef4ad2ebfa44ff633d0/workspace/gh-projects/read-hegel';
const out = {
  blocks: {
    '136': {
      en: ['\u00a7 [62]'],
      zh: ['\u00a7 [62]'],
    },
    '137': {
      en: [
        'Assertive [judgments].',
        'The constitution of the subject not yet developed.',
      ],
      zh: [
        '断言的[判断]。',
        '主体的性质尚未展开。',
      ],
    },
    '138': { en: ['\u00a7 [63]'], zh: ['\u00a7 [63]'] },
    '139': {
      en: [
        'Against the mere undeveloped44) assertion of the assertive judgment, the opposite assertion can be maintained with the same formal right.',
        'Insofar as thereby there is only the possibility that either the one or the opposite predicate accrues to the subject, the judgment is problematic.',
      ],
      zh: [
        '对断言式判断仅仅尚未展开的44)断言，可以用同样的形式权利主张相反的断言。',
        '只要由此仅仅存在一种可能性，即主体将会得到那一个谓词或与之相反的谓词，那么这个判断就是有问题的。',
      ],
    },
    '140': { en: ['\u00a7 [64]'], zh: ['\u00a7 [64]'] },
    '141': {
      en: [
        'The subject45) is therefore to be posited with a determination which expresses its constitution, in which the appropriateness or inappropriateness of determinate being with the concept lies.',
        'This modal judgment is apodictic.',
      ],
      zh: [
        '因此主体45)须用一个表达其性质的规定来设定，而在这一规定中，落定的是定在与概念相宜还是不相宜。',
        '这个模态判断是断言式的。',
      ],
    },
    '142': { en: 'III. Syllogism', zh: 'III. \u63a8\u8bba' },
    '143': { en: ['\u00a7 [65]'], zh: ['\u00a7 [65]'] },
    '144': {
      en: [
        'In the judgment two moments of the concept are immediately related to one another; the syllogism contains their mediation or their ground; in it two determinations are joined together by a third, which is their unity.',
      ],
      zh: [
        '在判断中，概念的两个环节被直接地互相关联；推论包含它们的中介或它们的根据；其中两个规定由第三个——即它们的统一——结合在一起。',
      ],
    },
    '145': { en: ['\u00a7 [66]46)'], zh: ['\u00a7 [66]46)'] },
    '146': {
      en: [
        'The two determinations joined together are the extremes, termini extremi; the determination connecting them is their middle, terminus medius.',
      ],
      zh: [
        '那两个结合在一起的规定是极端，termini extremi；把它们连接起来的规定是它们的中项，terminus medius。',
      ],
    },
    '147': { en: ['\u00a7 [67]'], zh: ['\u00a7 [67]'] },
    '148': {
      en: [
        'The two extremes behave toward one another like individuality and universality, the middle as particularity.',
      ],
      zh: [
        '两个极端彼此相关如同个别性与普遍性，中项则是特殊性。',
      ],
    },
    '149': { en: ['\u00a7 [68]'], zh: ['\u00a7 [68]'] },
    '150': {
      en: [
        'The middle behaves as subsuming toward individuality, as subsumed toward universality.',
      ],
      zh: ['中项对个别性表现为归摄的一方，对普遍性表现为被归摄的一方。'],
    },
    '151': { en: ['\u00a7 [69]'], zh: ['\u00a7 [69]'] },
    '152': {
      en: [
        'Since the universal subsumes the particular under itself, and the particular subsumes the individual under itself, so the universal also subsumes the individual under itself, and the former is predicate of the latter.',
        'Or conversely, since the individual contains in itself the determination of the particular, but the particular the determinacy of the universal, so the individual also contains the universal in itself.',
      ],
      zh: [
        '既然普遍性归摄特殊性于自身之下，而特殊性又归摄个别者于自身之下，那么普遍性也归摄个别者于自身之下，并且前者是后者的谓词。',
        '或者反过来，个别者在自身中包含特殊的规定，而特殊性包含普遍的规定性，于是个别者也在自身中包含普遍性。',
      ],
    },
    '153': { en: ['\u00a7 [70]'], zh: ['\u00a7 [70]'] },
    '154': {
      en: [
        'The relations of the two extremes to the middle are immediate; these relations expressed as propositions or judgments are called the premises of the syllogism, namely the one which contains the extreme of universality (terminus maior), the propositio maior, the one which contains the extreme of individuality, the [propositio] minor.',
      ],
      zh: [
        '两个极端对中项的关系是直接的；这些关系表达为命题或判断时，就叫做推论的前提，即那个包含普遍性这一极端（terminus maior）的，那叫 propositio maior；那个包含个别性这一极端的，那叫 [propositio] minor。',
      ],
    },
    '155': { en: ['\u00a7 [71]'], zh: ['\u00a7 [71]'] },
    '156': {
      en: [
        'The relation of the two extremes to one another is the mediated one and is called the syllogistic conclusion, conclusio.',
      ],
      zh: ['两个极端彼此之间的这个关系就是被中介了的关系，叫做推论句，conclusio。'],
    },
    '157': { en: ['\u00a7 [72]'], zh: ['\u00a7 [72]'] },
  },
};

const main = `${root}/web/data/trans/w4/4.p136.json`;
fs.mkdirSync(`${root}/web/data/trans/w4`, { recursive: true });
fs.writeFileSync(main, JSON.stringify(out, null, 2), 'utf8');

const rows = [
  ['de', 'en', 'zh', 'status', 'note'],
  ['Angemessenheit / Nichtangemessenheit', 'appropriateness / inappropriateness', '相宜 / 不相宜', 'ok',
    '上下文包与共享词表均未收；本单元 §64「定在与概念相宜或不相宜」。备选：适当性 / 不适当性、契合 / 不契合'],
  ['Bestimmung', 'determination', '规定', 'ok',
    '上下文包与共享词表只有 Bestimmtheit＝规定性；此处名词 Bestimmung 单数作「一种规定」不另立词根'],
  ['Modalitätsurteil', 'modal judgment', '模态判断', 'ok',
    '上下文包未收；共享词表有 Modalität＝模态；本单元 §64「Dieses Modalitätsurteil」。备选：模态的判断'],
  ['Prämissen', 'premises', '前提', 'ok',
    '上下文包与共享词表均未收；共享词表 Schluß＝推论，本词为推论的「前提」。备选：前件（易与条件句混淆，不取）'],
  ['subsumierend / subsumiert', 'subsuming / subsumed', '归摄的 / 被归摄的', 'ok',
    '共享词表只有 Subsumtion＝归摄、subsumieren＝归摄（variante）；此处为分词形式，按同一词根译。备选：摄 / 被摄'],
  ['termini extremi', 'termini extremi', '（原样保留）', 'ok',
    '拉丁术语；卷级 styleGuide 第 12 条规定拉丁术语不译不动、必要时括注中文。括注：两端／极端'],
  ['terminus medius', 'terminus medius', '（原样保留）', 'ok',
    '同上；括注：中项。与共享词表 Mitte＝中项 配套'],
  ['terminus maior', 'terminus maior', '（原样保留）', 'ok',
    '同上；括注：大项。任务书裁定 major terminus＝大项；本单元原文作「Extrem der Allgemeinheit（terminus maior）」，故按原文逐字译作「普遍性这一极端」并括注原文，不代改为「大项」'],
  ['propositio maior / [propositio] minor', 'propositio maior / [propositio] minor', '（原样保留）', 'ok',
    '同上；括注：大前提 / 小前提。与 terminus maior／minor（大项／小项）不同，propositio 指句子而非项，原文方括号缺字照残句保留'],
  ['conclusio', 'conclusio', '（原样保留）', 'ok',
    '同上；括注：推论句。与共享词表 Schlußsatz＝推论句 配套'],
  ['formelles Recht', 'formal right', '形式权利', 'unsicher',
    '上下文包 Recht 条把 das formelle Recht（成文制度义）定为「法」；本单元为逻辑学语境，指主张一个断言的形式权利，非成文制度义，故取「权利」。备选：形式法。须由用户裁定是否拉平'],
];

const csv = rows.map((r) => r.join(',')).join('\n') + '\n';
fs.writeFileSync(`${root}/data/_jobs/w4-4-136.glossar.csv`, csv, 'utf8');

console.log('written', main);
console.log('written glossar rows:', rows.length - 1);
