import type { AnswerField, JournalLine, Question } from '../types';
import { buildAccountPool } from '../data/accounts';

/** 仕訳問題から解答欄を生成する。借方欄→貸方欄の順で、科目プルダウン＋金額入力。 */
export function fieldsForQuestion(q: Question): AnswerField[] {
  if (q.fields && q.fields.length > 0) return q.fields;
  if (!q.journal) return [];
  const pool = q.accountPool ?? buildAccountPool(q.accounts);
  const fields: AnswerField[] = [];
  const debits = q.journal.filter((l) => l.side === 'debit');
  const credits = q.journal.filter((l) => l.side === 'credit');
  debits.forEach((l, i) => {
    fields.push({ key: `d${i}-account`, label: `借方${i + 1} 科目`, kind: 'account', options: pool, answer: l.account, points: 1 });
    fields.push({ key: `d${i}-amount`, label: `借方${i + 1} 金額`, kind: 'amount', answer: l.amount, points: 1 });
  });
  credits.forEach((l, i) => {
    fields.push({ key: `c${i}-account`, label: `貸方${i + 1} 科目`, kind: 'account', options: pool, answer: l.account, points: 1 });
    fields.push({ key: `c${i}-amount`, label: `貸方${i + 1} 金額`, kind: 'amount', answer: l.amount, points: 1 });
  });
  return fields;
}

/** 金額入力の正規化：数字のみを許容（公式注意事項：文字・円記号・カンマは不正解扱い） */
export function normalizeAmountInput(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

export interface GradeResult {
  fieldResults: Record<string, boolean>;
  correctCount: number;
  totalFields: number;
  allCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
}

/**
 * 公式の解答規則：同一設問で同じ勘定科目を借方内・貸方内でそれぞれ2回以上使った場合、
 * その科目欄は不正解になる。該当する科目欄のキーを返す（演習・模試で共通利用）。
 */
export function duplicateInvalidatedKeys(fields: AnswerField[], answers: Record<string, string>): Set<string> {
  const seenBySide = new Map<string, string[]>();
  for (const f of fields) {
    if (f.kind !== 'account') continue;
    const side = f.key.startsWith('d') ? 'debit' : 'credit';
    const v = (answers[f.key] ?? '').trim();
    if (!v) continue;
    const k = `${side}:${v}`;
    seenBySide.set(k, [...(seenBySide.get(k) ?? []), f.key]);
  }
  const out = new Set<string>();
  for (const keys of seenBySide.values()) if (keys.length > 1) for (const k of keys) out.add(k);
  return out;
}

export function grade(q: Question, answers: Record<string, string>): GradeResult {
  const fields = fieldsForQuestion(q);
  const fieldResults: Record<string, boolean> = {};
  let correctCount = 0;
  let earned = 0;
  let max = 0;
  for (const f of fields) {
    max += f.points;
    const raw = (answers[f.key] ?? '').trim();
    let ok = false;
    if (f.kind === 'amount') {
      const n = raw === '' ? NaN : Number(normalizeAmountInput(raw));
      ok = !Number.isNaN(n) && n === Number(f.answer);
    } else {
      ok = raw === String(f.answer);
    }
    fieldResults[f.key] = ok;
    if (ok) { correctCount++; earned += f.points; }
  }
  // 仕訳問題は科目の借方・貸方内での重複使用を公式ルールとして不正解条件に含める
  if (q.journal) {
    for (const k of duplicateInvalidatedKeys(fields, answers)) {
      if (fieldResults[k]) { fieldResults[k] = false; correctCount--; earned -= fields.find((f) => f.key === k)!.points; }
    }
  }
  return {
    fieldResults,
    correctCount,
    totalFields: fields.length,
    allCorrect: fields.length > 0 && correctCount === fields.length,
    earnedPoints: earned,
    maxPoints: max,
  };
}

export function journalBalance(journal: JournalLine[]): { debit: number; credit: number; balanced: boolean } {
  const debit = journal.filter((l) => l.side === 'debit').reduce((s, l) => s + l.amount, 0);
  const credit = journal.filter((l) => l.side === 'credit').reduce((s, l) => s + l.amount, 0);
  return { debit, credit, balanced: debit === credit && debit > 0 };
}
