import type { JournalLine, Question } from '../types';

// 派生問題ジェネレータ（指示書9章）:
// 取引モデル（パラメータ）から問題文と正答仕訳を同一の計算で導出する。
// 各インスタンスは一意のIDを持ち、parentId に基礎問題（ファミリー）IDを保持して独立問題と区別する。
// 全インスタンスは単体テストで「借方合計=貸方合計」「科目の実在」「金額の正値」を検証する。

type JL = JournalLine;
const D = (account: string, amount: number): JL => ({ side: 'debit', account, amount });
const C = (account: string, amount: number): JL => ({ side: 'credit', account, amount });
const yen = (n: number) => '￥' + n.toLocaleString('ja-JP');

interface MkOpts {
  parent: string;
  section?: Question['section'];
  format?: Question['format'];
  topic: string;
  syllabus: string;
  difficulty: Question['difficulty'];
  needsCalc: boolean;
  calcType?: string;
  calcComplexity?: 1 | 2 | 3;
  prompt: string;
  journal: JL[];
  explanation: string;
  calcProcess?: string;
  hints: string[];
  lessonId: string;
  terms: string[];
}

let counter = 0;
function mk(o: MkOpts): Question {
  counter++;
  const accounts = [...new Set(o.journal.map((l) => l.account))];
  return {
    id: `gen-${o.parent}-${String(counter).padStart(4, '0')}`,
    version: '1.0',
    examYear: 2027,
    section: o.section ?? 'q1',
    format: o.format ?? 'journal',
    topic: o.topic,
    syllabus: o.syllabus,
    difficulty: o.difficulty,
    needsCalc: o.needsCalc,
    calcType: o.calcType,
    calcComplexity: o.calcComplexity,
    prompt: o.prompt,
    journal: o.journal,
    explanation: o.explanation,
    calcProcess: o.calcProcess,
    hints: o.hints,
    accounts,
    terms: o.terms,
    lessonId: o.lessonId,
    parentId: o.parent,
    verified: true,
    source: '取引モデルから導出した派生問題（正答は同一モデルで再計算し自動検証）',
    updatedAt: '2026-11-04',
  };
}

const out: Question[] = [];
const push = (q: Question) => out.push(q);

// ---- F01 現金取引（計算不要） ----
for (const [amt, kind] of [
  [85000, '商品を現金で販売した'], [126000, '売掛金を現金で回収した'], [45000, '貸付金を現金で回収した'],
  [230000, '商品を現金で販売した'], [68000, '手数料を現金で受け取った'], [154000, '売掛金を現金で回収した'],
  [92000, '商品を現金で販売した'], [310000, '貸付金の元本を現金で回収した'],
] as [number, string][]) {
  const isLoan = kind.includes('貸付金');
  push(mk({
    parent: 'base-cash-receipt', topic: '2-1', syllabus: '第二・1 現金預金', difficulty: 'basic', needsCalc: false,
    prompt: `${kind}。金額は ${yen(amt)} である。仕訳を示しなさい。`,
    journal: isLoan ? [D('現金', amt), C('貸付金', amt)] : kind.includes('手数料') ? [D('現金', amt), C('受取手数料', amt)] : kind.includes('売掛金') ? [D('現金', amt), C('売掛金', amt)] : [D('現金', amt), C('売上', amt)],
    explanation: '現金が増えるので借方に現金、相手科目は取引の内容で判断する。',
    hints: ['何が増えたかを考える', '現金は資産で、増加は借方', '相手科目は代金の性質から選ぶ'],
    lessonId: 'L04', terms: ['仕訳', '現金'],
  }));
}
for (const [amt, item, acct] of [
  [32000, '消耗品を購入し現金で支払った', '消耗品費'], [58000, '旅費を現金で支払った', '旅費交通費'],
  [120000, '家賃を現金で支払った', '支払家賃'], [17500, '通信費を現金で支払った', '通信費'],
  [44000, '広告宣伝費を現金で支払った', '広告宣伝費'], [96000, '水道光熱費を現金で支払った', '水道光熱費'],
] as [number, string, string][]) {
  push(mk({
    parent: 'base-cash-payment', topic: '2-18', syllabus: '第二・18 収益と費用', difficulty: 'basic', needsCalc: false,
    prompt: `${item}。金額は ${yen(amt)} である。仕訳を示しなさい。`,
    journal: [D(acct, amt), C('現金', amt)],
    explanation: '費用が発生し、現金が減るので貸方に現金を記録する。',
    hints: ['何が減ったかを考える', '現金の減少は貸方', '支払いの内容が費用科目になる'],
    lessonId: 'L12', terms: ['仕訳', '費用'],
  }));
}

// ---- F02 掛売買・一部現金（計算不要） ----
for (const [total, cashPart, seller] of [
  [240000, 0, '青葉商店'], [380000, 100000, '港屋'], [520000, 200000, '白石商会'], [165000, 65000, '高森商店'],
  [730000, 300000, '緑屋'], [298000, 98000, '若葉商会'], [450000, 0, '港屋'], [610000, 110000, '青葉商店'],
] as [number, number, string][]) {
  const credit = total - cashPart;
  const journal = cashPart > 0
    ? [D('売掛金', credit), D('現金', cashPart), C('売上', total)]
    : [D('売掛金', total), C('売上', total)];
  push(mk({
    parent: 'base-credit-sale', topic: '2-7', syllabus: '第二・7 商品の売買', difficulty: cashPart > 0 ? 'standard' : 'basic',
    needsCalc: cashPart > 0, calcType: cashPart > 0 ? '差額計算' : undefined, calcComplexity: 1,
    prompt: cashPart > 0
      ? `${seller}へ商品 ${yen(total)} を販売し、代金のうち ${yen(cashPart)} は現金で受け取り、残額は掛けとした。仕訳を示しなさい。`
      : `${seller}へ商品 ${yen(total)} を掛けで販売した。仕訳を示しなさい。`,
    journal,
    explanation: cashPart > 0 ? `掛けとなる残額は ${yen(total)} − ${yen(cashPart)} = ${yen(credit)} で売掛金とする。` : '掛け販売では売掛金（資産）の増加を借方に記録する。',
    calcProcess: cashPart > 0 ? `${total.toLocaleString()} − ${cashPart.toLocaleString()} = ${credit.toLocaleString()}` : undefined,
    hints: ['代金の受け取り方を分けて考える', '掛け分は売掛金になる', '借方の合計は売上と一致する'],
    lessonId: 'L06', terms: ['売掛金', '三分法'],
  }));
}
for (const [total, cashPart, buyer] of [
  [330000, 0, '山川商店'], [275000, 75000, '浜田屋'], [890000, 390000, '森永商会'], [148000, 48000, '小島商店'],
  [560000, 160000, '浜田屋'], [412000, 0, '山川商店'], [205000, 55000, '森永商会'], [678000, 278000, '小島商店'],
] as [number, number, string][]) {
  const credit = total - cashPart;
  const journal = cashPart > 0
    ? [D('仕入', total), C('買掛金', credit), C('普通預金', cashPart)]
    : [D('仕入', total), C('買掛金', total)];
  push(mk({
    parent: 'base-credit-purchase', topic: '2-7', syllabus: '第二・7 商品の売買', difficulty: cashPart > 0 ? 'standard' : 'basic',
    needsCalc: cashPart > 0, calcType: cashPart > 0 ? '差額計算' : undefined, calcComplexity: 1,
    prompt: cashPart > 0
      ? `${buyer}から商品 ${yen(total)} を仕入れ、代金のうち ${yen(cashPart)} は普通預金から支払い、残額は掛けとした。仕訳を示しなさい。`
      : `${buyer}から商品 ${yen(total)} を掛けで仕入れた。仕訳を示しなさい。`,
    journal,
    explanation: cashPart > 0 ? `掛けとなる残額は ${yen(total)} − ${yen(cashPart)} = ${yen(credit)} で買掛金とする。三分法では商品の増加を仕入で処理する。` : '三分法では仕入勘定を用い、掛けは買掛金とする。',
    calcProcess: cashPart > 0 ? `${total.toLocaleString()} − ${cashPart.toLocaleString()} = ${credit.toLocaleString()}` : undefined,
    hints: ['三分法では商品ではなく仕入を使う', '支払った分と掛け分を分ける', '貸方の合計は仕入金額と一致する'],
    lessonId: 'L06', terms: ['買掛金', '三分法'],
  }));
}

// ---- F03 返品・値引（差額計算） ----
for (const [total, ret, kind] of [
  [200000, 30000, 'sale'], [450000, 50000, 'purchase'], [180000, 25000, 'sale'], [620000, 80000, 'purchase'],
  [350000, 45000, 'sale'], [270000, 20000, 'purchase'], [510000, 60000, 'sale'], [390000, 35000, 'purchase'],
] as [number, number, string][]) {
  if (kind === 'sale') {
    push(mk({
      parent: 'base-sales-return', topic: '2-7', syllabus: '第二・7 商品の売買', difficulty: 'standard', needsCalc: false,
      prompt: `掛けで販売した商品 ${yen(total)} のうち、品違いのため ${yen(ret)} 分が返品された。返品分の仕訳を示しなさい。`,
      journal: [D('売上', ret), C('売掛金', ret)],
      explanation: '売上返品は売上の取消しとして、借方に売上・貸方に売掛金を記録する（三分法）。',
      hints: ['返品は元の販売の逆仕訳と考える', '売上を取り消す側を確認する', '金額は返品分だけを使う'],
      lessonId: 'L06', terms: ['返品', '三分法'],
    }));
  } else {
    push(mk({
      parent: 'base-purchase-return', topic: '2-7', syllabus: '第二・7 商品の売買', difficulty: 'standard', needsCalc: false,
      prompt: `掛けで仕入れた商品 ${yen(total)} のうち、品違いのため ${yen(ret)} 分を返品した。返品分の仕訳を示しなさい。`,
      journal: [D('買掛金', ret), C('仕入', ret)],
      explanation: '仕入返品は仕入の取消しとして、借方に買掛金・貸方に仕入を記録する。',
      hints: ['返品は元の仕入の逆仕訳と考える', '買掛金が減る側を確認する', '金額は返品分だけを使う'],
      lessonId: 'L06', terms: ['返品', '三分法'],
    }));
  }
}

// ---- F04 貸付金・借入金の利息（利息計算） ----
for (const [principal, ratePct, months, kind] of [
  [1200000, 2, 6, 'lend'], [2000000, 3, 4, 'borrow'], [800000, 1.5, 8, 'lend'], [3000000, 2.5, 6, 'borrow'],
  [1500000, 4, 3, 'lend'], [600000, 2, 9, 'borrow'], [2400000, 1.8, 10, 'lend'], [1000000, 3.6, 5, 'borrow'],
  [1800000, 2.4, 5, 'lend'], [4500000, 2, 8, 'borrow'], [900000, 5, 4, 'lend'], [2600000, 1.5, 6, 'borrow'],
] as [number, number, number, string][]) {
  const interest = Math.round(principal * (ratePct / 100) * (months / 12));
  if (kind === 'lend') {
    push(mk({
      parent: 'base-loan-interest', topic: '2-4', syllabus: '第二・4 その他の債権と債務等', difficulty: 'standard',
      needsCalc: true, calcType: '利息計算', calcComplexity: 2,
      prompt: `貸付金 ${yen(principal)}（年利率 ${ratePct}％）について、${months}か月分の利息を現金で受け取った。利息受取の仕訳を示しなさい。`,
      journal: [D('現金', interest), C('受取利息', interest)],
      explanation: `利息 = 元本 × 年利率 × 期間（月数/12）で計算する。`,
      calcProcess: `${principal.toLocaleString()} × ${ratePct}％ × ${months}/12 = ${interest.toLocaleString()}`,
      hints: ['利息は元本・利率・期間から計算する', '期間は年単位に直す', '受け取った利息は収益である'],
      lessonId: 'L09', terms: ['貸付金', '受取利息'],
    }));
  } else {
    push(mk({
      parent: 'base-loan-interest', topic: '2-4', syllabus: '第二・4 その他の債権と債務等', difficulty: 'standard',
      needsCalc: true, calcType: '利息計算', calcComplexity: 2,
      prompt: `借入金 ${yen(principal)}（年利率 ${ratePct}％）について、${months}か月分の利息を普通預金から支払った。利息支払の仕訳を示しなさい。`,
      journal: [D('支払利息', interest), C('普通預金', interest)],
      explanation: `利息 = 元本 × 年利率 × 期間（月数/12）で計算する。`,
      calcProcess: `${principal.toLocaleString()} × ${ratePct}％ × ${months}/12 = ${interest.toLocaleString()}`,
      hints: ['利息は元本・利率・期間から計算する', '期間は年単位に直す', '支払った利息は費用である'],
      lessonId: 'L09', terms: ['借入金', '支払利息'],
    }));
  }
}

// ---- F05 減価償却（定額法） ----
for (const [cost, residualRate, life, usedMonths, asset, cumAcct] of [
  [600000, 0, 5, 12, '備品', '備品減価償却累計額'], [1200000, 10, 6, 12, '備品', '備品減価償却累計額'],
  [2400000, 0, 8, 6, '車両運搬具', '車両運搬具減価償却累計額'], [5000000, 10, 10, 12, '建物', '建物減価償却累計額'],
  [840000, 0, 7, 9, '備品', '備品減価償却累計額'], [3600000, 0, 6, 3, '車両運搬具', '車両運搬具減価償却累計額'],
  [1500000, 10, 5, 12, '備品', '備品減価償却累計額'], [9000000, 0, 15, 12, '建物', '建物減価償却累計額'],
  [720000, 10, 4, 6, '備品', '備品減価償却累計額'], [4800000, 0, 12, 9, '車両運搬具', '車両運搬具減価償却累計額'],
  [2000000, 0, 4, 12, '備品', '備品減価償却累計額'], [6600000, 10, 11, 12, '建物', '建物減価償却累計額'],
] as [number, number, number, number, string, string][]) {
  const residual = Math.round(cost * residualRate / 100);
  const annual = Math.round((cost - residual) / life);
  const amount = Math.round(annual * usedMonths / 12);
  push(mk({
    parent: 'base-dep-straight', topic: '2-10', syllabus: '第二・10 有形固定資産', difficulty: usedMonths === 12 ? 'standard' : 'advanced',
    needsCalc: true, calcType: '減価償却（定額法）', calcComplexity: usedMonths === 12 ? 2 : 3,
    prompt: `決算にあたり、${asset}（取得原価 ${yen(cost)}、残存価額は取得原価の${residualRate}％、耐用年数 ${life} 年）について定額法で減価償却を行う。当期の使用期間は ${usedMonths} か月である。仕訳を示しなさい（記帳方法は間接法）。`,
    journal: [D('減価償却費', amount), C(cumAcct, amount)],
    explanation: '定額法の1年分の償却額は（取得原価−残存価額）÷耐用年数。期中取得は月割計算する。間接法では貸方に減価償却累計額を用いる。',
    calcProcess: `(${cost.toLocaleString()} − ${residual.toLocaleString()}) ÷ ${life} 年 = ${annual.toLocaleString()}／年、${annual.toLocaleString()} × ${usedMonths}/12 = ${amount.toLocaleString()}`,
    hints: ['まず1年分の償却額を求める', '残存価額を差し引くのを忘れない', '期中取得は月割りにする'],
    lessonId: 'L11', terms: ['定額法', '減価償却', '耐用年数', '残存価額'],
  }));
}

// ---- F06 減価償却（定率法・基本） ----
for (const [cost, cum, ratePct, asset, cumAcct] of [
  [700000, 448000, 40, '備品', '備品減価償却累計額'], [400000, 0, 20, '備品', '備品減価償却累計額'],
  [1000000, 360000, 25, '車両運搬具', '車両運搬具減価償却累計額'], [800000, 512000, 40, '備品', '備品減価償却累計額'],
  [2000000, 800000, 20, '車両運搬具', '車両運搬具減価償却累計額'], [500000, 100000, 25, '備品', '備品減価償却累計額'],
  [1500000, 750000, 50, '備品', '備品減価償却累計額'], [3000000, 1080000, 20, '車両運搬具', '車両運搬具減価償却累計額'],
  [1200000, 240000, 25, '備品', '備品減価償却累計額'], [900000, 540000, 25, '備品', '備品減価償却累計額'],
] as [number, number, number, string, string][]) {
  const bookValue = cost - cum;
  const amount = Math.round(bookValue * ratePct / 100);
  push(mk({
    parent: 'base-dep-declining', topic: '2-10', syllabus: '第二・10 有形固定資産', difficulty: 'advanced',
    needsCalc: true, calcType: '減価償却（定率法）', calcComplexity: 2,
    prompt: `決算にあたり、${asset}（取得原価 ${yen(cost)}、減価償却累計額 ${yen(cum)}）について、償却率 ${ratePct}％の定率法で減価償却を行う。仕訳を示しなさい（記帳方法は間接法）。3級では償却率が示される基本的な計算のみが対象で、保証率・改定償却率は用いない。`,
    journal: [D('減価償却費', amount), C(cumAcct, amount)],
    explanation: '定率法の償却額は期首帳簿価額（取得原価−減価償却累計額）×償却率で計算する。',
    calcProcess: `期首帳簿価額 ${cost.toLocaleString()} − ${cum.toLocaleString()} = ${bookValue.toLocaleString()}、${bookValue.toLocaleString()} × ${ratePct}％ = ${amount.toLocaleString()}`,
    hints: ['定率法は取得原価ではなく期首の帳簿価額にかける', '先に帳簿価額を求める', '貸方は減価償却累計額（間接法）'],
    lessonId: 'L11', terms: ['定率法', '減価償却', '帳簿価額'],
  }));
}

export const GENERATED_1: Question[] = out;
