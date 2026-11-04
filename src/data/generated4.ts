import type { AnswerField, Format, JournalLine, Question, Section } from '../types';

// generated4: 帳簿・試算表・精算表（fields形式）と複合仕訳の派生問題。
// 正答はすべて生成コード内の取引モデル／帳簿シミュレーションから導出し、
// 貸借一致・純利益のPL/BS一致・貸借対照表の一致を assert で検証した組合せだけを出題する。
// 2027年度対応: 紙媒体の手形・小切手は出題しない。科目は accounts.ts マスタ内のみ。

const D = (account: string, amount: number): JournalLine => ({ side: 'debit', account, amount });
const C = (account: string, amount: number): JournalLine => ({ side: 'credit', account, amount });
const yen = (n: number) => '￥' + n.toLocaleString('ja-JP');
const num = (n: number) => n.toLocaleString('ja-JP');

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`generated4 assert failed: ${msg}`);
}

interface Base {
  parent: string; topic: string; syllabus: string; lessonId: string; terms: string[];
}
let counter = 0;
function mkq(b: Base, rest: Omit<Question, 'id' | 'version' | 'examYear' | 'verified' | 'source' | 'updatedAt' | 'parentId'>): Question {
  counter++;
  return {
    ...rest,
    id: `gen4-${b.parent}-${String(counter).padStart(4, '0')}`,
    version: '1.0', examYear: 2027, verified: true,
    source: '取引モデルから導出した派生問題（正答は同一モデルで再計算し自動検証）',
    updatedAt: '2026-11-04', parentId: b.parent,
  };
}
const out: Question[] = [];

const F = (b: Base, o: {
  section: Section; format: Format; difficulty: Question['difficulty'];
  calcType: string; calcComplexity: 1 | 2 | 3; prompt: string; fields: AnswerField[];
  explanation: string; calcProcess: string; hints: string[]; accounts: string[];
}) => {
  for (const f of o.fields) {
    assert(typeof f.answer !== 'number' || f.answer > 0, `fields amount must be positive: ${f.key}`);
    if (f.options) assert(f.options.includes(String(f.answer)), `select answer must be in options: ${f.key}`);
  }
  out.push(mkq(b, {
    section: o.section, format: o.format, topic: b.topic, syllabus: b.syllabus, difficulty: o.difficulty,
    needsCalc: true, calcType: o.calcType, calcComplexity: o.calcComplexity, prompt: o.prompt, fields: o.fields,
    explanation: o.explanation, calcProcess: o.calcProcess, hints: o.hints,
    accounts: o.accounts, terms: b.terms, lessonId: b.lessonId,
  }));
};

const J = (b: Base, o: {
  difficulty: Question['difficulty']; needsCalc: boolean; calcType?: string; calcComplexity?: 1 | 2 | 3;
  prompt: string; journal: JournalLine[]; explanation: string; calcProcess?: string; hints: string[];
}) => {
  const dr = o.journal.filter((l) => l.side === 'debit').reduce((s, l) => s + l.amount, 0);
  const cr = o.journal.filter((l) => l.side === 'credit').reduce((s, l) => s + l.amount, 0);
  assert(dr === cr && dr > 0, `journal must balance: ${b.parent}`);
  out.push(mkq(b, {
    section: 'q1', format: 'journal', topic: b.topic, syllabus: b.syllabus, difficulty: o.difficulty,
    needsCalc: o.needsCalc, calcType: o.calcType, calcComplexity: o.calcComplexity, prompt: o.prompt, journal: o.journal,
    explanation: o.explanation, calcProcess: o.calcProcess, hints: o.hints,
    accounts: [...new Set(o.journal.map((l) => l.account))], terms: b.terms, lessonId: b.lessonId,
  }));
};

// ================= G4-1 商品有高帳（先入先出法・移動平均法） 48問 =================
type InvEvent = { type: 'in'; qty: number; unit: number } | { type: 'out'; qty: number };
function simFIFO(openQty: number, openUnit: number, events: InvEvent[]) {
  const layers = [{ qty: openQty, unit: openUnit }];
  let totalInAmt = openQty * openUnit;
  const payouts: number[] = [];
  for (const ev of events) {
    if (ev.type === 'in') { layers.push({ qty: ev.qty, unit: ev.unit }); totalInAmt += ev.qty * ev.unit; }
    else {
      let rest = ev.qty; let cogs = 0;
      while (rest > 0) {
        const head = layers[0]!;
        const take = Math.min(head.qty, rest);
        cogs += take * head.unit; head.qty -= take; rest -= take;
        if (head.qty === 0) layers.shift();
      }
      payouts.push(cogs);
    }
  }
  const endQty = layers.reduce((s, l) => s + l.qty, 0);
  const endAmt = layers.reduce((s, l) => s + l.qty * l.unit, 0);
  const cogsTotal = payouts.reduce((s, x) => s + x, 0);
  assert(endAmt + cogsTotal === totalInAmt, 'FIFO conservation');
  return { payouts, cogsTotal, endQty, endAmt };
}
function simMA(openQty: number, openUnit: number, events: InvEvent[]) {
  let qty = openQty; let amt = openQty * openUnit;
  const totalInAmt = amt + events.filter((e) => e.type === 'in').reduce((s, e) => s + (e as { qty: number; unit: number }).qty * (e as { qty: number; unit: number }).unit, 0);
  const payouts: { unit: number; cogs: number }[] = [];
  for (const ev of events) {
    if (ev.type === 'in') { qty += ev.qty; amt += ev.qty * ev.unit; }
    else {
      assert(qty > 0 && amt % qty === 0, 'MA unit must be integer at payout');
      const unit = amt / qty;
      const cogs = unit * ev.qty;
      payouts.push({ unit, cogs });
      qty -= ev.qty; amt -= cogs;
    }
  }
  const cogsTotal = payouts.reduce((s, p) => s + p.cogs, 0);
  assert(amt + cogsTotal === totalInAmt, 'MA conservation');
  return { payouts, cogsTotal, endQty: qty, endAmt: amt };
}
{
  const b: Base = { parent: 'base3-inventory-ledger', topic: '2-7', syllabus: '第二・7 イ,キ 売上原価の都度振替・商品有高帳', lessonId: 'L07', terms: ['商品有高帳', '先入先出法', '移動平均法', '払出単価', '売上原価'] };
  // --- FIFO A: 受入1回・払出1回（standard）12問 ---
  const oqA = [80, 100, 60, 120, 90, 50, 110, 70, 130, 85, 95, 75];
  const ouA = [200, 250, 180, 300, 220, 160, 280, 240, 320, 210, 260, 190];
  const rqA = [50, 40, 70, 60, 45, 80, 55, 65, 40, 75, 35, 90];
  const rdA = [-20, 20, 0, 30, -30, 20, 10, -10, 20, -20, 30, 0];
  for (let k = 0; k < 12; k++) {
    const oq = oqA[k]!, ou = ouA[k]!, rq = rqA[k]!, ru = ou + rdA[k]!;
    const pq = oq + Math.floor(rq / 2);
    const r = simFIFO(oq, ou, [{ type: 'in', qty: rq, unit: ru }, { type: 'out', qty: pq }]);
    const month = 4 + (k % 3);
    F(b, {
      section: 'q2', format: 'ledger', difficulty: 'standard', calcType: '先入先出法による売上原価の算定', calcComplexity: 2,
      prompt: `商品有高帳（先入先出法）について答えなさい。期首繰越は ${oq} 個（単価 ${yen(ou)}）、当月の受入は ${month} 月 ${3 + k} 日の仕入 ${rq} 個（単価 ${yen(ru)}）のみであり、当月の払出は ${month} 月 ${12 + k} 日の売上 ${pq} 個のみであった。売上原価、期末在庫数量および期末在庫金額を求めなさい。`,
      fields: [
        { key: 'cogs', label: '売上原価', kind: 'amount', answer: r.cogsTotal, points: 2 },
        { key: 'qty', label: '期末在庫数量（個）', kind: 'amount', answer: r.endQty, points: 2 },
        { key: 'endamt', label: '期末在庫金額', kind: 'amount', answer: r.endAmt, points: 2 },
      ],
      explanation: `先入先出法では古い在庫から払い出します。払出 ${pq} 個は期首分 ${oq} 個（単価 ${yen(ou)}）と仕入分 ${pq - oq} 個（単価 ${yen(ru)}）で構成されます。`,
      calcProcess: `売上原価 = ${oq} × ${num(ou)} ＋ ${pq - oq} × ${num(ru)} = ${num(r.cogsTotal)}／期末在庫 = ${r.endQty} 個 × ${num(ru)} = ${num(r.endAmt)}`,
      hints: ['古い単価の在庫から順に払い出す', '払出数量が期首数量を超える分は仕入単価を使う', '期末在庫は最後に残った層の単価で評価する'],
      accounts: ['商品', '売上原価'],
    });
  }
  // --- FIFO B: 受入2回・払出2回（advanced）12問 ---
  const oqB = [90, 70, 110, 60, 100, 80, 120, 65, 95, 75, 105, 85];
  const ouB = [220, 190, 260, 210, 300, 240, 180, 270, 230, 200, 290, 250];
  const r1qB = [60, 50, 45, 70, 55, 65, 40, 80, 50, 60, 45, 70];
  const r1dB = [20, -10, 30, 0, -20, 10, 20, -30, 0, 30, -10, 20];
  const r2qB = [45, 65, 55, 40, 70, 50, 60, 45, 75, 55, 65, 40];
  const r2dB = [40, 20, -20, 30, 10, -10, 40, 0, 20, -20, 30, 10];
  for (let k = 0; k < 12; k++) {
    const oq = oqB[k]!, ou = ouB[k]!;
    const r1q = r1qB[k]!, r1u = ou + r1dB[k]!;
    const r2q = r2qB[k]!, r2u = ou + r2dB[k]!;
    const p1 = Math.floor(oq * 0.6);
    const availAfterP1 = oq + r1q - p1;
    const p2 = availAfterP1 + Math.floor(r2q / 2);
    const r = simFIFO(oq, ou, [
      { type: 'in', qty: r1q, unit: r1u }, { type: 'out', qty: p1 },
      { type: 'in', qty: r2q, unit: r2u }, { type: 'out', qty: p2 },
    ]);
    const month = 5 + (k % 3);
    F(b, {
      section: 'q2', format: 'ledger', difficulty: 'advanced', calcType: '先入先出法による売上原価の算定', calcComplexity: 3,
      prompt: `商品有高帳（先入先出法）について答えなさい。期首繰越は ${oq} 個（単価 ${yen(ou)}）である。当月の受入・払出は、${month} 月 ${2 + k} 日に仕入 ${r1q} 個（単価 ${yen(r1u)}）、${month} 月 ${9 + k} 日に売上 ${p1} 個、${month} 月 ${16 + k} 日に仕入 ${r2q} 個（単価 ${yen(r2u)}）、${month} 月 ${23 + k} 日に売上 ${p2} 個であった。第1回払出の売上原価、売上原価の合計、期末在庫数量および期末在庫金額を求めなさい。`,
      fields: [
        { key: 'cogs1', label: '第1回払出の売上原価', kind: 'amount', answer: r.payouts[0]!, points: 2 },
        { key: 'cogs', label: '売上原価の合計', kind: 'amount', answer: r.cogsTotal, points: 2 },
        { key: 'qty', label: '期末在庫数量（個）', kind: 'amount', answer: r.endQty, points: 2 },
        { key: 'endamt', label: '期末在庫金額', kind: 'amount', answer: r.endAmt, points: 2 },
      ],
      explanation: '先入先出法では各払出の時点で最も古い層から順に払い出します。第1回払出は期首層から、第2回払出は残った古い層から順に充てます。',
      calcProcess: `第1回払出 ${p1} 個は期首分のみ（単価 ${num(ou)}）で ${num(r.payouts[0]!)}。売上原価合計 = ${num(r.cogsTotal)}、期末在庫 = ${r.endQty} 個で ${num(r.endAmt)}`,
      hints: ['払出ごとに古い層から順に数量を充てる', '第1回払出は期首在庫の範囲内か確認する', '期末在庫は最も新しい層が残る'],
      accounts: ['商品', '売上原価'],
    });
  }
  // --- MA A: 受入1回・払出1回（standard）12問。期首数量=受入数量とし単価を平均の上下対称に置くことで平均単価が割り切れる ---
  const avgA = [250, 300, 200, 350, 280, 220, 320, 260, 240, 330, 290, 210];
  const qA = [40, 50, 60, 45, 55, 35, 65, 70, 48, 52, 58, 42];
  for (let k = 0; k < 12; k++) {
    const A = avgA[k]!, q = qA[k]!;
    const ou = A - 30, ru = A + 30;
    const pq = q + Math.floor(q / 2);
    const r = simMA(q, ou, [{ type: 'in', qty: q, unit: ru }, { type: 'out', qty: pq }]);
    assert(r.payouts[0]!.unit === A, 'MA A average');
    const month = 4 + (k % 4);
    F(b, {
      section: 'q2', format: 'ledger', difficulty: 'standard', calcType: '移動平均法による売上原価の算定', calcComplexity: 2,
      prompt: `商品有高帳（移動平均法）について答えなさい。期首繰越は ${q} 個（単価 ${yen(ou)}）、当月の受入は ${month} 月 ${4 + k} 日の仕入 ${q} 個（単価 ${yen(ru)}）のみであり、当月の払出は ${month} 月 ${15 + k} 日の売上 ${pq} 個のみであった。払出単価、売上原価、期末在庫数量および期末在庫金額を求めなさい。`,
      fields: [
        { key: 'unit', label: '払出単価', kind: 'amount', answer: r.payouts[0]!.unit, points: 2 },
        { key: 'cogs', label: '売上原価', kind: 'amount', answer: r.cogsTotal, points: 2 },
        { key: 'qty', label: '期末在庫数量（個）', kind: 'amount', answer: r.endQty, points: 2 },
        { key: 'endamt', label: '期末在庫金額', kind: 'amount', answer: r.endAmt, points: 2 },
      ],
      explanation: `移動平均法では受入のつど平均単価を計算します。受入後の平均単価は（${q} × ${num(ou)} ＋ ${q} × ${num(ru)}）÷ ${2 * q} = ${num(A)} 円です。`,
      calcProcess: `払出単価 = ${num(A)}／売上原価 = ${pq} × ${num(A)} = ${num(r.cogsTotal)}／期末在庫 = ${r.endQty} 個 × ${num(A)} = ${num(r.endAmt)}`,
      hints: ['受入後の総金額を総数量で割って平均単価を求める', '払出はすべて同じ平均単価で評価する', '期末在庫も平均単価で評価する'],
      accounts: ['商品', '売上原価'],
    });
  }
  // --- MA B: 受入2回・払出2回（advanced）12問。第1段階はMA Aと同じ対称設計、第2受入は残数量と同数・単価+40で平均が+20になる ---
  const avgB = [260, 310, 230, 340, 270, 210, 300, 250, 290, 320, 240, 280];
  const qB = [40, 50, 60, 44, 56, 36, 64, 70, 48, 52, 58, 42];
  for (let k = 0; k < 12; k++) {
    const A1 = avgB[k]!, q = qB[k]!;
    const ou = A1 - 30, r1u = A1 + 30;
    const p1 = q; // 受入後の半数を払出 → 残数量 q
    const r2u = A1 + 40; // 残数量と同数の受入 → 平均は A1+20
    const p2 = q + Math.floor(q / 2);
    const r = simMA(q, ou, [
      { type: 'in', qty: q, unit: r1u }, { type: 'out', qty: p1 },
      { type: 'in', qty: q, unit: r2u }, { type: 'out', qty: p2 },
    ]);
    assert(r.payouts[0]!.unit === A1 && r.payouts[1]!.unit === A1 + 20, 'MA B averages');
    const month = 6 + (k % 3);
    F(b, {
      section: 'q2', format: 'ledger', difficulty: 'advanced', calcType: '移動平均法による売上原価の算定', calcComplexity: 3,
      prompt: `商品有高帳（移動平均法）について答えなさい。期首繰越は ${q} 個（単価 ${yen(ou)}）である。当月の受入・払出は、${month} 月 ${3 + k} 日に仕入 ${q} 個（単価 ${yen(r1u)}）、${month} 月 ${10 + k} 日に売上 ${p1} 個、${month} 月 ${17 + k} 日に仕入 ${q} 個（単価 ${yen(r2u)}）、${month} 月 ${24 + k} 日に売上 ${p2} 個であった。第2回払出の払出単価、売上原価の合計、期末在庫数量および期末在庫金額を求めなさい。`,
      fields: [
        { key: 'unit2', label: '第2回払出の払出単価', kind: 'amount', answer: r.payouts[1]!.unit, points: 2 },
        { key: 'cogs', label: '売上原価の合計', kind: 'amount', answer: r.cogsTotal, points: 2 },
        { key: 'qty', label: '期末在庫数量（個）', kind: 'amount', answer: r.endQty, points: 2 },
        { key: 'endamt', label: '期末在庫金額', kind: 'amount', answer: r.endAmt, points: 2 },
      ],
      explanation: `移動平均法では受入のつど平均単価を再計算します。第1受入後の平均は ${num(A1)} 円、第1回払出後の残高は ${q} 個・${num(q * A1)} 円で、第2受入後の平均は ${num(A1 + 20)} 円になります。`,
      calcProcess: `第1回売上原価 = ${p1} × ${num(A1)} = ${num(r.payouts[0]!.cogs)}／第2回払出単価 = ${num(A1 + 20)}／売上原価合計 = ${num(r.cogsTotal)}／期末在庫 = ${r.endQty} 個 × ${num(A1 + 20)} = ${num(r.endAmt)}`,
      hints: ['受入のつど平均単価を計算し直す', '第1回払出後の残数量と残金額を確定させる', '第2回払出は新しい平均単価で評価する'],
      accounts: ['商品', '売上原価'],
    });
  }
}

// ================= G4-2 残高試算表（合計と空欄科目の逆算） 40問 =================
{
  const b: Base = { parent: 'base3-trial-balance', topic: '3-1', syllabus: '第三・1 試算表', lessonId: 'L13', terms: ['残高試算表', '貸借平均の原理'] };
  const debitPool = ['現金', '普通預金', '売掛金', '繰越商品', '貯蔵品', '貸付金', '備品', '仕入', '給料', '支払家賃', '消耗品費', '通信費', '旅費交通費', '広告宣伝費', '水道光熱費', '支払利息'];
  const creditPool = ['買掛金', '借入金', '資本金', '繰越利益剰余金', '未払金', '前受金', '預り金', '貸倒引当金', '備品減価償却累計額', '受取家賃', '受取利息'];
  const pick = (pool: string[], start: number, n: number) => Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]!);
  for (let k = 0; k < 40; k++) {
    const n = 8 + (k % 5); // 8〜12科目
    const nD = Math.ceil(n / 2);
    const nC = n - nD - 1; // バランサー（売上）を除く貸方科目数
    const dNames = pick(debitPool, k % debitPool.length, nD);
    const cNames = pick(creditPool, (k * 3) % creditPool.length, nC);
    const dAmts = dNames.map((_, i) => 1000 * (20 + ((k * 29 + i * 53) % 180)));
    const cAmts = cNames.map((_, i) => 1000 * (15 + ((k * 41 + i * 37) % 120)));
    let dTotal = dAmts.reduce((s, x) => s + x, 0);
    const cOther = cAmts.reduce((s, x) => s + x, 0);
    let sales = dTotal - cOther;
    if (sales < 50000) { // バランサー（売上）が十分な正値になるよう現金を増額して組み直す
      const add = 50000 - sales + 100000;
      dAmts[0] = dAmts[0]! + add; dTotal += add; sales = dTotal - cOther;
    }
    assert(sales >= 50000, 'trial balance sales balancer');
    const total = dTotal;
    assert(total === cOther + sales, 'trial balance equality');
    // 空欄はバランサー以外からローテーションで1科目選ぶ
    type Row = { name: string; amt: number; side: 'debit' | 'credit' };
    const rows: Row[] = [
      ...dNames.map((name, i) => ({ name, amt: dAmts[i]!, side: 'debit' as const })),
      ...cNames.map((name, i) => ({ name, amt: cAmts[i]!, side: 'credit' as const })),
      { name: '売上', amt: sales, side: 'credit' as const },
    ];
    const blankCandidates = rows.slice(0, rows.length - 1);
    const blank = blankCandidates[k % blankCandidates.length]!;
    const line = (r: Row) => (r.name === blank.name ? `${r.name} ？（空欄）` : `${r.name} ${yen(r.amt)}`);
    const dLines = rows.filter((r) => r.side === 'debit').map(line).join('、');
    const cLines = rows.filter((r) => r.side === 'credit').map(line).join('、');
    const diffAdv = n >= 10;
    F(b, {
      section: 'q2', format: 'trial-balance', difficulty: diffAdv ? 'advanced' : 'standard',
      calcType: '試算表の合計・空欄金額の算定', calcComplexity: n >= 11 ? 3 : 2,
      prompt: `次の残高試算表（一部）について答えなさい。借方欄は ${dLines} であり、貸方欄は ${cLines} である。「${blank.name}」の金額が空欄になっている。貸借合計金額と「${blank.name}」の残高を求めなさい。`,
      fields: [
        { key: 'debitTotal', label: '借方合計', kind: 'amount', answer: total, points: 2 },
        { key: 'creditTotal', label: '貸方合計', kind: 'amount', answer: total, points: 2 },
        { key: 'blank', label: `「${blank.name}」の残高`, kind: 'amount', answer: blank.amt, points: 3 },
      ],
      explanation: `残高試算表では借方合計と貸方合計が必ず一致します。空欄科目が属する側の判明している金額を合計し、反対側の合計との差額が空欄科目の残高になります。`,
      calcProcess: `${blank.side === 'debit' ? '借方' : '貸方'}の空欄以外を差し引き、合計 ${num(total)} との差額 = ${num(blank.amt)}（${blank.name}）`,
      hints: ['まず空欄のない側の合計を求める', '借方合計=貸方合計が手がかりになる', '空欄科目は反対側の合計との差額で求める'],
      accounts: rows.map((r) => r.name),
    });
  }
}

// ================= G4-3 元帳・補助簿の残高 36問 =================
{
  // --- A 現金出納帳（topic 1-4 / L03）9問 ---
  const bA: Base = { parent: 'base3-ledger-balance', topic: '1-4', syllabus: '第一・4 帳簿、第一・5 伝票と証ひょう', lessonId: 'L03', terms: ['現金出納帳', '補助簿'] };
  const incNames = ['売上代金の現金受取', '売掛金の回収', '貸付金の回収', '受取利息の現金受取'];
  const decNames = ['商品仕入の現金支払', '給料の支払', '消耗品の購入', '通信費の支払', '旅費交通費の支払'];
  for (let k = 0; k < 9; k++) {
    const open = 1000 * (25 + k * 7);
    const inc = [0, 1, 2].map((i) => ({ name: incNames[(k + i) % incNames.length]!, amt: 100 * (120 + ((k * 37 + i * 91) % 380)) }));
    const dec = [0, 1, 2].map((i) => ({ name: decNames[(k + i) % decNames.length]!, amt: 100 * (90 + ((k * 43 + i * 67) % 300)) }));
    const incTotal = inc.reduce((s, x) => s + x.amt, 0);
    let decTotal = dec.reduce((s, x) => s + x.amt, 0);
    let bal = open + incTotal - decTotal;
    if (bal < 10000) { inc[0]!.amt += 10000 - bal + 20000; }
    const incTotal2 = inc.reduce((s, x) => s + x.amt, 0);
    decTotal = dec.reduce((s, x) => s + x.amt, 0);
    bal = open + incTotal2 - decTotal;
    assert(bal >= 10000, 'cash book balance');
    const list = (xs: { name: string; amt: number }[]) => xs.map((x) => `${x.name} ${yen(x.amt)}`).join('、');
    F(bA, {
      section: 'q2', format: 'ledger', difficulty: k < 5 ? 'standard' : 'advanced', calcType: '元帳残高の集計', calcComplexity: 2,
      prompt: `現金出納帳について答えなさい。期首の現金残高は ${yen(open)} である。当月の増加明細は ${list(inc)} であり、減少明細は ${list(dec)} であった。当月の増加合計、減少合計および月末残高を求めなさい。`,
      fields: [
        { key: 'incTotal', label: '増加合計', kind: 'amount', answer: incTotal2, points: 2 },
        { key: 'decTotal', label: '減少合計', kind: 'amount', answer: decTotal, points: 2 },
        { key: 'bal', label: '月末残高', kind: 'amount', answer: bal, points: 3 },
        { key: 'side', label: '月末残高の区分', kind: 'select', options: ['借方', '貸方'], answer: '借方', points: 1 },
      ],
      explanation: '現金は資産で、増加は借方・減少は貸方に記入します。月末残高 = 期首残高 ＋ 増加合計 − 減少合計 です。',
      calcProcess: `増加合計 ${num(incTotal2)}／減少合計 ${num(decTotal)}／月末残高 = ${num(open)} ＋ ${num(incTotal2)} − ${num(decTotal)} = ${num(bal)}`,
      hints: ['増加と減少を別々に合計する', '現金の残高は期首＋増加−減少', '現金残高は通常借方に残る'],
      accounts: ['現金'],
    });
  }
  // --- B 売掛金元帳（得意先別）（topic 2-3 / L08）9問 ---
  const bB: Base = { parent: 'base3-ledger-balance', topic: '2-3', syllabus: '第二・3 ア,イ,エ 売掛金・買掛金・電子記録債権債務', lessonId: 'L08', terms: ['売掛金元帳', '補助簿', '得意先'] };
  const pairs: [string, string][] = [
    ['青葉商店', '白鳥商店'], ['高田商店', '森田商店'], ['川口商店', '西村商店'], ['大野商店', '小林商店'], ['藤井商店', '岡田商店'],
    ['山本商店', '中村商店'], ['井上商店', '木村商店'], ['林商店', '清水商店'], ['山口商店', '池田商店'],
  ];
  for (let k = 0; k < 9; k++) {
    const [nameA, nameB] = pairs[k]!;
    const mkCust = (seed: number) => {
      const open = 1000 * (40 + ((k * 31 + seed * 47) % 160));
      const sales = 1000 * (80 + ((k * 53 + seed * 29) % 220));
      const coll = Math.floor((open + sales) * (45 + ((k + seed) % 4) * 10) / 100 / 100) * 100;
      const bal = open + sales - coll;
      assert(bal > 0 && coll > 0, 'receivable customer balance');
      return { open, sales, coll, bal };
    };
    const a = mkCust(1); const c = mkCust(2);
    F(bB, {
      section: 'q2', format: 'ledger', difficulty: k < 4 ? 'standard' : 'advanced', calcType: '元帳残高の集計', calcComplexity: 2,
      prompt: `売掛金元帳について答えなさい。${nameA}の期首残高は ${yen(a.open)}、当月の掛売上高は ${yen(a.sales)}、当月の回収高は ${yen(a.coll)} であった。${nameB}の期首残高は ${yen(c.open)}、当月の掛売上高は ${yen(c.sales)}、当月の回収高は ${yen(c.coll)} であった。各得意先の月末残高と売掛金の合計残高を求めなさい。`,
      fields: [
        { key: 'balA', label: `${nameA}の月末残高`, kind: 'amount', answer: a.bal, points: 2 },
        { key: 'balB', label: `${nameB}の月末残高`, kind: 'amount', answer: c.bal, points: 2 },
        { key: 'total', label: '売掛金の合計残高', kind: 'amount', answer: a.bal + c.bal, points: 2 },
      ],
      explanation: '売掛金元帳は得意先ごとに記入し、各残高 = 期首残高 ＋ 掛売上高 − 回収高 です。補助簿の合計は総勘定元帳の売掛金残高と一致します。',
      calcProcess: `${nameA} = ${num(a.open)} ＋ ${num(a.sales)} − ${num(a.coll)} = ${num(a.bal)}／${nameB} = ${num(c.open)} ＋ ${num(c.sales)} − ${num(c.coll)} = ${num(c.bal)}／合計 = ${num(a.bal + c.bal)}`,
      hints: ['得意先ごとに残高を計算する', '回収は残高を減らす', '最後に2社分を合計する'],
      accounts: ['売掛金'],
    });
  }
  // --- C 買掛金元帳（topic 2-3 / L08）9問 ---
  const bC: Base = { parent: 'base3-ledger-balance', topic: '2-3', syllabus: '第二・3 ア,イ,エ 売掛金・買掛金・電子記録債権債務', lessonId: 'L08', terms: ['買掛金元帳', '補助簿', '仕入先'] };
  const supPairs: [string, string][] = [
    ['北野商店', '南野商店'], ['東屋商店', '西屋商店'], ['旭商店', '港商店'], ['梅田商店', '鶴屋商店'], ['富士商店', '栄商店'],
    ['京屋商店', '泉商店'], ['松屋商店', '竹屋商店'], ['星野商店', '月岡商店'], ['浜田商店', '磯部商店'],
  ];
  for (let k = 0; k < 9; k++) {
    if (k % 2 === 0) {
      const [nameA, nameB] = supPairs[k]!;
      const mkSup = (seed: number) => {
        const open = 1000 * (50 + ((k * 37 + seed * 41) % 150));
        const purch = 1000 * (90 + ((k * 43 + seed * 31) % 200));
        const pay = Math.floor((open + purch) * (40 + ((k + seed) % 4) * 12) / 100 / 100) * 100;
        const bal = open + purch - pay;
        assert(bal > 0 && pay > 0, 'payable supplier balance');
        return { open, purch, pay, bal };
      };
      const a = mkSup(1); const c = mkSup(2);
      F(bC, {
        section: 'q2', format: 'ledger', difficulty: k < 5 ? 'standard' : 'advanced', calcType: '元帳残高の集計', calcComplexity: 2,
        prompt: `買掛金元帳について答えなさい。${nameA}の期首残高は ${yen(a.open)}、当月の掛仕入高は ${yen(a.purch)}、当月の支払高は ${yen(a.pay)} であった。${nameB}の期首残高は ${yen(c.open)}、当月の掛仕入高は ${yen(c.purch)}、当月の支払高は ${yen(c.pay)} であった。各仕入先の月末残高と買掛金の合計残高を求めなさい。`,
        fields: [
          { key: 'balA', label: `${nameA}の月末残高`, kind: 'amount', answer: a.bal, points: 2 },
          { key: 'balB', label: `${nameB}の月末残高`, kind: 'amount', answer: c.bal, points: 2 },
          { key: 'total', label: '買掛金の合計残高', kind: 'amount', answer: a.bal + c.bal, points: 2 },
        ],
        explanation: '買掛金は負債で、掛仕入で増え支払で減ります。各残高 = 期首残高 ＋ 掛仕入高 − 支払高 です。',
        calcProcess: `${nameA} = ${num(a.open)} ＋ ${num(a.purch)} − ${num(a.pay)} = ${num(a.bal)}／${nameB} = ${num(c.open)} ＋ ${num(c.purch)} − ${num(c.pay)} = ${num(c.bal)}／合計 = ${num(a.bal + c.bal)}`,
        hints: ['仕入先ごとに残高を計算する', '支払は残高を減らす', '最後に2社分を合計する'],
        accounts: ['買掛金'],
      });
    } else {
      const [nameA] = supPairs[k]!;
      const open = 1000 * (60 + ((k * 37) % 140));
      const inc = [0, 1].map((i) => 1000 * (70 + ((k * 51 + i * 83) % 160)));
      const dec = [0, 1].map((i) => 1000 * (50 + ((k * 39 + i * 61) % 120)));
      const incTotal = inc.reduce((s, x) => s + x, 0);
      const decTotal = dec.reduce((s, x) => s + x, 0);
      const bal = open + incTotal - decTotal;
      assert(bal > 0, 'payable single balance');
      F(bC, {
        section: 'q2', format: 'ledger', difficulty: k < 5 ? 'standard' : 'advanced', calcType: '元帳残高の集計', calcComplexity: 2,
        prompt: `買掛金元帳（${nameA}）について答えなさい。期首残高は ${yen(open)} である。当月の増加明細は掛仕入 ${yen(inc[0]!)} と掛仕入 ${yen(inc[1]!)} であり、減少明細は支払 ${yen(dec[0]!)} と支払 ${yen(dec[1]!)} であった。増加合計、減少合計および月末残高を求めなさい。`,
        fields: [
          { key: 'incTotal', label: '増加合計', kind: 'amount', answer: incTotal, points: 2 },
          { key: 'decTotal', label: '減少合計', kind: 'amount', answer: decTotal, points: 2 },
          { key: 'bal', label: '月末残高', kind: 'amount', answer: bal, points: 3 },
          { key: 'side', label: '月末残高の区分', kind: 'select', options: ['借方', '貸方'], answer: '貸方', points: 1 },
        ],
        explanation: '買掛金は負債で、増加は貸方・減少は借方に記入します。月末残高 = 期首残高 ＋ 増加合計 − 減少合計 で、通常は貸方に残ります。',
        calcProcess: `増加合計 ${num(incTotal)}／減少合計 ${num(decTotal)}／月末残高 = ${num(open)} ＋ ${num(incTotal)} − ${num(decTotal)} = ${num(bal)}`,
        hints: ['増加と減少を別々に合計する', '買掛金の残高は期首＋増加−減少', '負債の残高は通常貸方に残る'],
        accounts: ['買掛金'],
      });
    }
  }
  // --- D 商品有高帳の数量残高（topic 1-4 / L03）9問 ---
  const bD: Base = { parent: 'base3-ledger-balance', topic: '1-4', syllabus: '第一・4 帳簿、第一・5 伝票と証ひょう', lessonId: 'L03', terms: ['商品有高帳', '補助簿'] };
  const products = ['コーヒー豆', '紅茶パック', '陶器カップ', '文具セット', 'タオル', '傘', 'ノート', '電球', '乾電池'];
  for (let k = 0; k < 9; k++) {
    const open = 40 + ((k * 23) % 90);
    const in1 = 30 + ((k * 17) % 60); const in2 = 20 + ((k * 13) % 50);
    const outTotalMax = open + in1 + in2 - 10;
    const out1 = Math.floor(outTotalMax * 0.5); const out2 = Math.floor(outTotalMax * 0.3);
    const inTotal = in1 + in2; const outTotal = out1 + out2;
    const end = open + inTotal - outTotal;
    assert(end > 0 && out1 > 0 && out2 > 0, 'inventory qty balance');
    F(bD, {
      section: 'q2', format: 'ledger', difficulty: k < 4 ? 'standard' : 'advanced', calcType: '数量の集計', calcComplexity: 1,
      prompt: `商品有高帳（品名：${products[k]}、数量のみの記録）について答えなさい。期首繰越数量は ${open} 個である。当月の受入は ${in1} 個と ${in2} 個であり、当月の払出は ${out1} 個と ${out2} 個であった。受入数量合計、払出数量合計および期末在庫数量を求めなさい。`,
      fields: [
        { key: 'inTotal', label: '受入数量合計（個）', kind: 'amount', answer: inTotal, points: 2 },
        { key: 'outTotal', label: '払出数量合計（個）', kind: 'amount', answer: outTotal, points: 2 },
        { key: 'endQty', label: '期末在庫数量（個）', kind: 'amount', answer: end, points: 2 },
      ],
      explanation: '数量のみの記録では、期末在庫数量 = 期首繰越数量 ＋ 受入数量合計 − 払出数量合計 です。',
      calcProcess: `受入合計 = ${in1} ＋ ${in2} = ${inTotal}／払出合計 = ${out1} ＋ ${out2} = ${outTotal}／期末 = ${open} ＋ ${inTotal} − ${outTotal} = ${end} 個`,
      hints: ['受入と払出を別々に合計する', '期末数量は期首＋受入−払出', '単価は数量の計算には使わない'],
      accounts: ['商品'],
    });
  }
}

// ================= G4-4 精算表ミニ 36問 =================
{
  const b: Base = { parent: 'base3-worksheet-mini', topic: '3-2', syllabus: '第三・2 精算表', lessonId: 'L14', terms: ['精算表', '決算整理', '売上原価', '当期純利益'] };
  for (let k = 0; k < 36; k++) {
    let cash = 1000 * (120 + ((k * 37) % 160));
    const recv = 1000 * (180 + ((k * 53) % 220));
    const invBeg = 1000 * (80 + ((k * 29) % 120));
    const equip = 1000 * (300 + ((k * 71) % 300));
    const purchases = 1000 * (400 + ((k * 43) % 300));
    const salary = 1000 * (150 + ((k * 31) % 120));
    const rent = 1000 * (90 + ((k * 17) % 80));
    const accum = 1000 * (60 + ((k * 23) % 120));
    const payables = 1000 * (100 + ((k * 47) % 150));
    const capital = 1000 * (400 + ((k * 13) % 200));
    const retained = 1000 * (50 + ((k * 19) % 100));
    const combo = k % 4; // 0:棚卸+減価償却 / 1:棚卸+貸倒 / 2:減価償却+貸倒 / 3:棚卸のみ
    const useInv = combo !== 2;
    const useDep = combo === 0 || combo === 2;
    const useBad = combo === 1 || combo === 2;
    const invEnd = 1000 * (60 + ((k * 41) % 140));
    const dep = equip / 10;
    const badRate = k % 2 === 0 ? 2 : 3;
    const badAmt = (recv * badRate) / 100;
    // 売上をバランサーとして試算表を一致させる。純利益が十分な正値になるまで現金を増額（売上と純利益が同額増える）
    const compute = () => {
      const dTb = cash + recv + invBeg + equip + purchases + salary + rent;
      const sales = dTb - (accum + payables + capital + retained);
      const cogs = useInv ? invBeg + purchases - invEnd : purchases;
      const plDebit = cogs + salary + rent + (useDep ? dep : 0) + (useBad ? badAmt : 0);
      const ni = sales - plDebit;
      return { sales, cogs, plDebit, ni };
    };
    let r = compute();
    while (r.ni < 80000) { cash += 100000; r = compute(); }
    assert(r.sales > 0 && r.ni >= 80000, 'worksheet NI positive');
    const bsDebit = cash + recv + (useInv ? invEnd : invBeg) + equip;
    const bsCreditBefore = accum + (useDep ? dep : 0) + (useBad ? badAmt : 0) + payables + capital + retained;
    // 純利益がPLとBSで一致することを assert（一致しない組合せは出題しない）
    assert(bsDebit === bsCreditBefore + r.ni, 'worksheet PL/BS net income agreement');
    const adjTexts: string[] = [];
    if (useInv) adjTexts.push(`期末商品棚卸高は ${yen(invEnd)} である`);
    if (useDep) adjTexts.push(`備品の減価償却を行う（定額法、本年分は取得原価の10％）`);
    if (useBad) adjTexts.push(`売掛金に対して ${badRate}％の貸倒見積りを行う（貸倒引当金の残高はない）`);
    const prompt = `精算表の作成について答えなさい。決算整理前の残高は、現金 ${yen(cash)}、売掛金 ${yen(recv)}、繰越商品 ${yen(invBeg)}、備品 ${yen(equip)}、備品減価償却累計額 ${yen(accum)}、買掛金 ${yen(payables)}、資本金 ${yen(capital)}、繰越利益剰余金 ${yen(retained)}、売上 ${yen(r.sales)}、仕入 ${yen(purchases)}、給料 ${yen(salary)}、支払家賃 ${yen(rent)} である。整理事項は次のとおりである。${adjTexts.map((t, i) => `(${i + 1}) ${t}`).join('。')}。`;
    const common = {
      section: 'q3' as Section, format: 'worksheet' as Format,
      calcType: '精算表の集計', calcComplexity: 3 as const,
      hints: ['整理事項を1つずつ試算表欄へ反映する', '売上原価は期首＋仕入−期末で求める', '当期純利益は損益計算書欄でも貸借対照表欄でも同じになる'],
      accounts: ['現金', '売掛金', '繰越商品', '備品', '備品減価償却累計額', '買掛金', '資本金', '繰越利益剰余金', '売上', '仕入', '給料', '支払家賃'],
    };
    if (combo === 0) {
      F(b, {
        ...common, difficulty: 'advanced',
        prompt: prompt + '売上原価、当期純利益および貸借対照表欄の借方合計を求めなさい。',
        fields: [
          { key: 'cogs', label: '売上原価', kind: 'amount', answer: r.cogs, points: 3 },
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: r.ni, points: 3 },
          { key: 'bsDebit', label: '貸借対照表欄の借方合計', kind: 'amount', answer: bsDebit, points: 4 },
        ],
        explanation: '売上原価はしーくりくりしーで算定し、減価償却費を費用に加えます。当期純利益は損益計算書欄の貸借差額であり、貸借対照表欄でも同じ金額が差額として現れます。',
        calcProcess: `売上原価 = ${num(invBeg)} ＋ ${num(purchases)} − ${num(invEnd)} = ${num(r.cogs)}／損益計算書欄借方 = ${num(r.plDebit)}、当期純利益 = ${num(r.sales)} − ${num(r.plDebit)} = ${num(r.ni)}／貸借対照表欄借方 = ${num(bsDebit)}`,
      });
    } else if (combo === 1) {
      F(b, {
        ...common, difficulty: 'advanced',
        prompt: prompt + '売上原価、当期純利益および貸借対照表欄の貸方合計を求めなさい。',
        fields: [
          { key: 'cogs', label: '売上原価', kind: 'amount', answer: r.cogs, points: 3 },
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: r.ni, points: 3 },
          { key: 'bsCredit', label: '貸借対照表欄の貸方合計', kind: 'amount', answer: bsDebit, points: 4 },
        ],
        explanation: '貸倒見積りでは売掛金残高×見積率を貸倒引当金繰入（費用）と貸倒引当金（貸借対照表欄の貸方）として計上します。貸借対照表欄の貸方合計は、当期純利益を含めると借方合計と一致します。',
        calcProcess: `貸倒見積額 = ${num(recv)} × ${badRate}％ = ${num(badAmt)}／売上原価 = ${num(r.cogs)}／当期純利益 = ${num(r.ni)}／貸借対照表欄貸方合計 = ${num(bsCreditBefore)} ＋ ${num(r.ni)} = ${num(bsDebit)}`,
      });
    } else if (combo === 2) {
      F(b, {
        ...common, difficulty: 'advanced',
        prompt: prompt + '当期純利益、貸借対照表欄の借方合計および貸倒引当金の金額（貸借対照表欄）を求めなさい。なお、商品の棚卸しは行わないものとし、仕入の金額がそのまま売上原価になる。',
        fields: [
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: r.ni, points: 3 },
          { key: 'bsDebit', label: '貸借対照表欄の借方合計', kind: 'amount', answer: bsDebit, points: 4 },
          { key: 'allowance', label: '貸倒引当金（貸借対照表欄）', kind: 'amount', answer: badAmt, points: 3 },
        ],
        explanation: '棚卸しを行わない場合は繰越商品は試算表の残高のまま貸借対照表欄へ移ります。減価償却費と貸倒引当金繰入を費用に加えて当期純利益を求めます。',
        calcProcess: `貸倒見積額 = ${num(recv)} × ${badRate}％ = ${num(badAmt)}／減価償却費 = ${num(dep)}／当期純利益 = ${num(r.sales)} − ${num(r.plDebit)} = ${num(r.ni)}／貸借対照表欄借方 = ${num(bsDebit)}`,
      });
    } else {
      F(b, {
        ...common, difficulty: 'standard',
        prompt: prompt + '売上原価、当期純利益および貸借対照表欄に記入する繰越商品の金額を求めなさい。',
        fields: [
          { key: 'cogs', label: '売上原価', kind: 'amount', answer: r.cogs, points: 3 },
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: r.ni, points: 3 },
          { key: 'invBs', label: '繰越商品（貸借対照表欄）', kind: 'amount', answer: invEnd, points: 4 },
        ],
        explanation: '決算整理後の繰越商品は期末棚卸高が貸借対照表欄へ移り、期首在庫と当期仕入から売上原価が算定されます。',
        calcProcess: `売上原価 = ${num(invBeg)} ＋ ${num(purchases)} − ${num(invEnd)} = ${num(r.cogs)}／当期純利益 = ${num(r.sales)} − ${num(r.plDebit)} = ${num(r.ni)}`,
      });
    }
  }
}

// ================= G4-5 決算数値の算定 36問 =================
{
  const b: Base = { parent: 'base3-closing-amounts', topic: '3-9', syllabus: '第三・9 財務諸表', lessonId: 'L15', terms: ['売上総利益', '営業利益', '経常利益', '当期純利益', '貸借対照表'] };
  for (let k = 0; k < 36; k++) {
    let sales = 1000 * (1500 + ((k * 67) % 900));
    const cogs = 1000 * (800 + ((k * 53) % 400));
    const salary = 1000 * (200 + ((k * 29) % 120));
    const rent = 1000 * (100 + ((k * 17) % 70));
    const supplies = 1000 * (30 + ((k * 11) % 40));
    const comm = 1000 * (20 + ((k * 7) % 25));
    const dep = 1000 * (40 + ((k * 13) % 50));
    const badIn = 1000 * (5 + ((k * 3) % 15));
    const sga = salary + rent + supplies + comm + dep + badIn;
    const intExp = 1000 * (10 + ((k * 5) % 20));
    const opRevInt = 1000 * (5 + ((k * 7) % 12));
    const opRevRent = 1000 * (20 + ((k * 11) % 30));
    // 営業利益が十分な正値になるまで売上を増額する（資本金はバランサーで再計算する）
    while (sales - cogs - sga < 100000) sales += 50000;
    const gp = sales - cogs;
    const op = gp - sga;
    const ordinary = op + opRevInt + opRevRent - intExp;
    const tax = Math.floor((ordinary * 0.3) / 1000) * 1000;
    const ni = ordinary - tax;
    assert(gp > 0 && op >= 100000 && tax > 0 && ni > 0, 'closing amounts profit stages');
    const cash = 1000 * (150 + ((k * 31) % 200));
    const bank = 1000 * (200 + ((k * 37) % 250));
    const recv = 1000 * (250 + ((k * 43) % 250));
    const invEnd = 1000 * (90 + ((k * 23) % 130));
    const loansR = 1000 * (50 + ((k * 19) % 150));
    let equip = 1000 * (400 + ((k * 59) % 400));
    const accum = 1000 * (80 + ((k * 27) % 160));
    const allowance = 1000 * (5 + ((k * 7) % 20));
    const payables = 1000 * (150 + ((k * 41) % 200));
    const borrow = 1000 * (100 + ((k * 47) % 250));
    const retained = 1000 * (80 + ((k * 17) % 150));
    const assetsGross = () => cash + bank + recv + invEnd + loansR + equip;
    const assetsTotal = () => assetsGross() - accum - allowance;
    // 資本金をバランサーとして貸借一致させる（正値でなければ備品を増額して組み直す）
    let capital = assetsTotal() - (payables + borrow + tax) - retained - ni;
    while (capital <= 200000) { equip += 200000; capital = assetsTotal() - (payables + borrow + tax) - retained - ni; }
    assert(capital > 200000, 'closing capital balancer');
    const assets = assetsTotal();
    const liabEquity = payables + borrow + tax + capital + retained + ni;
    assert(assets === liabEquity, 'closing BS equality');
    // 整理後試算表としても貸借一致することを assert（資本金がバランサー）
    const dTb = assetsGross() + cogs + sga + intExp + tax;
    const cTb = accum + allowance + payables + borrow + tax + capital + retained + sales + opRevInt + opRevRent;
    assert(dTb === cTb, 'closing TB equality');
    const setIdx = k % 4;
    const modeY = k % 2 === 1;
    const classNote = '販売費及び一般管理費は給料・支払家賃・消耗品費・通信費・減価償却費・貸倒引当金繰入とし、受取利息・受取家賃は営業外収益、支払利息は営業外費用とする。';
    const plText = `売上 ${yen(sales)}、売上原価 ${yen(cogs)}、給料 ${yen(salary)}、支払家賃 ${yen(rent)}、消耗品費 ${yen(supplies)}、通信費 ${yen(comm)}、減価償却費 ${yen(dep)}、貸倒引当金繰入 ${yen(badIn)}、受取利息 ${yen(opRevInt)}、受取家賃 ${yen(opRevRent)}、支払利息 ${yen(intExp)}、法人税・住民税及び事業税 ${yen(tax)}`;
    const bsText = `現金 ${yen(cash)}、普通預金 ${yen(bank)}、売掛金 ${yen(recv)}、貸倒引当金 ${yen(allowance)}、繰越商品 ${yen(invEnd)}、貸付金 ${yen(loansR)}、備品 ${yen(equip)}、備品減価償却累計額 ${yen(accum)}、買掛金 ${yen(payables)}、借入金 ${yen(borrow)}、未払法人税等 ${yen(tax)}、資本金 ${yen(capital)}、繰越利益剰余金 ${yen(retained)}`;
    const prompt = modeY
      ? `決算数値の算定について答えなさい。損益に関する整理後の数値は ${plText} であり、貸借対照表に関する残高は ${bsText} である。${classNote}`
      : `決算数値の算定について答えなさい。整理後試算表の残高は、${bsText}、${plText} である（貸倒引当金と備品減価償却累計額は控除科目である）。${classNote}`;
    const common = {
      section: 'q3' as Section, format: 'statements' as Format,
      difficulty: (k % 3 === 0 ? 'standard' : 'advanced') as Question['difficulty'],
      calcType: '段階利益と貸借対照表の算定', calcComplexity: 3 as const,
      hints: ['売上総利益→営業利益→経常利益→当期純利益の順に段階計算する', '販管費と営業外損益の区分は問題文の指定に従う', '貸借対照表は控除科目を差し引いて集計する'],
      accounts: ['売上', '売上原価', '給料', '支払家賃', '消耗品費', '通信費', '減価償却費', '貸倒引当金繰入', '受取利息', '受取家賃', '支払利息', '法人税・住民税及び事業税'],
    };
    if (setIdx === 0) {
      F(b, {
        ...common, prompt: prompt + '売上総利益、営業利益および当期純利益を求めなさい。',
        fields: [
          { key: 'gp', label: '売上総利益', kind: 'amount', answer: gp, points: 3 },
          { key: 'op', label: '営業利益', kind: 'amount', answer: op, points: 3 },
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: ni, points: 4 },
        ],
        explanation: '売上総利益 = 売上 − 売上原価、営業利益 = 売上総利益 − 販管費、経常利益 = 営業利益 ＋ 営業外収益 − 営業外費用、当期純利益 = 経常利益 − 法人税等 です。',
        calcProcess: `売上総利益 = ${num(sales)} − ${num(cogs)} = ${num(gp)}／営業利益 = ${num(gp)} − ${num(sga)} = ${num(op)}／経常利益 = ${num(ordinary)}／当期純利益 = ${num(ordinary)} − ${num(tax)} = ${num(ni)}`,
      });
    } else if (setIdx === 1) {
      F(b, {
        ...common, prompt: prompt + '売上総利益、当期純利益および貸借対照表の資産合計を求めなさい。',
        fields: [
          { key: 'gp', label: '売上総利益', kind: 'amount', answer: gp, points: 3 },
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: ni, points: 3 },
          { key: 'assets', label: '資産合計', kind: 'amount', answer: assets, points: 4 },
        ],
        explanation: '資産合計は各資産の残高から貸倒引当金と備品減価償却累計額を控除して集計します。',
        calcProcess: `売上総利益 = ${num(gp)}／当期純利益 = ${num(ni)}／資産合計 = ${num(assetsGross())} − ${num(accum)} − ${num(allowance)} = ${num(assets)}`,
      });
    } else if (setIdx === 2) {
      F(b, {
        ...common, prompt: prompt + '営業利益、経常利益および貸借対照表の負債・純資産合計を求めなさい。',
        fields: [
          { key: 'op', label: '営業利益', kind: 'amount', answer: op, points: 3 },
          { key: 'ordinary', label: '経常利益', kind: 'amount', answer: ordinary, points: 3 },
          { key: 'le', label: '負債・純資産合計', kind: 'amount', answer: liabEquity, points: 4 },
        ],
        explanation: '負債・純資産合計 = 負債合計 ＋ 資本金 ＋ 繰越利益剰余金 ＋ 当期純利益 で、資産合計と一致します。',
        calcProcess: `営業利益 = ${num(op)}／経常利益 = ${num(op)} ＋ ${num(opRevInt + opRevRent)} − ${num(intExp)} = ${num(ordinary)}／負債・純資産合計 = ${num(liabEquity)}（資産合計と一致）`,
      });
    } else {
      F(b, {
        ...common, prompt: prompt + '販売費及び一般管理費の合計、当期純利益および貸借対照表の資産合計を求めなさい。',
        fields: [
          { key: 'sga', label: '販売費及び一般管理費合計', kind: 'amount', answer: sga, points: 3 },
          { key: 'ni', label: '当期純利益', kind: 'amount', answer: ni, points: 3 },
          { key: 'assets', label: '資産合計', kind: 'amount', answer: assets, points: 4 },
        ],
        explanation: '販管費は問題文で指定された6科目の合計です。当期純利益を加えた負債・純資産合計は資産合計と一致します。',
        calcProcess: `販管費 = ${num(salary)} ＋ ${num(rent)} ＋ ${num(supplies)} ＋ ${num(comm)} ＋ ${num(dep)} ＋ ${num(badIn)} = ${num(sga)}／当期純利益 = ${num(ni)}／資産合計 = ${num(assets)}`,
      });
    }
  }
}

// ================= G4-6 複合仕訳の応用 34問 =================
{
  // --- a 一部現金・一部掛け仕入＋立替諸掛り（2-7 / L06）9問 ---
  const bA: Base = { parent: 'base3-journal-combo', topic: '2-7', syllabus: '第二・7 ア,エ 商品売買・返品', lessonId: 'L06', terms: ['立替金', '買掛金'] };
  const pcts = [30, 40, 50, 60, 40, 50, 30, 60, 50];
  for (let k = 0; k < 9; k++) {
    const P = 10000 * (30 + ((k * 7) % 40));
    const pct = pcts[k]!;
    const cashPart = (P * pct) / 100;
    const fr = 1000 * (3 + ((k * 3) % 8));
    J(bA, {
      difficulty: 'advanced', needsCalc: true, calcType: '複合仕訳の金額配分', calcComplexity: 2,
      prompt: `商品 ${yen(P)} を仕入れ、代金の ${pct}％を現金で支払い、残りを掛けとした。また、売主が負担すべき引取運賃 ${yen(fr)} を現金で立て替えた。これらをあわせた仕訳を示しなさい。`,
      journal: [D('仕入', P), D('立替金', fr), C('現金', cashPart + fr), C('買掛金', P - cashPart)],
      explanation: '仕入代金は現金支払分と買掛金に分け、売主負担の運賃を立て替えた分は立替金（債権）として現金の支払に含めます。',
      calcProcess: `現金支払 = ${num(P)} × ${pct}％ ＋ ${num(fr)} = ${num(cashPart + fr)}／買掛金 = ${num(P)} − ${num(cashPart)} = ${num(P - cashPart)}`,
      hints: ['仕入は購入金額の全額を計上する', '立て替えた運賃は費用ではなく立替金', '現金の支払は代金分と立替分を合計する'],
    });
  }
  // --- b 返品と相殺後の決済（2-7 / L06）9問 ---
  const bB: Base = { parent: 'base3-journal-combo', topic: '2-7', syllabus: '第二・7 ア,エ 商品売買・返品', lessonId: 'L06', terms: ['売上戻り', '売掛金'] };
  const retPcts = [10, 20, 10, 20, 10, 20, 10, 20, 10];
  for (let k = 0; k < 9; k++) {
    const S = 10000 * (40 + ((k * 11) % 50));
    const rp = retPcts[k]!;
    const R = (S * rp) / 100;
    J(bB, {
      difficulty: 'advanced', needsCalc: true, calcType: '返品控除後の決済額の計算', calcComplexity: 2,
      prompt: `以前に掛けで販売した商品（売掛金残高 ${yen(S)}）について、販売額の ${rp}％にあたる商品の返品を受け入れた。同日、残額の全額を普通預金口座への振込により回収した。返品の受入と回収をあわせた仕訳を示しなさい。`,
      journal: [D('売上', R), D('普通預金', S - R), C('売掛金', S)],
      explanation: '返品分は売上を取り消し、売掛金は残高の全額が消滅します。回収額は返品分を差し引いた残額です。',
      calcProcess: `返品額 = ${num(S)} × ${rp}％ = ${num(R)}／回収額 = ${num(S)} − ${num(R)} = ${num(S - R)}`,
      hints: ['返品は売上の取消しとして処理する', '売掛金は残高全額が消える', '入金額は返品を引いた残額になる'],
    });
  }
  // --- c 貸付金の一部返済と利息（2-4 / L09）8問 ---
  const bC: Base = { parent: 'base3-journal-combo', topic: '2-4', syllabus: '第二・4 その他の債権債務', lessonId: 'L09', terms: ['貸付金', '受取利息', '利息計算'] };
  const ratePairs: [number, number][] = [[4, 3], [2, 6], [3, 4], [6, 2], [4, 6], [1, 12], [3, 8], [4, 3]];
  for (let k = 0; k < 8; k++) {
    const L = 100000 * (4 + ((k * 3) % 8));
    const prin = 100000 * (1 + (k % 3));
    const [rate, months] = ratePairs[k]!;
    const interest = (L * rate * months) / 1200;
    assert(Number.isInteger(interest) && interest > 0 && prin < L, 'loan interest integer');
    J(bC, {
      difficulty: 'advanced', needsCalc: true, calcType: '利息計算', calcComplexity: 2,
      prompt: `取引先に貸し付けている貸付金 ${yen(L)}（年利率 ${rate}％）について、本日、元金の一部 ${yen(prin)} の返済を受け、あわせて ${months} か月分の利息を普通預金口座への振込により受け取った。仕訳を示しなさい。`,
      journal: [D('普通預金', prin + interest), C('貸付金', prin), C('受取利息', interest)],
      explanation: '受取額は元金の返済分と利息分に分け、元金分は貸付金の減少、利息分は受取利息（収益）として処理します。利息は貸付金全体について期間按分します。',
      calcProcess: `利息 = ${num(L)} × ${rate}％ × ${months}/12 = ${num(interest)}／受取額 = ${num(prin)} ＋ ${num(interest)} = ${num(prin + interest)}`,
      hints: ['利息は貸付金全体にかかる', '利息は年利率を月数で按分する', '入金額は元金と利息の合計になる'],
    });
  }
  // --- d 商品券の発行と自店商品券での売上（2-4 / L09）4問 ---
  const bD: Base = { parent: 'base3-journal-combo', topic: '2-4', syllabus: '第二・4 その他の債権債務', lessonId: 'L09', terms: ['発行商品券', '商品券'] };
  for (let k = 0; k < 2; k++) {
    const G = 10000 * (5 + k * 3);
    J(bD, {
      difficulty: 'standard', needsCalc: false,
      prompt: `自店の商品券 ${yen(G)} 分を販売し、代金を現金で受け取った。仕訳を示しなさい。`,
      journal: [D('現金', G), C('発行商品券', G)],
      explanation: '商品券の発行は商品の販売ではなく前受的な負債（発行商品券）であり、実際に商品と引き換えたときに売上が発生します。',
      hints: ['発行時点では売上は発生しない', '受け取った現金の相手は発行商品券', '発行商品券は負債である'],
    });
  }
  for (let k = 0; k < 2; k++) {
    const S = 10000 * (8 + k * 4);
    const G = 10000 * (3 + k * 2);
    J(bD, {
      difficulty: 'advanced', needsCalc: true, calcType: '差額計算', calcComplexity: 1,
      prompt: `商品 ${yen(S)} を販売し、代金のうち ${yen(G)} は自店発行の商品券で受け取り、残りを現金で受け取った。仕訳を示しなさい。`,
      journal: [D('発行商品券', G), D('現金', S - G), C('売上', S)],
      explanation: '自店商品券での支払を受けた分は発行商品券（負債）が消滅し、売上は販売額の全額を計上します。',
      calcProcess: `現金受取 = ${num(S)} − ${num(G)} = ${num(S - G)}`,
      hints: ['売上は全額を計上する', '商品券分は発行商品券の減少', '残りが現金受取になる'],
    });
  }
  // --- e 受取商品券の精算と受取（2-4 / L09）4問 ---
  const bE: Base = { parent: 'base3-journal-combo', topic: '2-4', syllabus: '第二・4 その他の債権債務', lessonId: 'L09', terms: ['受取商品券', '支払手数料'] };
  for (let k = 0; k < 2; k++) {
    const R = 10000 * (10 + k * 6);
    const feePct = k === 0 ? 3 : 5;
    const fee = (R * feePct) / 100;
    J(bE, {
      difficulty: 'advanced', needsCalc: true, calcType: '手数料計算', calcComplexity: 1,
      prompt: `以前に受け取っていた他店発行の商品券 ${yen(R)} を発行元へ送付して精算し、額面の ${feePct}％の手数料を差し引かれた残額が普通預金口座に入金された。仕訳を示しなさい。`,
      journal: [D('普通預金', R - fee), D('支払手数料', fee), C('受取商品券', R)],
      explanation: '受取商品券の精算では額面金額で受取商品券を取り崩し、手数料は支払手数料、入金額は差額となります。',
      calcProcess: `手数料 = ${num(R)} × ${feePct}％ = ${num(fee)}／入金額 = ${num(R)} − ${num(fee)} = ${num(R - fee)}`,
      hints: ['受取商品券は額面で取り崩す', '手数料は支払手数料になる', '入金は手数料を引いた残額'],
    });
  }
  for (let k = 0; k < 2; k++) {
    const S = 10000 * (12 + k * 5);
    const G = 10000 * (5 + k * 3);
    J(bE, {
      difficulty: 'standard', needsCalc: true, calcType: '差額計算', calcComplexity: 1,
      prompt: `商品 ${yen(S)} を販売し、代金のうち ${yen(G)} は他店発行の商品券で受け取り、残りを現金で受け取った。仕訳を示しなさい。`,
      journal: [D('受取商品券', G), D('現金', S - G), C('売上', S)],
      explanation: '他店発行の商品券で受け取った分は受取商品券（資産）として計上し、売上は販売額の全額を計上します。',
      calcProcess: `現金受取 = ${num(S)} − ${num(G)} = ${num(S - G)}`,
      hints: ['売上は全額を計上する', '他店の商品券は受取商品券（資産）', '残りが現金受取になる'],
    });
  }
}

export const GENERATED_4: Question[] = out;
