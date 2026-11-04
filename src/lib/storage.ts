import type { AttemptRecord, ExamRecord, PracticeDraft, UserData } from '../types';

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
    lessonStages: {},
    practiceDraft: null,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const strRec = (v: unknown): Record<string, string> => {
  if (!isObj(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) if (typeof val === 'string') out[k] = val;
  return out;
};

/** 要素の形状まで検証し、壊れた要素は捨てて正常な要素だけを残す（監査F1対応） */
function sanitizeAttempts(v: unknown): AttemptRecord[] {
  if (!Array.isArray(v)) return [];
  const out: AttemptRecord[] = [];
  for (const a of v) {
    if (!isObj(a) || typeof a.questionId !== 'string') continue;
    out.push({
      questionId: a.questionId,
      at: num(a.at),
      correct: a.correct === true,
      fieldCorrect: num(a.fieldCorrect),
      fieldTotal: num(a.fieldTotal),
      usedHint: a.usedHint === true,
      seconds: num(a.seconds),
      mode: a.mode === 'review' || a.mode === 'exam' ? a.mode : 'practice',
      noCalcMode: a.noCalcMode === true,
      answers: strRec(a.answers),
      ...(isObj(a.fieldResults)
        ? { fieldResults: Object.fromEntries(Object.entries(a.fieldResults).filter(([, x]) => typeof x === 'boolean')) as Record<string, boolean> }
        : {}),
    });
  }
  return out;
}

function sanitizeExams(v: unknown): ExamRecord[] {
  if (!Array.isArray(v)) return [];
  const out: ExamRecord[] = [];
  for (const e of v) {
    if (!isObj(e) || typeof e.total !== 'number') continue;
    const bs = isObj(e.bySection) ? e.bySection : {};
    const sec = (k: string) => {
      const s = isObj(bs[k]) ? (bs[k] as Record<string, unknown>) : {};
      return { got: num(s.got), max: num(s.max) };
    };
    out.push({
      at: num(e.at),
      kind: e.kind === 'random' ? 'random' : 'fixed',
      setLabel: str(e.setLabel),
      total: e.total,
      bySection: { q1: sec('q1'), q2: sec('q2'), q3: sec('q3') },
      questionIds: strArr(e.questionIds),
      ...(typeof e.seconds === 'number' ? { seconds: e.seconds } : {}),
    });
  }
  return out;
}

function sanitizePracticeDraft(v: unknown): PracticeDraft | null {
  if (!isObj(v) || !Array.isArray(v.ids)) return null;
  const gradedAnswers: Record<string, Record<string, string>> = {};
  if (isObj(v.gradedAnswers)) for (const [k, val] of Object.entries(v.gradedAnswers)) gradedAnswers[k] = strRec(val);
  const usedHints: Record<string, boolean> = {};
  if (isObj(v.usedHints)) for (const [k, val] of Object.entries(v.usedHints)) if (typeof val === 'boolean') usedHints[k] = val;
  return {
    ids: strArr(v.ids),
    mode: v.mode === 'review' ? 'review' : 'practice',
    idx: Math.max(0, Math.floor(num(v.idx))),
    gradedAnswers,
    currentAnswers: strRec(v.currentAnswers),
    usedHints,
    savedAt: num(v.savedAt),
  };
}

/** 旧形式からの移行・欠損フィールド補完を行い、壊れたデータでは既定値に落とす */
export function migrate(raw: unknown): UserData {
  const base = defaultUserData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<UserData> & Record<string, unknown>;
  const s: Record<string, unknown> = isObj(r.settings) ? (r.settings as Record<string, unknown>) : {};
  const theme = s.theme === 'light' || s.theme === 'dark' || s.theme === 'auto' ? s.theme : 'auto';
  const fontScaleRaw = num(s.fontScale as unknown, 1);
  const fontScale = Math.min(1.3, Math.max(0.85, fontScaleRaw || 1));
  const draftRaw = isObj(r.draft) ? r.draft : null;
  const draft = draftRaw && typeof draftRaw.kind === 'string' && isObj(draftRaw.payload)
    ? { kind: draftRaw.kind, payload: draftRaw.payload, savedAt: num(draftRaw.savedAt) }
    : null;
  const lessonStages: Record<string, string> = {};
  if (isObj(r.lessonStages)) for (const [k, val] of Object.entries(r.lessonStages)) if (typeof val === 'string') lessonStages[k] = val;
  return {
    schemaVersion: SCHEMA_VERSION,
    attempts: sanitizeAttempts(r.attempts),
    exams: sanitizeExams(r.exams),
    bookmarks: strArr(r.bookmarks),
    lessonsDone: strArr(r.lessonsDone),
    recentQuestionIds: strArr(r.recentQuestionIds),
    settings: {
      theme,
      fontScale,
      examDate: str(s.examDate),
      dailyGoalMinutes: Math.max(1, Math.floor(num(s.dailyGoalMinutes as unknown, 30)) || 30),
      noCalcMode: s.noCalcMode === true,
    },
    draft,
    lessonStages,
    practiceDraft: sanitizePracticeDraft(r.practiceDraft),
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
