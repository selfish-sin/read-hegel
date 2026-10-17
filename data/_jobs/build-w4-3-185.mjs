import fs from 'node:fs';

const blocks = {
  "185": {
    en: ["§ 26"],
    zh: ["§ 26"]
  },
  "186": {
    en: [
      "This feeling of an otherness within itself contradicts its equality with itself.",
      "The felt necessity to sublate this opposition is the drive.",
      "The negation, or the otherness, presents itself to it as consciousness, as an external thing different from it, which however is determined through self-consciousness 1. as something conformable to the drive and 2. as something negative in itself, whose existence is to be sublated by the self and put into equality with it."
    ],
    zh: [
      "这种在自身之内有他在的感觉，与它同自身的相等相矛盾。",
      "那种感觉到的、要扬弃这一对立的必然性，就是冲动。",
      "否定，也就是他在，向它呈现为意识，呈现为一个外在的、与它不同的东西，而这个东西却由自我意识规定为：1. 与冲动相符合的，2. 自在的否定者，其存在须由自我加以扬弃，并置入与自我的相等之中。"
    ]
  },
  "187": {
    en: ["§ 27"],
    zh: ["§ 27"]
  },
  "188": {
    en: [
      "The activity of desire therefore sublates the otherness of the object, its existence altogether, and unites it with the subject, and through this the desire is satisfied.",
      "This satisfaction is therefore conditioned 1. by an external object existing indifferently towards it, or through consciousness; 2. its activity brings forth the satisfaction only through the sublation of the object.",
      "Self-consciousness therefore attains only to its self-feeling."
    ],
    zh: [
      "因此欲望的活动扬弃了对象的他在，即对象的存在，并把它与主体结合起来，欲望由此得到满足。",
      "这种满足因而以此为条件：1. 通过一个外在地存在着、对它漠不关心的对象，或者通过意识；2. 它的活动只有通过扬弃对象才产生出这种满足。",
      "自我意识因此只达到了自我感觉。"
    ]
  },
  "189": {
    en: ["§ 28"],
    zh: ["§ 28"]
  },
  "190": {
    en: [
      "In desire self-consciousness relates itself to itself as a singular.",
      "It relates itself to an object without self, which in and for itself is another than the self-consciousness.",
      "It therefore reaches this equality with itself in respect of the object only through the sublation of it.",
      "Desire is therefore 1. destructive; 2. in its satisfaction there comes to be only the self-feeling of the being-for-itself of the subject as singular, the indeterminate concept of the subject joined with objectivity."
    ],
    zh: [
      "在欲望中，自我意识作为个别者关联于自身。",
      "它关联于一个无自身的对象，这对象在自在自为上[是]不同于自我意识的另一个。",
      "因此，就对象而言，它只有通过扬弃对象才达到这种与自身的相等。",
      "欲望因而总的说来 1. 是毁灭性的；2. 在欲望的满足中，因而只达到了作为个别者的主体的自为存在的自我感觉，即与对象性相结合的主体的那个未定的概念。"
    ]
  },
  "191": {
    en: "B. Lordship and Bondage",
    zh: "B. 主人与奴隶"
  },
  "192": {
    en: ["§ 29"],
    zh: ["§ 29"]
  },
  "193": {
    en: [
      "The concept of self-consciousness as a subject which is at the same time objective gives the relation that for self-consciousness there is another self-consciousness."
    ],
    zh: [
      "自我意识作为一个同时又是客观的主体的这个概念，给出了这样一个关系：对自我意识来说，有另一个自我意识。"
    ]
  },
  "194": {
    en: ["§ 30"],
    zh: ["§ 30"]
  },
  "195": {
    en: [
      "A self-consciousness which is for another is not for it merely an object, but its other self.",
      "The I is not an abstract universality in which as such there is no difference or determination.",
      "Thus, insofar as the I is an object to the I, in this respect it is the same for it as that which it is.",
      "It beholds itself in the Other."
    ],
    zh: [
      "一个为另一个而存在的自我意识，对这另一个来说并不单单是对象，而是它的另一个自我。",
      "「我」不是一种抽象的普遍性，在其中作为这样的普遍性既没有区别也没有规定。",
      "既然「我」是对「我」的对象，那么在这一方面，它对它而言就是它所是的那个同一个。",
      "它在另一个者中观照自身。"
    ]
  },
  "196": {
    en: ["§ 31"],
    zh: ["§ 31"]
  },
  "197": {
    en: [
      "This self-intuition of the one in the other is 1. the abstract moment of sameness.",
      "Each however also has the determination to appear for the other as an external object and insofar as such an immediate, sensuous, and determinate being.",
      "Each is absolutely for itself and singular against the other, and it also demands of the other, as it is to be and to hold as such for the other, that its own freedom as one existing in and for itself in the other be beheld in the other, or that it be acknowledged by the other."
    ],
    zh: [
      "这一个在另一个者中的自我直观就是 1. 同一性的抽象环节。",
      "但每一个也都另有一种规定，即对另一个者而言显现为一个外在的对象，并且就此而言显现为直接的、感性的、具体的定在。",
      "每一个绝对地为自身，并且在另一个者面前是个别者；它也要求另一个者，作为这样的另一个者而存在并对它算数，去观照它自己的自由，即一个在另一个者中自在自为地存在者的自由，或者去承认它。"
    ]
  },
  "198": {
    en: ["§ 32"],
    zh: ["§ 32"]
  }
};

const outFile = "web/data/trans/w4/3.p185.json";
fs.mkdirSync("web/data/trans/w4", { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ blocks }, null, 1), "utf8");

const csv = [
  "de,en,zh,status,note",
  "Diesselbigkeit,sameness,同一性,unsicher,上下文包与共享词表均未收。指二者无分别的相与，是本节自我意识互相承认的前提。与 Einzelnes（个别）分开。备选「同一」。EN 亦作 identity。",
  "Selbstgefühl,self-feeling,自我感觉,ok,上下文包与共享词表均未收；与 Gefühl（感觉）同根，故保留前缀作「自我感觉」。备选「自我感受」。",
  "Befriedigung,satisfaction,满足,ok,上下文包与共享词表均未收；本节指欲望得到满足。备选「满足感」。",
  "zerstörend,destructive,毁灭性的,ok,上下文包与共享词表均未收；与 Selbtzerstörung（自我毁灭）同根（共享词表已收后者）。备选「破坏性的」。",
  "fürsichseierend,existing in and for itself,自在自为地存在的,variante,上下文包只收 Fürsichsein（自为存在），未收其分词。与 an und für sich（自在自为，共享词表）保持同一译根。备选「自为存在的」。",
  "unbestimmt,indeterminate,未定的,ok,上下文包与共享词表均未收；与 Bestimmung（规定）同根，故作「未定的」。备选「不确定的」。",
  "das Selbst,the self,自我,ok,上下文包与共享词表均未收单数 das Selbst。与 Selbstbewußtsein（自我意识）同根。备选「自身」。",
  "Herrschaft,lordship / mastery,支配,variante,共享词表只收了合称 Herrschaft und Knechtschaft＝主人与奴隶（ok，全卷统一），未收单词。本单元标题照合称作「主人与奴隶」（与 181 块 zh 保持一致）；单用时作「支配」。任务书裁定亦作支配。",
  "Knechtschaft,bondage / slavery,奴役,variante,同上：共享词表只收合称。合称内作「奴隶」，单用时作「奴役」。与 Knecht（奴隶，共享词表已收）区分。"
].join("\n") + "\n";
fs.writeFileSync("data/_jobs/w4-3-185.glossar.csv", csv, "utf8");
console.log("written");
