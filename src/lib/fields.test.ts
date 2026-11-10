import { describe, expect, it } from 'vitest';
import { amountIsCorrect, grade } from './fields';
import { ALL_QUESTIONS } from '../data';

describe('amountIsCorrect（金額の正誤判定の契約）', () => {
  it('数字のみは正解', () => {
    expect(amountIsCorrect('12000', 12000)).toBe(true);
    expect(amountIsCorrect(' 12000 ', 12000)).toBe(true);
    expect(amountIsCorrect('１２０００', 12000)).toBe(true); // 全角数字は読み替える
  });
  it('カンマ・円記号・文字・符号・小数点は数値が合っても不正解', () => {
    expect(amountIsCorrect('12,000', 12000)).toBe(false);
    expect(amountIsCorrect('12000円', 12000)).toBe(false);
    expect(amountIsCorrect('￥12000', 12000)).toBe(false);
    expect(amountIsCorrect('-12000', 12000)).toBe(false);
    expect(amountIsCorrect('12000.0', 12000)).toBe(false);
    expect(amountIsCorrect('', 12000)).toBe(false);
    expect(amountIsCorrect('12001', 12000)).toBe(false);
  });
  it('演習の採点でも同じ契約が効く', () => {
    const q = ALL_QUESTIONS.find((x) => x.journal && x.journal.length === 2)!;
    const fields = q.journal!.map((l, i) => ({ side: l.side, account: l.account, amount: l.amount, i }));
    const answers: Record<string, string> = {};
    let d = 0, c = 0;
    for (const l of fields) {
      const side = l.side === 'debit' ? `d${d++}` : `c${c++}`;
      answers[`${side}-account`] = l.account;
      answers[`${side}-amount`] = `${l.amount.toLocaleString('ja-JP')}円`;
    }
    const g = grade(q, answers);
    expect(g.allCorrect).toBe(false);
  });
});
