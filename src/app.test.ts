import { describe, expect, it } from 'vitest';
import { ALL_QUESTIONS, GLOSSARY, LESSONS } from './data';
import { ACCOUNT_MAP, ACCOUNTS } from './data/accounts';
import { fieldsForQuestion, grade, journalBalance, normalizeAmountInput } from './lib/fields';
import { mulberry32, pickQuestions, shuffle } from './lib/shuffle';
import { buildExam, gradeExam, SECTION_MAX } from './lib/exam';
import { migrate, defaultUserData } from './lib/storage';
import { reviewQueue, topicStats } from './lib/analytics';
import type { Question } from './types';

const FORBIDDEN_ACCOUNTS = ['受取手形', '支払手形', '手形', '小切手'];

describe('問題データ全体の整合性', () => {
  it('IDが一意である', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('全問題が検証済みで2027年度適用である', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.verified, q.id).toBe(true);
      expect(q.examYear, q.id).toBe(2027);
      expect(q.prompt.length, q.id).toBeGreaterThan(10);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      expect(q.hints.length, q.id).toBeGreaterThanOrEqual(1);
    }
  });
  it('仕訳問題は借方合計と貸方合計が一致し、科目が実在する', () => {
    let checked = 0;
    for (const q of ALL_QUESTIONS) {
      if (!q.journal) continue;
      checked++;
      const b = journalBalance(q.journal);
      expect(b.balanced, `${q.id}: debit=${b.debit} credit=${b.credit}`).toBe(true);
      for (const l of q.journal) {
        expect(ACCOUNT_MAP.has(l.account), `${q.id}: unknown account ${l.account}`).toBe(true);
        expect(l.amount, q.id).toBeGreaterThan(0);
      }
    }
    expect(checked).toBeGreaterThan(200);
  });
  it('fields問題は正答が選択肢に含まれ、金額が正値である', () => {
    for (const q of ALL_QUESTIONS) {
      if (!q.fields) continue;
      for (const f of q.fields) {
        if (f.kind === 'amount') expect(Number(f.answer), `${q.id}/${f.key}`).toBeGreaterThan(0);
        else expect(f.options, `${q.id}/${f.key}`).toContain(String(f.answer));
      }
    }
  });
  it('解答欄が生成できる問題だけが存在する', () => {
    for (const q of ALL_QUESTIONS) expect(fieldsForQuestion(q).length, q.id).toBeGreaterThan(0);
  });
  it('手形・小切手の科目を出題していない（2027年度改定）', () => {
    for (const q of ALL_QUESTIONS) {
      for (const a of q.accounts) expect(FORBIDDEN_ACCOUNTS, `${q.id}:${a}`).not.toContain(a);
      if (q.journal) for (const l of q.journal) expect(FORBIDDEN_ACCOUNTS).not.toContain(l.account);
    }
  });
  it('重複した問題文がない（派生は親が異なる場合のみ許可）', () => {
    const seen = new Map<string, Question>();
    for (const q of ALL_QUESTIONS) {
      const prev = seen.get(q.prompt);
      if (prev) expect(prev.parentId, `dup prompt: ${prev.id} / ${q.id}`).toBe(q.parentId);
      seen.set(q.prompt, q);
    }
  });
  it('計算不要問題には計算タイプが付いていない／計算問題には付いている', () => {
    for (const q of ALL_QUESTIONS) {
      if (q.needsCalc) expect(q.calcType, q.id).toBeTruthy();
    }
  });
});

describe('計算問題除外モードのフィルタ', () => {
  it('needsCalc=false の問題だけが残り、十分な数が存在する', () => {
    const noc = ALL_QUESTIONS.filter((q) => !q.needsCalc);
    expect(noc.length).toBeGreaterThan(150);
    expect(noc.every((q) => !q.needsCalc)).toBe(true);
  });
});

describe('シャッフルと出題選定', () => {
  it('同じシードでは同じ順序、異なるシードでは（通常）異なる順序になる', () => {
    const base = Array.from({ length: 30 }, (_, i) => i);
    const a = shuffle(base, mulberry32(42));
    const b = shuffle(base, mulberry32(42));
    const c = shuffle(base, mulberry32(7));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect([...a].sort((x, y) => x - y)).toEqual(base);
  });
  it('pickQuestionsはセット内で重複せず、直近出題を避ける', () => {
    const pool = ALL_QUESTIONS.slice(0, 50);
    const recent = pool.slice(0, 40).map((q) => q.id);
    const picked = pickQuestions(pool, { count: 10, recentIds: recent, seed: 99 });
    expect(new Set(picked.map((q) => q.id)).size).toBe(10);
    expect(picked.every((q) => !recent.includes(q.id))).toBe(true);
  });
});

describe('採点', () => {
  const sample = ALL_QUESTIONS.find((q) => q.journal)!;
  it('全欄正答で正解になる', () => {
    const fields = fieldsForQuestion(sample);
    const answers: Record<string, string> = {};
    for (const f of fields) answers[f.key] = String(f.answer);
    const g = grade(sample, answers);
    expect(g.allCorrect).toBe(true);
    expect(g.earnedPoints).toBe(g.maxPoints);
  });
  it('未回答は不正解になる', () => {
    const g = grade(sample, {});
    expect(g.allCorrect).toBe(false);
    expect(g.correctCount).toBe(0);
  });
  it('金額入力は数字以外を除去して判定する', () => {
    expect(normalizeAmountInput('￥12,000円')).toBe('12000');
  });
  it('同じ科目を同じ側で2回使うと公式ルールで当該欄が不正解になる', () => {
    const multi = ALL_QUESTIONS.find((q) => q.journal && q.journal.filter((l) => l.side === 'debit').length >= 2);
    if (!multi) return;
    const fields = fieldsForQuestion(multi);
    const answers: Record<string, string> = {};
    for (const f of fields) answers[f.key] = String(f.answer);
    const debitAccountFields = fields.filter((f) => f.kind === 'account' && f.key.startsWith('d'));
    answers[debitAccountFields[1]!.key] = String(debitAccountFields[0]!.answer);
    const g = grade(multi, answers);
    expect(g.fieldResults[debitAccountFields[0]!.key]).toBe(false);
    expect(g.fieldResults[debitAccountFields[1]!.key]).toBe(false);
  });
});

describe('模擬試験', () => {
  it('固定模試10回すべてが配点どおりに構成される（45/25/30）', () => {
    for (let setNo = 1; setNo <= 10; setNo++) {
      const paper = buildExam(ALL_QUESTIONS, 'fixed', setNo, 5000 + setNo);
      const sums = { q1: 0, q2: 0, q3: 0 };
      for (const item of paper.items) sums[item.section] += item.sectionPoints;
      expect(sums, `set ${setNo}`).toEqual(SECTION_MAX);
      const ids = paper.items.map((i) => i.question.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it('全問正答で100点になる', () => {
    const paper = buildExam(ALL_QUESTIONS, 'random', 1, 12345);
    const answers: Record<string, Record<string, string>> = {};
    for (const item of paper.items) {
      answers[item.question.id] = {};
      for (const f of item.fields) answers[item.question.id][f.key] = String(f.answer);
    }
    const r = gradeExam(paper, answers);
    expect(r.total).toBe(100);
  });
  it('模試には計算問題も含まれる（除外モードを適用しない）', () => {
    const paper = buildExam(ALL_QUESTIONS, 'random', 1, 777);
    expect(paper.items.some((i) => i.question.needsCalc)).toBe(true);
  });
});

describe('保存と移行', () => {
  it('壊れたデータ・旧データでも既定値へ安全に移行する', () => {
    expect(migrate(null).schemaVersion).toBe(defaultUserData().schemaVersion);
    const m = migrate({ attempts: [{ questionId: 'x' }] });
    expect(m.attempts.length).toBe(1);
    expect(m.settings.theme).toBe('auto');
  });
});

describe('分析', () => {
  it('復習キューは誤答を最優先する', () => {
    const q = ALL_QUESTIONS[0]!;
    const attempts = [{ questionId: q.id, at: Date.now(), correct: false, fieldCorrect: 0, fieldTotal: 2, usedHint: false, seconds: 10, mode: 'practice' as const, noCalcMode: false, answers: {} }];
    const queue = reviewQueue(attempts, [q.id]);
    expect(queue.length).toBe(1);
    expect(queue[0]!.reason).toContain('誤答');
  });
  it('習熟度は0〜100に収まる', () => {
    const stats = topicStats([], new Map());
    expect(stats).toEqual([]);
  });
});

describe('教材と辞典', () => {
  it('教材は16レッスンで4段階解説がすべて存在する', () => {
    expect(LESSONS.length).toBe(16);
    for (const l of LESSONS) {
      expect(l.stages.overview.length, l.id).toBeGreaterThan(30);
      expect(l.stages.detail.length, l.id).toBeGreaterThan(80);
      expect(l.stages.expert.length, l.id).toBeGreaterThan(40);
      expect(l.stages.practice.length, l.id).toBeGreaterThan(40);
      if (l.exampleJournal) expect(journalBalance(l.exampleJournal).balanced, l.id).toBe(true);
    }
  });
  it('辞典は科目マスタの全科目を収録する', () => {
    const gacc = new Set(GLOSSARY.filter((g) => g.kind === 'account').map((g) => g.term));
    for (const a of ACCOUNTS) expect(gacc.has(a.name), `glossary missing ${a.name}`).toBe(true);
  });
  it('辞典の科目例示仕訳は貸借一致し、用語が100件以上ある', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(100);
    for (const g of GLOSSARY) {
      if (g.exampleJournal) expect(journalBalance(g.exampleJournal).balanced, g.term).toBe(true);
      expect(g.short.length, g.term).toBeGreaterThan(5);
      expect(g.detail.length, g.term).toBeGreaterThan(20);
    }
  });
});

describe('監査回帰（2026-11-04 品質監査の指摘対応）', () => {
  it('計算不要の仕訳問題は、問題文に正答金額が明示されている（解答不能問題の再発防止）', () => {
    for (const q of ALL_QUESTIONS) {
      if (!q.journal || q.needsCalc) continue;
      const text = q.prompt.replace(/[,，￥¥\s]/g, '');
      for (const line of q.journal) {
        expect(text.includes(String(line.amount)), `${q.id}: 金額 ${line.amount} が問題文にない`).toBe(true);
      }
    }
  });
  it('貸付金の回収問題で売上を正答にしていない', () => {
    for (const q of ALL_QUESTIONS) {
      if (!q.journal || !q.prompt.includes('貸付金')) continue;
      if (!q.prompt.includes('回収')) continue;
      const credits = q.journal.filter((l) => l.side === 'credit').map((l) => l.account);
      expect(credits, q.id).not.toContain('売上');
    }
  });
  it('前払家賃の決算整理は、問題文の支払月から導ける未経過月数と正答が一致する', () => {
    const targets = ALL_QUESTIONS.filter((q) => q.id.includes('accrual-deferral') && q.prompt.includes('前払い'));
    expect(targets.length).toBeGreaterThan(0);
    for (const q of targets) {
      const m = /毎年(\d+)月1日に1年分/.exec(q.prompt);
      if (!m) continue; // 支払月が明記されていない形式（月数が直接書かれている等）は対象外
      const startMonth = Number(m[1]);
      // 支払月から始まる12か月のうち、3月31日時点で未経過な月数（4月開始→0、7月開始→3、10月開始→6）
      const remaining = (startMonth + 8) % 12;
      const annual = Number((/￥([\d,]+)/.exec(q.prompt)?.[1] ?? '0').replace(/,/g, ''));
      const expected = Math.round(annual * remaining / 12);
      const debit = q.journal?.find((l) => l.account === '前払家賃');
      expect(debit?.amount, `${q.id}: 未経過${remaining}か月のはず`).toBe(expected);
    }
  });
  it('商品有高帳の問題に存在しない日付が含まれていない', () => {
    for (const q of ALL_QUESTIONS) {
      for (const m of q.prompt.matchAll(/(\d{1,2}) 月 (\d{1,2}) 日/g)) {
        const month = Number(m[1]);
        const day = Number(m[2]);
        const maxDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
        expect(day, `${q.id}: ${month}月${day}日`).toBeLessThanOrEqual(maxDay);
      }
    }
  });
  it('模試採点でも同一科目の同側重複使用は不正解になる（演習採点と同一ルール）', () => {
    const paper = buildExam(ALL_QUESTIONS, 'fixed', 1, 42);
    const item = paper.items.find((i) => i.question.journal && i.fields.filter((f) => f.kind === 'account' && f.key.startsWith('d')).length >= 2);
    expect(item, '重複テストに使える仕訳問題があること').toBeTruthy();
    const answers: Record<string, string> = {};
    const fields = item!.fields;
    for (const f of fields) answers[f.key] = String(f.answer);
    const dAcc = fields.filter((f) => f.kind === 'account' && f.key.startsWith('d'));
    answers[dAcc[1]!.key] = answers[dAcc[0]!.key]!; // 借方で同じ科目を2回使う
    const result = gradeExam(paper, { [item!.question.id]: answers });
    const fr = result.perQuestion[item!.question.id]!.fieldResults;
    expect(fr[dAcc[0]!.key]).toBe(false);
    expect(fr[dAcc[1]!.key]).toBe(false);
  });
  it('壊れた形状の保存データでも例外なくサニタイズされる', () => {
    const corrupt = {
      attempts: [null, 42, {}, { questionId: 'q1', at: 1, correct: true, fieldCorrect: 2, fieldTotal: 2, answers: { a: '1' } }],
      exams: [null, { total: 80, at: 5 }],
      bookmarks: ['x', 9, null],
      settings: { theme: 'neon', fontScale: 'abc', dailyGoalMinutes: -3 },
      draft: { kind: 'exam', payload: null },
      lessonStages: { L01: 2, L02: 'x' },
      practiceDraft: { ids: 'bad' },
    };
    const d = migrate(corrupt);
    expect(d.attempts.length).toBe(1);
    expect(d.attempts[0]!.questionId).toBe('q1');
    expect(d.exams.length).toBe(1);
    expect(d.bookmarks).toEqual(['x']);
    expect(d.settings.theme).toBe('auto');
    expect(d.settings.fontScale).toBe(1);
    expect(d.draft).toBeNull();
    expect(d.practiceDraft).toBeNull();
    // サニタイズ済みデータで分析が例外を投げない
    expect(() => topicStats(d.attempts, new Map())).not.toThrow();
    expect(() => reviewQueue(d.attempts, ['q1'])).not.toThrow();
  });
  it('ヒント使用後の正解は習熟度で0.5換算される', () => {
    const q = ALL_QUESTIONS[0]!;
    const map = new Map([[q.id, q]]);
    const mk = (usedHint: boolean) => ({ questionId: q.id, at: 1, correct: true, fieldCorrect: 1, fieldTotal: 1, usedHint, seconds: 1, mode: 'practice' as const, noCalcMode: false, answers: {} });
    const withHint = topicStats([mk(true)], map);
    const without = topicStats([mk(false)], map);
    expect(withHint[0]!.mastery).toBe(50);
    expect(without[0]!.mastery).toBe(100);
    expect(withHint[0]!.hintCorrect).toBe(1);
  });
});
