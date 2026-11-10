import { beforeEach, describe, expect, it } from 'vitest';
import { defaultUserData, exportUserDataJson, loadUserData, migrate, parseImportedJson } from './storage';

// 最小の localStorage スタブ（node環境用）
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
const store = new MemStorage();
beforeEach(() => {
  (globalThis as Record<string, unknown>).localStorage = store;
  store.removeItem('boki-userdata-v1');
  store.removeItem('boki-userdata-v1:backup');
});

const validExamDraft = {
  kind: 'exam',
  payload: {
    paper: {
      kind: 'fixed', setLabel: '固定模試 第1回', seed: 1,
      items: [{ question: { id: 'a1' }, fields: [{ key: 'd0-account', label: 'x', kind: 'account', answer: '現金', points: 0 }], section: 'q1', sectionPoints: 3 }],
    },
    answers: {}, startedAt: 123,
  },
  savedAt: 999,
};

describe('migrate の下書き検証（BOKI-03）', () => {
  it('中身のない模試下書きは捨て、履歴は保持する', () => {
    const d = defaultUserData();
    const raw = { ...d, attempts: [{ questionId: 'a1', at: 1, correct: true, fieldCorrect: 4, fieldTotal: 4, usedHint: false, seconds: 10, mode: 'practice', noCalcMode: false, answers: {} }], draft: { kind: 'exam', payload: {}, savedAt: 1 } };
    const m = migrate(raw);
    expect(m.draft).toBeNull();
    expect(m.attempts.length).toBe(1);
  });
  it('paper.items が壊れた下書きも捨てる', () => {
    const broken = { ...validExamDraft, payload: { ...validExamDraft.payload, paper: { ...validExamDraft.payload.paper, items: [{ question: {} }] } } };
    expect(migrate({ ...defaultUserData(), draft: broken }).draft).toBeNull();
  });
  it('正しい模試下書きは保持する', () => {
    const m = migrate({ ...defaultUserData(), draft: validExamDraft });
    expect(m.draft?.kind).toBe('exam');
    expect((m.draft!.payload as { paper: { setLabel: string } }).paper.setLabel).toBe('固定模試 第1回');
  });
  it('壊れた要素が混ざった履歴は、正常な要素だけ残す', () => {
    const m = migrate({ ...defaultUserData(), attempts: [null, 42, {}, { questionId: 'x', at: 5 }] });
    expect(m.attempts.length).toBe(1);
    expect(m.attempts[0]!.questionId).toBe('x');
  });
});

describe('破損データの退避（BOKI-05）', () => {
  it('JSONとして読めない保存データは別キーに退避してから初期化する', () => {
    store.setItem('boki-userdata-v1', '{broken json,,,');
    const d = loadUserData();
    expect(d.attempts).toEqual([]);
    expect(store.getItem('boki-userdata-v1:backup')).toBe('{broken json,,,');
  });
  it('正常なデータは退避を作らない', () => {
    store.setItem('boki-userdata-v1', JSON.stringify(defaultUserData()));
    loadUserData();
    expect(store.getItem('boki-userdata-v1:backup')).toBeNull();
  });
});

describe('単語帳データの移行', () => {
  it('旧データ（カード項目なし）でも既定値で補完される', () => {
    const old = { schemaVersion: 1, attempts: [], exams: [], bookmarks: [], lessonsDone: [], recentQuestionIds: [], settings: { theme: 'auto', fontScale: 1, examDate: '', dailyGoalMinutes: 30, noCalcMode: false }, draft: null, lessonStages: {}, practiceDraft: null };
    const m = migrate(old);
    expect(m.cardBookmarks).toEqual([]);
    expect(m.cardStats).toEqual({});
    expect(m.cardSession).toBeNull();
    expect(m.settings.shufflePractice).toBe(true);
  });
  it('カードブックマークは card: で始まるものだけ通す（問題IDと混ざらない）', () => {
    const m = migrate({ ...defaultUserData(), cardBookmarks: ['card:account:現金', 'a1-01', 'gen-x'] });
    expect(m.cardBookmarks).toEqual(['card:account:現金']);
  });
  it('カードセッションの idx は範囲内に収める', () => {
    const m = migrate({ ...defaultUserData(), cardSession: { ids: ['card:account:現金'], idx: 99, startSide: 'back', shuffle: true, savedAt: 1 } });
    expect(m.cardSession?.idx).toBe(0);
    expect(m.cardSession?.startSide).toBe('back');
  });
  it('シャッフル設定 false は保持される', () => {
    const d = defaultUserData();
    const m = migrate({ ...d, settings: { ...d.settings, shufflePractice: false } });
    expect(m.settings.shufflePractice).toBe(false);
  });
});

describe('書き出し・取り込み', () => {
  it('書き出したJSONはそのまま取り込める', () => {
    const d = defaultUserData();
    d.bookmarks = ['a1-01'];
    const r = parseImportedJson(exportUserDataJson(d));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.bookmarks).toEqual(['a1-01']);
  });
  it('形式の違うJSONは理由付きで拒否する', () => {
    expect(parseImportedJson('{"foo":1}').ok).toBe(false);
    expect(parseImportedJson('not json').ok).toBe(false);
  });
  it('attempts/examsだけを持つ他形式のJSONは取り込まない', () => {
    expect(parseImportedJson('{"attempts":[],"exams":[]}').ok).toBe(false);
  });
  it('模試下書きの解答欄の中身が壊れていれば下書きだけを捨てる', () => {
    const d = defaultUserData();
    const badField = { kind: 'exam', savedAt: 1, payload: { startedAt: 1, answers: {}, paper: { kind: 'random', setLabel: 'x', items: [{ question: { id: 'A001' }, fields: [null], sectionPoints: 3, section: 'q1' }] } } };
    expect(migrate({ ...d, draft: badField }).draft).toBeNull();
    const keyOnly = { kind: 'exam', savedAt: 1, payload: { startedAt: 1, answers: {}, paper: { kind: 'random', setLabel: 'x', items: [{ question: { id: 'A001' }, fields: [{ key: 'd0-a' }], sectionPoints: 3, section: 'q1' }] } } };
    expect(migrate({ ...d, draft: keyOnly }).draft).toBeNull();
    const good = { kind: 'exam', savedAt: 1, payload: { startedAt: 1, answers: {}, paper: { kind: 'random', setLabel: 'x', items: [{ question: { id: 'A001' }, fields: [{ key: 'd0-a', label: '借方科目', kind: 'account' }], sectionPoints: 3, section: 'q1' }] } } };
    expect(migrate({ ...d, draft: good }).draft).not.toBeNull();
  });
  it('演習下書きの idx は問題数の範囲内に収める', () => {
    const d = defaultUserData();
    const m = migrate({ ...d, practiceDraft: { ids: ['A001', 'A002', 'A003'], mode: 'practice', idx: 999, gradedAnswers: {}, currentAnswers: {}, usedHints: {}, savedAt: 1 } });
    expect(m.practiceDraft?.idx).toBe(2);
  });
});
