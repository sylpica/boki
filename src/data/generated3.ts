import type { JournalLine, Question } from '../types';

const D = (account: string, amount: number): JournalLine => ({ side: 'debit', account, amount });
const C = (account: string, amount: number): JournalLine => ({ side: 'credit', account, amount });
const yen = (n: number) => '￥' + n.toLocaleString('ja-JP');

interface Base {
  parent: string; topic: string; syllabus: string; lessonId: string; terms: string[];
}
let counter = 0;
function mkq(b: Base, rest: Omit<Question, 'id' | 'version' | 'examYear' | 'verified' | 'source' | 'updatedAt' | 'parentId'>): Question {
  counter++;
  return {
    ...rest,
    id: `gen3-${b.parent}-${String(counter).padStart(4, '0')}`,
    version: '1.0', examYear: 2027, verified: true,
    source: '取引モデルから導出した派生問題（正答は同一モデルで再計算し自動検証）',
    updatedAt: '2026-11-04', parentId: b.parent,
  };
}
const out: Question[] = [];
const J = (b: Base, o: { section?: Question['section']; format?: Question['format']; difficulty: Question['difficulty']; needsCalc: boolean; calcType?: string; calcComplexity?: 1 | 2 | 3; prompt: string; journal: JournalLine[]; explanation: string; calcProcess?: string; hints: string[] }) => {
  out.push(mkq(b, {
    section: o.section ?? 'q1', format: o.format ?? 'journal', topic: b.topic, syllabus: b.syllabus, difficulty: o.difficulty,
    needsCalc: o.needsCalc, calcType: o.calcType, calcComplexity: o.calcComplexity, prompt: o.prompt, journal: o.journal,
    explanation: o.explanation, calcProcess: o.calcProcess, hints: o.hints,
    accounts: [...new Set(o.journal.map((l) => l.account))], terms: b.terms, lessonId: b.lessonId,
  }));
};

// ---- H01 定額法の減価償却（残存価額率0％/10％・月割あり） ----
for (const [cost, residualRate, life, months, asset, cumAcct] of [
  [600000, 0, 5, 12, '備品', '備品減価償却累計額'], [1200000, 10, 6, 12, '備品', '備品減価償却累計額'],
  [840000, 0, 7, 6, '備品', '備品減価償却累計額'], [960000, 10, 8, 9, '備品', '備品減価償却累計額'],
  [1500000, 0, 5, 3, '備品', '備品減価償却累計額'], [720000, 10, 4, 6, '備品', '備品減価償却累計額'],
  [2000000, 0, 10, 12, '備品', '備品減価償却累計額'], [480000, 0, 4, 9, '備品', '備品減価償却累計額'],
  [1800000, 10, 9, 12, '備品', '備品減価償却累計額'], [540000, 0, 3, 6, '備品', '備品減価償却累計額'],
  [2400000, 0, 6, 12, '車両運搬具', '車両運搬具減価償却累計額'], [3600000, 10, 8, 6, '車両運搬具', '車両運搬具減価償却累計額'],
  [3000000, 0, 5, 9, '車両運搬具', '車両運搬具減価償却累計額'], [1800000, 0, 6, 3, '車両運搬具', '車両運搬具減価償却累計額'],
  [4200000, 10, 7, 12, '車両運搬具', '車両運搬具減価償却累計額'], [2640000, 0, 11, 6, '車両運搬具', '車両運搬具減価償却累計額'],
  [1500000, 10, 5, 9, '車両運搬具', '車両運搬具減価償却累計額'], [4800000, 0, 8, 12, '車両運搬具', '車両運搬具減価償却累計額'],
  [9000000, 0, 15, 12, '建物', '建物減価償却累計額'], [12000000, 10, 20, 6, '建物', '建物減価償却累計額'],
  [6600000, 0, 11, 9, '建物', '建物減価償却累計額'], [15000000, 10, 25, 12, '建物', '建物減価償却累計額'],
  [7200000, 0, 12, 3, '建物', '建物減価償却累計額'], [18000000, 0, 30, 12, '建物', '建物減価償却累計額'],
  [8400000, 10, 14, 6, '建物', '建物減価償却累計額'], [10800000, 0, 18, 9, '建物', '建物減価償却累計額'],
  [1320000, 0, 11, 12, '備品', '備品減価償却累計額'], [900000, 10, 5, 6, '備品', '備品減価償却累計額'],
  [2160000, 0, 9, 3, '備品', '備品減価償却累計額'], [1600000, 0, 8, 9, '備品', '備品減価償却累計額'],
  [5400000, 0, 9, 6, '車両運搬具', '車両運搬具減価償却累計額'], [2880000, 10, 8, 12, '車両運搬具', '車両運搬具減価償却累計額'],
] as [number, number, number, number, string, string][]) {
  const residual = Math.round(cost * residualRate / 100);
  const annual = Math.round((cost - residual) / life);
  const amount = Math.round(annual * months / 12);
  const b = { parent: 'base2-dep-straight', topic: '2-10', syllabus: '第二・10 有形固定資産', lessonId: 'L11', terms: ['定額法', '減価償却', '耐用年数', '残存価額'] };
  J(b, {
    difficulty: months === 12 ? 'standard' : 'advanced', needsCalc: true, calcType: '減価償却（定額法）', calcComplexity: months === 12 ? 2 : 3,
    prompt: `決算にあたり、${asset}（取得原価 ${yen(cost)}、残存価額は取得原価の${residualRate}％、耐用年数 ${life} 年）について定額法で減価償却を行う。当期の使用期間は ${months} か月である。仕訳を示しなさい（記帳方法は間接法）。`,
    journal: [D('減価償却費', amount), C(cumAcct, amount)],
    explanation: '定額法の1年分の償却額は（取得原価−残存価額）÷耐用年数。使用期間が1年に満たない期は月割計算する。間接法では貸方に減価償却累計額を用いる。',
    calcProcess: `(${cost.toLocaleString()} − ${residual.toLocaleString()}) ÷ ${life} 年 = ${annual.toLocaleString()}／年、${annual.toLocaleString()} × ${months}/12 = ${amount.toLocaleString()}`,
    hints: ['まず1年分の償却額を求める', '残存価額を差し引くのを忘れない', '使用月数で月割りする'],
  });
}

// ---- H02 定率法の減価償却（償却率提示の基本形のみ） ----
for (const [cost, cum, ratePct, asset, cumAcct] of [
  [800000, 200000, 20, '備品', '備品減価償却累計額'], [1000000, 400000, 25, '車両運搬具', '車両運搬具減価償却累計額'],
  [600000, 0, 40, '備品', '備品減価償却累計額'], [1500000, 900000, 20, '備品', '備品減価償却累計額'],
  [2000000, 800000, 25, '車両運搬具', '車両運搬具減価償却累計額'], [900000, 300000, 30, '備品', '備品減価償却累計額'],
  [1200000, 600000, 40, '車両運搬具', '車両運搬具減価償却累計額'], [2500000, 500000, 20, '車両運搬具', '車両運搬具減価償却累計額'],
  [700000, 100000, 25, '備品', '備品減価償却累計額'], [1800000, 600000, 30, '車両運搬具', '車両運搬具減価償却累計額'],
  [500000, 200000, 50, '備品', '備品減価償却累計額'], [1600000, 400000, 25, '備品', '備品減価償却累計額'],
  [3000000, 1800000, 20, '車両運搬具', '車両運搬具減価償却累計額'], [1100000, 200000, 30, '備品', '備品減価償却累計額'],
  [2200000, 1000000, 25, '車両運搬具', '車両運搬具減価償却累計額'], [450000, 150000, 40, '備品', '備品減価償却累計額'],
  [2800000, 400000, 25, '車両運搬具', '車両運搬具減価償却累計額'], [950000, 350000, 20, '備品', '備品減価償却累計額'],
  [1350000, 150000, 40, '備品', '備品減価償却累計額'], [3200000, 2000000, 30, '車両運搬具', '車両運搬具減価償却累計額'],
  [650000, 50000, 20, '備品', '備品減価償却累計額'], [1750000, 550000, 40, '車両運搬具', '車両運搬具減価償却累計額'],
  [850000, 250000, 30, '備品', '備品減価償却累計額'], [4000000, 1600000, 20, '車両運搬具', '車両運搬具減価償却累計額'],
] as [number, number, number, string, string][]) {
  const bookValue = cost - cum;
  const amount = Math.round(bookValue * ratePct / 100);
  const b = { parent: 'base2-dep-declining', topic: '2-10', syllabus: '第二・10 有形固定資産', lessonId: 'L11', terms: ['定率法', '減価償却', '帳簿価額'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '減価償却（定率法）', calcComplexity: 2,
    prompt: `決算にあたり、${asset}（取得原価 ${yen(cost)}、減価償却累計額 ${yen(cum)}）について、償却率 ${ratePct}％の定率法で減価償却を行う。仕訳を示しなさい（記帳方法は間接法）。3級では償却率が示される基本的な計算のみが対象で、保証率・改定償却率は用いない。`,
    journal: [D('減価償却費', amount), C(cumAcct, amount)],
    explanation: '定率法の償却額は期首帳簿価額（取得原価−減価償却累計額）×償却率で計算する。取得原価に直接率を掛けない点に注意する。',
    calcProcess: `期首帳簿価額 ${cost.toLocaleString()} − ${cum.toLocaleString()} = ${bookValue.toLocaleString()}、${bookValue.toLocaleString()} × ${ratePct}％ = ${amount.toLocaleString()}`,
    hints: ['定率法は取得原価ではなく期首の帳簿価額にかける', '先に帳簿価額を求める', '貸方は減価償却累計額（間接法）'],
  });
}

// ---- H03 有形固定資産の取得（付随費用は取得原価に含める） ----
for (const [asset, price, fees, payAcct] of [
  ['備品', 450000, [['引取運賃', 15000]], '現金'],
  ['備品', 780000, [['引取運賃', 20000], ['設置費', 30000]], '普通預金'],
  ['備品', 380000, [['設置費', 12000]], '未払金'],
  ['備品', 920000, [['引取運賃', 25000], ['仲介手数料', 40000], ['設置費', 18000]], '未払金'],
  ['備品', 1250000, [['設置費', 50000]], '普通預金'],
  ['備品', 640000, [['引取運賃', 18000], ['設置費', 22000]], '現金'],
  ['備品', 560000, [['仲介手数料', 28000]], '未払金'],
  ['備品', 1580000, [['引取運賃', 32000], ['設置費', 46000]], '普通預金'],
  ['車両運搬具', 2400000, [['引取運賃', 30000], ['仲介手数料', 60000]], '普通預金'],
  ['車両運搬具', 1800000, [['仲介手数料', 45000]], '未払金'],
  ['車両運搬具', 3200000, [['引取運賃', 40000]], '現金'],
  ['車両運搬具', 2750000, [['引取運賃', 35000], ['仲介手数料', 55000]], '普通預金'],
  ['車両運搬具', 1950000, [['仲介手数料', 38000]], '現金'],
  ['車両運搬具', 4100000, [['引取運賃', 52000], ['仲介手数料', 74000]], '未払金'],
  ['建物', 8500000, [['仲介手数料', 255000]], '普通預金'],
  ['建物', 12600000, [['仲介手数料', 378000]], '未払金'],
  ['建物', 6400000, [['仲介手数料', 192000]], '現金'],
  ['建物', 15800000, [['仲介手数料', 474000]], '普通預金'],
  ['建物', 9800000, [['仲介手数料', 294000]], '未払金'],
  ['建物', 21000000, [['仲介手数料', 630000]], '普通預金'],
  ['土地', 5000000, [['仲介手数料', 150000]], '普通預金'],
  ['土地', 7200000, [['仲介手数料', 216000]], '未払金'],
  ['土地', 3600000, [['仲介手数料', 108000]], '現金'],
  ['土地', 9100000, [['仲介手数料', 273000]], '普通預金'],
] as [string, number, [string, number][], string][]) {
  const feeTotal = fees.reduce((s, f) => s + f[1], 0);
  const total = price + feeTotal;
  const payText = payAcct === '未払金' ? '支払いは後日行うこととした' : `${payAcct}で支払った`;
  const feeText = fees.map((f) => `${f[0]} ${yen(f[1])}`).join('、');
  const b = { parent: 'base2-asset-acquire', topic: '2-10', syllabus: '第二・10 有形固定資産', lessonId: 'L11', terms: ['取得原価', '付随費用'] };
  J(b, {
    difficulty: fees.length >= 2 ? 'advanced' : 'standard', needsCalc: true, calcType: '取得原価の集計', calcComplexity: fees.length >= 2 ? 2 : 1,
    prompt: `${asset}を ${yen(price)} で購入し、あわせて${feeText}がかかり、${payText}。仕訳を示しなさい。`,
    journal: [D(asset, total), C(payAcct, total)],
    explanation: '固定資産の取得原価には購入代金のほか、引取運賃・設置費・仲介手数料などの付随費用を含める。費用として別に計上しない。',
    calcProcess: `取得原価 ${price.toLocaleString()} + ${fees.map((f) => f[1].toLocaleString()).join(' + ')} = ${total.toLocaleString()}`,
    hints: ['付随費用は費用ではなく取得原価に含める', '借方は合計額で1行にまとめる', '支払手段（現金・預金・未払金）を確認する'],
  });
}

// ---- H04 有形固定資産の除却・廃棄（処分費用は除却損に含める） ----
for (const [asset, cumAcct, cost, cum, fee] of [
  ['備品', '備品減価償却累計額', 800000, 650000, 0], ['備品', '備品減価償却累計額', 1200000, 960000, 20000],
  ['備品', '備品減価償却累計額', 500000, 380000, 0], ['備品', '備品減価償却累計額', 960000, 720000, 15000],
  ['備品', '備品減価償却累計額', 1500000, 1230000, 0], ['備品', '備品減価償却累計額', 640000, 448000, 12000],
  ['備品', '備品減価償却累計額', 2000000, 1700000, 0], ['備品', '備品減価償却累計額', 720000, 504000, 18000],
  ['車両運搬具', '車両運搬具減価償却累計額', 2400000, 1920000, 0], ['車両運搬具', '車両運搬具減価償却累計額', 3600000, 3060000, 30000],
  ['車両運搬具', '車両運搬具減価償却累計額', 1800000, 1260000, 0], ['車両運搬具', '車両運搬具減価償却累計額', 2800000, 2240000, 25000],
  ['車両運搬具', '車両運搬具減価償却累計額', 1500000, 1050000, 0], ['車両運搬具', '車両運搬具減価償却累計額', 4200000, 3570000, 40000],
  ['建物', '建物減価償却累計額', 9000000, 5400000, 0], ['建物', '建物減価償却累計額', 12000000, 8400000, 150000],
  ['建物', '建物減価償却累計額', 6600000, 3960000, 0], ['建物', '建物減価償却累計額', 15000000, 11250000, 200000],
  ['建物', '建物減価償却累計額', 7200000, 4320000, 0], ['建物', '建物減価償却累計額', 10800000, 7560000, 120000],
  ['備品', '備品減価償却累計額', 1100000, 825000, 0], ['備品', '備品減価償却累計額', 880000, 616000, 16000],
] as [string, string, number, number, number][]) {
  const bookValue = cost - cum;
  const loss = bookValue + fee;
  const journal: JournalLine[] = fee > 0
    ? [D(cumAcct, cum), D('固定資産除却損', loss), C(asset, cost), C('現金', fee)]
    : [D(cumAcct, cum), D('固定資産除却損', loss), C(asset, cost)];
  const b = { parent: 'base2-asset-retire', topic: '2-10', syllabus: '第二・10 有形固定資産', lessonId: 'L11', terms: ['除却', '固定資産除却損', '帳簿価額', '処分費用'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '帳簿価額の計算', calcComplexity: fee > 0 ? 3 : 2,
    prompt: fee > 0
      ? `${asset}（取得原価 ${yen(cost)}、減価償却累計額 ${yen(cum)}）を除却し、処分費用 ${yen(fee)} を現金で支払った。除却の仕訳を示しなさい。`
      : `${asset}（取得原価 ${yen(cost)}、減価償却累計額 ${yen(cum)}）が使用できなくなったため除却した。除却の仕訳を示しなさい。`,
    journal,
    explanation: fee > 0
      ? '除却では減価償却累計額を取り崩し、残っていた帳簿価額に処分費用を加えた額が固定資産除却損となる。処分費用の現金支払いは貸方に現れる。'
      : '除却では対価がないため、減価償却累計額を取り崩した後に残る帳簿価額の全額が固定資産除却損となる。',
    calcProcess: fee > 0
      ? `帳簿価額 ${cost.toLocaleString()} − ${cum.toLocaleString()} = ${bookValue.toLocaleString()}、除却損 ${bookValue.toLocaleString()} + 処分費用 ${fee.toLocaleString()} = ${loss.toLocaleString()}`
      : `帳簿価額 ${cost.toLocaleString()} − ${cum.toLocaleString()} = ${bookValue.toLocaleString()}（全額が除却損）`,
    hints: ['まず帳簿価額を求める', '累計額は借方で取り崩す', fee > 0 ? '処分費用は除却損に含める' : '対価がないので帳簿価額がそのまま損失になる'],
  });
}

// ---- H05 給料の支払い（預り金を差し引く複合仕訳） ----
for (const [gross, tax, insurance] of [
  [320000, 14500, 28600], [450000, 22800, 41200], [280000, 11800, 24500], [560000, 31500, 52400],
  [390000, 18200, 35900], [620000, 38600, 57800], [340000, 15600, 30200], [480000, 25400, 44100],
  [510000, 27900, 47600], [265000, 10400, 22800], [590000, 34200, 54900], [430000, 21600, 39800],
  [368000, 16900, 33400], [700000, 45800, 65200], [305000, 13200, 27100], [525000, 28300, 48900],
] as [number, number, number][]) {
  const withheld = tax + insurance;
  const net = gross - withheld;
  const b = { parent: 'base2-salary', topic: '2-18', syllabus: '第二・18 収益と費用', lessonId: 'L12', terms: ['給料', '預り金', '源泉所得税', '社会保険料'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '集計', calcComplexity: 2,
    prompt: `従業員への給料総額 ${yen(gross)} について、源泉所得税 ${yen(tax)} と社会保険料の従業員負担分 ${yen(insurance)} を差し引き、残額を普通預金から支払った。仕訳を示しなさい。`,
    journal: [D('給料', gross), C('預り金', withheld), C('普通預金', net)],
    explanation: '給料は総額を費用とし、源泉所得税と社会保険料の従業員負担分はいずれも預り金（負債）として合算し、差引額を手取りとして支払う。',
    calcProcess: `預り金合計 ${tax.toLocaleString()} + ${insurance.toLocaleString()} = ${withheld.toLocaleString()}、手取り額 ${gross.toLocaleString()} − ${withheld.toLocaleString()} = ${net.toLocaleString()}`,
    hints: ['給料は総額を借方に計上する', '税金と社会保険料は預り金に合算する', '貸方の預金は差引後の手取り額になる'],
  });
}

// ---- H06 利息の期中処理（元本同時返済・未払利息の計上） ----
for (const [principal, ratePct, months] of [
  [600000, 2, 6], [800000, 3, 4], [1000000, 2, 12], [500000, 3, 6],
  [1200000, 2, 9], [900000, 2, 4], [1500000, 3, 8], [700000, 3, 12],
] as [number, number, number][]) {
  const interest = Math.round(principal * ratePct / 100 * months / 12);
  const b = { parent: 'base2-interest-accrual', topic: '2-4', syllabus: '第二・4 その他の債権と債務等', lessonId: 'L09', terms: ['貸付金', '受取利息'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '利息計算', calcComplexity: 2,
    prompt: `貸付金 ${yen(principal)}（年利率 ${ratePct}％、貸付期間 ${months} か月）の満期となり、元本と利息をあわせて普通預金口座に入金された。入金時の仕訳を示しなさい。`,
    journal: [D('普通預金', principal + interest), C('貸付金', principal), C('受取利息', interest)],
    explanation: '元本の返済は貸付金の減少、利息は受取利息（収益）として分けて記録する。入金額は元本と利息の合計である。',
    calcProcess: `利息 ${principal.toLocaleString()} × ${ratePct}％ × ${months}/12 = ${interest.toLocaleString()}、入金額 ${principal.toLocaleString()} + ${interest.toLocaleString()} = ${(principal + interest).toLocaleString()}`,
    hints: ['利息は元本・利率・期間から計算する', '元本と利息は分けて考える', '預金は合計額で増える'],
  });
}
for (const [principal, ratePct, months] of [
  [400000, 2, 6], [900000, 3, 6], [2000000, 2, 3], [600000, 3, 12],
  [1100000, 2, 6], [750000, 2, 8], [1800000, 3, 4], [300000, 3, 6],
] as [number, number, number][]) {
  const interest = Math.round(principal * ratePct / 100 * months / 12);
  const b = { parent: 'base2-interest-accrual', topic: '2-4', syllabus: '第二・4 その他の債権と債務等', lessonId: 'L09', terms: ['借入金', '支払利息'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '利息計算', calcComplexity: 2,
    prompt: `借入金 ${yen(principal)}（年利率 ${ratePct}％）について、${months} か月分の利息と元本をあわせて普通預金口座から返済した。返済時の仕訳を示しなさい。`,
    journal: [D('借入金', principal), D('支払利息', interest), C('普通預金', principal + interest)],
    explanation: '元本の返済は借入金の減少、利息は支払利息（費用）として分けて記録する。支払額は元本と利息の合計である。',
    calcProcess: `利息 ${principal.toLocaleString()} × ${ratePct}％ × ${months}/12 = ${interest.toLocaleString()}、返済額 ${principal.toLocaleString()} + ${interest.toLocaleString()} = ${(principal + interest).toLocaleString()}`,
    hints: ['利息は元本・利率・期間から計算する', '元本と利息は分けて考える', '預金は合計額で減る'],
  });
}
for (const [principal, ratePct, months] of [
  [1000000, 2, 3], [800000, 3, 3], [1500000, 2, 6], [600000, 2, 9],
  [2000000, 3, 2], [450000, 2, 12], [1200000, 3, 5], [1800000, 2, 5],
] as [number, number, number][]) {
  const interest = Math.round(principal * ratePct / 100 * months / 12);
  const b = { parent: 'base2-interest-accrual', topic: '2-4', syllabus: '第二・4 その他の債権と債務等', lessonId: 'L09', terms: ['借入金', '支払利息', '未払利息'] };
  J(b, {
    difficulty: 'standard', needsCalc: true, calcType: '利息計算', calcComplexity: 2,
    prompt: `借入金 ${yen(principal)}（年利率 ${ratePct}％）の利息は後払いの契約であり、月末時点で ${months} か月分の利息が未払いである。未払利息を計上する仕訳を示しなさい。`,
    journal: [D('支払利息', interest), C('未払利息', interest)],
    explanation: '利息は期間の経過により発生するため、未払い分も支払利息として計上し、未払利息（負債）とする。支払い時に未払利息を取り崩す。',
    calcProcess: `未払利息 ${principal.toLocaleString()} × ${ratePct}％ × ${months}/12 = ${interest.toLocaleString()}`,
    hints: ['利息は元本・利率・期間から計算する', '未払いでも費用は発生している', '相手科目は未払利息'],
  });
}

// ---- H07 税込価格からの算出（税抜方式・税込は1.1で割り切れる数値） ----
for (const [net, payAcct, payText] of [
  [80000, '買掛金', '掛けで'], [150000, '普通預金', '普通預金から支払って'], [45000, '買掛金', '掛けで'],
  [230000, '現金', '現金で支払って'], [68000, '買掛金', '掛けで'], [360000, '普通預金', '普通預金から支払って'],
  [120000, '買掛金', '掛けで'], [275000, '買掛金', '掛けで'], [96000, '現金', '現金で支払って'],
  [510000, '普通預金', '普通預金から支払って'], [56000, '買掛金', '掛けで'], [188000, '買掛金', '掛けで'],
] as [number, string, string][]) {
  const tax = Math.round(net * 0.1);
  const gross = net + tax;
  const b = { parent: 'base2-vat-gross', topic: '2-19', syllabus: '第二・19 税金', lessonId: 'L12', terms: ['税抜方式', '仮払消費税', '消費税'] };
  J(b, {
    difficulty: 'standard', needsCalc: true, calcType: '消費税額の算定', calcComplexity: 2,
    prompt: `商品を税込価格 ${yen(gross)} で${payText}仕入れた。消費税率は10％である。税抜方式による仕訳を示しなさい。`,
    journal: [D('仕入', net), D('仮払消費税', tax), C(payAcct, gross)],
    explanation: '税抜方式では税込価格を1.1で割って本体価格を求め、消費税分は仮払消費税（資産）として分けて記録する。',
    calcProcess: `本体価格 ${gross.toLocaleString()} ÷ 1.1 = ${net.toLocaleString()}、消費税 ${net.toLocaleString()} × 10％ = ${tax.toLocaleString()}`,
    hints: ['税込価格を1.1で割ると本体価格になる', '支払う側の消費税は仮払消費税', '貸方は税込の全額になる'],
  });
}
for (const [net, recvAcct, recvText] of [
  [90000, '売掛金', '掛けで'], [175000, '普通預金', '普通預金口座に入金を受けて'], [52000, '売掛金', '掛けで'],
  [248000, '売掛金', '掛けで'], [134000, '普通預金', '普通預金口座に入金を受けて'], [390000, '売掛金', '掛けで'],
  [210000, '売掛金', '掛けで'], [46000, '普通預金', '普通預金口座に入金を受けて'], [305000, '売掛金', '掛けで'],
  [72000, '売掛金', '掛けで'], [428000, '普通預金', '普通預金口座に入金を受けて'], [162000, '売掛金', '掛けで'],
] as [number, string, string][]) {
  const tax = Math.round(net * 0.1);
  const gross = net + tax;
  const b = { parent: 'base2-vat-gross', topic: '2-19', syllabus: '第二・19 税金', lessonId: 'L12', terms: ['税抜方式', '仮受消費税', '消費税'] };
  J(b, {
    difficulty: 'standard', needsCalc: true, calcType: '消費税額の算定', calcComplexity: 2,
    prompt: `商品を税込価格 ${yen(gross)} で${recvText}販売した。消費税率は10％である。税抜方式による仕訳を示しなさい。`,
    journal: [D(recvAcct, gross), C('売上', net), C('仮受消費税', tax)],
    explanation: '税抜方式では税込価格を1.1で割って売上（税抜）を求め、預かった消費税は仮受消費税（負債）として分けて記録する。',
    calcProcess: `本体価格 ${gross.toLocaleString()} ÷ 1.1 = ${net.toLocaleString()}、消費税 ${net.toLocaleString()} × 10％ = ${tax.toLocaleString()}`,
    hints: ['税込価格を1.1で割ると本体価格になる', '預かる側の消費税は仮受消費税', '借方は税込の全額になる'],
  });
}

// ---- H08 前払金・前受金・立替金・預り金・仮払金・仮受金・未収入金・未払金の諸処理 ----
{
  const b = { parent: 'base2-misc-receivables', topic: '2-4', syllabus: '第二・4 その他の債権と債務等', lessonId: 'L09', terms: ['前払金', '前受金', '仮払金', '仮受金'] };
  const hints3 = ['勘定の性質（資産か負債か）を考える', '精算では元の仮勘定を取り崩す', '金額は問題文の指示どおりに使う'];
  // 前払金の支払い
  for (const [amt, store, acct] of [
    [30000, '甲商店', '普通預金'], [50000, '乙商店', '現金'], [80000, '丙商店', '普通預金'], [120000, '丁商店', '普通預金'],
  ] as [number, string, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${store}から商品を仕入れる契約を結び、手付金 ${yen(amt)} を${acct === '現金' ? '現金で' : '普通預金から'}支払った。仕訳を示しなさい。`, journal: [D('前払金', amt), C(acct, amt)], explanation: '商品を受け取る前に代金の一部を支払った場合は前払金（資産）として記録する。', hints: hints3 });
  }
  // 前払金の精算（商品の受取り）
  for (const [total, adv, store] of [
    [180000, 50000, '甲商店'], [260000, 80000, '乙商店'], [340000, 120000, '丙商店'], [150000, 40000, '丁商店'],
  ] as [number, number, string][]) {
    const rem = total - adv;
    J(b, { difficulty: 'advanced', needsCalc: false, prompt: `${store}から商品 ${yen(total)} を受け取った。代金のうち ${yen(adv)} は前払金で精算し、残額 ${yen(rem)} は掛けとした。受取時の仕訳を示しなさい。`, journal: [D('仕入', total), C('前払金', adv), C('買掛金', rem)], explanation: '商品の受取りで仕入を計上し、前払金を取り崩して残額を買掛金とする。', hints: hints3 });
  }
  // 前受金の受取り
  for (const [amt, store] of [[40000, '甲商店'], [90000, '乙商店']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${store}への商品販売の契約にあたり、手付金 ${yen(amt)} を普通預金口座で受け取った。仕訳を示しなさい。`, journal: [D('普通預金', amt), C('前受金', amt)], explanation: '商品を引き渡す前に代金の一部を受け取った場合は前受金（負債）として記録する。', hints: hints3 });
  }
  // 前受金の精算（商品の引渡し）
  for (const [total, adv, store] of [
    [220000, 60000, '甲商店'], [310000, 90000, '丙商店'], [175000, 50000, '乙商店'], [420000, 150000, '丁商店'],
  ] as [number, number, string][]) {
    const rem = total - adv;
    J(b, { difficulty: 'advanced', needsCalc: false, prompt: `${store}へ商品 ${yen(total)} を引き渡した。代金のうち ${yen(adv)} は前受金で精算し、残額 ${yen(rem)} は掛けとした。引渡し時の仕訳を示しなさい。`, journal: [D('前受金', adv), D('売掛金', rem), C('売上', total)], explanation: '商品の引渡しで売上を計上し、前受金を取り崩して残額を売掛金とする。', hints: hints3 });
  }
  // 立替金の支払い
  for (const [amt, what] of [[8500, '得意先あての商品発送の運賃'], [12600, '従業員が出張先で支払った荷物の運搬賃']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${what} ${yen(amt)} を現金で立て替え払いした。仕訳を示しなさい。`, journal: [D('立替金', amt), C('現金', amt)], explanation: '他人が負担すべき金額を一時的に立て替えた場合は立替金（資産）として記録する。', hints: hints3 });
  }
  // 立替金の回収
  for (const [amt, who] of [[9200, '得意先'], [17400, '従業員']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `立て替えていた ${yen(amt)} を${who}から現金で回収した。仕訳を示しなさい。`, journal: [D('現金', amt), C('立替金', amt)], explanation: '立替金の回収により立替金（資産）が消滅し、現金が増える。', hints: hints3 });
  }
  // 預り金の受取り
  for (const [amt] of [[25000], [43000]] as [number][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `貸店舗の入居者から保証金 ${yen(amt)} を普通預金口座で預かった。仕訳を示しなさい。`, journal: [D('普通預金', amt), C('預り金', amt)], explanation: '将来返還する義務のある保証金は預り金（負債）として記録する。収益ではない。', hints: hints3 });
  }
  // 預り金の納付・返還
  for (const [amt, what] of [[18500, '従業員から預かっていた源泉所得税を税務署へ納付した'], [36000, '退去した入居者へ保証金を返還した']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${what}。普通預金から ${yen(amt)} を支払った。仕訳を示しなさい。`, journal: [D('預り金', amt), C('普通預金', amt)], explanation: '預り金の納付・返還により預り金（負債）が消滅する。費用の支払いではない。', hints: hints3 });
  }
  // 仮払金の支払い
  for (const [amt, who] of [[50000, '営業部員'], [80000, '技術部員'], [100000, '総務部員']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${who}の出張旅費として概算額 ${yen(amt)} を現金で前渡しした。仕訳を示しなさい。`, journal: [D('仮払金', amt), C('現金', amt)], explanation: '用途が未確定の概算払いは仮払金（資産）として記録し、精算時に費用へ振り替える。', hints: hints3 });
  }
  // 仮払金の精算（費用計上＋残額の返還）
  for (const [adv, expenses, stateRem] of [
    [60000, [['旅費交通費', 38500], ['通信費', 4200]], true],
    [45000, [['旅費交通費', 26800], ['雑費', 5600]], false],
    [90000, [['旅費交通費', 54300], ['消耗品費', 12700], ['通信費', 3800]], true],
    [70000, [['旅費交通費', 41900], ['消耗品費', 8600]], false],
  ] as [number, [string, number][], boolean][]) {
    const used = expenses.reduce((s, e) => s + e[1], 0);
    const rem = adv - used;
    const expText = expenses.map((e) => `${e[0]} ${yen(e[1])}`).join('、');
    J(b, {
      difficulty: 'advanced', needsCalc: !stateRem, calcType: !stateRem ? '差額計算' : undefined, calcComplexity: !stateRem ? 2 : undefined,
      prompt: `出張旅費の仮払金 ${yen(adv)} について、精算報告（${expText}）を受け、残額${stateRem ? ` ${yen(rem)} ` : ''}を現金で返還を受けた。精算の仕訳を示しなさい。`,
      journal: [...expenses.map((e) => D(e[0], e[1])), D('現金', rem), C('仮払金', adv)],
      explanation: '精算では実際の費用を計上し、使わなかった残額は現金で戻して仮払金を消滅させる。',
      calcProcess: !stateRem ? `使用額 ${expenses.map((e) => e[1].toLocaleString()).join(' + ')} = ${used.toLocaleString()}、残額 ${adv.toLocaleString()} − ${used.toLocaleString()} = ${rem.toLocaleString()}` : undefined,
      hints: hints3,
    });
  }
  // 仮受金の受取り
  for (const [amt] of [[33000], [57000]] as [number][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `普通預金口座に原因不明の入金 ${yen(amt)} があった。入金時の仕訳を示しなさい。`, journal: [D('普通預金', amt), C('仮受金', amt)], explanation: '入金の原因が判明しない間は仮受金（負債）として記録し、判明した時点で本来の科目へ振り替える。', hints: hints3 });
  }
  // 仮受金の原因判明
  for (const [amt, cause, acct] of [
    [28000, '得意先への現金売上の代金', '売上'], [46000, '売掛金の回収', '売掛金'], [72000, '事務代行の手数料', '受取手数料'],
  ] as [number, string, string][]) {
    J(b, { difficulty: 'advanced', needsCalc: false, prompt: `仮受金として処理していた ${yen(amt)} は、${cause}であることが判明した。振替の仕訳を示しなさい。`, journal: [D('仮受金', amt), C(acct, amt)], explanation: '原因が判明した仮受金は、本来の科目へ振り替えて仮受金を消滅させる。', hints: hints3 });
  }
  // 未収入金の回収
  for (const [amt] of [[65000]] as [number][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `固定資産の売却代金として未収入金に計上していた ${yen(amt)} を普通預金口座で受け取った。仕訳を示しなさい。`, journal: [D('普通預金', amt), C('未収入金', amt)], explanation: '未収入金の回収により未収入金（資産）が消滅し、預金が増える。本業の売上代金の回収ではないため売掛金は使わない。', hints: hints3 });
  }
  // 未払金の支払い
  for (const [amt, what] of [[54000, '備品の購入代金として未払金に計上していた額'], [97000, '車両の修理代として未払金に計上していた額']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${what} ${yen(amt)} を普通預金から支払った。仕訳を示しなさい。`, journal: [D('未払金', amt), C('普通預金', amt)], explanation: '未払金の支払いにより未払金（負債）が消滅する。商品仕入の代金ではないため買掛金は使わない。', hints: hints3 });
  }
  // 売掛金と買掛金の相殺
  for (const [amt, store] of [[135000, '甲商店'], [210000, '丙商店']] as [number, string][]) {
    J(b, { difficulty: 'advanced', needsCalc: false, prompt: `${store}に対する売掛金と買掛金を同額で相殺することとした。相殺額は ${yen(amt)} である。仕訳を示しなさい。`, journal: [D('買掛金', amt), C('売掛金', amt)], explanation: '同一の取引先に対する債権と債務は相殺でき、買掛金（負債）と売掛金（資産）が同額減少する。現金の動きはない。', hints: hints3 });
  }
  // 未払金の発生（備品の購入）
  for (const [amt] of [[150000]] as [number][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `事務用の備品 ${yen(amt)} を購入し、代金は月末に支払うこととした。仕訳を示しなさい。`, journal: [D('備品', amt), C('未払金', amt)], explanation: '商品以外のものを購入して未払いの場合は未払金（負債）とする。買掛金は商品仕入の代金専用である。', hints: hints3 });
  }
}

// ---- H09 現金過不足の原因判明処理 ----
for (const [balance, causes] of [
  [3000, [['消耗品費', 1200], ['旅費交通費', 800]]], [4500, [['給料', 3000]]], [2800, [['消耗品費', 2800]]],
  [6200, [['旅費交通費', 2500], ['通信費', 1700]]], [5100, [['給料', 4000]]], [7600, [['消耗品費', 3200], ['給料', 2600]]],
  [3900, [['旅費交通費', 1900]]], [8800, [['通信費', 2800], ['消耗品費', 3500]]], [2400, [['消耗品費', 1500]]],
  [9700, [['給料', 5500], ['旅費交通費', 2200]]], [5600, [['消耗品費', 5600]]], [6800, [['旅費交通費', 3100], ['雑費', 1400]]],
] as [number, [string, number][]][]) {
  const explained = causes.reduce((s, c) => s + c[1], 0);
  const rem = balance - explained;
  const causeText = causes.map((c) => `${c[0]} ${yen(c[1])}`).join('、');
  const b = { parent: 'base2-cash-shortage-cause', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L04', terms: ['現金過不足', '雑損'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '差額計算', calcComplexity: causes.length >= 2 ? 3 : 2,
    prompt: `現金過不足勘定の借方残高は ${yen(balance)} である。その後の調査で、${causeText}の記帳漏れが判明した。${rem > 0 ? '残額については原因が判明しなかった。' : ''}決算前の処理として原因判明分と${rem > 0 ? '残額の処理' : 'その処理'}の仕訳を示しなさい。`,
    journal: [...causes.map((c) => D(c[0], c[1])), ...(rem > 0 ? [D('雑損', rem)] : []), C('現金過不足', balance)],
    explanation: '不足の原因が判明した分は本来の費用科目に戻し、最後まで判明しなかった残額は雑損とする。現金過不足勘定はこの仕訳で消滅する。',
    calcProcess: rem > 0 ? `判明分 ${causes.map((c) => c[1].toLocaleString()).join(' + ')} = ${explained.toLocaleString()}、雑損 ${balance.toLocaleString()} − ${explained.toLocaleString()} = ${rem.toLocaleString()}` : `判明分 ${explained.toLocaleString()} が残高 ${balance.toLocaleString()} と一致するため雑損は生じない`,
    hints: ['現金過不足の残高が振替の総額になる', '判明した分は本来の費用科目を使う', '残額は雑損になる'],
  });
}
for (const [balance, causes] of [
  [2600, [['受取利息', 1600]]], [5400, [['売上', 3800]]], [4200, [['受取利息', 1200], ['売上', 2000]]],
  [7100, [['売上', 7100]]], [3800, [['受取利息', 2300]]], [6500, [['売上', 4200], ['受取利息', 800]]],
  [2900, [['売上', 1700]]], [8300, [['受取利息', 3500], ['売上', 2900]]], [4700, [['売上', 2600]]],
  [5900, [['受取利息', 5900]]], [9200, [['売上', 6000], ['受取利息', 1400]]], [3400, [['受取利息', 900], ['売上', 1300]]],
] as [number, [string, number][]][]) {
  const explained = causes.reduce((s, c) => s + c[1], 0);
  const rem = balance - explained;
  const causeText = causes.map((c) => `${c[0]} ${yen(c[1])}`).join('、');
  const b = { parent: 'base2-cash-shortage-cause', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L04', terms: ['現金過不足', '雑益'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '差額計算', calcComplexity: causes.length >= 2 ? 3 : 2,
    prompt: `現金過不足勘定の貸方残高は ${yen(balance)} である。その後の調査で、${causeText}の記帳漏れが判明した。${rem > 0 ? '残額については原因が判明しなかった。' : ''}原因判明分と${rem > 0 ? '残額の処理' : 'その処理'}の仕訳を示しなさい。`,
    journal: [D('現金過不足', balance), ...causes.map((c) => C(c[0], c[1])), ...(rem > 0 ? [C('雑益', rem)] : [])],
    explanation: '超過の原因が判明した分は本来の収益科目に戻し、最後まで判明しなかった残額は雑益とする。現金過不足勘定はこの仕訳で消滅する。',
    calcProcess: rem > 0 ? `判明分 ${causes.map((c) => c[1].toLocaleString()).join(' + ')} = ${explained.toLocaleString()}、雑益 ${balance.toLocaleString()} − ${explained.toLocaleString()} = ${rem.toLocaleString()}` : `判明分 ${explained.toLocaleString()} が残高 ${balance.toLocaleString()} と一致するため雑益は生じない`,
    hints: ['現金過不足の残高が振替の総額になる', '判明した分は本来の収益科目を使う', '残額は雑益になる'],
  });
}

// ---- H10 掛売買のバリエーション ----
{
  const b = { parent: 'base2-credit-variants', topic: '2-3', syllabus: '第二・3 売掛金および買掛金ならびに電子記録債権等', lessonId: 'L08', terms: ['電子記録債権', '電子記録債務', '仕入諸掛り', '貸倒れ'] };
  // 仕入諸掛りを仕入先が立替払いし買掛金に加算
  for (const [price, freight, store] of [
    [240000, 8000, '甲商店'], [380000, 12000, '乙商店'], [175000, 6500, '丙商店'], [520000, 15000, '丁商店'],
  ] as [number, number, string][]) {
    J(b, {
      difficulty: 'standard', needsCalc: true, calcType: '集計', calcComplexity: 1,
      prompt: `${store}から商品 ${yen(price)} を掛けで仕入れた。当社負担の引取運賃 ${yen(freight)} は仕入先が立て替え払いし、買掛金に加算された。仕訳を示しなさい。`,
      journal: [D('仕入', price + freight), C('買掛金', price + freight)],
      explanation: '当社負担の仕入諸掛りは仕入原価に含める。立替分も買掛金に加算されるため、仕入と買掛金は合計額になる。',
      calcProcess: `${price.toLocaleString()} + ${freight.toLocaleString()} = ${(price + freight).toLocaleString()}`,
      hints: ['諸掛りは仕入に含める', '立替分は買掛金に加わる', '借方・貸方は同額になる'],
    });
  }
  // 仕入諸掛りを現金で支払った掛仕入
  for (const [price, freight, store] of [
    [260000, 9000, '甲商店'], [145000, 5500, '乙商店'], [430000, 13500, '丙商店'], [310000, 11000, '丁商店'],
  ] as [number, number, string][]) {
    J(b, {
      difficulty: 'advanced', needsCalc: true, calcType: '集計', calcComplexity: 2,
      prompt: `${store}から商品 ${yen(price)} を掛けで仕入れ、当社負担の引取運賃 ${yen(freight)} を現金で支払った。仕訳を示しなさい。`,
      journal: [D('仕入', price + freight), C('買掛金', price), C('現金', freight)],
      explanation: '当社負担の仕入諸掛りは仕入原価に含める。商品代金は買掛金、運賃は現金支払いとして貸方を分ける。',
      calcProcess: `仕入 ${price.toLocaleString()} + ${freight.toLocaleString()} = ${(price + freight).toLocaleString()}`,
      hints: ['諸掛りは仕入に含める', '貸方は代金と運賃で分ける', '運賃の支払手段は現金'],
    });
  }
  // 販売時に代金の一部を電子記録債権で回収
  for (const [total, densai, store] of [
    [480000, 200000, '甲商店'], [650000, 300000, '乙商店'], [390000, 150000, '丙商店'], [820000, 500000, '丁商店'],
  ] as [number, number, string][]) {
    J(b, {
      difficulty: 'advanced', needsCalc: false,
      prompt: `${store}へ商品 ${yen(total)} を販売した。代金のうち ${yen(densai)} については電子記録債権の発生記録がされ、残額は掛けとした。販売時の仕訳をすべて示しなさい。`,
      journal: [D('売掛金', total), D('電子記録債権', densai), C('売上', total), C('売掛金', densai)],
      explanation: 'まず掛け売上として売掛金を計上し、電子記録債権の発生記録がされた分を売掛金から電子記録債権へ振り替える。',
      hints: ['仕訳は売上の計上と振替の2本になる', '電子記録債権は売掛金の転化', '売掛金の残りが掛け分になる'],
    });
  }
  // 売掛金の一部を電子記録債権へ振替
  for (const [amt, store] of [
    [180000, '甲商店'], [260000, '乙商店'], [420000, '丙商店'], [135000, '丁商店'],
  ] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${store}に対する売掛金 ${yen(amt)} について、電子記録債権の発生記録がされた。振替の仕訳を示しなさい。`, journal: [D('電子記録債権', amt), C('売掛金', amt)], explanation: '電子記録債権は売掛金が転化した債権であり、発生時は振替処理を行う。', hints: ['発生時は振替のみ', '入金はまだない', '電子記録債権は資産'] });
  }
  // 買掛金を電子記録債務へ振替
  for (const [amt, store] of [
    [230000, '甲商店'], [375000, '乙商店'], [158000, '丙商店'], [490000, '丁商店'],
  ] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${store}に対する買掛金 ${yen(amt)} について、電子記録債務の発生記録がされた。振替の仕訳を示しなさい。`, journal: [D('買掛金', amt), C('電子記録債務', amt)], explanation: '電子記録債務は買掛金が転化した債務であり、発生時は振替処理を行う。', hints: ['発生時は振替のみ', '支払いはまだない', '電子記録債務は負債'] });
  }
  // 電子記録債務の決済
  for (const [amt] of [[205000], [340000], [467000], [129000]] as [number][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `電子記録債務 ${yen(amt)} の決済日となり、当座預金口座から支払われた。仕訳を示しなさい。`, journal: [D('電子記録債務', amt), C('当座預金', amt)], explanation: '決済により電子記録債務が消滅し、当座預金が減る。', hints: ['決済時は消滅処理', '支払口座は当座預金', '買掛金はすでに振替済み'] });
  }
  // 売掛金の貸倒れ（引当金＋貸倒損失の複合）
  for (const [total, allowance, store] of [
    [300000, 120000, '甲商店'], [450000, 200000, '乙商店'], [180000, 60000, '丙商店'], [620000, 350000, '丁商店'],
  ] as [number, number, string][]) {
    const loss = total - allowance;
    J(b, {
      difficulty: 'advanced', needsCalc: true, calcType: '差額計算', calcComplexity: 2,
      prompt: `${store}に対する前期に発生した売掛金 ${yen(total)} が貸し倒れた。この売掛金に対する貸倒引当金の残高は ${yen(allowance)} である。貸倒れの仕訳を示しなさい。`,
      journal: [D('貸倒引当金', allowance), D('貸倒損失', loss), C('売掛金', total)],
      explanation: '前期に発生した債権の貸倒れは、まず貸倒引当金を取り崩し、不足分を貸倒損失とする。',
      calcProcess: `貸倒損失 ${total.toLocaleString()} − ${allowance.toLocaleString()} = ${loss.toLocaleString()}`,
      hints: ['引当金でカバーできる分を先に取り崩す', '不足分が貸倒損失になる', '売掛金は全額消滅する'],
    });
  }
  // 当期発生の売掛金の貸倒れ
  for (const [amt, store] of [[95000, '甲商店'], [140000, '丙商店']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${store}に対する当期に発生した売掛金 ${yen(amt)} が貸し倒れた。貸倒れの仕訳を示しなさい。`, journal: [D('貸倒損失', amt), C('売掛金', amt)], explanation: '当期に発生した債権の貸倒れは、引当金を使わず全額を貸倒損失とする。', hints: ['当期発生分は引当金の対象外', '全額が貸倒損失', '売掛金が消滅する'] });
  }
  // 前期売掛金の貸倒れ（引当金で全額カバー）
  for (const [amt, store] of [[110000, '乙商店'], [230000, '丁商店']] as [number, string][]) {
    J(b, { difficulty: 'standard', needsCalc: false, prompt: `${store}に対する前期に発生した売掛金 ${yen(amt)} が貸し倒れた。貸倒引当金の残高はこの金額を上回っている。貸倒れの仕訳を示しなさい。`, journal: [D('貸倒引当金', amt), C('売掛金', amt)], explanation: '前期に発生した債権の貸倒れで引当金が足りる場合は、引当金の取崩しのみで処理し、貸倒損失は生じない。', hints: ['前期発生分は引当金から取り崩す', '不足がなければ貸倒損失はゼロ', '売掛金が消滅する'] });
  }
}

// ---- H11 増資・配当の支払い・利益準備金の上限 ----
for (const [shares, price, acct] of [
  [2000, 600, '普通預金'], [1200, 900, '当座預金'], [3500, 500, '普通預金'],
  [800, 1500, '普通預金'], [2500, 800, '当座預金'], [1800, 1100, '普通預金'],
] as [number, number, string][]) {
  const total = shares * price;
  const b = { parent: 'base2-capital-dividend', topic: '4-1', syllabus: '第四・1 資本金', lessonId: 'L16', terms: ['資本金', '増資', '新株発行'] };
  J(b, {
    difficulty: 'standard', needsCalc: true, calcType: '発行総額の計算', calcComplexity: 1,
    prompt: `増資のため新株 ${shares.toLocaleString()} 株を1株 ${yen(price)} で発行し、全額の払込みを受け${acct}に預け入れた。仕訳を示しなさい（3級では発行価額の全額を資本金とする）。`,
    journal: [D(acct, total), C('資本金', total)],
    explanation: '3級では株式の発行価額の全額を資本金に計上する。増資により預金と資本金が同額増える。',
    calcProcess: `${shares.toLocaleString()} 株 × ${price.toLocaleString()} = ${total.toLocaleString()}`,
    hints: ['株数×1株の価額が発行総額', '3級では全額を資本金にする', '払込みは預金の増加'],
  });
}
for (const [amt] of [[450000], [720000]] as [number][]) {
  const b = { parent: 'base2-capital-dividend', topic: '4-4', syllabus: '第四・4 剰余金の配当など', lessonId: 'L16', terms: ['未払配当金', '配当'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `未払配当金 ${yen(amt)} を普通預金から株主に支払った。仕訳を示しなさい。`, journal: [D('未払配当金', amt), C('普通預金', amt)], explanation: '配当の支払いにより未払配当金（負債）が消滅する。配当の決議時の仕訳とは別である。', hints: ['支払時は負債の消滅', '相手は普通預金', '繰越利益剰余金は使わない'] });
}
for (const [total, tax] of [[600000, 61200], [850000, 86700], [380000, 38760]] as [number, number][]) {
  const net = total - tax;
  const b = { parent: 'base2-capital-dividend', topic: '4-4', syllabus: '第四・4 剰余金の配当など', lessonId: 'L16', terms: ['未払配当金', '預り金', '源泉所得税'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '差額計算', calcComplexity: 1,
    prompt: `未払配当金 ${yen(total)} を支払うにあたり、源泉所得税 ${yen(tax)} を差し引き、残額を普通預金から株主に支払った。仕訳を示しなさい。`,
    journal: [D('未払配当金', total), C('預り金', tax), C('普通預金', net)],
    explanation: '配当の支払い時に差し引いた源泉所得税は、株主に代わって納付するための預り金とする。未払配当金は全額が消滅する。',
    calcProcess: `支払額 ${total.toLocaleString()} − ${tax.toLocaleString()} = ${net.toLocaleString()}`,
    hints: ['未払配当金は全額を取り崩す', '差し引いた税金は預り金', '預金は差引後の額で減る'],
  });
}
for (const [dividend] of [[500000], [900000], [640000]] as [number][]) {
  const b = { parent: 'base2-capital-dividend', topic: '4-4', syllabus: '第四・4 剰余金の配当など', lessonId: 'L16', terms: ['剰余金の配当', '利益準備金'] };
  J(b, {
    difficulty: 'advanced', needsCalc: false,
    prompt: `株主総会で繰越利益剰余金 ${yen(dividend)} の配当が決議された。利益準備金と資本準備金の合計額は、すでに資本金の4分の1に達している。配当の仕訳を示しなさい。`,
    journal: [D('繰越利益剰余金', dividend), C('未払配当金', dividend)],
    explanation: '準備金の合計額が資本金の4分の1に達している場合は、それ以上利益準備金を積み立てる必要がないため、配当額の全額が未払配当金となる。',
    hints: ['準備金が上限に達しているか確認する', '上限到達時は積立て不要', '繰越利益剰余金の減少は配当額のみ'],
  });
}
for (const [capital, existing, dividend] of [
  [4000000, 940000, 800000], [2000000, 470000, 500000], [8000000, 1920000, 1000000], [1200000, 285000, 240000],
] as [number, number, number][]) {
  const cap = Math.round(capital / 4);
  const add = cap - existing;
  const b = { parent: 'base2-capital-dividend', topic: '4-4', syllabus: '第四・4 剰余金の配当など', lessonId: 'L16', terms: ['剰余金の配当', '利益準備金'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '利益準備金の計算', calcComplexity: 3,
    prompt: `株主総会で繰越利益剰余金 ${yen(dividend)} の配当が決議された。資本金は ${yen(capital)}、利益準備金の残高は ${yen(existing)} である。会社法により配当額の10分の1を利益準備金として積み立てるが、準備金の合計額が資本金の4分の1に達する場合はその範囲内にとどめる。配当の仕訳を示しなさい（資本準備金の残高はないものとする）。`,
    journal: [D('繰越利益剰余金', dividend + add), C('利益準備金', add), C('未払配当金', dividend)],
    explanation: '積立額は原則として配当額の1/10だが、準備金の合計額が資本金の1/4に達する場合は、達するまでの不足分だけを積み立てる。今回は不足分の方が小さいため不足分が積立額になる。',
    calcProcess: `上限 ${capital.toLocaleString()} × 1/4 = ${cap.toLocaleString()}、不足分 ${cap.toLocaleString()} − ${existing.toLocaleString()} = ${add.toLocaleString()}（配当の1/10＝${Math.round(dividend / 10).toLocaleString()} より小さい）、繰越利益剰余金の減少 ${dividend.toLocaleString()} + ${add.toLocaleString()} = ${(dividend + add).toLocaleString()}`,
    hints: ['まず準備金の上限額を求める', '積立額は1/10と上限までの不足分のうち小さい方', '繰越利益剰余金の減少は配当＋積立て'],
  });
}

// ---- H12 決算整理の追加（法人税等・固定資産税・当座借越振替・損益振替） ----
for (const [amt] of [[85000], [120000], [64000], [158000], [92000], [210000]] as [number][]) {
  const b = { parent: 'base2-year-end-misc', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['法人税等', '未払法人税等'] };
  J(b, {
    section: 'q3', format: 'closing-journal', difficulty: 'standard', needsCalc: false,
    prompt: `決算にあたり、当期の法人税・住民税及び事業税の見積額 ${yen(amt)} を計上する。決算整理仕訳を示しなさい。`,
    journal: [D('法人税・住民税及び事業税', amt), C('未払法人税等', amt)],
    explanation: '法人税等は当期の利益に対応する費用として決算で計上し、未納分を未払法人税等（負債）とする。',
    hints: ['当期の費用として計上する', '相手科目は未払法人税等', '納付時の仕訳とは区別する'],
  });
}
for (const [amt] of [[60000], [95000]] as [number][]) {
  const b = { parent: 'base2-year-end-misc', topic: '2-19', syllabus: '第二・19 税金', lessonId: 'L12', terms: ['法人税等'] };
  J(b, {
    difficulty: 'standard', needsCalc: false,
    prompt: `法人税・住民税及び事業税の中間納付額 ${yen(amt)} を普通預金から納付した。仕訳を示しなさい（3級では法人税・住民税及び事業税勘定で処理する）。`,
    journal: [D('法人税・住民税及び事業税', amt), C('普通預金', amt)],
    explanation: '中間納付額は、3級では法人税・住民税及び事業税勘定の借方に記入して処理する。決算時に未払法人税等の計上とあわせて当期の税額が確定する。',
    hints: ['中間納付も税金の費用勘定で処理する', '相手は普通預金', '決算で未払分を別途計上する'],
  });
}
for (const [amt] of [[78000], [134000], [56000], [189000]] as [number][]) {
  const b = { parent: 'base2-year-end-misc', topic: '2-19', syllabus: '第二・19 税金', lessonId: 'L12', terms: ['法人税等', '未払法人税等'] };
  J(b, {
    difficulty: 'standard', needsCalc: false,
    prompt: `前決算で計上した未払法人税等 ${yen(amt)} を普通預金から納付した。仕訳を示しなさい。`,
    journal: [D('未払法人税等', amt), C('普通預金', amt)],
    explanation: '確定した法人税等の納付により未払法人税等（負債）が消滅する。納付時に新たな費用は計上しない。',
    hints: ['納付時は負債の消滅', '費用は決算で計上済み', '相手は普通預金'],
  });
}
for (const [amt] of [[42000], [68000], [95000]] as [number][]) {
  const b = { parent: 'base2-year-end-misc', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['固定資産税', '租税公課'] };
  J(b, {
    section: 'q3', format: 'closing-journal', difficulty: 'standard', needsCalc: false,
    prompt: `決算日時点で、固定資産税の当期に属する ${yen(amt)} が未払いである。決算整理仕訳を示しなさい。`,
    journal: [D('租税公課', amt), C('未払金', amt)],
    explanation: '固定資産税は租税公課として費用計上し、未払い分は未払金（負債）とする。',
    hints: ['固定資産税は租税公課', '未払いは見越しで計上する', '相手科目は未払金'],
  });
}
for (const [annual, months] of [[144000, 9], [96000, 6]] as [number, number][]) {
  const amt = Math.round(annual * months / 12);
  const b = { parent: 'base2-year-end-misc', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['固定資産税', '租税公課', '期間按分'] };
  J(b, {
    section: 'q3', format: 'closing-journal', difficulty: 'advanced', needsCalc: true, calcType: '期間按分', calcComplexity: 2,
    prompt: `固定資産税の年額は ${yen(annual)} であり、決算日時点で当期に属する ${months} か月分が未払いである。決算整理仕訳を示しなさい。`,
    journal: [D('租税公課', amt), C('未払金', amt)],
    explanation: '年額のうち当期に属する月数分だけを租税公課として見越し計上し、未払金とする。',
    calcProcess: `${annual.toLocaleString()} × ${months}/12 = ${amt.toLocaleString()}`,
    hints: ['当期に属する月数で按分する', '固定資産税は租税公課', '相手科目は未払金'],
  });
}
for (const [amt] of [[25000], [48000], [72000], [36000], [89000]] as [number][]) {
  const b = { parent: 'base2-year-end-misc', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['当座借越', '借入金'] };
  J(b, {
    section: 'q3', format: 'closing-journal', difficulty: 'standard', needsCalc: false,
    prompt: `決算日における当座借越の残高は ${yen(amt)} である。決算整理として借入金への振替を行う仕訳を示しなさい。`,
    journal: [D('当座借越', amt), C('借入金', amt)],
    explanation: '決算時には当座借越を借入金に振り替えて貸借対照表に表示する。当座借越を取り崩し、借入金に置き換える。',
    hints: ['決算では借入金に振り替えて表示する', '当座借越は借方で取り崩す', '金額は残高の全額'],
  });
}
for (const [revenues, expenses] of [
  [[['売上', 520000], ['受取利息', 6000]], [['仕入', 310000], ['給料', 98000], ['支払家賃', 54000]]],
  [[['売上', 845000]], [['仕入', 498000], ['給料', 156000], ['通信費', 28000], ['消耗品費', 19000]]],
  [[['売上', 386000], ['受取家賃', 36000]], [['仕入', 229000], ['支払利息', 9000], ['雑費', 12000]]],
  [[['売上', 654000], ['受取利息', 4500], ['雑益', 8000]], [['仕入', 402000], ['給料', 121000], ['旅費交通費', 26000], ['支払手数料', 6000]]],
  [[['売上', 298000]], [['仕入', 186000], ['給料', 87000], ['支払家賃', 48000], ['消耗品費', 9500]]],
  [[['売上', 1120000], ['受取手数料', 25000]], [['仕入', 705000], ['給料', 198000], ['広告宣伝費', 34000], ['水道光熱費', 21000]]],
] as [[string, number][], [string, number][]][]) {
  const revTotal = revenues.reduce((s, r) => s + r[1], 0);
  const expTotal = expenses.reduce((s, e) => s + e[1], 0);
  const profit = revTotal - expTotal;
  const b = { parent: 'base2-year-end-misc', topic: '3-4', syllabus: '第三・4〜9 決算手続き・財務諸表', lessonId: 'L15', terms: ['損益振替', '損益'] };
  J(b, {
    section: 'q3', format: 'closing-journal', difficulty: 'advanced', needsCalc: true, calcType: '集計', calcComplexity: 3,
    prompt: `決算にあたり、次の収益・費用を損益勘定へ振り替える仕訳を示しなさい。収益：${revenues.map((r) => `${r[0]} ${yen(r[1])}`).join('、')}。費用：${expenses.map((e) => `${e[0]} ${yen(e[1])}`).join('、')}。`,
    journal: [...revenues.map((r) => D(r[0], r[1])), C('損益', revTotal), D('損益', expTotal), ...expenses.map((e) => C(e[0], e[1]))],
    explanation: profit >= 0
      ? '収益は借方に残高がある相手方から損益勘定の貸方へ、費用は損益勘定の借方から各費用の貸方へ振り替える。振替後の損益勘定の貸方残高が当期純利益になる。'
      : '収益は損益勘定の貸方へ、費用は損益勘定の借方へ振り替える。振替後の損益勘定の借方残高が当期純損失になる。',
    calcProcess: `収益合計 ${revenues.map((r) => r[1].toLocaleString()).join(' + ')} = ${revTotal.toLocaleString()}、費用合計 ${expenses.map((e) => e[1].toLocaleString()).join(' + ')} = ${expTotal.toLocaleString()}、差額 ${Math.abs(profit).toLocaleString()} が当期純${profit >= 0 ? '利益' : '損失'}`,
    hints: ['収益は損益の貸方へ振り替える', '費用は損益の借方へ振り替える', '損益勘定への振替額は各合計額になる'],
  });
}

// ---- H13 小口現金の前渡・増額・減額・精算 ----
for (const [amt, when] of [[30000, '月初'], [50000, '期首'], [20000, '週初']] as [number, string][]) {
  const b = { parent: 'base2-petty-advance', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['小口現金', 'インプレストシステム'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `${when}に、小口現金係へ定額資金前渡額 ${yen(amt)} を当座預金から前渡しした（定額資金前渡法）。前渡し時の仕訳を示しなさい。`, journal: [D('小口現金', amt), C('当座預金', amt)], explanation: '定額資金前渡法では、前渡し時に小口現金（資産）を計上する。実際に支払った時点ではなく報告時に費用を計上する。', hints: ['前渡し時は小口現金の増加', '出どころは当座預金', 'この時点では費用は計上しない'] });
}
for (const [amt] of [[10000], [15000], [20000]] as [number][]) {
  const b = { parent: 'base2-petty-advance', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['小口現金', 'インプレストシステム'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `小口現金の定額資金前渡額を増額するため、${yen(amt)} を当座預金から小口現金係へ追加で渡した。増額時の仕訳を示しなさい。`, journal: [D('小口現金', amt), C('当座預金', amt)], explanation: '前渡額の増額分だけ小口現金が増え、当座預金が減る。前渡し時と同じ処理である。', hints: ['増額分だけを仕訳する', '小口現金の借方', '出どころは当座預金'] });
}
for (const [amt] of [[10000], [8000]] as [number][]) {
  const b = { parent: 'base2-petty-advance', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['小口現金', 'インプレストシステム'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `小口現金の定額資金前渡額を減額するため、小口現金係から ${yen(amt)} の返還を受け、当座預金に預け入れた。減額時の仕訳を示しなさい。`, journal: [D('当座預金', amt), C('小口現金', amt)], explanation: '前渡額の減額分だけ小口現金が減り、当座預金が増える。増額時と逆の処理である。', hints: ['減額分だけを仕訳する', '小口現金の貸方', '返還金は当座預金に入る'] });
}
for (const [fund, expenses, stateRem] of [
  [30000, [['旅費交通費', 12500], ['消耗品費', 6800]], true],
  [50000, [['通信費', 8400], ['旅費交通費', 23600], ['雑費', 3900]], false],
  [20000, [['消耗品費', 5400], ['通信費', 2600]], true],
  [40000, [['旅費交通費', 18700], ['雑費', 4600]], false],
  [60000, [['消耗品費', 15200], ['通信費', 9800], ['旅費交通費', 21400]], true],
  [25000, [['雑費', 3100], ['消耗品費', 7900]], false],
  [45000, [['旅費交通費', 26800], ['通信費', 7200]], true],
  [35000, [['消耗品費', 11300], ['旅費交通費', 15900], ['通信費', 4300]], false],
] as [number, [string, number][], boolean][]) {
  const used = expenses.reduce((s, e) => s + e[1], 0);
  const rem = fund - used;
  const expText = expenses.map((e) => `${e[0]} ${yen(e[1])}`).join('、');
  const b = { parent: 'base2-petty-advance', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['小口現金', '精算'] };
  J(b, {
    difficulty: 'advanced', needsCalc: !stateRem, calcType: !stateRem ? '差額計算' : undefined, calcComplexity: !stateRem ? 2 : undefined,
    prompt: `期末に小口現金制度を精算することとし、小口現金係から使用明細（${expText}）と残額${stateRem ? ` ${yen(rem)} ` : ''}の返還を受けた。残額は当座預金に預け入れた。精算の仕訳を示しなさい（前渡額は ${yen(fund)}）。`,
    journal: [...expenses.map((e) => D(e[0], e[1])), D('当座預金', rem), C('小口現金', fund)],
    explanation: '期末精算では使用した費用を計上し、残額は当座預金に戻して小口現金勘定を精算する。補給（インプレストの維持）とは異なり、小口現金勘定自体が減る。',
    calcProcess: !stateRem ? `使用額 ${expenses.map((e) => e[1].toLocaleString()).join(' + ')} = ${used.toLocaleString()}、残額 ${fund.toLocaleString()} − ${used.toLocaleString()} = ${rem.toLocaleString()}` : undefined,
    hints: ['明細を費用科目ごとに分ける', '残額は当座預金に戻る', '貸方は前渡額の全額になる'],
  });
}

// ---- H14 預金口座間の振替・当座借越の解消 ----
for (const [amt, why] of [
  [80000, '決済資金を確保するため'], [150000, '支払いに備えて'], [240000, '給料の支払資金として'], [65000, '仕入代金の決済に備えて'],
] as [number, string][]) {
  const b = { parent: 'base2-deposit-transfer', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['当座預金', '普通預金'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `${why}、普通預金口座から当座預金口座へ ${yen(amt)} を振り替えた。仕訳を示しなさい。`, journal: [D('当座預金', amt), C('普通預金', amt)], explanation: '預金口座間の振替では、増える口座を借方、減る口座を貸方に記録する。資産の総額は変わらない。', hints: ['増える口座が借方', '減る口座が貸方', '現金は動いていない'] });
}
for (const [amt, why] of [
  [120000, '余剰資金を利息のつく口座へ移すため'], [90000, '資金を一元管理するため'], [300000, '当面の支払予定がなくなったため'], [175000, '決済口座の残高を調整するため'],
] as [number, string][]) {
  const b = { parent: 'base2-deposit-transfer', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['当座預金', '普通預金'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `${why}、当座預金口座から普通預金口座へ ${yen(amt)} を振り替えた。仕訳を示しなさい。`, journal: [D('普通預金', amt), C('当座預金', amt)], explanation: '預金口座間の振替では、増える口座を借方、減る口座を貸方に記録する。移動の向きを取り違えない。', hints: ['増える口座が借方', '減る口座が貸方', '現金は動いていない'] });
}
for (const [deposit, overdraft] of [
  [60000, 25000], [100000, 45000], [85000, 38000], [150000, 72000], [50000, 18000],
] as [number, number][]) {
  const excess = deposit - overdraft;
  const b = { parent: 'base2-deposit-transfer', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['当座預金', '当座借越', '二勘定制'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '差額計算', calcComplexity: 2,
    prompt: `当座借越の残高が ${yen(overdraft)} ある当座預金口座に、現金 ${yen(deposit)} を預け入れた。二勘定制による仕訳を示しなさい。`,
    journal: [D('当座借越', overdraft), D('当座預金', excess), C('現金', deposit)],
    explanation: '二勘定制では、預入金はまず当座借越の返済に充てられ、借越を上回る分が当座預金残高となる。',
    calcProcess: `当座預金となる額 ${deposit.toLocaleString()} − ${overdraft.toLocaleString()} = ${excess.toLocaleString()}`,
    hints: ['預入金はまず借越の返済に充てる', '残りが当座預金になる', '借越は借方で取り崩す'],
  });
}
for (const [amt, why] of [
  [70000, '売上代金の手元現金'], [110000, '回収した売掛金の現金分'], [45000, '手元に保管していた現金'],
] as [number, string][]) {
  const b = { parent: 'base2-deposit-transfer', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['普通預金', '現金'] };
  J(b, { difficulty: 'standard', needsCalc: false, prompt: `${why} ${yen(amt)} を普通預金口座に預け入れた。仕訳を示しなさい。`, journal: [D('普通預金', amt), C('現金', amt)], explanation: '現金を預金口座に預け入れると、普通預金が増えて現金が減る。資産の中での移動である。', hints: ['預け入れで預金が増える', '手元現金が減る', '収益の発生ではない'] });
}

export const GENERATED_3: Question[] = out;
