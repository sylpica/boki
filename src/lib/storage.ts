import type { UserData } from '../types';

const KEY = 'boki-userdata-v1';
export const SCHEMA_VERSION = 1;

export function defaultUserData(): UserData {
  return {
    schemaVersion: SCHEMA_VERSION,
    attempts: [],
    exams: [],
    bookmarks: [],
    lessonsDone: [],
    recentQuestionIds: [],
    settings: { theme: 'auto', fontScale: 1, examDate: '', dailyGoalMinutes: 30, noCalcMode: false },
    draft: null,
  };
}

/** 旧形式からの移行・欠損フィールド補完を行い、壊れたデータでは既定値に落とす */
export function migrate(raw: unknown): UserData {
  const base = defaultUserData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<UserData>;
  return {
    schemaVersion: SCHEMA_VERSION,
    attempts: Array.isArray(r.attempts) ? r.attempts : [],
    exams: Array.isArray(r.exams) ? r.exams : [],
    bookmarks: Array.isArray(r.bookmarks) ? r.bookmarks : [],
    lessonsDone: Array.isArray(r.lessonsDone) ? r.lessonsDone : [],
    recentQuestionIds: Array.isArray(r.recentQuestionIds) ? r.recentQuestionIds : [],
    settings: { ...base.settings, ...(r.settings ?? {}) },
    draft: r.draft ?? null,
  };
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultUserData();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultUserData();
  }
}

export function saveUserData(data: UserData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
