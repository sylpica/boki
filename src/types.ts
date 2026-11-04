// boki コア型定義（2027年度 日商簿記3級・ネット試験対応）
export type Difficulty = 'basic' | 'standard' | 'advanced';
export type Section = 'q1' | 'q2' | 'q3';
export type Format =
  | 'journal' // 仕訳（プルダウン科目選択＋金額入力）= 第1問形式
  | 'ledger' // 帳簿・元帳・補助簿の記入（第2問形式）
  | 'trial-balance' // 試算表の完成（第2問形式）
  | 'voucher' // 伝票・証ひょう（第2問形式）
  | 'worksheet' // 精算表の完成（第3問形式）
  | 'statements' // 貸借対照表・損益計算書の完成（第3問形式）
  | 'closing-journal'; // 決算整理仕訳（第3問の入口として扱う仕訳）

export interface JournalLine {
  side: 'debit' | 'credit';
  account: string;
  amount: number;
}

export interface AnswerField {
  key: string;
  label: string;
  kind: 'account' | 'amount' | 'select';
  /** account/select の候補（accountは科目名、selectは選択肢文字列） */
  options?: string[];
  answer: string | number;
  points: number;
}

export interface Question {
  id: string;
  version: string;
  examYear: 2027;
  section: Section;
  format: Format;
  /** 出題区分コード（例: '2-7' = 第二・7 商品の売買） */
  topic: string;
  syllabus: string;
  difficulty: Difficulty;
  /** 計算が必要か。金額欄があるだけでは計算問題にしない（指示書7.2） */
  needsCalc: boolean;
  calcType?: string;
  calcComplexity?: 1 | 2 | 3;
  prompt: string;
  /** journal / closing-journal 用の正答仕訳 */
  journal?: JournalLine[];
  /** journal以外の汎用解答欄、および journal の自動生成欄の上書き用 */
  fields?: AnswerField[];
  /** 仕訳問題の科目プルダウン候補（未指定時は正答科目＋同一分野の攪乱科目） */
  accountPool?: string[];
  explanation: string;
  calcProcess?: string;
  hints: string[];
  accounts: string[];
  terms: string[];
  lessonId?: string;
  /** 数値派生問題の親ID。独立問題と区別して集計する */
  parentId?: string;
  verified: boolean;
  source: string;
  updatedAt: string;
}

export interface LessonStage {
  overview: string;
  detail: string;
  expert: string;
  practice: string;
}

export interface Lesson {
  id: string;
  chapter: string;
  title: string;
  syllabus: string;
  topic: string;
  prerequisites: string[];
  stages: LessonStage;
  exampleJournal?: JournalLine[];
  exampleNote?: string;
  accounts: string[];
  terms: string[];
}

export interface GlossaryEntry {
  term: string;
  kind: 'account' | 'term';
  category?: string; // 勘定科目の分類（資産/負債/純資産/収益/費用）
  reading?: string;
  short: string;
  detail: string;
  normalSide?: 'debit' | 'credit';
  statement?: string; // 財務諸表上の位置付け
  exampleJournal?: JournalLine[];
  confusable?: string[];
  lessonId?: string;
  topic?: string;
}

export interface AttemptRecord {
  questionId: string;
  at: number;
  correct: boolean;
  /** 欄単位の正解数 / 全欄数 */
  fieldCorrect: number;
  fieldTotal: number;
  usedHint: boolean;
  seconds: number;
  mode: 'practice' | 'review' | 'exam';
  noCalcMode: boolean;
  answers: Record<string, string>;
}

export interface ExamRecord {
  at: number;
  kind: 'fixed' | 'random';
  setLabel: string;
  total: number;
  bySection: Record<Section, { got: number; max: number }>;
  questionIds: string[];
}

export interface UserData {
  schemaVersion: number;
  attempts: AttemptRecord[];
  exams: ExamRecord[];
  bookmarks: string[];
  lessonsDone: string[];
  recentQuestionIds: string[];
  settings: {
    theme: 'auto' | 'light' | 'dark';
    fontScale: number;
    examDate: string;
    dailyGoalMinutes: number;
    noCalcMode: boolean;
  };
  draft?: { kind: string; payload: unknown; savedAt: number } | null;
}
