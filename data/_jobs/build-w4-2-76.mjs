import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('C:/Users/21886/.minimax/sessions/mvs_c7c434fcb8bd4ef4ad2ebfa44ff633d0/workspace/gh-projects/read-hegel');
const IN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/_jobs/w4-2-76.in.json'), 'utf8'));

const T = {
  '76': { en: ['§ 5'], zh: ['§ 5'] },
  '77': {
    en: ['At the same time, however, the object is essentially determined through the relation of consciousness to it, and it becomes different with the further development of consciousness.'],
    zh: ['但同时，对象本质上是由意识与它的关系所规定的，并且随着意识的进一步发展而变得不同。'],
  },
  '78': { en: ['§ 6'], zh: ['§ 6'] },
  '79': {
    en: ['Consciousness divides into three principal stages: α) the consciousness of abstract or incomplete objects, β) the consciousness of the world of finite spirit, γ) the consciousness of absolute spirit.'],
    zh: ['意识分为三个主要阶段：α) 对抽象的或不完整的对象的意识，β) 对有限精神世界的意识，γ) 对绝对精神的意识。'],
  },
  '80': { en: 'A. Consciousness of abstract objects7)', zh: 'A. 对抽象对象的意识7)' },
  '81': { en: '[I. Consciousness]', zh: '[I. 意识]' },
  '82': { en: ['a) Sense-consciousness'], zh: ['a) 感性意识'] },
  '83': { en: ['§ 7'], zh: ['§ 7'] },
  '84': {
    en: [
      'The simple sense-consciousness is the immediate certainty of an external object.',
      'The expression for the immediacy of such an object is that it is the This; Now according to time; Here according to space, each entirely distinguished from all the others and not determined by means of another.',
      'But both the Now and the Here disappear and show themselves as something other, and what remains is only the universal, which contains in itself the relation to what is other and the mediation.',
    ],
    zh: [
      '简单的感性意识是对一个外在对象的直接确定性。',
      '这样一个对象的直接性的表达是：它是这个；按时间说是这时；按空间说是这里，每一个都完全与所有其他者相区别，并且不是通过另一个者而得到规定的。',
      '但这时和这里都消失，并显示为另一个东西；而留下来的只有普遍者，它本身包含着对另一个者的关系以及中介。',
    ],
  },
  '85': {
    en: [
      'α) [The] sensuous is, abstractly, only this poor determination; [the] sensuous [is] the most abstract; it does not know [this].',
      'This is; this simple immediacy.',
      'Time and space, forms, universal sensuous abstractions.',
      'Now it is day; also not day; the negative.',
      'The Now remains as the universal, which mediates that not-day is not-night, simply as before; neither this nor that and both this and that is.',
      'Here is a table; here is not a table; here also is not a table. - The universal.',
      'Even this I [is] only the universal - I, they say just as well: I.',
      'Or if I hold fast to the Now and the Here - the Now has been; is not; the Now remains. - flowing - another Here infinitely divisible; is not; right or left.',
      'Point, thing of thought.',
    ],
    zh: [
      'α) [感性]在抽象的意义上只是这个贫乏的规定；[感性]是最抽象的；它不知道这一点。',
      '这个是；这种简单的直接性。',
      '时间与空间是形式，普遍的感性抽象物。',
      '这时是白天；也不是白天；否定的东西。',
      '这时作为普遍者留下来，中介着：不是白天并不是不是黑夜，正如先前一样地单纯；既不是这个也不是那个，而既是这个又是那个。',
      '这里是一张桌子；这里不是一张桌子；这里也不是一张桌子。——普遍者。',
      '连这个我[也]只是普遍的我——我，他们也同样说：我。',
      '或者，如果我抓住这时和这里不放——这时曾经是；现在不是；这时依然留下。——流动的——另一个这里可以无限分割；现在不是；在右边或左边。',
      '点，思想之物。',
    ],
  },
  '86': { en: ['b) Perception'], zh: ['b) 知觉'] },
  '87': { en: ['§ 8'], zh: ['§ 8'] },
  '88': {
    en: ['Perception does indeed have the sensuous, but at the same time it has the universal as its object within it, a mixture of sensuous determinations and determinations of understanding.'],
    zh: ['知觉诚然以感性之物为对象，但其中同时以普遍者为对象，是感性规定与知性规定的混合。'],
  },
  '89': { en: ['§ 9'], zh: ['§ 9'] },
  '90': {
    en: [
      'The sensuous properties are immediately in feeling, but at the same time determined through their relation to others, and mediated.',
      'The most universal determinations of understanding are the individuality of the thing, in which the properties are contained, and the universality of those same properties, according to which they go beyond the single thing and are independent of one another.8)',
    ],
    zh: [
      '感性属性直接地在感受之中，但同时又通过与其他者的关系而得到规定，并且是被中介的。',
      '最普遍的知性规定是事物的个别性，属性就含在其中；以及这些属性的普遍性，按照这种普遍性，它们越出单个事物而彼此独立。8)',
    ],
  },
  '91': { en: ['§ 10'], zh: ['§ 10'] },
};

const out = { blocks: {} };
for (const b of IN.blocks) out.blocks[String(b.bi)] = T[String(b.bi)];

const outFile = path.join(ROOT, IN.outFile);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2), { encoding: 'utf8' });

const csv = [
  'de,en,zh,status,note',
  'Fortbildung,further development,进一步的发展,ok,上下文包与共享词表均未收；本句「随意识的进一步发展而不同」；备选「进展」「进一步形成」。与 Fortgang（进程）分开',
  'Vermischung,mixture,混合,ok,组合新出现；与 Vermittlung（中介）同音异根须严格分开；备选「混杂」',
  'unvollständig,incomplete,不完整的,ok,与 abstrakt 并列修饰 Gegenstände；与 vollständig 相对',
  'Abstrakta (das Abstraktum),abstractions,抽象物,ok,复数即「抽象物」；与 Abstraktion（抽象）区分，抽象过程作「抽象」抽象物作「抽象物」',
  'Wahrnehmen,perceiving / perception,知觉,ok,与共享词表 Wahrnehmung（知觉）同根故统一作「知觉」；不作「感知」',
  'fließend,flowing,流动的,variante,提纲式形容词；备选「流淌的」；与静态的 Jetzt（这时）对照',
];
const csvPath = path.join(ROOT, 'data/_jobs/w4-2-76.glossar.csv');
fs.writeFileSync(csvPath, csv.join('\r\n') + '\r\n', { encoding: 'utf8' });

console.log('written', outFile, fs.statSync(outFile).size);
console.log('written', csvPath, fs.statSync(csvPath).size);
