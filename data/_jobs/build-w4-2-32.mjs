import fs from 'node:fs';

const out = {
  blocks: {
    "32": {
      h: "19r3xc8wgi",
      en: "II. Religion",
      zh: "II. 宗教"
    },
    "33": {
      h: "1btpzgl18r",
      en: ["§ 207"],
      zh: ["§ 207"]
    },
    "34": {
      h: "yb7u371hdd",
      en: [
        "Religion gives the presentation of absolute spirit not merely for intuition and representation, but also for thought and cognition.",
        "Its principal determination is to raise the individual up to the thought of God, to bring forth its unity with him, and to make it certain of the same."
      ],
      zh: [
        "宗教给出的绝对精神的呈现，不单单是为了直观和表象，也是为了思想和认识。",
        "它的主要规定是：把个体提高到上帝的思想，使它与上帝的统一显现出来，并使它对这一点确信不疑。"
      ]
    },
    "35": {
      h: "e48w7d1fth",
      en: [
        "(Religion is truth, as it is for all men.",
        "The essence of true religion is love.",
        "It is essentially disposition, as cognition of the truth of the human will.",
        "Religious love is not merely natural attachment or merely moral benevolence, not an indeterminate universal dull sensation, but [it] proves itself in the particular with absolute self-sacrifice.",
        "\"Love one another as I have loved you.\" 4) — Religious love is infinite power over everything finite of spirit, over what is bad, evil, crime, and even positive laws and so forth.",
        "Christ let his disciples pluck ears of grain on the Sabbath and healed a sick hand.",
        "Divine love forgives sin; it makes what has happened into something that has not happened for spirit.",
        "Much is forgiven to Mary Magdalene, because she has loved much.",
        "Love itself is beyond the considerations of morality: Mary anoints Christ instead of giving it to the poor, and Christ approves of this. — The substantial relation of man to God is the forgiveness of sins.",
        "The ground of love is the consciousness of God and of his essence as love, and love is therefore at the same time the highest humility.",
        "I am not to be for myself the objectivity in love, but God; yet in his knowing I am to forget myself. — The forgiveness of sin is not something temporal, no consequence of external punishment, but something eternal, inner, in spirit and mind.",
        "The annihilation of its nullity is the loftiness of love. — The substantial relation of man to God seems in its truth to be a beyond, but the love of God to man and of man to God sublates the separation of the this-side from what is represented as a beyond, and is the eternal life."
      ],
      zh: [
        "（宗教就是真理，是它对于一切人所是的真理。",
        "真实宗教的本质是爱。",
        "它本质上是心态，即对人的意志之真理的认识。",
        "宗教之爱不只是自然的依恋，也不只是道德的善意，不是一种不确定的、笼统而愚钝的感受，而是［它］在个别场合以绝对的牺牲来证明自己。",
        "“你们要彼此相爱，像我爱你们一样。”4)——宗教之爱是凌驾于精神的一切有限者之上、凌驾于坏的、恶的、罪行的乃至实定法等等之上的无限力量。",
        "基督让他的门徒在安息日掐取谷穗，并治好了一只病手。",
        "神圣的爱赦免罪，使发生过的事在精神那里成为未曾发生的事。",
        "抹大拉的马利亚被赦免了很多，因为她的爱很多。",
        "爱本身就超出道德的顾虑：抹大拉的马利亚给基督傅油，而没有把它给穷人，基督也认可这一点。——人同上帝的实体性关系就是罪的赦免。",
        "爱的根据是对上帝及其本质（就是爱）的意识，因此爱同时也是最高的谦卑。",
        "我在爱中不应当是我自己的客体，而应当是上帝；但在他的认识中我应当忘掉我自己。——罪的赦免不是时间性的东西，不是外在惩罚的后果，而是在精神与心中永恒的、内在的东西。",
        "摧毁其虚无性就是爱的崇高。——人同上帝的实体性关系在其真理中似乎是一个彼岸，但上帝对人的爱与人对上帝的爱扬弃了此岸同被表象为彼岸者的分离，并且就是永生。"
      ]
    },
    "36": {
      h: "87og04y327",
      en: [
        "This identity is intuited in Christ.",
        "As son of man he is son of God.",
        "For the God-man there is no beyond.",
        "He counts not as this individual but as the universal, as true man.",
        "The external side of his history must be distinguished from the religious side.",
        "He has passed through actuality, abasement, ignominy, and died.",
        "His pain was the depth of the unity of the divine and human nature in life and suffering.",
        "The blessed gods of the heathen were represented as being in a beyond; through Christ common actuality, this abasement which is not contemptible, is itself hallowed.",
        "His resurrection and ascension exist only for faith: Stephen saw him in vision at the right hand of God.",
        "The eternal life of God is this, the return into self.",
        "To raise doubts from circumstances, from particulars as to whether this is an external actuality is trivial, sordid.",
        "Faith is not at all concerned with the sensuous happening, but with what happens eternally.",
        "History of God."
      ],
      zh: [
        "这一同一性在基督身上得到直观。",
        "作为人子，他是上帝之子。",
        "对神人来说没有彼岸。",
        "他算作的不是这一个个体，而是普遍者、作为真实的人。",
        "他生平的外在方面必须与宗教的方面区分开来。",
        "他经历了现实性、卑贱、辱骂而死了。",
        "他的痛苦是神人二性在生活与受苦中的统一的深度。",
        "异教徒那些至福的众神被表象为处在某个彼岸之中；通过基督，共同的现实性、这种并不值得鄙视的卑贱，本身也得到圣化。",
        "他的复活与升天只是就信仰而言：司提反在所见中看见他位于上帝的右边。",
        "上帝的永恒生命就是这个，即向自身的回归。",
        "从境况、从个别细节出发去怀疑这是否是一种外在的现实性，是无聊的、卑劣的。",
        "信仰根本不取决于感性所发生的事，而取决于那永恒发生的事。",
        "上帝的历史。"
      ]
    }
  }
};

const target = 'web/data/trans/w4/2.p32.json';
fs.mkdirSync('web/data/trans/w4', { recursive: true });
fs.writeFileSync(target, JSON.stringify(out, null, 1), 'utf8');
console.log('wrote', target);
