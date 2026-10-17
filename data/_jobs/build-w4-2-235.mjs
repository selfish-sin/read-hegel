// w4-2-235 翻译单元写入脚本（UTF-8 无 BOM）
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? '.');
const IN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/_jobs/w4-2-235.in.json'), 'utf8'));

const T = {
  '235': {
    en: ['The relation to what is other is a) that of difference in general; and stated generally as a proposition: There are no two things which are perfectly equal to each other; otherwise they would be the same22); - sensuous difference, sensuous determinate being.'],
    zh: ['对他者的关系是 a) 一般意义上的相异；若一般地表述为命题：没有两个东西是完全彼此等同的；否则它们就会是同一个22)；——感性的相异，感性的定在。'],
  },
  '236': { en: ['§ [24/56]'], zh: ['§ [24/56]'] },
  '237': {
    en: ['b) The relation of opposition; in it one determination is the positive and the other the negative of that same determination; stated as an ontological proposition: Of opposed predicates the one appertains to each thing, A is either B or -B; there is no third.'],
    zh: ['b) 对立的关系；在其中，一个规定是这同一个规定肯定的，另一个则是它否定的；表述为本体论命题：在相对立的谓词中，总有一个属于每个事物，A 或者说是 B，或者说是 -B；没有第三者。'],
  },
  '238': { en: ['§ [25/57]'], zh: ['§ [25/57]'] },
  '239': {
    en: [
      'The ground is the simple third which contains in itself the difference and the opposition of determinate being.',
      'The principle of ground is called: Everything has a sufficient ground.',
    ],
    zh: [
      '根据是单纯的三者，它在自身中包含着定在的相异与对立。',
      '根据命题叫做：一切都有一个充分的根据。',
    ],
  },
  '240': {
    en: ['makes white and black - crooked and straight; organic and inorganic - sun and light, earth; the determinate being is the externality of opposed relations, as different ones'],
    zh: ['分出白与黑——曲与直；有机与无机——太阳与光、大地；定在是相对立诸关系的外在性，作为相异者'],
  },
  '241': { en: '[C.] Reason', zh: '[C.] 理性' },
  '242': { en: ['§ [26/58]'], zh: ['§ [26/58]'] },
  '243': {
    en: ['Reason appears in relation to the determinations of understanding and of judgment as the dialectical movement of these.'],
    zh: ['理性在与知性的规定和判断的规定的关系中，显现为这些规定的辩证运动。'],
  },
  '244': { en: ['§ [27/59]'], zh: ['§ [27/59]'] },
  '245': {
    en: [
      'The dialectic of reason consists in showing forth the nature of these determinations, or rather in the nature of these determinations themselves, that in themselves they are not what they are posited to be in their determinacy, but that they pass over into their opposite.',
      'The dialectical of reason, insofar as it is at first only the sublation of the determinacy, is therefore at first something negative.',
    ],
    zh: [
      '理性的辩证法在于展示这些规定的本性，或者更确切地说，在于这些规定本身的本性：它们自在地不是它们在其规定性中被设定成的那个东西，而是过渡到它们的对立面。',
      '理性的辩证法，就它起初只是规定的扬弃而言，因而起初是某种否定的东西。',
    ],
  },
  '246': { en: ['§ [28/60]'], zh: ['§ [28/60]'] },
  '247': {
    en: ['The dialectical of the determinations can also be so represented, that from an ontological proposition which states a determinacy of understanding of what exists, its opposite can just as well be proved as itself.'],
    zh: ['这些规定的辩证法也可以这样表象：同一个本体论命题——它从存在者出发说出知性的一个规定——其对立面也同样可以像它本身一样得到证明。'],
  },
  '248': { en: ['§ [29/61]'], zh: ['§ [29/61]'] },
  '249': {
    en: ['Of what exists, on the one hand the one category can just as well be predicated as its opposite altogether; on the other hand, insofar as what exists is predicated through the category as something finite or conditioned, the negative dialectic has the form that what exists is at the same time represented as finite and at the same time as infinite in the ordinary sense of the word.'],
    zh: ['对存在者，一方面一个范畴同它的对立范畴总的来说同样可以被说出；另一方面，就存在者通过该范畴被说成一个有限者或有条件者而言，否定的辩证法具有这样的形式：存在者同时被表象为有限的，同时又被表象为通常意义所说的无限的。'],
  },
  '250': {
    en: [
      'Infinity',
      'Going beyond the determinacy α) world - beginning, and bounded in space β) atoms, divisible to infinity γ) first unconditioned cause, or going forth into the infinite',
    ],
    zh: [
      '无限性',
      '超出规定 α) 世界——开端，并在空间中受界限 β) 原子，可无限分割 γ) 第一无条件的因，或向着无限者前进',
    ],
  },
  '251': { en: ['§ [30/62]'], zh: ['§ [30/62]'] },
  '252': {
    en: ['These representations have been called antinomies of reason, - and this expression is not to be understood as if reason were incapable of recognizing the essence of what exists and thereby fell only into contradiction, but as meaning that into the determinations, as understanding holds them fast, this contradiction falls.'],
    zh: ['这些表述被称为理性的二律背反，——这一说法不应当理解为：理性无力认识存在者的本质，因而只在其中陷入矛盾；而应理解为：这个矛盾落入知性所固守的那些规定之中。'],
  },
  '253': { en: '1. Dialectic of the Categories of Being', zh: '1. 存在范畴的辩证法' },
  '254': { en: ['§ [31/63]'], zh: ['§ [31/63]'] },
  '255': {
    en: [
      'A. In the qualitative α) being is the abstraction completely without content and without determinacy; it is therefore the same as the nothing, which likewise is in thinking and thus has the same being as being itself.',
      'Being and nothing therefore do not have a truth as separate determinacies of understanding, but their truth is their passing over, the becoming.',
    ],
    zh: [
      'A. 在质的规定中 α) 存在是完全无内容、无规定的抽象；因此它与无是同一个，而无在思维中同样存在，因而具有与存在本身相同的存在。',
      '所以，存在与无并不是作为彼此分开的知性的规定而有一个真理；它们的真理就是它们的过渡，即生成。',
    ],
  },
  '256': { en: ['§ [32/64]'], zh: ['§ [32/64]'] },
  '257': {
    en: [
      'β) Determinate being distinguishes itself from others through its determinacy and is thereby what it is.23) But the determinacy is essentially relation to what is other, being-for-other, being unequal to itself, and sublates itself.',
      'Through its determinacy, determinate being is therefore just as much not what it is, but becomes another, becomes changed.',
    ],
    zh: [
      'β) 定在通过自己的规定性而与他人相区别，并由此成为它所是的东西。23) 但规定性本质上是对他者的关系，为他者的存在，与自身不相等，并把自己扬弃。',
      '所以，通过自己的规定性，定在同样不是它所是的东西，而是变成另一个东西，变成被改变了的东西。',
    ],
  },
};

const out = { blocks: {} };
for (const b of IN.blocks) {
  const t = T[String(b.bi)];
  if (!t) throw new Error('缺少翻译：bi=' + b.bi);
  out.blocks[String(b.bi)] = t;
}

const outFile = path.join(ROOT, IN.outFile);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 1), 'utf8');

// 术语草表
const rows = [
  ['de', 'en', 'zh', 'status', 'note'],
  ['zureichender Grund', 'sufficient ground', '充分的根据', 'ok', '上下文包与共享词表均无此条；根据＝Grund（根据命题）保持同根，充足义取充分；备选：足够理由'],
  ['das einfache Dritte', 'the simple third', '单纯的三者', 'unsicher', '上下文包与共享词表均无此条；Einfachheit 共享词表作单纯性；Dritte 与「es gibt kein Drittes」第三者同根；备选：简单的第三者'],
  ['Urteilsbestimmung', 'determinacy of judgment', '判断的规定', 'ok', '上下文包与共享词表均无此条；与 Verstandesbestimmung（知性的规定）平行，共享词表已有后者；Urteilskraft＝判断力'],
  ['ontologischer Satz', 'ontological proposition', '本体论命题', 'ok', '上下文包与共享词表只有 ontologische Logik（本体逻辑学）；Satz＝命题；备选：存在论命题（学界亦通行）'],
  ['das Qualitative', 'the qualitative', '质的规定', 'variante', '上下文包与共享词表均无此条；Qualität＝质、quantitative Größe＝质的量，故取「质的规定」以显与量的规定对举；备选：质的'],
  ['Fortgehen', 'going forth', '前进（向着无限者）', 'unsicher', '上下文包与共享词表均无此条；Fortgehen ins Unendliche 与 Hinausgehen über die Bestimmung 并列，共享词表 Übergehen＝过渡，此处不作过渡以免同词根碰撞；备选：向外行进'],
  ['Unendl.', 'infinity', '无限性', 'unsicher', '原文为残缺缩写，疑为 Unendliches／Unendlichkeit 的截写，底本未补足；上下文包与共享词表均无此缩写；按所在小节作无限性处理（共享词表 Unendlichkeit＝无限性）；备选：无限者（若原文指 das Unendliche）'],
  ['ausgesagt werden (von einem Subjekt)', 'to be predicated (of a subject)', '被说出（关于主词）', 'ok', '上下文包与共享词表均无此条；与 Prädikat＝谓词同族；备选：被谓述'],
];
const csv = rows
  .map((r) => r.map((c) => (c.includes(',') ? '"' + c.replace(/"/g, '""') + '"' : c)).join(','))
  .join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'data/_jobs/w4-2-235.glossar.csv'), csv, 'utf8');

console.log('written:', IN.outFile, 'blocks=', Object.keys(out.blocks).length);
