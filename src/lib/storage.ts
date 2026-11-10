import type { AttemptRecord, CardSession, CardStat, ExamRecord, PracticeDraft, UserData } from '../types';

const KEY = 'boki-userdata-v1';
const BACKUP_KEY = 'boki-userdata-v1:backup';
export const SCHEMA_VERSION = 1;

export function defaultUserData(): UserData {
  return {
    schemaVersion: SCHEMA_VERSION,
    attempts: [],
    exams: [],
    bookmarks: [],
    lessonsDone: [],
    recentQuestionIds: [],
    settings: { theme: 'auto', fontScale: 1, examDate: '', dailyGoalMinutes: 30, noCalcMode: false, shufflePractice: true },
    draft: null,
    lessonStages: {},
    practiceDraft: null,
    cardBookmarks: [],
    cardStats: {},
    cardSession: null,
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
      ...(typeof e.gradingVersion === 'number' ? { gradingVersion: e.gradingVersion } : {}),
    });
  }
  return out;
}

function sanitizePracticeDraft(v: unknown): PracticeDraft | null {
  if (!isObj(v) || !Array.isArray(v.ids)) return null;
  const ids = strArr(v.ids);
  if (ids.length === 0) return null;
  const gradedAnswers: Record<string, Record<string, string>> = {};
  if (isObj(v.gradedAnswers)) for (const [k, val] of Object.entries(v.gradedAnswers)) gradedAnswers[k] = strRec(val);
  const usedHints: Record<string, boolean> = {};
  if (isObj(v.usedHints)) for (const [k, val] of Object.entries(v.usedHints)) if (typeof val === 'boolean') usedHints[k] = val;
  return {
    ids,
    mode: v.mode === 'review' ? 'review' : 'practice',
    idx: Math.min(ids.length - 1, Math.max(0, Math.floor(num(v.idx)))),
    gradedAnswers,
    currentAnswers: strRec(v.currentAnswers),
    usedHints,
    savedAt: num(v.savedAt),
  };
}

/**
 * 模試の下書きは中身まで検証する（BOKI-03）。
 * paper.items の各要素に問題ID・解答欄・配点が揃っていない下書きは、履歴を壊さず下書きだけを捨てる。
 */
function sanitizeDraft(v: unknown): UserData['draft'] {
  if (!isObj(v) || typeof v.kind !== 'string' || !isObj(v.payload)) return null;
  if (v.kind !== 'exam') return { kind: v.kind, payload: v.payload, savedAt: num(v.savedAt) };
  const p = v.payload as Record<string, unknown>;
  const paper = isObj(p.paper) ? p.paper : null;
  if (!paper || (paper.kind !== 'fixed' && paper.kind !== 'random')) return null;
  if (typeof paper.setLabel !== 'string' || !Array.isArray(paper.items) || paper.items.length === 0) return null;
  for (const it of paper.items) {
    if (!isObj(it) || !isObj(it.question) || typeof it.question.id !== 'string') return null;
    if (!Array.isArray(it.fields) || typeof it.sectionPoints !== 'number') return null;
    if (it.section !== 'q1' && it.section !== 'q2' && it.section !== 'q3') return null;
    // 解答欄の要素まで検証する（中身が壊れた欄がある下書きは再開時に描画例外になるため捨てる）
    for (const f of it.fields) {
      if (!isObj(f) || typeof f.key !== 'string' || typeof f.label !== 'string') return null;
      if (f.kind !== 'account' && f.kind !== 'amount' && f.kind !== 'select') return null;
    }
  }
  if (typeof p.startedAt !== 'number' || !Number.isFinite(p.startedAt)) return null;
  const answers: Record<string, Record<string, string>> = {};
  if (isObj(p.answers)) for (const [k, val] of Object.entries(p.answers)) answers[k] = strRec(val);
  return { kind: 'exam', payload: { paper, answers, startedAt: p.startedAt }, savedAt: num(v.savedAt) };
}

function sanitizeCardStats(v: unknown): Record<string, CardStat> {
  if (!isObj(v)) return {};
  const out: Record<string, CardStat> = {};
  for (const [k, val] of Object.entries(v)) {
    if (!k.startsWith('card:') || !isObj(val)) continue;
    out[k] = {
      seen: Math.max(0, Math.floor(num(val.seen))),
      known: Math.max(0, Math.floor(num(val.known))),
      unsure: Math.max(0, Math.floor(num(val.unsure))),
      unknown: Math.max(0, Math.floor(num(val.unknown))),
      lastSeenAt: num(val.lastSeenAt),
      dueAt: num(val.dueAt),
    };
  }
  return out;
}

function sanitizeCardSession(v: unknown): CardSession | null {
  if (!isObj(v) || !Array.isArray(v.ids)) return null;
  const ids = strArr(v.ids).filter((x) => x.startsWith('card:'));
  if (ids.length === 0) return null;
  return {
    ids,
    idx: Math.min(ids.length - 1, Math.max(0, Math.floor(num(v.idx)))),
    startSide: v.startSide === 'back' ? 'back' : 'front',
    shuffle: v.shuffle === true,
    savedAt: num(v.savedAt),
  };
}

/** 旧形式からの移行・欠損フィールド補完を行い、壊れた要素は捨てて正常な部分だけを残す */
export function migrate(raw: unknown): UserData {
  const base = defaultUserData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<UserData> & Record<string, unknown>;
  const s: Record<string, unknown> = isObj(r.settings) ? (r.settings as Record<string, unknown>) : {};
  const theme = s.theme === 'light' || s.theme === 'dark' || s.theme === 'auto' ? s.theme : 'auto';
  const fontScaleRaw = num(s.fontScale as unknown, 1);
  const fontScale = Math.min(1.3, Math.max(0.85, fontScaleRaw || 1));
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
      shufflePractice: s.shufflePractice !== false,
    },
    draft: sanitizeDraft(r.draft),
    lessonStages,
    practiceDraft: sanitizePracticeDraft(r.practiceDraft),
    cardBookmarks: strArr(r.cardBookmarks).filter((x) => x.startsWith('card:')),
    cardStats: sanitizeCardStats(r.cardStats),
    cardSession: sanitizeCardSession(r.cardSession),
  };
}

let recoveredFromCorrupt = false;
/** 直近の loadUserData で、読めない保存データを退避して初期化したかどうか */
export function wasRecoveredFromCorrupt(): boolean {
  return recoveredFromCorrupt;
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultUserData();
    try {
      return migrate(JSON.parse(raw));
    } catch {
      // BOKI-05：破損した原本は別キーへ退避してから初期化する（黙って上書きしない）
      try { localStorage.setItem(BACKUP_KEY, raw); } catch { /* 退避自体が失敗しても初期化は続ける */ }
      recoveredFromCorrupt = true;
      return defaultUserData();
    }
  } catch {
    return defaultUserData();
  }
}

/** 退避された破損データ（原本）が残っているか */
export function corruptBackup(): string | null {
  try { return localStorage.getItem(BACKUP_KEY); } catch { return null; }
}
export function clearCorruptBackup(): void {
  try { localStorage.removeItem(BACKUP_KEY); } catch { /* noop */ }
  recoveredFromCorrupt = false;
}

export function saveUserData(data: UserData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** 学習データの書き出し（JSON文字列）。個人情報は含まない（端末内学習履歴のみ） */
export function exportUserDataJson(data: UserData): string {
  return JSON.stringify({ app: 'boki', schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data }, null, 2);
}

/** 取り込み用JSONを検証する。成功時は移行済みデータ、失敗時は理由を返す */
export function parseImportedJson(text: string): { ok: true; data: UserData } | { ok: false; error: string } {
  if (text.length > 5_000_000) return { ok: false, error: 'ファイルが大きすぎます（上限5MB）。' };
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { ok: false, error: 'JSONとして読み取れませんでした。' }; }
  const inner = isObj(parsed) && isObj((parsed as Record<string, unknown>).data) ? (parsed as Record<string, unknown>).data : parsed;
  if (!isObj(inner) || !Array.isArray(inner.attempts) || !Array.isArray(inner.exams)) {
    return { ok: false, error: 'bokiの学習データの形式ではありません。' };
  }
  // 他アプリのJSONとの取り違え防止：書き出しマーカー、またはこのアプリ固有の構造があること
  const looksLikeBoki = (isObj(parsed) && (parsed as Record<string, unknown>).app === 'boki')
    || (Array.isArray(inner.bookmarks) && isObj(inner.settings));
  if (!looksLikeBoki) return { ok: false, error: 'bokiの書き出しファイルではないようです。' };
  return { ok: true, data: migrate(inner) };
}
