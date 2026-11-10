import { describe, expect, it } from 'vitest';
import { BS_EXAMPLE, FIVE_ELEMENTS, PL_EXAMPLE, T_ACCOUNT_EXAMPLE, sum, tAccountBalance } from './Figures';
import { applyNoCalc, pickQuestions } from './lib/shuffle';
import { ALL_QUESTIONS } from './data';

describe('教材図表の数値検証', () => {
  it('貸借対照表の例は 資産合計 = 負債合計 + 純資産合計', () => {
    expect(sum(BS_EXAMPLE.assets)).toBe(sum(BS_EXAMPLE.liabilities) + sum(BS_EXAMPLE.equity));
    expect(sum(BS_EXAMPLE.assets)).toBe(1000000);
  });
  it('損益計算書の例は 収益 - 費用 = 当期純利益（正の値）', () => {
    const profit = sum(PL_EXAMPLE.revenues) - sum(PL_EXAMPLE.expenses);
    expect(profit).toBe(80000);
  });
  it('T勘定の例は 借方合計 - 貸方合計 = 残高120,000', () => {
    expect(tAccountBalance(T_ACCOUNT_EXAMPLE.debits, T_ACCOUNT_EXAMPLE.credits)).toBe(120000);
  });
  it('5要素は増える側と減る側がすべて逆', () => {
    for (const e of FIVE_ELEMENTS) expect(e.inc).not.toBe(e.dec);
    expect(FIVE_ELEMENTS.map((e) => e.name)).toEqual(['資産', '負債', '純資産', '収益', '費用']);
  });
});

describe('出題プールの共通処理', () => {
  it('applyNoCalc は計算不要の問題だけを残す（全入口共通の適用点）', () => {
    const pool = applyNoCalc(ALL_QUESTIONS, true);
    expect(pool.length).toBe(279);
    expect(pool.every((q) => !q.needsCalc)).toBe(true);
    expect(applyNoCalc(ALL_QUESTIONS, false).length).toBe(ALL_QUESTIONS.length);
  });
  it('pickQuestions のシャッフルOFFはプールの順序を保つ', () => {
    const pool = ALL_QUESTIONS.slice(0, 50);
    const picked = pickQuestions(pool, { count: 10, shuffle: false });
    expect(picked.map((q) => q.id)).toEqual(pool.slice(0, 10).map((q) => q.id));
  });
  it('pickQuestions は重複なく指定件数を返す（複数シード）', () => {
    for (const seed of [3, 99, 12345]) {
      const picked = pickQuestions(ALL_QUESTIONS, { count: 20, seed });
      expect(picked.length).toBe(20);
      expect(new Set(picked.map((q) => q.id)).size).toBe(20);
    }
  });
});
