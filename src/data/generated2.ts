import type { AnswerField, JournalLine, Question } from '../types';

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
    id: `gen2-${b.parent}-${String(counter).padStart(4, '0')}`,
    version: '1.0', examYear: 2027, verified: true,
    source: '取引モデルから導出した派生問題（正答は同一モデルで再計算し自動検証）',
    updatedAt: '2026-11-04', parentId: b.parent,
  };
}
const out: Question[] = [];
const J = (b: Base, o: { section?: Question['section']; difficulty: Question['difficulty']; needsCalc: boolean; calcType?: string; calcComplexity?: 1 | 2 | 3; prompt: string; journal: JournalLine[]; explanation: string; calcProcess?: string; hints: string[] }) => {
  out.push(mkq(b, {
    section: o.section ?? 'q1', format: 'journal', topic: b.topic, syllabus: b.syllabus, difficulty: o.difficulty,
    needsCalc: o.needsCalc, calcType: o.calcType, calcComplexity: o.calcComplexity, prompt: o.prompt, journal: o.journal,
    explanation: o.explanation, calcProcess: o.calcProcess, hints: o.hints,
    accounts: [...new Set(o.journal.map((l) => l.account))], terms: b.terms, lessonId: b.lessonId,
  }));
};

// ---- G01 貸倒引当金の設定（実績法・差額補充法） ----
for (const [receivables, ratePct, existing] of [
  [3000000, 2, 40000], [5000000, 1, 0], [2400000, 3, 80000], [8000000, 2, 120000],
  [1500000, 2, 45000], [6200000, 1, 30000], [4000000, 3, 100000], [2800000, 2, 0],
  [9600000, 1, 76000], [3300000, 3, 99000], [5400000, 2, 130000], [2100000, 1, 25000],
] as [number, number, number][]) {
  const target = Math.round(receivables * ratePct / 100);
  const diff = target - existing;
  const b = { parent: 'base-bad-debt-allowance', topic: '2-5', syllabus: '第二・5 引当金', lessonId: 'L10', terms: ['貸倒引当金', '貸倒実績率', '差額補充法'] };
  if (diff > 0) {
    J(b, {
      difficulty: 'advanced', needsCalc: true, calcType: '貸倒引当金の計算', calcComplexity: 2,
      prompt: `決算にあたり、期末の売掛金残高 ${yen(receivables)} に対して貸倒実績率 ${ratePct}％で貸倒引当金を設定する。貸倒引当金の残高は ${yen(existing)} である。差額補充法による仕訳を示しなさい。`,
      journal: [D('貸倒引当金繰入', diff), C('貸倒引当金', diff)],
      explanation: '設定すべき引当金は期末債権残高×貸倒実績率。既存残高との差額だけを繰り入れる（差額補充法）。',
      calcProcess: `設定額 ${receivables.toLocaleString()} × ${ratePct}％ = ${target.toLocaleString()}、繰入額 ${target.toLocaleString()} − ${existing.toLocaleString()} = ${diff.toLocaleString()}`,
      hints: ['まず設定すべき金額を求める', '既にある残高を差し引く', '不足分の相手科目は貸倒引当金繰入'],
    });
  } else if (diff < 0) {
    J(b, {
      difficulty: 'advanced', needsCalc: true, calcType: '貸倒引当金の計算', calcComplexity: 2,
      prompt: `決算にあたり、期末の売掛金残高 ${yen(receivables)} に対して貸倒実績率 ${ratePct}％で貸倒引当金を設定する。貸倒引当金の残高は ${yen(existing)} である。差額補充法による仕訳を示しなさい。`,
      journal: [D('貸倒引当金', -diff), C('貸倒引当金繰入', -diff)],
      explanation: '設定すべき引当金が既存残高を下回る場合は、超過分を取り崩して貸倒引当金繰入と相殺する。',
      calcProcess: `設定額 ${receivables.toLocaleString()} × ${ratePct}％ = ${target.toLocaleString()}、戻入額 ${existing.toLocaleString()} − ${target.toLocaleString()} = ${(-diff).toLocaleString()}`,
      hints: ['まず設定すべき金額を求める', '既存残高の方が大きい場合は戻入れになる', '戻入れは貸倒引当金繰入の貸方で処理する'],
    });
  }
}

// ---- G02 消費税（税抜方式） ----
for (const [net, kind] of [
  [100000, 'purchase'], [250000, 'sale'], [80000, 'purchase'], [430000, 'sale'], [176000, 'purchase'], [520000, 'sale'],
  [64000, 'purchase'], [298000, 'sale'], [150000, 'purchase'], [365000, 'sale'], [92000, 'purchase'], [610000, 'sale'],
] as [number, string][]) {
  const tax = Math.round(net * 0.1);
  const gross = net + tax;
  const b = { parent: 'base-vat-exclusive', topic: '2-19', syllabus: '第二・19 税金', lessonId: 'L12', terms: ['税抜方式', '仮払消費税', '仮受消費税'] };
  if (kind === 'purchase') {
    J(b, {
      difficulty: 'standard', needsCalc: true, calcType: '消費税額の算定', calcComplexity: 1,
      prompt: `商品 ${yen(net)}（消費税抜き）を掛けで仕入れ、消費税 ${yen(tax)} とあわせて買掛金とした。税抜方式による仕訳を示しなさい。`,
      journal: [D('仕入', net), D('仮払消費税', tax), C('買掛金', gross)],
      explanation: '税抜方式では本体価格と消費税を分けて記録し、仕入に伴う消費税は仮払消費税（資産）とする。',
      calcProcess: `買掛金 = ${net.toLocaleString()} + ${tax.toLocaleString()} = ${gross.toLocaleString()}`,
      hints: ['本体と消費税を分けて考える', '支払う側の消費税は仮払消費税', '貸方は合計額になる'],
    });
  } else {
    J(b, {
      difficulty: 'standard', needsCalc: true, calcType: '消費税額の算定', calcComplexity: 1,
      prompt: `商品 ${yen(net)}（消費税抜き）を掛けで販売し、消費税 ${yen(tax)} とあわせて売掛金とした。税抜方式による仕訳を示しなさい。`,
      journal: [D('売掛金', gross), C('売上', net), C('仮受消費税', tax)],
      explanation: '税抜方式では売上は税抜きで計上し、預かった消費税は仮受消費税（負債）とする。',
      calcProcess: `売掛金 = ${net.toLocaleString()} + ${tax.toLocaleString()} = ${gross.toLocaleString()}`,
      hints: ['本体と消費税を分けて考える', '預かる側の消費税は仮受消費税', '借方は合計額になる'],
    });
  }
}
for (const [received, paid] of [
  [86000, 54000], [120000, 120000], [45000, 78000], [210000, 135000], [98000, 61000], [150000, 172000],
] as [number, number][]) {
  const diff = received - paid;
  const b = { parent: 'base-vat-settlement', topic: '2-19', syllabus: '第二・19 税金', lessonId: 'L12', terms: ['税抜方式', '未払消費税'] };
  if (diff > 0) {
    J(b, {
      difficulty: 'advanced', needsCalc: true, calcType: '消費税額の算定', calcComplexity: 2,
      prompt: `決算にあたり消費税の精算を行う。仮受消費税の残高は ${yen(received)}、仮払消費税の残高は ${yen(paid)} である。税抜方式による精算仕訳を示しなさい。`,
      journal: [D('仮受消費税', received), C('仮払消費税', paid), C('未払消費税', diff)],
      explanation: '仮受消費税から仮払消費税を差し引いた残額が納付すべき消費税で、未払消費税として計上する。',
      calcProcess: `${received.toLocaleString()} − ${paid.toLocaleString()} = ${diff.toLocaleString()}`,
      hints: ['仮受と仮払を相殺する', '差額の方向で納付か還付かが決まる', '納付分は未払消費税になる'],
    });
  } else if (diff < 0) {
    J(b, {
      difficulty: 'advanced', needsCalc: true, calcType: '消費税額の算定', calcComplexity: 2,
      prompt: `決算にあたり消費税の精算を行う。仮受消費税の残高は ${yen(received)}、仮払消費税の残高は ${yen(paid)} である。税抜方式による精算仕訳を示しなさい（還付請求分は未収入金とする）。`,
      journal: [D('仮受消費税', received), D('未収入金', -diff), C('仮払消費税', paid)],
      explanation: '仮払消費税が仮受消費税を上回る場合は差額が還付され、未収入金として計上する。',
      calcProcess: `${paid.toLocaleString()} − ${received.toLocaleString()} = ${(-diff).toLocaleString()}`,
      hints: ['仮受と仮払を相殺する', '差額の方向で納付か還付かが決まる', '還付分は未収入金になる'],
    });
  }
}

// ---- G03 しーくりくりしー ----
for (const [opening, closing] of [
  [180000, 220000], [350000, 290000], [120000, 120000], [480000, 510000], [260000, 175000], [540000, 460000],
  [95000, 130000], [720000, 685000], [310000, 398000], [205000, 240000],
] as [number, number][]) {
  const b = { parent: 'base-shikuri', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['しーくりくりしー', '繰越商品'] };
  out.push(mkq(b, {
    section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, difficulty: 'standard', needsCalc: false,
    prompt: `決算整理として商品の棚卸しを行う。期首商品棚卸高は ${yen(opening)}、期末商品棚卸高は ${yen(closing)} である。仕訳を示しなさい。`,
    journal: [D('仕入', opening), C('繰越商品', opening), D('繰越商品', closing), C('仕入', closing)],
    explanation: '期首在庫は仕入へ振り替え（しい）、期末在庫は繰越商品として資産に残す（くり）。2本の仕訳で売上原価の計算基礎を作る。',
    hints: ['期首分と期末分で2本の仕訳になる', '期首は仕入の借方・繰越商品の貸方', '期末はその逆になる'],
    accounts: ['仕入', '繰越商品'], terms: b.terms, lessonId: b.lessonId,
  }));
}

// ---- G04 貯蔵品棚卸 ----
for (const [bought, unused, item] of [
  [50000, 18000, '切手と収入印紙'], [82000, 26000, '事務用品'], [36000, 9000, '切手'], [64000, 21000, 'コピー用紙等の消耗品'],
  [45000, 15000, '収入印紙'], [98000, 34000, '事務用品'], [28000, 7000, '切手と収入印紙'], [73000, 19500, '消耗品'],
] as [number, number, string][]) {
  const b = { parent: 'base-supplies-inventory', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['貯蔵品', '棚卸し'] };
  out.push(mkq(b, {
    section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, difficulty: 'standard', needsCalc: false,
    prompt: `当期に購入し消耗品費で処理していた${item}について、決算時の未使用分が ${yen(unused)} ある（当期の購入総額は ${yen(bought)}）。決算整理仕訳を示しなさい。`,
    journal: [D('貯蔵品', unused), C('消耗品費', unused)],
    explanation: '未使用分は翌期に使う資産なので、消耗品費から貯蔵品へ振り替える。',
    hints: ['未使用分は費用ではなく資産になる', '振替先は貯蔵品', '金額は未使用分だけを使う'],
    accounts: ['貯蔵品', '消耗品費'], terms: b.terms, lessonId: b.lessonId,
  }));
}

// ---- G05 繰延べ・見越し（期間按分） ----
for (const [annual, monthsUsed, kind] of [
  [240000, 9, 'rent-prepaid'], [360000, 8, 'rent-prepaid'], [180000, 10, 'rent-accrued'], [300000, 7, 'interest-accrued'],
  [120000, 11, 'rent-received'], [480000, 6, 'rent-prepaid'], [600000, 9, 'interest-prepaid'], [150000, 8, 'rent-received'],
  [420000, 5, 'rent-accrued'], [200000, 10, 'interest-accrued'], [540000, 8, 'rent-prepaid'], [96000, 9, 'rent-received'],
] as [number, number, string][]) {
  const remaining = 12 - monthsUsed;
  const amount = Math.round(annual * remaining / 12);
  const b = { parent: 'base-accrual-deferral', topic: '3-3', syllabus: '第三・3 決算整理', lessonId: 'L14', terms: ['繰延べ', '見越し'] };
  const common = { needsCalc: true, calcType: '期間按分', calcComplexity: 2 as const, difficulty: 'advanced' as const };
  if (kind === 'rent-prepaid') {
    // 3月31日時点で未経過 remaining か月になるのは、支払日が「翌期の開始月」である場合。
    // 例: 未経過3か月 → 期間は7月〜翌6月 → 毎年7月1日に前払い。
    const endMonth = 3 + remaining;
    const startMonth = endMonth - 11 <= 0 ? endMonth - 11 + 12 : endMonth - 11;
    out.push(mkq(b, {
      section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, ...common,
      prompt: `家賃は毎年${startMonth}月1日に1年分 ${yen(annual)} を前払いし、支払家賃で処理している。決算日は3月31日である。決算整理仕訳を示しなさい。`,
      journal: [D('前払家賃', amount), C('支払家賃', amount)],
      explanation: '決算日時点で未経過の月数分は当期の費用ではないため、前払家賃（資産）へ振り替える。',
      calcProcess: `${annual.toLocaleString()} × ${remaining}/12 = ${amount.toLocaleString()}（未経過 ${remaining} か月分）`,
      hints: ['未経過の月数を数える', '按分は月数で行う', '翌期分は前払家賃になる'],
      accounts: ['前払家賃', '支払家賃'], terms: b.terms, lessonId: b.lessonId,
    }));
  } else if (kind === 'rent-accrued') {
    const used = Math.round(annual * monthsUsed / 12);
    out.push(mkq(b, {
      section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, ...common,
      prompt: `家賃（年額 ${yen(annual)}）は翌期の4月末に1年分を後払いする契約で、当期は ${monthsUsed} か月分が未払いである。決算整理仕訳を示しなさい。`,
      journal: [D('支払家賃', used), C('未払家賃', used)],
      explanation: '当期に属する未払いの費用は見越し計上し、支払家賃と未払家賃（負債）を記録する。',
      calcProcess: `${annual.toLocaleString()} × ${monthsUsed}/12 = ${used.toLocaleString()}`,
      hints: ['当期に属する月数を数える', '未払いは見越しで計上する', '相手科目は未払家賃'],
      accounts: ['支払家賃', '未払家賃'], terms: b.terms, lessonId: b.lessonId,
    }));
  } else if (kind === 'rent-received') {
    out.push(mkq(b, {
      section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, ...common,
      prompt: `貸店舗の家賃として当期に1年分 ${yen(annual)} を受け取り、受取家賃で処理した。決算日時点で ${remaining} か月分が翌期に属する。決算整理仕訳を示しなさい。`,
      journal: [D('受取家賃', amount), C('前受家賃', amount)],
      explanation: '翌期に属する収益は繰り延べ、前受家賃（負債）へ振り替える。',
      calcProcess: `${annual.toLocaleString()} × ${remaining}/12 = ${amount.toLocaleString()}`,
      hints: ['翌期に属する月数を数える', '収益の繰延べは前受家賃', '受取家賃を取り消す側を確認する'],
      accounts: ['受取家賃', '前受家賃'], terms: b.terms, lessonId: b.lessonId,
    }));
  } else if (kind === 'interest-accrued') {
    const used = Math.round(annual * monthsUsed / 12);
    out.push(mkq(b, {
      section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, ...common,
      prompt: `貸付金に対する利息（年額換算 ${yen(annual)}）のうち、当期の ${monthsUsed} か月分が未収である。決算整理仕訳を示しなさい。`,
      journal: [D('未収利息', used), C('受取利息', used)],
      explanation: '当期に属する未収の収益は見越し計上し、未収利息（資産）と受取利息を記録する。',
      calcProcess: `${annual.toLocaleString()} × ${monthsUsed}/12 = ${used.toLocaleString()}`,
      hints: ['当期に属する月数を数える', '未収は見越しで計上する', '相手科目は未収利息'],
      accounts: ['未収利息', '受取利息'], terms: b.terms, lessonId: b.lessonId,
    }));
  } else {
    out.push(mkq(b, {
      section: 'q3', format: 'closing-journal', topic: b.topic, syllabus: b.syllabus, ...common,
      prompt: `借入金の利息として1年分 ${yen(annual)} を前払いし支払利息で処理した。決算日時点で ${remaining} か月分が翌期に属する。決算整理仕訳を示しなさい。`,
      journal: [D('前払利息', amount), C('支払利息', amount)],
      explanation: '翌期に属する費用は繰り延べ、前払利息（資産）へ振り替える。',
      calcProcess: `${annual.toLocaleString()} × ${remaining}/12 = ${amount.toLocaleString()}`,
      hints: ['翌期に属する月数を数える', '費用の繰延べは前払利息', '支払利息を取り消す側を確認する'],
      accounts: ['前払利息', '支払利息'], terms: b.terms, lessonId: b.lessonId,
    }));
  }
}

// ---- G06 固定資産の売却（月割償却＋売却損益） ----
for (const [cost, life, holdYears, sellPrice, asset, cumAcct] of [
  [1000000, 5, 3, 250000, '備品', '備品減価償却累計額'], [2400000, 6, 4, 500000, '車両運搬具', '車両運搬具減価償却累計額'],
  [800000, 4, 2, 450000, '備品', '備品減価償却累計額'], [3600000, 8, 5, 900000, '車両運搬具', '車両運搬具減価償却累計額'],
  [1500000, 5, 4, 120000, '備品', '備品減価償却累計額'], [600000, 3, 2, 80000, '備品', '備品減価償却累計額'],
] as [number, number, number, number, string, string][]) {
  const annual = Math.round(cost / life);
  const cumBefore = annual * holdYears;
  const bookValue = cost - cumBefore;
  const gain = sellPrice - bookValue;
  const journal: JournalLine[] = gain >= 0
    ? [D('未収入金', sellPrice), D(cumAcct, cumBefore), C(asset, cost), C('固定資産売却益', gain)]
    : [D('未収入金', sellPrice), D(cumAcct, cumBefore), D('固定資産売却損', -gain), C(asset, cost)];
  const b = { parent: 'base-asset-sale', topic: '2-10', syllabus: '第二・10 有形固定資産', lessonId: 'L11', terms: ['減価償却', '帳簿価額'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '固定資産売却損益の計算', calcComplexity: 3,
    prompt: `${asset}（取得原価 ${yen(cost)}、耐用年数 ${life} 年、残存価額ゼロ、定額法）を ${holdYears} 年使用した後、期首に ${yen(sellPrice)} で売却し、代金は月末に受け取ることとした。売却の仕訳を示しなさい（減価償却累計額は売却時点まで計上済みとする）。`,
    journal,
    explanation: '売却時は減価償却累計額を取り崩し、帳簿価額と売却価額の差額を売却損益とする。代金未収は未収入金で処理する。',
    calcProcess: `年間償却額 ${cost.toLocaleString()} ÷ ${life} = ${annual.toLocaleString()}、累計額 ${annual.toLocaleString()} × ${holdYears} 年 = ${cumBefore.toLocaleString()}、帳簿価額 ${cost.toLocaleString()} − ${cumBefore.toLocaleString()} = ${bookValue.toLocaleString()}、売却${gain >= 0 ? '益' : '損'} ${Math.abs(gain).toLocaleString()}`,
    hints: ['まず帳簿価額を求める', '累計額は資産と相殺する', '売却価額との差が売却損益になる'],
  });
}

// ---- G07 電子記録債権・債務 ----
for (const [amt, kind] of [
  [450000, 'receivable-arise'], [780000, 'debt-arise'], [320000, 'receivable-settle'], [560000, 'debt-pay'],
  [890000, 'receivable-arise'], [210000, 'debt-arise'], [640000, 'receivable-settle'], [430000, 'debt-pay'],
  [275000, 'receivable-arise'], [915000, 'debt-pay'], [505000, 'receivable-settle'], [168000, 'debt-arise'],
] as [number, string][]) {
  const b = { parent: 'base-densai', topic: '2-3', syllabus: '第二・3 売掛金および買掛金ならびに電子記録債権等', lessonId: 'L08', terms: ['電子記録債権', '電子記録債務'] };
  const map: Record<string, { prompt: string; journal: JournalLine[]; exp: string }> = {
    'receivable-arise': { prompt: `得意先への掛け売上 ${yen(amt)} について、電子記録債権の発生記録がされた。仕訳を示しなさい（売掛金から振り替える）。`, journal: [D('電子記録債権', amt), C('売掛金', amt)], exp: '電子記録債権は売掛金が転化した債権として振り替える。' },
    'debt-arise': { prompt: `仕入先への買掛金 ${yen(amt)} について、電子記録債務の発生記録がされた。仕訳を示しなさい（買掛金から振り替える）。`, journal: [D('買掛金', amt), C('電子記録債務', amt)], exp: '電子記録債務は買掛金が転化した債務として振り替える。' },
    'receivable-settle': { prompt: `電子記録債権 ${yen(amt)} の決済日となり、普通預金口座に入金された。仕訳を示しなさい。`, journal: [D('普通預金', amt), C('電子記録債権', amt)], exp: '決済により電子記録債権が消滅し、預金が増える。' },
    'debt-pay': { prompt: `電子記録債務 ${yen(amt)} の決済日となり、当座預金口座から支払われた。仕訳を示しなさい。`, journal: [D('電子記録債務', amt), C('当座預金', amt)], exp: '決済により電子記録債務が消滅し、預金が減る。' },
  };
  const m = map[kind]!;
  J(b, { difficulty: 'standard', needsCalc: false, prompt: m.prompt, journal: m.journal, explanation: m.exp, hints: ['電子記録債権等は売掛金・買掛金の転化と考える', '発生時は振替、決済時は消滅', '入金・支払の口座を確認する'] });
}

// ---- G08 クレジット売掛金（手数料計算） ----
for (const [amt, feePct] of [
  [120000, 3], [250000, 2], [86000, 5], [340000, 3], [158000, 4], [420000, 2], [96000, 3], [275000, 5],
] as [number, number][]) {
  const fee = Math.round(amt * feePct / 100);
  const b = { parent: 'base-credit-sales', topic: '2-3', syllabus: '第二・3 売掛金および買掛金ならびに電子記録債権等', lessonId: 'L09', terms: ['クレジット売掛金', 'キャッシュレス決済'] };
  J(b, {
    difficulty: 'standard', needsCalc: true, calcType: '手数料計算', calcComplexity: 1,
    prompt: `商品 ${yen(amt)} をクレジットカード決済で販売した。信販会社への手数料は販売額の ${feePct}％で、売上時に費用処理する。仕訳を示しなさい。`,
    journal: [D('クレジット売掛金', amt - fee), D('支払手数料', fee), C('売上', amt)],
    explanation: 'クレジット販売では信販会社に対する債権（クレジット売掛金）は手数料を差し引いた金額で計上し、手数料は支払手数料とする。',
    calcProcess: `手数料 ${amt.toLocaleString()} × ${feePct}％ = ${fee.toLocaleString()}、クレジット売掛金 ${amt.toLocaleString()} − ${fee.toLocaleString()} = ${(amt - fee).toLocaleString()}`,
    hints: ['債権は手数料を引いた金額になる', '手数料は支払手数料（費用）', '貸方は販売額の全額が売上'],
  });
}

// ---- G09 小口現金の補給 ----
for (const [items, total] of [
  ['交通費 ￥12,000、消耗品費 ￥8,500、通信費 ￥4,300', 24800], ['旅費交通費 ￥23,000、雑費 ￥3,200、消耗品費 ￥6,800', 33000],
  ['通信費 ￥5,600、消耗品費 ￥11,400、旅費交通費 ￥9,000', 26000], ['雑費 ￥2,800、交通費 ￥7,500、消耗品費 ￥13,200', 23500],
  ['旅費交通費 ￥31,000、通信費 ￥6,100、雑費 ￥4,900', 42000], ['消耗品費 ￥9,700、通信費 ￥3,900、旅費交通費 ￥15,400', 29000],
] as [string, number][]) {
  const b = { parent: 'base-petty-cash', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L05', terms: ['小口現金', 'インプレストシステム'] };
  // 明細を分解して仕訳を作る
  const parts = items.split('、').map((s) => {
    const m = s.match(/(.+?) ￥([\d,]+)/)!;
    const name = m[1]! === '交通費' ? '旅費交通費' : m[1]!;
    return { name, amt: Number(m[2]!.replace(/,/g, '')) };
  });
  const journal: JournalLine[] = [...parts.map((p) => D(p.name, p.amt)), C('当座預金', total)];
  J(b, {
    difficulty: 'standard', needsCalc: true, calcType: '集計', calcComplexity: 1,
    prompt: `小口現金係から使用明細（${items}）の報告を受け、ただちに同額を当座預金から補給した（定額資金前渡法）。補給時の仕訳を示しなさい。`,
    journal,
    explanation: '定額資金前渡法では、補給時に使用した費用を借方に計上し、同額を当座預金から補給する（小口現金勘定の残高は常に一定額を保つため、補給時の仕訳に小口現金は現れない）。',
    calcProcess: `合計 ${parts.map((p) => p.amt.toLocaleString()).join(' + ')} = ${total.toLocaleString()}`,
    hints: ['使用明細を費用科目ごとに分ける', '合計額が補給額になる', '補給は当座預金から行う'],
  });
}

// ---- G10 株式の発行・配当 ----
for (const [shares, price] of [
  [1000, 500], [2000, 800], [500, 1200], [3000, 600], [1500, 1000], [800, 750],
] as [number, number][]) {
  const total = shares * price;
  const b = { parent: 'base-share-issue', topic: '4-1', syllabus: '第四・1 資本金', lessonId: 'L16', terms: ['資本金', '増資'] };
  J(b, {
    difficulty: 'basic', needsCalc: true, calcType: '発行総額の計算', calcComplexity: 1,
    prompt: `会社を設立し、株式 ${shares.toLocaleString()} 株を1株 ${yen(price)} で発行して、全額の払込みを受け普通預金に預け入れた。仕訳を示しなさい（3級では発行価額の全額を資本金とする）。`,
    journal: [D('普通預金', total), C('資本金', total)],
    explanation: '3級では株式の発行価額の全額を資本金に計上する。',
    calcProcess: `${shares.toLocaleString()} 株 × ${price.toLocaleString()} = ${total.toLocaleString()}`,
    hints: ['株数×1株の価額が発行総額', '3級では全額を資本金にする', '払込みは預金の増加'],
  });
}
for (const [dividend] of [
  [400000], [650000], [280000], [900000], [520000], [360000],
] as [number][]) {
  const reserve = Math.round(dividend / 10);
  const b = { parent: 'base-dividend', topic: '4-4', syllabus: '第四・4 剰余金の配当など', lessonId: 'L16', terms: ['剰余金の配当', '利益準備金'] };
  J(b, {
    difficulty: 'advanced', needsCalc: true, calcType: '利益準備金の計算', calcComplexity: 2,
    prompt: `株主総会で繰越利益剰余金 ${yen(dividend)} の配当が決議された。会社法により配当額の10分の1を利益準備金として積み立てる（準備金の合計額は資本金の4分の1に達していない）。配当の仕訳を示しなさい。`,
    journal: [D('繰越利益剰余金', dividend + reserve), C('利益準備金', reserve), C('未払配当金', dividend)],
    explanation: '配当時は繰越利益剰余金を取り崩し、配当額の1/10を利益準備金に、配当額を未払配当金に計上する。',
    calcProcess: `利益準備金 ${dividend.toLocaleString()} × 1/10 = ${reserve.toLocaleString()}、繰越利益剰余金の減少 ${dividend.toLocaleString()} + ${reserve.toLocaleString()} = ${(dividend + reserve).toLocaleString()}`,
    hints: ['繰越利益剰余金の減少は配当＋準備金', '準備金は配当額の10分の1', '配当の相手は未払配当金'],
  });
}

// ---- G11 販売のつど売上原価 ----
for (const [saleAmt, costRatePct] of [
  [200000, 60], [350000, 70], [180000, 65], [420000, 60], [260000, 75], [510000, 70], [145000, 60], [388000, 65],
] as [number, number][]) {
  const cost = Math.round(saleAmt * costRatePct / 100);
  const b = { parent: 'base-cost-at-sale', topic: '2-7', syllabus: '第二・7 商品の売買', lessonId: 'L07', terms: ['売上原価', '販売のつど売上原価'] };
  out.push(mkq(b, {
    section: 'q1', format: 'journal', topic: b.topic, syllabus: b.syllabus, difficulty: 'advanced',
    needsCalc: true, calcType: '売上原価の計算', calcComplexity: 2,
    prompt: `商品 ${yen(saleAmt)} を掛けで販売した。当社は販売のつど売上原価勘定に振り替える方法を採用しており、売上原価は売上の ${costRatePct}％である。販売時の仕訳をすべて示しなさい。`,
    journal: [D('売掛金', saleAmt), C('売上', saleAmt), D('売上原価', cost), C('商品', cost)],
    explanation: '販売のつど売上原価を計上する方法では、売上の仕訳に加えて原価を商品から売上原価へ振り替える。',
    calcProcess: `売上原価 ${saleAmt.toLocaleString()} × ${costRatePct}％ = ${cost.toLocaleString()}`,
    hints: ['仕訳は2本になる', '原価は売上に率をかけて求める', '原価の相手科目は商品'],
    accounts: ['売掛金', '売上', '売上原価', '商品'], terms: b.terms, lessonId: b.lessonId,
  }));
}

// ---- G12 現金過不足（差額計上） ----
for (const [book, actual] of [
  [86500, 84200], [123000, 124600], [54200, 51800], [210000, 213500], [98700, 95400], [176000, 172300],
  [67800, 69500], [145000, 141900],
] as [number, number][]) {
  const diff = actual - book;
  const b = { parent: 'base-cash-shortage', topic: '2-1', syllabus: '第二・1 現金預金', lessonId: 'L04', terms: ['現金過不足'] };
  if (diff < 0) {
    J(b, {
      difficulty: 'standard', needsCalc: true, calcType: '差額計算', calcComplexity: 1,
      prompt: `現金の帳簿残高は ${yen(book)} であったが、実際有高は ${yen(actual)} であった。不一致の原因は不明である。決算前の処理として不一致判明時の仕訳を示しなさい。`,
      journal: [D('現金過不足', -diff), C('現金', -diff)],
      explanation: '実際有高が帳簿より少ない場合、不足分を現金過不足勘定へ振り替えて現金残高を実際有高に合わせる。',
      calcProcess: `不足額 ${book.toLocaleString()} − ${actual.toLocaleString()} = ${(-diff).toLocaleString()}`,
      hints: ['まず差額を求める', '不足は現金過不足の借方', '現金は実際有高まで減らす'],
    });
  } else {
    J(b, {
      difficulty: 'standard', needsCalc: true, calcType: '差額計算', calcComplexity: 1,
      prompt: `現金の帳簿残高は ${yen(book)} であったが、実際有高は ${yen(actual)} であった。不一致の原因は不明である。不一致判明時の仕訳を示しなさい。`,
      journal: [D('現金', diff), C('現金過不足', diff)],
      explanation: '実際有高が帳簿より多い場合、超過分を現金過不足勘定へ振り替えて現金残高を実際有高に合わせる。',
      calcProcess: `超過額 ${actual.toLocaleString()} − ${book.toLocaleString()} = ${diff.toLocaleString()}`,
      hints: ['まず差額を求める', '超過は現金の借方・現金過不足の貸方', '現金は実際有高まで増やす'],
    });
  }
}

export const GENERATED_2: Question[] = out;
