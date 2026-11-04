// 2027年度「商業簿記 標準・許容勘定科目表（2〜3級）」および3級出題区分に基づく科目マスタ。
// 区分表に載るだけでは3級範囲と断定しない。手形・小切手関係の科目（受取手形・支払手形等）は
// 2027年度改定で紙媒体の手形・小切手が廃止され区分表から削除されたため、3級の出題対象に含めない。
export interface AccountInfo {
  name: string;
  category: '資産' | '負債' | '純資産' | '収益' | '費用' | 'その他';
  normalSide: 'debit' | 'credit';
  statement: '貸借対照表' | '損益計算書' | '―';
}

export const ACCOUNTS: AccountInfo[] = [
  // 資産
  { name: '現金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '小口現金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '普通預金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '当座預金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '現金過不足', category: 'その他', normalSide: 'debit', statement: '―' },
  { name: '売掛金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '電子記録債権', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: 'クレジット売掛金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '貸倒引当金', category: '資産', normalSide: 'credit', statement: '貸借対照表' },
  { name: '商品', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '繰越商品', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '貯蔵品', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '貸付金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '未収入金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '前払金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '立替金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '仮払金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '差入保証金', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '受取商品券', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '建物', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '備品', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '車両運搬具', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '土地', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '建物減価償却累計額', category: '資産', normalSide: 'credit', statement: '貸借対照表' },
  { name: '備品減価償却累計額', category: '資産', normalSide: 'credit', statement: '貸借対照表' },
  { name: '車両運搬具減価償却累計額', category: '資産', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未収家賃', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '前払家賃', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '前払利息', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '未収利息', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  // 負債
  { name: '買掛金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '電子記録債務', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '借入金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '当座借越', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '前受金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '預り金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '仮受金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払法人税等', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払消費税', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '仮受消費税', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '仮払消費税', category: '資産', normalSide: 'debit', statement: '貸借対照表' },
  { name: '前受家賃', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払家賃', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払利息', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払給料', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '前受利息', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '発行商品券', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  { name: '未払配当金', category: '負債', normalSide: 'credit', statement: '貸借対照表' },
  // 純資産
  { name: '資本金', category: '純資産', normalSide: 'credit', statement: '貸借対照表' },
  { name: '繰越利益剰余金', category: '純資産', normalSide: 'credit', statement: '貸借対照表' },
  { name: '利益準備金', category: '純資産', normalSide: 'credit', statement: '貸借対照表' },
  // 収益
  { name: '売上', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '受取手数料', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '受取家賃', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '受取地代', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '受取利息', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '償却債権取立益', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '固定資産売却益', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  { name: '雑益', category: '収益', normalSide: 'credit', statement: '損益計算書' },
  // 費用
  { name: '仕入', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '売上原価', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '給料', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '法定福利費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '広告宣伝費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '旅費交通費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '通信費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '消耗品費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '水道光熱費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '支払家賃', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '支払地代', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '雑費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '貸倒損失', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '貸倒引当金繰入', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '支払利息', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '減価償却費', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '固定資産売却損', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '固定資産除却損', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '租税公課', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '法人税・住民税及び事業税', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '支払手数料', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  { name: '雑損', category: '費用', normalSide: 'debit', statement: '損益計算書' },
  // 決算用
  { name: '損益', category: 'その他', normalSide: 'debit', statement: '―' },
];

export const ACCOUNT_NAMES = ACCOUNTS.map((a) => a.name);
export const ACCOUNT_MAP = new Map(ACCOUNTS.map((a) => [a.name, a]));

/** 科目プルダウン用：正答科目＋同分類・近縁の攪乱科目を五十音順で返す */
export function buildAccountPool(answerAccounts: string[], extras: string[] = []): string[] {
  const set = new Set<string>([...answerAccounts, ...extras]);
  const cats = new Set(answerAccounts.map((n) => ACCOUNT_MAP.get(n)?.category).filter(Boolean));
  for (const a of ACCOUNTS) {
    if (set.size >= 16) break;
    if (cats.has(a.category) && a.category !== 'その他') set.add(a.name);
  }
  return [...set].sort((x, y) => x.localeCompare(y, 'ja'));
}
