// build w4-4-110 translation unit (outFile: web/data/trans/w4/4.p110.json)
import fs from 'node:fs';

const blocks = {
  '110': {
    en: ["The infinite judgment contains within itself the further sense that whatever is a subject is not exhausted in a predicate which expresses a quality of it, neither insofar as this quality expresses a nearest determinacy, still less insofar as it contains a further determinacy, which of the general sphere,"],
    zh: ["无限判断自身包含着进一步的意义：凡是一个主体存在的东西，都没有在一个谓词里被穷尽，而这个谓词表达出它的一个质——既不在这个质表达一项最近的规定性这一点上，更不在它含有一项属于一般领域的进一步的规定性这一点上。"],
  },
  '111': {
    en: "II. Judgments of Quantity or of Reflection",
    zh: "II. 量的判断或反思判断",
  },
  '112': { en: ["§ [52]"], zh: ["§ [52]"] },
  '113': {
    en: ["Reflecting means going beyond something immediate and on to something else, and comprehending the manifoldness that thereby arises into a unity."],
    zh: ["反思就是：越过某个直接者而继续走向别的东西，并把由此产生的杂多综合为一个统一。"],
  },
  '114': { en: ["§ [53]"], zh: ["§ [53]"] },
  '115': {
    en: ["A determinacy of reflection thus contains partly a comparison of [an object] with others and the aspect with respect to which, in its qualities, it is the same as that same one or differs from it, partly a comprehension of its own determinations, which however expresses only an external universality and commonality, or even mere completeness."],
    zh: ["所以，一项反思的规定，一部分包含[一个对象]与他者的比较，以及它凭其诸质与同一个相等、或与同一个相别的那个方面，另一部分包含对自身诸规定的综合；这种综合却只表达一种外在的普遍性和共同性，或者干脆只是完整性。"],
  },
  '116': { en: ["§ [54]"], zh: ["§ [54]"] },
  '117': {
    en: ["The individual judgment expresses of a subject such a predicate as belongs only to it and by which it distinguishes itself from all others; the subject is accordingly likewise an individual."],
    zh: ["个别判断从一个主体表达出这样一个谓词：这个谓词只属于该主体，并使它把自己与所有其他者区别开来；主体因此同样是一个个别者。"],
  },
  '118': {
    en: ["Classification of natural beings according to differences in number, an external mark of distinction."],
    zh: ["自然存在物按数目差别所作的分类，外在的区别标志。"],
  },
  '119': { en: ["§ [55]"], zh: ["§ [55]"] },
  '120': {
    en: ["An individual judgment can in a broader sense also be called such when its subject is an individual, even though a universal predicate is said of it, which however serves at least to distinguish it from the others that come into consideration."],
    zh: ["在更宽的意义上，当一个判断的主体是一个个别者时，它也可以被称作个别判断，虽然关于它被说出了一个普遍的谓词，但这个谓词至少足以把它与那些纳入考虑的其他者区别开来。"],
  },
  '121': { en: ["§ [56]"], zh: ["§ [56]"] },
  '122': {
    en: ["A particular judgment has some individuals for its subject."],
    zh: ["特称判断以若干个别者为主语。"],
  },
  '123': {
    en: ["In the universal judgment the subject is a comprehension of all the individuals of one kind; this comprehension is the allness, or the universality of reflection, [and] the predicate which belongs to such a subject is likewise the universal of these individuals, namely as what is common to them."],
    zh: ["在全称判断中，主体是一个种的全体个别者的综合；这一综合就是全体性，或者说反思的普遍性，[而]属于这样一个主体的谓词同样也是这些个别者的普遍者，即作为它们之中的共同者。"],
  },
  '124': {
    en: "III. Judgments of Relation or of Necessity",
    zh: "III. 关系的判断或必然性的判断",
  },
  '125': { en: ["§ [57]"], zh: ["§ [57]"] },
  '126': {
    en: ["Subject and predicate [here] necessarily belong together through their content."],
    zh: ["[在这里]主体与谓词由于其内容而必然地属于一起。"],
  },
  '127': { en: ["§ [58]"], zh: ["§ [58]"] },
  '128': {
    en: [
      "Categorical judgment.",
      "The predicate expresses the nature or the truly universal of the subject, and the two have the same essential content (and the subject is only a particularity of the predicate).",
      "The further determinations which the subject has over and above what such a predicate contains are inessential properties or merely its restrictions.",
    ],
    zh: [
      "定言判断。",
      "谓词表达主体的本性，或者表达主体真正普遍的东西，而两者具有同一个本质的内容（并且主体只是谓词的一个特殊性）。",
      "主体除了这样一个谓词所含内容之外所还具有的进一步规定，是不本质的属性，或者仅仅是它的限制。",
    ],
  },
  '129': { en: ["§ [59]"], zh: ["§ [59]"] },
  '130': {
    en: ["In the hypothetical judgment the necessity does not lie in the equality of the content, but this content is rather different, and what is said in this judgment is only this: that two determinations stand in a necessary connection as ground and consequence."],
    zh: ["在假言判断中，必然性并不在于内容的等同，毋宁说内容是互不相同的；而在这一判断中所说出的只是这一点：两项规定作为根据与后果，处于一种必然的联系之中。"],
  },
  '131': { en: ["§ [60]"], zh: ["§ [60]"] },
  '132': {
    en: ["In the disjunctive judgment the subject is considered as a general sphere, which in this respect can have different determinations, but, because these exclude one another, must necessarily have only one of them with the exclusion of the rest."],
    zh: ["在选言判断中，主体被看作一个一般领域，它可以就此具有不同的规定；但因为这些规定相互排斥，所以它必然只能具有其中之一，并排除其余的。"],
  },
  '133': { en: "IV. Modality", zh: "IV. 模态" },
  '134': { en: ["§ [61]"], zh: ["§ [61]"] },
  '135': {
    en: ["Judgments according to their modality [to consider means to examine whether the] predicate [expresses the] adequacy of the concept and of the determinate being of the subject."],
    zh: ["按其模态来考察判断，[就是考察]谓词[是否]表达概念与[主体的]定在的适切性。"],
  },
};

const out = 'web/data/trans/w4/4.p110.json';
fs.mkdirSync('web/data/trans/w4', { recursive: true });
fs.writeFileSync(out, JSON.stringify({ blocks }, null, 1), 'utf8');
console.log('wrote', out);
