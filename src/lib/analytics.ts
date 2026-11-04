import type { AttemptRecord, Question } from '../types';

export interface TopicStat {
  topic: string;
  syllabus: string;
  attempts: number;
  correct: number;
  rate: number;
  /** 習熟度（説明可能な定義）: 直近の成績を重み付けした正答率。根拠のない合格予測は出さない。 */
  mastery: number;
  /** ヒントを使って正解した回数（自力正解とは区別して集計する） */
  hintCorrect: number;
}

/** 1回の解答の得点換算。ヒント使用後の正解は自力正解と区別し 0.5 として数える（R28）。 */
const scoreOf = (a: AttemptRecord): number => (a.correct ? (a.usedHint ? 0.5 : 1) : 0);

export function topicStats(attempts: AttemptRecord[], questions: Map<string, Question>): TopicStat[] {
  const byTopic = new Map<string, { syllabus: string; list: AttemptRecord[] }>();
  for (const a of attempts) {
    if (a.mode === 'exam') continue;
    const q = questions.get(a.questionId);
    if (!q) continue;
    const e = byTopic.get(q.topic) ?? { syllabus: q.syllabus, list: [] };
    e.list.push(a);
    byTopic.set(q.topic, e);
  }
  return [...byTopic.entries()].map(([topic, e]) => {
    const sorted = [...e.list].sort((x, y) => x.at - y.at);
    const correct = sorted.filter((a) => a.correct).length;
    const hintCorrect = sorted.filter((a) => a.correct && a.usedHint).length;
    // 習熟度 = 全期間の換算正答率×0.5 + 直近10件の換算正答率×0.5（ヒント使用正解は0.5換算）
    const recent = sorted.slice(-10);
    const recentRate = recent.length ? recent.reduce((s, a) => s + scoreOf(a), 0) / recent.length : 0;
    const allRate = sorted.length ? sorted.reduce((s, a) => s + scoreOf(a), 0) / sorted.length : 0;
    return {
      topic,
      syllabus: e.syllabus,
      attempts: sorted.length,
      correct,
      rate: allRate,
      mastery: Math.round((allRate * 0.5 + recentRate * 0.5) * 100),
      hintCorrect,
    };
  }).sort((a, b) => a.mastery - b.mastery);
}

/** 復習対象: 誤答、または連続正解が2回未満で古くなった問題を優先度順に返す */
export function reviewQueue(attempts: AttemptRecord[], questionIds: string[]): { id: string; priority: number; reason: string }[] {
  const byQ = new Map<string, AttemptRecord[]>();
  for (const a of attempts) {
    byQ.set(a.questionId, [...(byQ.get(a.questionId) ?? []), a]);
  }
  const out: { id: string; priority: number; reason: string }[] = [];
  for (const id of questionIds) {
    const list = (byQ.get(id) ?? []).sort((x, y) => x.at - y.at);
    if (list.length === 0) continue;
    const last = list[list.length - 1]!;
    const lastTwo = list.slice(-2);
    const streak = lastTwo.length === 2 && lastTwo.every((a) => a.correct);
    const daysSince = (Date.now() - last.at) / 86400000;
    if (!last.correct) out.push({ id, priority: 100 + Math.min(daysSince, 30), reason: '前回誤答' });
    else if (!streak) out.push({ id, priority: 50 + Math.min(daysSince, 30), reason: '連続正解が未定着' });
    else if (daysSince >= 7) out.push({ id, priority: 10 + Math.min(daysSince, 20), reason: '前回から時間が経過' });
  }
  return out.sort((a, b) => b.priority - a.priority);
}
