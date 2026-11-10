import { describe, expect, it } from 'vitest';
import { ALL_QUESTIONS } from '../data';
import { fieldsForQuestion } from './fields';
import { buildExam, gradeExam, GRADING_VERSION, SECTION_MAX, type ExamPaper } from './exam';

// 期待値はアプリの採点実装からではなく、指令書の採点原則（欄の正誤→按分、全欄正解のみ満点）から手で導く
function correctAnswers(paper: ExamPaper): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const item of paper.items) {
    out[item.question.id] = Object.fromEntries(item.fields.map((f) => [f.key, String(f.answer)]));
  }
  return out;
}

describe('模試採点（方式バージョン2、BOKI-01対応）', () => {
  it('採点方式の版は2', () => {
    expect(GRADING_VERSION).toBe(2);
  });

  it('固定模試は全10回とも配点構成が 45/25/30 = 100点', () => {
    for (let n = 1; n <= 10; n++) {
      const paper = buildExam(ALL_QUESTIONS, 'fixed', n);
      const sum = (s: string) => paper.items.filter((i) => i.section === s).reduce((a, i) => a + i.sectionPoints, 0);
      expect(sum('q1')).toBe(SECTION_MAX.q1);
      expect(sum('q2')).toBe(SECTION_MAX.q2);
      expect(sum('q3')).toBe(SECTION_MAX.q3);
    }
  });

  it('全問正答で100点、全問未回答で0点', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 1);
    expect(gradeExam(paper, correctAnswers(paper)).total).toBe(100);
    expect(gradeExam(paper, {}).total).toBe(0);
  });

  it('最後の1欄だけ間違えても満点にならず、正解としても記録されない（0点欄の欠陥の回帰）', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 1);
    const target = paper.items.find((i) => i.section === 'q1' && i.fields.length === 4)!;
    expect(target).toBeTruthy();
    const answers = correctAnswers(paper);
    const last = target.fields[target.fields.length - 1]!;
    answers[target.question.id]![last.key] = last.kind === 'amount' ? String(Number(last.answer) + 1) : '現金';
    if (last.kind !== 'amount' && String(last.answer) === '現金') answers[target.question.id]![last.key] = '普通預金';
    const r = gradeExam(paper, answers);
    const pq = r.perQuestion[target.question.id]!;
    expect(pq.correct).toBe(false);
    expect(pq.got).toBeLessThan(target.sectionPoints);
    // 4欄中3欄正解・満点3点 → floor(3*3/4) = 2点が手計算の期待値
    expect(pq.got).toBe(2);
    expect(r.total).toBe(99);
  });

  it('欄の正誤に応じた按分（手計算の期待値）', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 2);
    const target = paper.items.find((i) => i.section === 'q1' && i.fields.length === 4)!;
    const answers = correctAnswers(paper);
    const a = answers[target.question.id]!;
    // 2欄だけ正解にする
    target.fields.forEach((f, i) => { if (i >= 2) a[f.key] = f.kind === 'amount' ? '1' : '存在しない科目'; });
    const pq = gradeExam(paper, answers).perQuestion[target.question.id]!;
    expect(pq.correctCount).toBe(2);
    expect(pq.got).toBe(1); // floor(3 * 2/4)
    expect(pq.correct).toBe(false);
  });

  it('同一科目の同側重複は模試でも不正解になる', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 3);
    const target = paper.items.find((i) => i.question.journal && i.fields.filter((f) => f.kind === 'account' && f.key.startsWith('d')).length >= 2)!;
    expect(target).toBeTruthy();
    const answers = correctAnswers(paper);
    const a = answers[target.question.id]!;
    const debitAccounts = target.fields.filter((f) => f.kind === 'account' && f.key.startsWith('d'));
    a[debitAccounts[1]!.key] = a[debitAccounts[0]!.key]!;
    const pq = gradeExam(paper, answers).perQuestion[target.question.id]!;
    expect(pq.correct).toBe(false);
    expect(pq.fieldResults[debitAccounts[0]!.key]).toBe(false);
    expect(pq.fieldResults[debitAccounts[1]!.key]).toBe(false);
  });

  it('金額欄にカンマや円記号が入ると、数値が合っていても不正解（公式の数字のみ注意と同一契約）', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 1);
    const target = paper.items.find((i) => i.fields.some((f) => f.kind === 'amount'))!;
    const answers = correctAnswers(paper);
    const amt = target.fields.find((f) => f.kind === 'amount')!;
    answers[target.question.id]![amt.key] = `${Number(amt.answer).toLocaleString('ja-JP')}円`;
    const pq = gradeExam(paper, answers).perQuestion[target.question.id]!;
    expect(pq.fieldResults[amt.key]).toBe(false);
    expect(pq.correct).toBe(false);
  });

  it('全設問で「全欄正解=満点」「誤答あり=満点未満」が成り立つ（全10回・プロパティ検証）', () => {
    for (let n = 1; n <= 10; n++) {
      const paper = buildExam(ALL_QUESTIONS, 'fixed', n);
      const answers = correctAnswers(paper);
      const first = paper.items[0]!;
      const f0 = first.fields[0]!;
      answers[first.question.id]![f0.key] = f0.kind === 'amount' ? String(Number(f0.answer) + 7) : '存在しない科目';
      const r = gradeExam(paper, answers);
      for (const item of paper.items) {
        const pq = r.perQuestion[item.question.id]!;
        if (item.question.id === first.question.id) {
          expect(pq.got).toBeLessThan(item.sectionPoints);
          expect(pq.correct).toBe(false);
        } else {
          expect(pq.got).toBe(item.sectionPoints);
          expect(pq.correct).toBe(true);
        }
      }
    }
  });

  it('解答欄に0点の配点を持たない（旧方式の assignPoints を使わない）', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 1);
    for (const item of paper.items) {
      expect(item.fields.length).toBe(fieldsForQuestion(item.question).length);
      expect(item.fields.every((f) => f.points === 0)).toBe(true);
    }
  });
});
