import fs from 'node:fs';

const T = {
  '92': {
    en: [
      'Thereby the following contradiction is posited: the properties, insofar as they are free in and for themselves from the individuality of the thing and undisturbed by one another, are particular, independent materials, and the thing is only the universal compass that comprehends them.',
      'In the individuality of the thing, to which they belong inseparably, their independence and their indifferent existence are on the contrary negated, and only the thing [is] that which exists in and for itself.'
    ],
    zh: [
      '由此就设定出如下矛盾：属性在自在地脱离物的个别性、又彼此不受干扰时，就是特殊的、独立的物质，而物不过是那个包含它们的普遍范围。',
      '反过来，在物的个别性中——属性不可分离地属于它——它们的独立性和它们彼此无差别的存在被否定了，只有物[才是]那个自为存在者。'
    ]
  },
  '93': {
    en: [
      'Mat[ter], the simple determination (quantity), the indivisible point, is both sweet and white, hard, odorous.'
    ],
    zh: [
      '物[质]，单纯的规定（量），不可分的点，既是甜的，也是白的、硬的、有气味的。'
    ]
  },
  '94': { en: ['c) The understanding'], zh: ['c) 知性'] },
  '95': { en: ['§ 11'], zh: ['§ 11'] },
  '96': {
    en: [
      'Since these two determinations are equally essential in the same object and at the same time opposed to one another, neither of them is the true one, but they sublate one another.'
    ],
    zh: [
      '由于这两项规定在同一对象中同样本质、同时又彼此对立，所以没有一项是真正的那一个，而是它们彼此扬弃。'
    ]
  },
  '97': { en: ['§ 12'], zh: ['§ 12'] },
  '98': {
    en: [
      'They therefore now have the determination [to be] only as sublated ones.',
      'Thus they make up the object of the understanding, to which they count as appearances and which considers the inner of things.'
    ],
    zh: [
      '因此它们如今有了这样的规定：只有作为被扬弃者[而存在]。',
      '这样它们就构成了知性的对象，它们作为现象归属于这个对象，而这个对象考察物的内在。'
    ]
  },
  '99': { en: ['§ 13'], zh: ['§ 13'] },
  '100': {
    en: [
      'The inner of things is what in them is on the one hand free from appearance, but on the other hand is related to it through its concept.',
      'It is therefore α) the simple force, which β) passes into determinate being; the expression of the force.'
    ],
    zh: [
      '物的内在就是它们身上那个一方面脱离现象、另一方面又通过自身的概念与现象相关的东西。',
      '因此它就是 α) 单纯的力，它 β) 进入定在；这是力的表现。'
    ]
  },
  '101': { en: ['§ 14'], zh: ['§ 14'] },
  '102': {
    en: [
      'In the inner, the opposition of the determinations that is present in appearance is sublated, i.e. at the same time preserved.',
      'The force therefore has the difference in itself, but not as sensuous manifoldness, but as an inner difference; this difference is to begin with the law of the force.'
    ],
    zh: [
      '在内在之中，现象中已有的各项规定的对立被扬弃了，即同时被保存下来。',
      '所以力把差别置于自身之内，但不是作为感性的杂多，而是作为一个内在的差别；这个差别首先是力的规律。'
    ]
  },
  '103': {
    en: [
      'The inner going into itself, not disappearing; recollection; the force of the tree; electricity, which returns into its force.'
    ],
    zh: [
      '内在在自身中走，而不是消失；回忆；树的力；电，回返到它的力。'
    ]
  },
  '104': { en: ['§ 15'], zh: ['§ 15'] },
  '105': {
    en: [
      'The law of the force is the quiet universal image of the appearance and does indeed express a necessary relation of its two differentiated sides, but it does not contain this necessity; rather, in the law the sides of it are still indifferent to one another; and in this way the difference is not yet an inner one.'
    ],
    zh: [
      '力的规律是现象的安静的普遍图像，它固然表述出它的两个有差别的方面之间一种必然的关系，却并不包含这种必然性；而在规律里，它的诸方面仍然彼此平列不分高下；并且这样一来，差别还不是内在的差别。'
    ]
  },
  '106': { en: ['§ 16'], zh: ['§ 16'] },
  '107': {
    en: [
      'The difference as a truly inner or simple one is the difference in itself; but this pure abstraction is nothing other than the difference, which is just as much no difference; the differentiating of the undifferentiated, or the not-being-differentiated of the differentiated.'
    ],
    zh: [
      '差别作为真正内在的或单纯的差别，就是自在的差别；但这一纯粹的抽象无非就是那个差别，而这个差别同样不是差别；这是对无差别者的区分，或者说是差别者的无区别状态。'
    ]
  },
  '108': { en: ['§ 17'], zh: ['§ 17'] },
  '109': {
    en: [
      'The consciousness that has as its object only such a differentiated one as is no difference has thereby left behind the previous kind of objects.',
      'For these were something alien to it, differentiated from it; but insofar as it has as its object the differentiated, which is no differentiated, its difference falls away from the object, or it has itself as its object.'
    ],
    zh: [
      '那个只把这样一位并非差别的差别者当作对象的意识，由此就离开了此前诸对象的方式。',
      '因为这些对象曾是某种由它区分出来的异己之物；但当它把那个并非差别者的差别者当作对象时，它的差别便从对象那里消逝了，或者它以自身为对象。'
    ]
  },
  '110': { en: [], zh: [] },
  '111': { en: ['Questions. 3 January [1809]'], zh: ['《问题》　1809 年 1 月 3 日'] },
  '112': {
    en: ['Is the object of sense-certainty an abstract object?'],
    zh: ['感性确定性的对象是一个抽象的对象吗？']
  }
};

const inp = JSON.parse(fs.readFileSync('data/_jobs/w4-2-92.in.json', 'utf8'));
const blocks = {};
for (const b of inp.blocks) {
  const t = T[String(b.bi)];
  if (!t) throw new Error('missing translation for bi=' + b.bi);
  blocks[String(b.bi)] = { h: b.hash, en: t.en, zh: t.zh };
}
fs.mkdirSync('web/data/trans/w4', { recursive: true });
fs.writeFileSync(inp.outFile, JSON.stringify({ blocks }, null, 1), 'utf8');

const csv = [
  'de,en,zh,status,note',
  'Umfang,compass / scope,范围,ok,力的规律与属性语境指包含诸属性的整体范围；备选「涵盖范围」；本单元 das Ding 只是包含这些属性的普遍范围',
  'verneinen / verneint,to negate,否定,ok,否定；与 Nichtung（非）分开；不与 aufheben（扬弃）混',
  'Abbild,image,图象,ok,力的规律作为现象的「安静的普遍图像」；备选「摹本」',
  'Ununterschiedenen,undifferentiated one,无差别者,ok,与 Unterschied（差别）对举；名词化的形容词；对句 Nichtunterschiedensein des Unterschiedenen 同根',
  'Nichtunterschiedensein,not-being-differentiated,无区别状态,unsicher,与 Ununterschiedenen 呼应；备选「不分状态」；名词化抽象名词',
  'ungetrennt,inseparable,不可分离的,ok,属性不可分离地属于物；备选「未分离的」',
  'unteilbar,indivisible,不可分的,ok,与 teilbar（可分的）对举；质作为不可分的点',
  'riechend,odoriferous,有气味的,ok,质的规定之一；备选「散发气味的」'
].join('\r\n') + '\r\n';
fs.writeFileSync('data/_jobs/w4-2-92.glossar.csv', csv, 'utf8');
console.log('written', inp.outFile, 'blocks', Object.keys(blocks).length);
