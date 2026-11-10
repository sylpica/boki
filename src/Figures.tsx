// 教材の図表。数値はすべてこのファイル内の定数で完結し、合計の一致をテストで検証する。
// 装飾ではなく、借方・貸方の位置と合計の関係をそのまま読める形にする。

export const T_ACCOUNT_EXAMPLE = {
  account: '現金',
  debits: [
    { label: '期首残高', amount: 100000 },
    { label: '売上（現金販売）', amount: 50000 },
  ],
  credits: [{ label: '仕入（現金購入）', amount: 30000 }],
};
export const tAccountBalance = (d: { amount: number }[], c: { amount: number }[]) =>
  d.reduce((s, x) => s + x.amount, 0) - c.reduce((s, x) => s + x.amount, 0);

export function TAccountFigure() {
  const dSum = T_ACCOUNT_EXAMPLE.debits.reduce((s, x) => s + x.amount, 0);
  const cSum = T_ACCOUNT_EXAMPLE.credits.reduce((s, x) => s + x.amount, 0);
  const bal = tAccountBalance(T_ACCOUNT_EXAMPLE.debits, T_ACCOUNT_EXAMPLE.credits);
  return (
    <figure className="fig">
      <figcaption>T勘定（{T_ACCOUNT_EXAMPLE.account}勘定）：左が借方、右が貸方。資産は借方で増え、貸方で減る</figcaption>
      <table className="t-account" aria-label={`T勘定の例：${T_ACCOUNT_EXAMPLE.account}`}>
        <thead>
          <tr><th colSpan={2}>借方（左）</th><th colSpan={2}>貸方（右）</th></tr>
        </thead>
        <tbody>
          {T_ACCOUNT_EXAMPLE.debits.map((d, i) => (
            <tr key={d.label}>
              <td>{d.label}</td><td className="num">￥{d.amount.toLocaleString('ja-JP')}</td>
              <td>{T_ACCOUNT_EXAMPLE.credits[i]?.label ?? ''}</td>
              <td className="num">{T_ACCOUNT_EXAMPLE.credits[i] ? `￥${T_ACCOUNT_EXAMPLE.credits[i]!.amount.toLocaleString('ja-JP')}` : ''}</td>
            </tr>
          ))}
          <tr className="fig-total">
            <td>合計</td><td className="num">￥{dSum.toLocaleString('ja-JP')}</td>
            <td>合計</td><td className="num">￥{cSum.toLocaleString('ja-JP')}</td>
          </tr>
          <tr>
            <td colSpan={4}>残高 ￥{bal.toLocaleString('ja-JP')}（借方残高：借方合計 − 貸方合計）</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}

export const FIVE_ELEMENTS = [
  { name: '資産', inc: '借方', dec: '貸方', examples: '現金、普通預金、売掛金、商品、備品', side: 'B/Sの左側' },
  { name: '負債', inc: '貸方', dec: '借方', examples: '買掛金、借入金、未払金、預り金', side: 'B/Sの右側' },
  { name: '純資産', inc: '貸方', dec: '借方', examples: '資本金、繰越利益剰余金', side: 'B/Sの右側' },
  { name: '収益', inc: '貸方', dec: '借方', examples: '売上、受取利息、受取手数料', side: 'P/Lの右側' },
  { name: '費用', inc: '借方', dec: '貸方', examples: '仕入、給料、家賃、支払利息', side: 'P/Lの左側' },
];

export function FiveElementsFigure() {
  return (
    <figure className="fig">
      <figcaption>5要素と増える側：資産・費用は借方で増え、負債・純資産・収益は貸方で増える</figcaption>
      <div className="table-scroll">
        <table className="fig-table">
          <thead><tr><th>要素</th><th>増える側</th><th>減る側</th><th>代表的な科目</th><th>表示場所</th></tr></thead>
          <tbody>
            {FIVE_ELEMENTS.map((e) => (
              <tr key={e.name}><th>{e.name}</th><td>{e.inc}</td><td>{e.dec}</td><td>{e.examples}</td><td>{e.side}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export const FLOW_STEPS = ['取引', '仕訳', '総勘定元帳へ転記', '試算表', '決算整理', '精算表', '貸借対照表・損益計算書'];

export function FlowFigure() {
  return (
    <figure className="fig">
      <figcaption>帳簿の流れ：取引は仕訳され、元帳へ転記され、試算表で貸借一致を確かめてから決算整理を経て財務諸表になる</figcaption>
      <ol className="flow-steps">
        {FLOW_STEPS.map((s, i) => (
          <li key={s}><span className="flow-step">{s}</span>{i < FLOW_STEPS.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}</li>
        ))}
      </ol>
    </figure>
  );
}

export const BS_EXAMPLE = {
  assets: [
    { label: '現金', amount: 300000 },
    { label: '売掛金', amount: 200000 },
    { label: '商品', amount: 300000 },
    { label: '備品', amount: 200000 },
  ],
  liabilities: [
    { label: '買掛金', amount: 250000 },
    { label: '借入金', amount: 150000 },
  ],
  equity: [
    { label: '資本金', amount: 500000 },
    { label: '繰越利益剰余金', amount: 100000 },
  ],
};
export const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + x.amount, 0);

export function BSFigure() {
  const a = sum(BS_EXAMPLE.assets);
  const l = sum(BS_EXAMPLE.liabilities);
  const e = sum(BS_EXAMPLE.equity);
  return (
    <figure className="fig">
      <figcaption>貸借対照表の骨格：左の資産合計と、右の負債・純資産合計は必ず一致する（資産 ＝ 負債 ＋ 純資産）</figcaption>
      <div className="bs-grid">
        <table className="fig-table" aria-label="貸借対照表の資産の部">
          <thead><tr><th colSpan={2}>資産</th></tr></thead>
          <tbody>
            {BS_EXAMPLE.assets.map((x) => <tr key={x.label}><td>{x.label}</td><td className="num">￥{x.amount.toLocaleString('ja-JP')}</td></tr>)}
            <tr className="fig-total"><td>資産合計</td><td className="num">￥{a.toLocaleString('ja-JP')}</td></tr>
          </tbody>
        </table>
        <table className="fig-table" aria-label="貸借対照表の負債・純資産の部">
          <thead><tr><th colSpan={2}>負債</th></tr></thead>
          <tbody>
            {BS_EXAMPLE.liabilities.map((x) => <tr key={x.label}><td>{x.label}</td><td className="num">￥{x.amount.toLocaleString('ja-JP')}</td></tr>)}
            <tr className="fig-total"><td>負債合計</td><td className="num">￥{l.toLocaleString('ja-JP')}</td></tr>
          </tbody>
          <thead><tr><th colSpan={2}>純資産</th></tr></thead>
          <tbody>
            {BS_EXAMPLE.equity.map((x) => <tr key={x.label}><td>{x.label}</td><td className="num">￥{x.amount.toLocaleString('ja-JP')}</td></tr>)}
            <tr className="fig-total"><td>純資産合計</td><td className="num">￥{e.toLocaleString('ja-JP')}</td></tr>
            <tr className="fig-total"><td>負債・純資産合計</td><td className="num">￥{(l + e).toLocaleString('ja-JP')}</td></tr>
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export const PL_EXAMPLE = {
  revenues: [{ label: '売上', amount: 800000 }],
  expenses: [
    { label: '売上原価', amount: 500000 },
    { label: '給料', amount: 150000 },
    { label: '家賃', amount: 70000 },
  ],
};

export function PLFigure() {
  const r = sum(PL_EXAMPLE.revenues);
  const x = sum(PL_EXAMPLE.expenses);
  return (
    <figure className="fig">
      <figcaption>損益計算書の骨格：収益 − 費用 ＝ 当期純利益。この利益は貸借対照表の繰越利益剰余金へつながる</figcaption>
      <table className="fig-table" aria-label="損益計算書の例">
        <tbody>
          {PL_EXAMPLE.revenues.map((v) => <tr key={v.label}><td>{v.label}（収益）</td><td className="num">￥{v.amount.toLocaleString('ja-JP')}</td></tr>)}
          {PL_EXAMPLE.expenses.map((v) => <tr key={v.label}><td>{v.label}（費用）</td><td className="num">△￥{v.amount.toLocaleString('ja-JP')}</td></tr>)}
          <tr className="fig-total"><td>当期純利益</td><td className="num">￥{(r - x).toLocaleString('ja-JP')}</td></tr>
        </tbody>
      </table>
    </figure>
  );
}

/** レッスンID → 概要段階に表示する図表 */
export function LessonFigure({ lessonId }: { lessonId: string }) {
  switch (lessonId) {
    case 'L01': return (<><FiveElementsFigure /><TAccountFigure /></>);
    case 'L02': return <TAccountFigure />;
    case 'L03': return <FlowFigure />;
    case 'L13': return <FlowFigure />;
    case 'L15': return (<><BSFigure /><PLFigure /></>);
    default: return null;
  }
}
