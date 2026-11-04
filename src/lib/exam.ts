import type { AnswerField, Question, Section } from '../types';
import { fieldsForQuestion, duplicateInvalidatedKeys } from './fields';
import { mulberry32, shuffle } from './shuffle';

// 2027年度以降の公式配点（日本商工会議所 2026-09-25公表）: 第1問45点・第2問25点・第3問30点、合計100点、60分、合格基準70点。
export const SECTION_MAX: Record<Section, number> = { q1: 45, q2: 25, q3: 30 };
export const EXAM_MINUTES = 60;
export const PASS_LINE = 70;
export const TARGET_LINE = 95;

export interface ExamQuestion {
  question: Question;
  fields: AnswerField[];
  section: Section;
  sectionPoints: number;
}

export interface ExamPaper {
  kind: 'fixed' | 'random';
  setLabel: string;
  seed: number;
  items: ExamQuestion[];
}

/** 問題の解答欄へ配点を割り付ける（合計が sectionPoints になるよう端数は科目欄へ寄せる） */
function assignPoints(q: Question, sectionPoints: number): AnswerField[] {
  const fields = fieldsForQuestion(q).map((f) => ({ ...f }));
  if (fields.length === 0) return fields;
  const base = Math.floor(sectionPoints / fields.length);
  let rest = sectionPoints - base * fields.length;
  for (const f of fields) {
    f.points = base + (rest > 0 ? 1 : 0);
    if (rest > 0) rest--;
  }
  return fields;
}

/** 論点の偏りを避けるため、トピックでラウンドロビンに並べ替える */
function diversify(pool: Question[], rng: () => number): Question[] {
  const byTopic = new Map<string, Question[]>();
  for (const q of shuffle(pool, rng)) {
    byTopic.set(q.topic, [...(byTopic.get(q.topic) ?? []), q]);
  }
  const queues = [...byTopic.values()];
  const out: Question[] = [];
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const que of queues) {
      const q = que.shift();
      if (q) { out.push(q); progressed = true; }
    }
  }
  return out;
}

function pickForSection(all: Question[], section: Section, plan: { count: number; points: number }[], seed: number): ExamQuestion[] {
  const rng = mulberry32(seed);
  const pool = diversify(all.filter((q) => q.section === section), rng);
  const items: ExamQuestion[] = [];
  let idx = 0;
  for (const p of plan) {
    for (let i = 0; i < p.count && idx < pool.length; i++, idx++) {
      const q = pool[idx]!;
      items.push({ question: q, fields: assignPoints(q, p.points), section, sectionPoints: p.points });
    }
  }
  return items;
}

/**
 * 模擬試験を構築する。固定模試はシード固定で10回分（セット内の独立設問の順序は毎回シャッフルするが、
 * 開始後は順序を保持する）。ランダム模試は毎回新しいシードで構成・配点を維持して抽選する。
 * 計算問題除外は模試には適用しない（指示書7.4）。
 */
export function buildExam(all: Question[], kind: 'fixed' | 'random', setNo = 1, seedOverride?: number): ExamPaper {
  const seed = seedOverride ?? (kind === 'fixed' ? 20270401 + setNo * 977 : ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0));
  const q1 = pickForSection(all, 'q1', [{ count: 15, points: 3 }], seed + 11);
  const q2 = pickForSection(all, 'q2', [{ count: 1, points: 15 }, { count: 1, points: 10 }], seed + 22);
  const q3 = pickForSection(all, 'q3', [{ count: 1, points: 30 }], seed + 33);
  let items = [...q1, ...q2, ...q3];
  if (kind === 'fixed') {
    // 固定模試でも独立設問の提示順はシードを変えてシャッフルする（大問構造は維持）
    const rng = mulberry32(((Date.now() % 100000) ^ seed) >>> 0);
    const s1 = shuffle(items.filter((i) => i.section === 'q1'), rng);
    const s2 = shuffle(items.filter((i) => i.section === 'q2'), rng);
    const s3 = shuffle(items.filter((i) => i.section === 'q3'), rng);
    items = [...s1, ...s2, ...s3];
  }
  return { kind, setLabel: kind === 'fixed' ? `固定模試 第${setNo}回` : 'ランダム模試', seed, items };
}

export function gradeExam(paper: ExamPaper, answersByQid: Record<string, Record<string, string>>) {
  const bySection: Record<Section, { got: number; max: number }> = {
    q1: { got: 0, max: SECTION_MAX.q1 },
    q2: { got: 0, max: SECTION_MAX.q2 },
    q3: { got: 0, max: SECTION_MAX.q3 },
  };
  let total = 0;
  const perQuestion: Record<string, { got: number; max: number; fieldResults: Record<string, boolean> }> = {};
  for (const item of paper.items) {
    const answers = answersByQid[item.question.id] ?? {};
    const fieldResults: Record<string, boolean> = {};
    let got = 0;
    for (const f of item.fields) {
      const raw = (answers[f.key] ?? '').trim();
      let ok = false;
      if (f.kind === 'amount') {
        const n = raw === '' ? NaN : Number(raw.replace(/[^0-9]/g, ''));
        ok = !Number.isNaN(n) && n === Number(f.answer);
      } else ok = raw === String(f.answer);
      fieldResults[f.key] = ok;
      if (ok) got += f.points;
    }
    // 公式の解答規則（同一科目の同側重複使用は不正解）を演習の採点と同一ロジックで適用する
    if (item.question.journal) {
      for (const k of duplicateInvalidatedKeys(item.fields, answers)) {
        if (fieldResults[k]) { fieldResults[k] = false; got -= item.fields.find((f) => f.key === k)!.points; }
      }
    }
    perQuestion[item.question.id] = { got, max: item.sectionPoints, fieldResults };
    bySection[item.section].got += got;
    total += got;
  }
  return { total, bySection, perQuestion };
}
