import type { Question } from '../types';
import { QUESTIONS_A } from './questions-a';
import { QUESTIONS_B } from './questions-b';
import { QUESTIONS_C } from './questions-c';
import { QUESTIONS_D } from './questions-d';
import { GENERATED_1 } from './generated1';
import { GENERATED_2 } from './generated2';
import { GENERATED_3 } from './generated3';
import { GENERATED_4 } from './generated4';
import { LESSONS } from './lessons';
import { GLOSSARY } from './glossary';

const RAW_QUESTIONS: Question[] = [
  ...QUESTIONS_A, ...QUESTIONS_B, ...QUESTIONS_C, ...QUESTIONS_D, ...GENERATED_1, ...GENERATED_2, ...GENERATED_3, ...GENERATED_4,
];
// 重複問題の除去（指示書6.3）: 問題文が完全一致するものは先勝ちで1件だけ残す
export const ALL_QUESTIONS: Question[] = (() => {
  const seen = new Set<string>();
  return RAW_QUESTIONS.filter((q) => {
    if (seen.has(q.prompt)) return false;
    seen.add(q.prompt);
    return true;
  });
})();
export const QUESTION_MAP = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
export const INDEPENDENT_QUESTIONS = ALL_QUESTIONS.filter((q) => !q.parentId);
export const DERIVED_QUESTIONS = ALL_QUESTIONS.filter((q) => q.parentId);
export { LESSONS, GLOSSARY };
export const LESSON_MAP = new Map(LESSONS.map((l) => [l.id, l]));

export const TOPICS: { topic: string; syllabus: string }[] = (() => {
  const seen = new Map<string, string>();
  for (const q of ALL_QUESTIONS) if (!seen.has(q.topic)) seen.set(q.topic, q.syllabus);
  return [...seen.entries()].map(([topic, syllabus]) => ({ topic, syllabus })).sort((a, b) => a.topic.localeCompare(b.topic));
})();
