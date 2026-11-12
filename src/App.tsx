import { useEffect, useMemo, useRef, useState } from 'react';
import type { AttemptRecord, Difficulty, ExamRecord, Lesson, Question, Section, UserData } from './types';
import { ALL_QUESTIONS, GLOSSARY, LESSONS, LESSON_MAP, QUESTION_MAP, TOPICS, INDEPENDENT_QUESTIONS, DERIVED_QUESTIONS } from './data';
import { fieldsForQuestion, grade } from './lib/fields';
import { pickQuestions, applyNoCalc, shuffle, mulberry32 } from './lib/shuffle';
import { buildExam, gradeExam, SECTION_MAX, PASS_LINE, TARGET_LINE, EXAM_MINUTES, type ExamPaper } from './lib/exam';
import { loadUserData, saveUserData, wasRecoveredFromCorrupt, corruptBackup, clearCorruptBackup, exportUserDataJson, parseImportedJson } from './lib/storage';
import { reviewQueue, topicStats } from './lib/analytics';
import { buildCards, isDue } from './lib/flashcards';
import CardsView from './CardsView';
import { LessonFigure } from './Figures';
import { ILLUSTRATIONS } from './data/illustrations';

type View =
  | { name: 'home' }
  | { name: 'lessons' }
  | { name: 'lesson'; id: string }
  | { name: 'glossary' }
  | { name: 'practice-setup' }
  | { name: 'cards' }
  | { name: 'practice'; ids: string[]; mode: 'practice' | 'review'; resume?: boolean }
  | { name: 'exam-setup' }
  | { name: 'exam'; paper: ExamPaper; startedAt: number }
  | { name: 'analytics' }
  | { name: 'settings' }
  | { name: 'search' };

const DIFF_LABEL: Record<Difficulty, string> = { basic: '基礎', standard: '標準', advanced: '応用' };
const SECTION_LABEL: Record<Section, string> = { q1: '第1問形式', q2: '第2問形式', q3: '第3問形式' };
const fmtYen = (n: number) => '￥' + n.toLocaleString('ja-JP');
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function App() {
  const [data, setData] = useState<UserData>(() => loadUserData());
  const [view, setView] = useState<View>({ name: 'home' });
  const [saveFailed, setSaveFailed] = useState(false);
  const [systemDark, setSystemDark] = useState<boolean>(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  useEffect(() => { setSaveFailed(!saveUserData(data)); }, [data]);
  // テーマ auto のときは OS のダーク/ライト切替に動的に追随する（R35）
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  const update = (fn: (d: UserData) => UserData) => setData((d) => fn(structuredClone(d)));

  const theme = data.settings.theme;
  const effectiveDark = theme === 'dark' || (theme === 'auto' && systemDark);

  const stats = useMemo(() => {
    const a = data.attempts.filter((x) => x.mode !== 'exam');
    const correct = a.filter((x) => x.correct).length;
    return { attempts: a.length, correct, rate: a.length ? Math.round((correct / a.length) * 100) : 0 };
  }, [data.attempts]);
  const lastExam = data.exams[data.exams.length - 1];
  const reviewCount = useMemo(() => reviewQueue(data.attempts, ALL_QUESTIONS.map((q) => q.id)).length, [data.attempts]);
  const examDraft = data.draft?.kind === 'exam' ? (data.draft.payload as { paper: ExamPaper; answers: Record<string, Record<string, string>>; startedAt: number }) : null;
  const allCards = useMemo(() => buildCards(GLOSSARY), []);
  const dueCardCount = useMemo(() => allCards.filter((c) => isDue(data.cardStats[c.id], Date.now())).length, [allCards, data.cardStats]);
  const [recovered] = useState(() => wasRecoveredFromCorrupt());

  return (
    <div className="app" data-theme={effectiveDark ? 'dark' : 'light'} style={{ fontSize: `${data.settings.fontScale}rem` }}>
      <header className="topbar">
        <button className="brand" onClick={() => setView({ name: 'home' })} aria-label="ホームへ">boki</button>
        <span className="brand-sub">日商簿記3級・2027年度対応</span>
        <nav className="topnav" aria-label="主要メニュー">
          <button onClick={() => setView({ name: 'search' })}>検索</button>
          <button onClick={() => setView({ name: 'analytics' })}>成績</button>
          <button onClick={() => setView({ name: 'settings' })}>設定</button>
        </nav>
      </header>

      <main className="main">
        {saveFailed && (
          <section className="panel warn-panel" role="alert">
            <p>学習データの保存に失敗しました（ブラウザの保存容量が不足している可能性があります）。古い履歴が失われるおそれがあるため、不要なブラウザデータを整理してから学習を続けてください。</p>
          </section>
        )}
        {recovered && corruptBackup() && (
          <section className="panel warn-panel" role="alert">
            <p>保存されていた学習データが読み取れなかったため、元のデータは消さずに退避し、新しい状態で開始しました。退避したデータは設定画面からダウンロードできます。</p>
          </section>
        )}
        {view.name === 'home' && (
          <div>
            <section className="home-grid" aria-label="主要機能">
              <button className="home-card" onClick={() => setView({ name: 'lessons' })}>
                <span className="home-card-title">教材</span>
                <span className="home-card-sub">{LESSONS.length}レッスン・4段階解説</span>
              </button>
              <button className="home-card" onClick={() => setView({ name: 'practice-setup' })}>
                <span className="home-card-title">問題演習</span>
                <span className="home-card-sub">全{ALL_QUESTIONS.length}問（独立{INDEPENDENT_QUESTIONS.length}・派生{DERIVED_QUESTIONS.length}）</span>
              </button>
              <button className="home-card" onClick={() => setView({ name: 'cards' })}>
                <span className="home-card-title">単語帳</span>
                <span className="home-card-sub">カード{allCards.length}枚・未学習・復習対象 {dueCardCount} 枚</span>
              </button>
              <button className="home-card" onClick={() => setView({ name: 'exam-setup' })}>
                <span className="home-card-title">模擬試験</span>
                <span className="home-card-sub">60分・100点・目標{TARGET_LINE}点</span>
              </button>
              <button className="home-card" onClick={() => startReview()}>
                <span className="home-card-title">復習</span>
                <span className="home-card-sub">復習対象 {reviewCount} 問</span>
              </button>
            </section>

            {examDraft && (
              <section className="panel warn-panel">
                <p>模擬試験の途中データがあります（{examDraft.paper.setLabel}）。再読み込みによる事故防止のため、同じ問題・経過時間のまま再開できます。</p>
                <button className="primary" onClick={() => setView({ name: 'exam', paper: examDraft.paper, startedAt: examDraft.startedAt })}>模試を再開する</button>{' '}
                <button onClick={() => update((d) => ({ ...d, draft: null }))}>破棄する</button>
              </section>
            )}

            {data.practiceDraft && data.practiceDraft.ids.length > 0 && (
              <section className="panel warn-panel">
                <p>演習の途中データがあります（{data.practiceDraft.ids.length}問中 {Object.keys(data.practiceDraft.gradedAnswers).length} 問採点済み）。</p>
                <button className="primary" onClick={() => setView({ name: 'practice', ids: data.practiceDraft!.ids, mode: data.practiceDraft!.mode, resume: true })}>演習を再開する</button>{' '}
                <button onClick={() => update((d) => ({ ...d, practiceDraft: null }))}>破棄する</button>
              </section>
            )}

            {data.cardSession && data.cardSession.ids.length > 0 && (
              <section className="panel warn-panel">
                <p>単語帳の途中データがあります（{data.cardSession.ids.length}枚中 {data.cardSession.idx + 1} 枚目）。</p>
                <button className="primary" onClick={() => setView({ name: 'cards' })}>単語帳を再開する</button>{' '}
                <button onClick={() => update((d) => ({ ...d, cardSession: null }))}>破棄する</button>
              </section>
            )}

            <section className="panel">
              <h2>学習状況</h2>
              <div className="stat-row">
                <div><strong>{stats.attempts}</strong><span>演習解答数</span></div>
                <div><strong>{stats.rate}%</strong><span>演習正答率</span></div>
                <div><strong>{data.lessonsDone.length}/{LESSONS.length}</strong><span>教材完了</span></div>
                <div><strong>{lastExam ? `${lastExam.total}点` : '―'}</strong><span>直近の模試</span></div>
              </div>
              {lastExam && (
                <p className="muted">合格基準 {PASS_LINE} 点まで {Math.max(0, PASS_LINE - lastExam.total)} 点、目標 {TARGET_LINE} 点まで {Math.max(0, TARGET_LINE - lastExam.total)} 点</p>
              )}
              <NextSuggestion data={data} go={setView} />
            </section>

            <section className="panel">
              <h2>辞典</h2>
              <p className="muted">勘定科目・専門用語 {GLOSSARY.length} 件</p>
              <button onClick={() => setView({ name: 'glossary' })}>辞典を開く</button>
            </section>
          </div>
        )}

        {view.name === 'lessons' && <LessonsView data={data} go={setView} />}
        {view.name === 'lesson' && <LessonView id={view.id} data={data} update={update} go={setView} />}
        {view.name === 'glossary' && <GlossaryView go={setView} />}
        {view.name === 'practice-setup' && <PracticeSetup data={data} update={update} go={setView} startReview={startReview} />}
        {view.name === 'cards' && <CardsView data={data} update={update} goLesson={(id) => setView({ name: 'lesson', id })} goHome={() => setView({ name: 'home' })} />}
        {view.name === 'practice' && (
          <PracticeSession key={view.ids.join(',') + (view.resume ? ':resume' : '')} ids={view.ids} mode={view.mode} resume={!!view.resume} data={data} update={update} go={setView} />
        )}
        {view.name === 'exam-setup' && <ExamSetup go={setView} update={update} />}
        {view.name === 'exam' && <ExamSession paper={view.paper} startedAt={view.startedAt} data={data} update={update} go={setView} />}
        {view.name === 'analytics' && <AnalyticsView data={data} go={setView} startReview={startReview} />}
        {view.name === 'settings' && <SettingsView data={data} update={update} />}
        {view.name === 'search' && <SearchView data={data} go={setView} />}
      </main>

      <footer className="footer">
        <p>boki は日本商工会議所とは無関係の独自学習アプリです。問題・教材はすべて独自作成で、公式サンプル問題の転載はしていません。出題範囲は2027年度適用の出題区分表（確定版）に基づきます。学習データはこの端末のブラウザ内にのみ保存され、ブラウザのデータを削除すると失われます。</p>
      </footer>
    </div>
  );

  function startReview() {
    const queue = reviewQueue(data.attempts, ALL_QUESTIONS.map((q) => q.id));
    const practiced = new Set(data.attempts.map((a) => a.questionId));
    const noCalc = data.settings.noCalcMode;
    // 計算問題除外は復習経路にも適用する（BOKI-04）。模試には適用しない
    const selected = queue
      .map((x) => x.id)
      .filter((id) => { const q = QUESTION_MAP.get(id); return !!q && (!noCalc || !q.needsCalc); })
      .slice(0, 20);
    if (selected.length === 0) {
      const fresh = pickQuestions(applyNoCalc(ALL_QUESTIONS.filter((q) => !practiced.has(q.id)), noCalc), { count: 10, recentIds: data.recentQuestionIds, shuffle: data.settings.shufflePractice });
      setView({ name: 'practice', ids: fresh.map((q) => q.id), mode: 'review' });
    } else {
      const ids = data.settings.shufflePractice
        ? shuffle(selected, mulberry32(((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0)))
        : selected;
      setView({ name: 'practice', ids, mode: 'review' });
    }
  }
}

function NextSuggestion({ data, go }: { data: UserData; go: (v: View) => void }) {
  const tstats = topicStats(data.attempts, QUESTION_MAP);
  const weak = tstats.filter((t) => t.attempts >= 3 && t.mastery < 70)[0];
  const nextLesson = LESSONS.find((l) => !data.lessonsDone.includes(l.id));
  return (
    <div>
      <h3>次に取り組むこと</h3>
      {weak ? (
        <p>弱点分野：{weak.syllabus}（習熟度 {weak.mastery}）。この分野の演習をおすすめします。{' '}
          <button onClick={() => go({ name: 'practice-setup' })}>演習を設定する</button></p>
      ) : nextLesson ? (
        <p>次の教材：{nextLesson.title}{' '}
          <button onClick={() => go({ name: 'lesson', id: nextLesson.id })}>開く</button></p>
      ) : (
        <p>教材はすべて完了しています。模擬試験で総仕上げをしましょう。{' '}
          <button onClick={() => go({ name: 'exam-setup' })}>模試を設定する</button></p>
      )}
    </div>
  );
}

function LessonsView({ data, go }: { data: UserData; go: (v: View) => void }) {
  const chapters = [...new Set(LESSONS.map((l) => l.chapter))];
  return (
    <div>
      <h1>教材</h1>
      {chapters.map((ch) => (
        <section key={ch} className="panel">
          <h2>{ch}</h2>
          <ul className="list">
            {LESSONS.filter((l) => l.chapter === ch).map((l) => (
              <li key={l.id}>
                <button className="list-btn" onClick={() => go({ name: 'lesson', id: l.id })}>
                  <span>{l.title}</span>
                  <span className="muted">{data.lessonsDone.includes(l.id) ? '完了' : '未学習'}｜{l.syllabus}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** 文末の「。」を各文の末尾に残したまま文単位に分割する */
function splitSentences(text: string): string[] {
  return text.split(/(?<=。)/).filter((s) => s.length > 0);
}

/** 概要の途中に差し込む概念イラスト。画像は Base64 テキストとして同梱し、開いたレッスンの分だけ読み込む */
function LessonIllustration({ lessonId }: { lessonId: string }) {
  const meta = ILLUSTRATIONS[lessonId];
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setSrc(null);
    fetch(`${import.meta.env.BASE_URL}img64/${lessonId}.b64`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('load failed'))))
      .then((t) => { if (alive) setSrc(`data:image/webp;base64,${t.trim()}`); })
      .catch(() => { /* 読み込めない場合は図なしで本文のみ表示する */ });
    return () => { alive = false; };
  }, [lessonId]);
  if (!meta || !src) return null;
  return (
    <figure className="lesson-illustration">
      <img src={src} alt={meta.alt} width={1152} height={648} />
      <figcaption className="muted">{meta.caption}</figcaption>
    </figure>
  );
}

function LessonView({ id, data, update, go }: { id: string; data: UserData; update: (fn: (d: UserData) => UserData) => void; go: (v: View) => void }) {
  const lesson: Lesson | undefined = LESSON_MAP.get(id);
  const savedStage = Math.min(3, Math.max(0, Number(data.lessonStages[id] ?? 0) || 0));
  const [stage, setStageState] = useState(savedStage);
  const [term, setTerm] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const setStage = (i: number) => {
    setStageState(i);
    update((d) => ({ ...d, lessonStages: { ...d.lessonStages, [id]: String(i) } }));
  };
  useEffect(() => { if (term) closeBtnRef.current?.focus(); }, [term]);
  useEffect(() => {
    if (!term) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTerm(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [term]);
  if (!lesson) return <p>教材が見つかりません。</p>;
  const done = data.lessonsDone.includes(lesson.id);
  const related = ALL_QUESTIONS.filter((q) => q.lessonId === lesson.id);
  const entry = term ? GLOSSARY.find((g) => g.term === term) : null;
  const stageNames = ['概要', '詳細', '専門的解説', '実務例'];
  const stageTexts = [lesson.stages.overview, lesson.stages.detail, lesson.stages.expert, lesson.stages.practice];
  return (
    <div>
      <button onClick={() => go({ name: 'lessons' })}>← 教材一覧</button>
      <h1>{lesson.title}</h1>
      <p className="muted">対応区分：{lesson.syllabus}</p>
      {lesson.prerequisites.length > 0 && (
        <p className="muted">前提：{lesson.prerequisites.map((p) => {
          const pl = LESSON_MAP.get(p);
          const isDone = data.lessonsDone.includes(p);
          return (
            <button key={p} className="linklike" onClick={() => go({ name: 'lesson', id: p })}>{pl?.title ?? p}{isDone ? '' : '（未学習）'}</button>
          );
        })}</p>
      )}
      <div className="tabs" role="tablist" aria-label="解説段階">
        {stageNames.map((n, i) => (
          <button key={n} role="tab" id={`stage-tab-${i}`} aria-selected={stage === i} aria-controls={`stage-panel`} className={stage === i ? 'tab active' : 'tab'} onClick={() => setStage(i)}>{n}</button>
        ))}
      </div>
      <section className="panel" role="tabpanel" id="stage-panel" aria-labelledby={`stage-tab-${stage}`}>
        {stage === 0 && ILLUSTRATIONS[lesson.id] ? (
          <>
            <p className="prewrap">{splitSentences(stageTexts[0]).slice(0, ILLUSTRATIONS[lesson.id].after).join('')}</p>
            <LessonIllustration lessonId={lesson.id} />
            <p className="prewrap">{splitSentences(stageTexts[0]).slice(ILLUSTRATIONS[lesson.id].after).join('')}</p>
          </>
        ) : (
          <p className="prewrap">{stageTexts[stage]}</p>
        )}
        {stage === 0 && <LessonFigure lessonId={lesson.id} />}
        {stage === 1 && lesson.exampleJournal && (
          <div>
            <h3>仕訳例{lesson.exampleNote ? `（${lesson.exampleNote}）` : ''}</h3>
            <JournalTable journal={lesson.exampleJournal} />
          </div>
        )}
      </section>
      <section className="panel">
        <h2>関連用語</h2>
        <p>{lesson.terms.map((t) => (
          <button key={t} className="chip" onClick={() => setTerm(t)}>{t}</button>
        ))}</p>
        {entry && (
          <div className="term-box" role="dialog" aria-label={`${entry.term}の説明`}>
            <strong>{entry.term}</strong>
            <p>{entry.short}</p>
            <p className="muted">{entry.detail}</p>
            <button ref={closeBtnRef} onClick={() => setTerm(null)}>閉じる（教材に戻る）</button>
          </div>
        )}
        <h2>この単元の問題</h2>
        <p className="muted">{related.length} 問{data.settings.noCalcMode ? `（計算問題除外モードのため、出題対象は ${applyNoCalc(related, true).length} 問）` : ''}</p>
        <button className="primary" disabled={applyNoCalc(related, data.settings.noCalcMode).length === 0} onClick={() => {
          const pool = applyNoCalc(related, data.settings.noCalcMode);
          const picked = pickQuestions(pool, { count: Math.min(10, pool.length), recentIds: data.recentQuestionIds, shuffle: data.settings.shufflePractice });
          go({ name: 'practice', ids: picked.map((q) => q.id), mode: 'practice' });
        }}>この単元を演習する</button>{' '}
        <button onClick={() => update((d) => ({ ...d, lessonsDone: done ? d.lessonsDone.filter((x) => x !== lesson.id) : [...d.lessonsDone, lesson.id] }))}>
          {done ? '完了を取り消す' : '学習完了にする'}
        </button>
      </section>
    </div>
  );
}

export function JournalTable({ journal }: { journal: { side: 'debit' | 'credit'; account: string; amount: number }[] }) {
  const debits = journal.filter((l) => l.side === 'debit');
  const credits = journal.filter((l) => l.side === 'credit');
  const rows = Math.max(debits.length, credits.length);
  return (
    <div className="table-scroll">
    <table className="journal-table">
      <thead><tr><th>借方科目</th><th>借方金額</th><th>貸方科目</th><th>貸方金額</th></tr></thead>
      <tbody>
        {Array.from({ length: rows }, (_, i) => (
          <tr key={i}>
            <td>{debits[i]?.account ?? ''}</td><td className="num">{debits[i] ? fmtYen(debits[i]!.amount) : ''}</td>
            <td>{credits[i]?.account ?? ''}</td><td className="num">{credits[i] ? fmtYen(credits[i]!.amount) : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

function GlossaryView({ go }: { go: (v: View) => void }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | 'account' | 'term'>('all');
  const [cat, setCat] = useState('all');
  const cats = [...new Set(GLOSSARY.filter((g) => g.kind === 'account').map((g) => g.category ?? ''))];
  const filtered = GLOSSARY.filter((g) =>
    (kind === 'all' || g.kind === kind) &&
    (cat === 'all' || g.category === cat) &&
    (query === '' || g.term.includes(query) || g.short.includes(query))
  );
  return (
    <div>
      <h1>勘定科目・用語辞典</h1>
      <div className="filters">
        <input aria-label="辞典を検索" placeholder="検索" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select aria-label="種類" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="all">すべて</option><option value="account">勘定科目</option><option value="term">専門用語</option>
        </select>
        <select aria-label="分類" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">分類すべて</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <p className="muted">{filtered.length} 件</p>
      {filtered.map((g) => (
        <details key={g.term} className="gloss-item">
          <summary>{g.term}{g.kind === 'account' ? `（${g.category}）` : ''}</summary>
          <p>{g.short}</p>
          <p className="muted">{g.detail}</p>
          {g.normalSide && <p className="muted">通常残高：{g.normalSide === 'debit' ? '借方' : '貸方'}｜財務諸表：{g.statement}</p>}
          {g.exampleJournal && <JournalTable journal={g.exampleJournal} />}
          {g.confusable && g.confusable.length > 0 && <p className="muted">間違いやすい科目：{g.confusable.join('、')}</p>}
          {g.lessonId && <button onClick={() => go({ name: 'lesson', id: g.lessonId! })}>関連教材を開く</button>}
        </details>
      ))}
    </div>
  );
}

function PracticeSetup({ data, update, go, startReview }: { data: UserData; update: (fn: (d: UserData) => UserData) => void; go: (v: View) => void; startReview: () => void }) {
  const [topic, setTopic] = useState('all');
  const [section, setSection] = useState<'all' | Section>('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [onlyUnseen, setOnlyUnseen] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [count, setCount] = useState(10);
  const noCalc = data.settings.noCalcMode;

  const practiced = new Map<string, AttemptRecord[]>();
  for (const a of data.attempts) practiced.set(a.questionId, [...(practiced.get(a.questionId) ?? []), a]);
  const weakTopics = new Set(topicStats(data.attempts, QUESTION_MAP).filter((t) => t.attempts >= 3 && t.mastery < 70).map((t) => t.topic));

  const pool = applyNoCalc(ALL_QUESTIONS.filter((q) =>
    (topic === 'all' || q.topic === topic) &&
    (section === 'all' || q.section === section) &&
    (difficulty === 'all' || q.difficulty === difficulty) &&
    (!onlyWeak || weakTopics.has(q.topic)) &&
    (!onlyWrong || (practiced.get(q.id) ?? []).some((a) => !a.correct)) &&
    (!onlyUnseen || !practiced.has(q.id)) &&
    (!onlyBookmarked || data.bookmarks.includes(q.id))
  ), noCalc);

  return (
    <div>
      <h1>問題演習</h1>
      <section className="panel">
        <label className="switch-row">
          <input type="checkbox" checked={noCalc} onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, noCalcMode: e.target.checked } }))} />
          計算問題除外モード（計算不要の問題だけを出題します。模擬試験には適用されません）
        </label>
        <div className="filters">
          <select aria-label="単元" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">単元すべて</option>
            {TOPICS.map((t) => <option key={t.topic} value={t.topic}>{t.syllabus}</option>)}
          </select>
          <select aria-label="出題形式" value={section} onChange={(e) => setSection(e.target.value as typeof section)}>
            <option value="all">形式すべて</option>
            <option value="q1">第1問形式（仕訳）</option>
            <option value="q2">第2問形式（帳簿・試算表）</option>
            <option value="q3">第3問形式（決算）</option>
          </select>
          <select aria-label="難易度" value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
            <option value="all">難易度すべて</option>
            <option value="basic">基礎</option><option value="standard">標準</option><option value="advanced">応用</option>
          </select>
          <select aria-label="問題数" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}問</option>)}
          </select>
        </div>
        <div className="filters">
          <label><input type="checkbox" checked={onlyWeak} onChange={(e) => setOnlyWeak(e.target.checked)} /> 苦手分野のみ</label>
          <label><input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> 間違えた問題のみ</label>
          <label><input type="checkbox" checked={onlyUnseen} onChange={(e) => setOnlyUnseen(e.target.checked)} /> 未出題のみ</label>
          <label><input type="checkbox" checked={onlyBookmarked} onChange={(e) => setOnlyBookmarked(e.target.checked)} /> ブックマークのみ</label>
          <label><input type="checkbox" checked={data.settings.shufflePractice} onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, shufflePractice: e.target.checked } }))} /> 問題順をシャッフルする</label>
        </div>
        <p aria-live="polite">{pool.length === 0 ? '条件に該当する問題がありません。条件を緩めてください。' : `対象 ${pool.length} 問から ${Math.min(count, pool.length)} 問を${data.settings.shufflePractice ? 'シャッフルして' : '順番どおりに'}出題します`}</p>
        <button className="primary" disabled={pool.length === 0} onClick={() => {
          const wrongIds = new Set([...practiced.entries()].filter(([, v]) => v.every((a) => a.correct)).map(([k]) => k));
          const picked = pickQuestions(pool, { count, recentIds: data.recentQuestionIds, deprioritizeIds: [...wrongIds], shuffle: data.settings.shufflePractice });
          go({ name: 'practice', ids: picked.map((q) => q.id), mode: 'practice' });
        }}>演習を開始する</button>{' '}
        <button onClick={startReview}>復習を開始する</button>
      </section>
    </div>
  );
}

export function FieldsInput({ q, fields, answers, setAnswers, graded, disabled }: {
  q: Question;
  fields: ReturnType<typeof fieldsForQuestion>;
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  graded?: Record<string, boolean> | null;
  disabled?: boolean;
}) {
  const input = (f: (typeof fields)[number]) => f.kind === 'amount' ? (
    <input
      inputMode="numeric"
      aria-label={f.label}
      disabled={disabled}
      value={answers[f.key] ?? ''}
      onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
      placeholder="数字のみ"
    />
  ) : (
    <select aria-label={f.label} disabled={disabled} value={answers[f.key] ?? ''} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}>
      <option value="">選択してください</option>
      {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  // 帳票系（試算表・精算表・財務諸表・帳簿）は、項目と解答欄を行列の表として提示する
  const tabular = !q.journal && fields.length >= 2;
  if (tabular) {
    return (
      <div className="fields-table-wrap">
        <div className="table-scroll">
          <table className="fig-table fields-table">
            <thead><tr><th>項目</th><th>解答</th>{graded ? <th>正誤</th> : null}</tr></thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.key} className={graded ? (graded[f.key] ? 'row-correct' : 'row-wrong') : ''}>
                  <th scope="row">{f.label}</th>
                  <td>{input(f)}</td>
                  {graded ? <td aria-label={graded[f.key] ? '正解' : '不正解'}>{graded[f.key] ? '○' : '×'}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">金額は数字のみで入力してください。カンマ・円記号・文字が含まれると不正解になります（本試験の公式注意と同じ扱いで、入力を黙って直すことはしません）。</p>
      </div>
    );
  }
  return (
    <div className="fields">
      {fields.map((f) => {
        const state = graded ? (graded[f.key] ? ' correct' : ' wrong') : '';
        return (
          <label key={f.key} className={`field${state}`}>
            <span>{f.label}{graded ? (graded[f.key] ? ' ○' : ' ×') : ''}</span>
            {input(f)}
          </label>
        );
      })}
      <p className="muted">金額は数字のみで入力してください。カンマ・円記号・文字が含まれると不正解になります（本試験の公式注意と同じ扱いで、入力を黙って直すことはしません）。仕訳では同じ科目を借方・貸方のそれぞれの中で2回使わないでください（公式の解答規則）。</p>
    </div>
  );
}

/** 安全な四則演算パーサ（eval系を使わない。数値・+ - * / ・括弧・小数だけを許可。長さと入れ子の深さに上限を設ける） */
export function evalExpr(src: string): number | null {
  const s = src.replace(/\s+/g, '');
  if (!s || s.length > 100 || !/^[0-9+\-*/.()]+$/.test(s)) return null;
  let p = 0;
  let depth = 0;
  const pk = () => s[p] ?? '';
  const ex = (): number | null => {
    let v = tm();
    if (v === null) return null;
    while (pk() === '+' || pk() === '-') {
      const op = s[p++]!;
      const r = tm();
      if (r === null) return null;
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const tm = (): number | null => {
    let v = fc();
    if (v === null) return null;
    while (pk() === '*' || pk() === '/') {
      const op = s[p++]!;
      const r = fc();
      if (r === null) return null;
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };
  const fc = (): number | null => {
    if (depth > 20) return null;
    if (pk() === '(') {
      p++; depth++;
      const v = ex();
      depth--;
      if (v === null || pk() !== ')') return null;
      p++;
      return v;
    }
    if (pk() === '-') { p++; depth++; const v = fc(); depth--; return v === null ? null : -v; }
    const m = /^[0-9]*\.?[0-9]+/.exec(s.slice(p));
    if (!m) return null;
    p += m[0].length;
    return Number(m[0]);
  };
  const v = ex();
  return v !== null && p === s.length ? v : null;
}

function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const calc = () => {
    const v = evalExpr(expr);
    setResult(v !== null && Number.isFinite(v) ? v.toLocaleString('ja-JP') : '計算式が不正です');
  };
  return (
    <div className="calc">
      <input aria-label="電卓の計算式" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="例: 120000*0.02*6/12" />
      <button onClick={calc}>=</button>
      <output aria-live="polite">{result}</output>
    </div>
  );
}

function PracticeSession({ ids, mode, resume, data, update, go }: { ids: string[]; mode: 'practice' | 'review'; resume?: boolean; data: UserData; update: (fn: (d: UserData) => UserData) => void; go: (v: View) => void }) {
  const draft = resume ? data.practiceDraft : null;
  const [order, setOrder] = useState<string[]>(() => (draft ? draft.ids : ids));
  const questions = order.map((id) => QUESTION_MAP.get(id)).filter((q): q is Question => !!q);
  const [idx, setIdx] = useState(() => Math.min(draft?.idx ?? 0, Math.max(0, questions.length - 1)));
  const [answers, setAnswers] = useState<Record<string, string>>(() => draft?.currentAnswers ?? {});
  const [gradedMap, setGradedMap] = useState<Record<string, ReturnType<typeof grade>>>(() => {
    if (!draft) return {};
    const out: Record<string, ReturnType<typeof grade>> = {};
    for (const [qid, ans] of Object.entries(draft.gradedAnswers)) {
      const qq = QUESTION_MAP.get(qid);
      if (qq) out[qid] = grade(qq, ans);
    }
    return out;
  });
  const [hintLevel, setHintLevel] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [memo, setMemo] = useState('');
  const startedRef = useRef(Date.now());
  const draftAnswersRef = useRef<Record<string, Record<string, string>>>(draft ? { ...draft.gradedAnswers } : {});
  const draftHintsRef = useRef<Record<string, boolean>>(draft ? { ...draft.usedHints } : {});
  // 未採点問題の入力途中データとヒント状態を問題ごとに保持する（移動・並び替えで消えないように）
  const pendingRef = useRef<Record<string, Record<string, string>>>(draft ? { [draft.ids[draft.idx] ?? '']: draft.currentAnswers } : {});
  const hintRef = useRef<Record<string, { level: number; used: boolean }>>({});
  const gradedIdsRef = useRef<Set<string>>(new Set(Object.keys(draft?.gradedAnswers ?? {})));
  const q = questions[idx];
  const graded = q ? gradedMap[q.id] : undefined;

  // 途中状態を自動保存する（R32）。全問採点済みになったら下書きは消す。
  useEffect(() => {
    const gradedAnswers: Record<string, Record<string, string>> = {};
    const usedHints: Record<string, boolean> = {};
    for (const qid of Object.keys(gradedMap)) {
      gradedAnswers[qid] = draftAnswersRef.current[qid] ?? {};
      usedHints[qid] = draftHintsRef.current[qid] ?? false;
    }
    const allDone = questions.length > 0 && Object.keys(gradedMap).length >= questions.length;
    update((d) => ({
      ...d,
      practiceDraft: allDone ? null : { ids: order, mode, idx, gradedAnswers, currentAnswers: answers, usedHints, savedAt: Date.now() },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, gradedMap, answers, order]);
  if (!q) return <div><p>問題がありません。条件を変えてもう一度お試しください。</p><button onClick={() => go({ name: 'home' })}>ホームへ</button></div>;
  const fields = fieldsForQuestion(q);
  const doneCount = Object.keys(gradedMap).length;

  // 問題の移動。復元直後のマウントで入力を消す旧欠陥（BOKI-02）を避けるため、
  // リセットは移動操作の中でのみ行い、未採点の入力は問題ごとに退避・復元する。
  const goTo = (j: number) => {
    if (!gradedMap[q.id]) {
      pendingRef.current[q.id] = answers;
      hintRef.current[q.id] = { level: hintLevel, used: usedHint };
    }
    const nq = questions[j];
    setIdx(j);
    startedRef.current = Date.now();
    if (!nq) return;
    if (gradedMap[nq.id]) {
      setAnswers(draftAnswersRef.current[nq.id] ?? {});
      setHintLevel(0); setUsedHint(draftHintsRef.current[nq.id] ?? false);
    } else {
      setAnswers(pendingRef.current[nq.id] ?? {});
      const h = hintRef.current[nq.id];
      setHintLevel(h?.level ?? 0); setUsedHint(h?.used ?? false);
    }
  };

  // 再シャッフル：採点済みの問題は位置と結果を固定し、未採点の問題だけを並べ替える
  const reshuffle = () => {
    if (!gradedMap[q.id]) {
      pendingRef.current[q.id] = answers;
      hintRef.current[q.id] = { level: hintLevel, used: usedHint };
    }
    const ungradedPos = order.map((id, i) => (gradedMap[id] ? -1 : i)).filter((i) => i >= 0);
    if (ungradedPos.length < 2) return;
    const shuffledIds = shuffle(ungradedPos.map((i) => order[i]!), mulberry32(((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0)));
    const next = [...order];
    ungradedPos.forEach((pos, k) => { next[pos] = shuffledIds[k]!; });
    setOrder(next);
    const ni = next.indexOf(q.id);
    setIdx(ni);
    if (!gradedMap[q.id]) {
      setAnswers(pendingRef.current[q.id] ?? {});
      const h = hintRef.current[q.id];
      setHintLevel(h?.level ?? 0); setUsedHint(h?.used ?? false);
    }
  };

  const submit = () => {
    if (gradedIdsRef.current.has(q.id)) return; // 高速な二重クリックで同一問題を二重記録しない
    gradedIdsRef.current.add(q.id);
    const g = grade(q, answers);
    const seconds = Math.round((Date.now() - startedRef.current) / 1000);
    draftAnswersRef.current[q.id] = answers;
    draftHintsRef.current[q.id] = usedHint;
    setGradedMap((m) => ({ ...m, [q.id]: g }));
    update((d) => ({
      ...d,
      attempts: [...d.attempts, { questionId: q.id, at: Date.now(), correct: g.allCorrect, fieldCorrect: g.correctCount, fieldTotal: g.totalFields, usedHint, seconds, mode, noCalcMode: data.settings.noCalcMode, answers, fieldResults: g.fieldResults }],
      recentQuestionIds: [...d.recentQuestionIds.filter((x) => x !== q.id), q.id].slice(-60),
    }));
  };

  return (
    <div>
      <div className="session-head">
        <span>{mode === 'review' ? '復習' : '演習'} {idx + 1} / {questions.length}（採点済み {doneCount}）</span>
        <span>
          <button onClick={reshuffle}>並び替え</button>{' '}
          <button onClick={() => go({ name: 'home' })}>終了する</button>
        </span>
      </div>
      <section className="panel">
        <p className="muted">{SECTION_LABEL[q.section]}｜{q.syllabus}｜難易度：{DIFF_LABEL[q.difficulty]}{q.needsCalc ? `｜計算：${q.calcType ?? 'あり'}` : '｜計算不要'}{' '}
          <button className="linklike" onClick={() => update((d) => ({ ...d, bookmarks: d.bookmarks.includes(q.id) ? d.bookmarks.filter((x) => x !== q.id) : [...d.bookmarks, q.id] }))}>
            {data.bookmarks.includes(q.id) ? 'ブックマーク済み' : 'ブックマーク'}
          </button>
        </p>
        <p className="prompt prewrap">{q.prompt}</p>
        <FieldsInput q={q} fields={fields} answers={answers} setAnswers={setAnswers} graded={graded?.fieldResults ?? null} disabled={!!graded} />
        {!graded ? (
          <div className="actions">
            <button className="primary" onClick={submit}>採点する</button>
            {hintLevel < q.hints.length && (
              <button onClick={() => { setHintLevel(hintLevel + 1); setUsedHint(true); }}>ヒントを見る（{hintLevel + 1}/{q.hints.length}）</button>
            )}
          </div>
        ) : (
          <div>
            <p className={graded.allCorrect ? 'result-ok' : 'result-ng'} aria-live="polite">
              {graded.allCorrect ? '正解です。' : `一部不正解です（${graded.correctCount}/${graded.totalFields} 欄正解）。`} {usedHint ? 'ヒント使用ありで記録しました。' : ''}
            </p>
            <h3>正答</h3>
            {q.journal ? <JournalTable journal={q.journal} /> : (
              <ul>{fields.map((f) => <li key={f.key}>{f.label}：{f.kind === 'amount' ? fmtYen(Number(f.answer)) : f.answer}</li>)}</ul>
            )}
            {q.calcProcess && <p><strong>計算過程：</strong>{q.calcProcess}</p>}
            <p className="prewrap">{q.explanation}</p>
            {q.lessonId && LESSON_MAP.get(q.lessonId) && (
              <button onClick={() => go({ name: 'lesson', id: q.lessonId! })}>関連教材：{LESSON_MAP.get(q.lessonId)!.title}</button>
            )}
          </div>
        )}
        {hintLevel > 0 && !graded && (
          <div className="hint-box">{q.hints.slice(0, hintLevel).map((h, i) => <p key={i}>ヒント{i + 1}：{h}</p>)}</div>
        )}
        {idx > 0 && (
          <button className="next-btn" onClick={() => goTo(idx - 1)}>前の問題へ</button>
        )}
        {idx + 1 < questions.length ? (
          <button className="primary next-btn" disabled={!graded} onClick={() => goTo(idx + 1)}>次の問題へ</button>
        ) : graded ? (
          <button className="primary next-btn" onClick={() => go({ name: 'analytics' })}>結果・成績を見る</button>
        ) : null}
      </section>
      <details className="panel">
        <summary>電卓・計算用メモ（演習用）</summary>
        <Calculator />
        <textarea aria-label="計算用メモ" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="計算用メモ" />
      </details>
    </div>
  );
}

function ExamSetup({ go, update }: { go: (v: View) => void; update: (fn: (d: UserData) => UserData) => void }) {
  const [setNo, setSetNo] = useState(1);
  const start = (kind: 'fixed' | 'random') => {
    const paper = buildExam(ALL_QUESTIONS, kind, setNo);
    const startedAt = Date.now();
    update((d) => ({ ...d, draft: { kind: 'exam', payload: { paper, answers: {}, startedAt }, savedAt: Date.now() } }));
    go({ name: 'exam', paper, startedAt });
  };
  return (
    <div>
      <h1>模擬試験</h1>
      <section className="panel">
        <p>公式資料で確認できる条件に合わせます：試験時間 {EXAM_MINUTES} 分、第1問 {SECTION_MAX.q1} 点・第2問 {SECTION_MAX.q2} 点・第3問 {SECTION_MAX.q3} 点の合計100点、合格基準 {PASS_LINE} 点（目標 {TARGET_LINE} 点は学習目標です）。ヒント・正答表示・途中採点・計算問題除外は無効です。</p>
        <p className="muted">設問ごとの配点内訳や部分点の付け方など、公式が公開していない採点の細部は、本アプリ独自の方法（欄の正誤に応じた按分）で近似しています。本試験は会場のPCで受験し、条件を満たす実物の電卓と会場から配布される計算・メモ用紙（A4・2枚）を使います。本アプリの模試ではアプリ内電卓を表示しないため、実物の電卓と紙を用意してください。</p>
        <div className="filters">
          <select aria-label="固定模試の回" value={setNo} onChange={(e) => setSetNo(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>固定模試 第{n}回</option>)}
          </select>
          <button className="primary" onClick={() => start('fixed')}>固定模試を開始</button>
          <button onClick={() => start('random')}>ランダム模試を開始</button>
        </div>
      </section>
    </div>
  );
}

function ExamSession({ paper, startedAt, data, update, go }: { paper: ExamPaper; startedAt: number; data: UserData; update: (fn: (d: UserData) => UserData) => void; go: (v: View) => void }) {
  const saved = data.draft?.kind === 'exam' ? (data.draft.payload as { answers: Record<string, Record<string, string>> }).answers : {};
  const [answersByQid, setAnswersByQid] = useState<Record<string, Record<string, string>>>(saved ?? {});
  const [idx, setIdx] = useState(0);
  const [finished, setFinished] = useState<ReturnType<typeof gradeExam> | null>(null);
  const [remain, setRemain] = useState(() => Math.max(0, EXAM_MINUTES * 60 - Math.floor((Date.now() - startedAt) / 1000)));
  const finishedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      const left = EXAM_MINUTES * 60 - Math.floor((Date.now() - startedAt) / 1000);
      setRemain(Math.max(0, left));
      if (left <= 0 && !finishedRef.current) finish(true); // 時間切れは確認なしで自動採点する（9.2）
    }, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, answersByQid]);

  useEffect(() => {
    if (!finished) update((d) => ({ ...d, draft: { kind: 'exam', payload: { paper, answers: answersByQid, startedAt }, savedAt: Date.now() } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answersByQid]);

  const item = paper.items[idx];
  if (!item && !finished) return <p>模試データがありません。</p>;

  function finish(auto = false) {
    if (finishedRef.current) return;
    if (!auto && !window.confirm('模擬試験を終了して採点しますか？終了後は解答を変更できません。')) return;
    finishedRef.current = true;
    const result = gradeExam(paper, answersByQid);
    setFinished(result);
    const elapsed = Math.min(EXAM_MINUTES * 60, Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    const rec: ExamRecord = {
      at: Date.now(), kind: paper.kind, setLabel: paper.setLabel, total: result.total,
      bySection: result.bySection, questionIds: paper.items.map((i) => i.question.id),
      seconds: elapsed, gradingVersion: result.gradingVersion,
    };
    update((d) => ({
      ...d, draft: null, exams: [...d.exams, rec],
      attempts: [...d.attempts, ...paper.items.map((i) => ({
        questionId: i.question.id, at: Date.now(),
        correct: result.perQuestion[i.question.id]?.correct ?? false,
        fieldCorrect: result.perQuestion[i.question.id]?.correctCount ?? 0,
        fieldTotal: i.fields.length, usedHint: false, seconds: 0, mode: 'exam' as const, noCalcMode: false,
        answers: answersByQid[i.question.id] ?? {},
        fieldResults: result.perQuestion[i.question.id]?.fieldResults,
      }))],
    }));
  }

  if (finished) {
    const weakTopics = new Map<string, number>();
    for (const i of paper.items) {
      const got = finished.perQuestion[i.question.id]?.got ?? 0;
      if (got < i.sectionPoints) weakTopics.set(i.question.syllabus, (weakTopics.get(i.question.syllabus) ?? 0) + (i.sectionPoints - got));
    }
    return (
      <div>
        <h1>{paper.setLabel} 結果</h1>
        <section className="panel">
          <p className="score-big">{finished.total} 点 / 100点</p>
          <p>第1問 {finished.bySection.q1.got}/{SECTION_MAX.q1} 点、第2問 {finished.bySection.q2.got}/{SECTION_MAX.q2} 点、第3問 {finished.bySection.q3.got}/{SECTION_MAX.q3} 点</p>
          <p>合格基準 {PASS_LINE} 点まで {finished.total >= PASS_LINE ? '到達しています' : `あと ${PASS_LINE - finished.total} 点`}。目標 {TARGET_LINE} 点まで {finished.total >= TARGET_LINE ? '到達しています' : `あと ${TARGET_LINE - finished.total} 点`}。</p>
          <p className="muted">これは本アプリ独自の採点です。実際の合否判定や得点を保証するものではありません。</p>
          {weakTopics.size > 0 && <p>得点できなかった分野：{[...weakTopics.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}（−${v}点）`).join('、')}</p>}
        </section>
        {paper.items.map((i, n) => {
          const r = finished.perQuestion[i.question.id];
          return (
            <details key={i.question.id} className="panel">
              <summary>{n + 1}. {i.question.syllabus}（{r?.got ?? 0}/{i.sectionPoints}点）</summary>
              <p className="prompt prewrap">{i.question.prompt}</p>
              <FieldsInput q={i.question} fields={i.fields} answers={answersByQid[i.question.id] ?? {}} setAnswers={() => undefined} graded={r?.fieldResults ?? null} disabled />
              <h3>正答</h3>
              {i.question.journal ? <JournalTable journal={i.question.journal} /> : (
                <ul>{i.fields.map((f) => <li key={f.key}>{f.label}：{f.kind === 'amount' ? fmtYen(Number(f.answer)) : f.answer}</li>)}</ul>
              )}
              {i.question.calcProcess && <p><strong>計算過程：</strong>{i.question.calcProcess}</p>}
              <p className="prewrap">{i.question.explanation}</p>
            </details>
          );
        })}
        <button className="primary" onClick={() => go({ name: 'analytics' })}>成績分析を見る</button>
      </div>
    );
  }

  return (
    <div>
      <div className="session-head">
        <span>{paper.setLabel}｜残り時間 <span role="timer" aria-label={`残り時間 ${Math.floor(remain / 60)}分${remain % 60}秒`}>{mmss(remain)}</span>｜{idx + 1} / {paper.items.length}</span>
        <button onClick={() => finish(false)}>試験を終了して採点</button>
      </div>
      <div className="exam-nav" role="navigation" aria-label="大問移動">
        {(['q1', 'q2', 'q3'] as Section[]).map((s) => {
          const first = paper.items.findIndex((i) => i.section === s);
          return first >= 0 ? <button key={s} onClick={() => setIdx(first)}>{SECTION_LABEL[s].replace('形式', '')}へ</button> : null;
        })}
        {paper.items.map((i, n) => (
          <button key={i.question.id} className={n === idx ? 'num active' : 'num'} onClick={() => setIdx(n)} aria-label={`${n + 1}問目へ`}>{n + 1}</button>
        ))}
      </div>
      <section className="panel">
        <p className="muted">{SECTION_LABEL[item.section]}（{item.sectionPoints}点）｜{item.question.syllabus}</p>
        <p className="prompt prewrap">{item.question.prompt}</p>
        <FieldsInput q={item.question} fields={item.fields} answers={answersByQid[item.question.id] ?? {}}
          setAnswers={(a) => setAnswersByQid((prev) => ({ ...prev, [item.question.id]: a }))} graded={null} />
        <div className="actions">
          <button disabled={idx === 0} onClick={() => setIdx(idx - 1)}>前へ</button>
          <button className="primary" disabled={idx + 1 >= paper.items.length} onClick={() => setIdx(idx + 1)}>次へ</button>
        </div>
      </section>
    </div>
  );
}

function AnalyticsView({ data, go, startReview }: { data: UserData; go: (v: View) => void; startReview: () => void }) {
  const tstats = topicStats(data.attempts, QUESTION_MAP);
  const ex = data.attempts.filter((a) => a.mode !== 'exam');
  const byDiff = (['basic', 'standard', 'advanced'] as Difficulty[]).map((d) => {
    const list = ex.filter((a) => QUESTION_MAP.get(a.questionId)?.difficulty === d);
    return { d, n: list.length, rate: list.length ? Math.round((list.filter((a) => a.correct).length / list.length) * 100) : 0 };
  });
  const bySection = (['q1', 'q2', 'q3'] as Section[]).map((s) => {
    const list = ex.filter((a) => QUESTION_MAP.get(a.questionId)?.section === s);
    return { s, n: list.length, rate: list.length ? Math.round((list.filter((a) => a.correct).length / list.length) * 100) : 0 };
  });
  const noCalcAttempts = ex.filter((a) => a.noCalcMode);
  return (
    <div>
      <h1>成績・学習分析</h1>
      <section className="panel">
        <h2>模擬試験の推移</h2>
        {data.exams.length === 0 ? <p className="muted">まだ模擬試験の記録がありません。</p> : (
          <ul>{data.exams.map((e, i) => <li key={i}>{new Date(e.at).toLocaleString('ja-JP')}｜{e.setLabel}｜<strong>{e.total}点</strong>（第1問 {e.bySection.q1.got}・第2問 {e.bySection.q2.got}・第3問 {e.bySection.q3.got}）目標{TARGET_LINE}点まで {Math.max(0, TARGET_LINE - e.total)} 点{e.seconds !== undefined ? `｜所要 ${Math.floor(e.seconds / 60)}分${e.seconds % 60}秒` : ''}{e.gradingVersion === 2 ? '' : '｜旧採点方式の記録'}</li>)}</ul>
        )}
      </section>
      <section className="panel">
        <h2>単元別（通常演習・復習）</h2>
        {tstats.length === 0 ? <p className="muted">まだ演習記録がありません。</p> : (
          <table className="stats-table"><thead><tr><th>単元</th><th>解答数</th><th>正答率</th><th>習熟度</th></tr></thead>
            <tbody>{tstats.map((t) => <tr key={t.topic}><td>{t.syllabus}</td><td className="num">{t.attempts}</td><td className="num">{Math.round(t.rate * 100)}%</td><td className="num">{t.mastery}</td></tr>)}</tbody></table>
        )}
        <p className="muted">習熟度＝全期間の換算正答率×50％＋直近10件の換算正答率×50％で計算しています（合格予測ではありません）。ヒントを使って正解した解答は自力正解と区別し、換算正答率では0.5件として数えます。</p>
      </section>
      <section className="panel">
        <h2>難易度別・形式別</h2>
        <p>難易度：{byDiff.map((x) => `${DIFF_LABEL[x.d]} ${x.rate}%（${x.n}問）`).join('｜')}</p>
        <p>形式：{bySection.map((x) => `${SECTION_LABEL[x.s]} ${x.rate}%（${x.n}問）`).join('｜')}</p>
        <p className="muted">計算問題除外モードでの解答は {noCalcAttempts.length} 件あります。この成績は通常演習・模試の成績とは別に扱ってください（除外モードの正答率は試験全体の得点力を表しません）。</p>
        <button onClick={startReview}>復習を開始する</button>{' '}
        <button onClick={() => go({ name: 'practice-setup' })}>演習を設定する</button>
      </section>
      <section className="panel">
        <h2>学習計画</h2>
        {(() => {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const todaySec = data.attempts.filter((a) => a.at >= startOfToday.getTime()).reduce((s, a) => s + a.seconds, 0)
            + data.exams.filter((e) => e.at >= startOfToday.getTime()).reduce((s, e) => s + (e.seconds ?? 0), 0);
          const todayMin = Math.floor(todaySec / 60);
          return (
            <p>
              {data.settings.examDate ? <>受験予定日：{data.settings.examDate}（あと {Math.max(0, Math.ceil((new Date(data.settings.examDate).getTime() - Date.now()) / 86400000))} 日）｜</> : null}
              1日の目標：{data.settings.dailyGoalMinutes} 分｜本日の学習時間：{todayMin} 分（目標まで {Math.max(0, data.settings.dailyGoalMinutes - todayMin)} 分）
            </p>
          );
        })()}
      </section>
    </div>
  );
}

function SettingsView({ data, update }: { data: UserData; update: (fn: (d: UserData) => UserData) => void }) {
  const s = data.settings;
  const set = (patch: Partial<UserData['settings']>) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const [importMsg, setImportMsg] = useState('');
  const download = (name: string, text: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };
  const onImportFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then((text) => {
      const r = parseImportedJson(text);
      if (!r.ok) { setImportMsg(r.error); return; }
      if (window.confirm('現在の学習データを、読み込んだ内容で置き換えますか？（現在のデータは失われます。先に書き出しを済ませてください）')) {
        update(() => r.data);
        setImportMsg('学習データを取り込みました。');
      }
    }).catch(() => setImportMsg('ファイルを読み取れませんでした。'));
  };
  const backup = corruptBackup();
  return (
    <div>
      <h1>設定</h1>
      <section className="panel">
        <label>テーマ{' '}
          <select value={s.theme} onChange={(e) => set({ theme: e.target.value as UserData['settings']['theme'] })}>
            <option value="auto">OS連動</option><option value="light">ライト</option><option value="dark">ダーク</option>
          </select>
        </label>
        <label>文字サイズ{' '}
          <select value={String(s.fontScale)} onChange={(e) => set({ fontScale: Number(e.target.value) })}>
            <option value="0.9">小</option><option value="1">標準</option><option value="1.15">大</option><option value="1.3">特大</option>
          </select>
        </label>
        <label>受験予定日{' '}
          <input type="date" value={s.examDate} onChange={(e) => set({ examDate: e.target.value })} />
        </label>
        <label>1日の学習目標（分）{' '}
          <input type="number" min={5} max={480} value={s.dailyGoalMinutes} onChange={(e) => set({ dailyGoalMinutes: Number(e.target.value) || 30 })} />
        </label>
        <p className="muted">学習データはこの端末のブラウザ内（localStorage）に自動保存されます。ブラウザのデータを削除すると履歴は失われます。アカウント登録やクラウド同期はありません。</p>
        <button onClick={() => { if (window.confirm('学習履歴をすべて削除しますか？')) update(() => loadUserDataFresh()); }}>学習履歴をリセット</button>
      </section>
      <section className="panel">
        <h2>学習データの書き出し・取り込み</h2>
        <p className="muted">機種変更やブラウザ変更のときは、書き出したJSONを取り込むと履歴を引き継げます。取り込むと現在のデータは置き換わります。</p>
        <button onClick={() => download('boki-backup.json', exportUserDataJson(data))}>学習データを書き出す</button>{' '}
        <label className="file-label">学習データを取り込む
          <input type="file" accept="application/json,.json" className="visually-hidden" onChange={(e) => onImportFile(e.target.files?.[0])} />
        </label>
        {importMsg && <p role="status">{importMsg}</p>}
        {backup && (
          <p className="muted">読み取れなかった保存データの退避があります。
            <button onClick={() => download('boki-corrupt-backup.json', backup)}>退避データをダウンロード</button>
          </p>
        )}
      </section>
      <section className="panel">
        <h2>このアプリについて</h2>
        <p className="muted">対象：日商簿記検定3級 ネット試験（2027年度以降の出題区分表・配点 第1問45点／第2問25点／第3問30点、60分、合格基準70点）。日本商工会議所とは無関係の独自アプリです。問題データの適用年度は2027年度、バージョン1.0です。収録問題は独立問題 {INDEPENDENT_QUESTIONS.length} 問と、取引モデルから導出した派生問題 {DERIVED_QUESTIONS.length} 問の合計 {ALL_QUESTIONS.length} 問で、全問について借方・貸方合計の一致と科目の妥当性を自動検証しています。</p>
      </section>
    </div>
  );
}
function loadUserDataFresh(): UserData {
  try { localStorage.removeItem('boki-userdata-v1'); } catch { /* ignore */ }
  clearCorruptBackup();
  return loadUserData();
}

function SearchView({ data, go }: { data: UserData; go: (v: View) => void }) {
  const [query, setQuery] = useState('');
  const [noCalcOnly, setNoCalcOnly] = useState(false);
  const lessons = query ? LESSONS.filter((l) => l.title.includes(query) || l.stages.overview.includes(query) || l.stages.detail.includes(query) || l.stages.expert.includes(query) || l.stages.practice.includes(query)) : [];
  const terms = query ? GLOSSARY.filter((g) => g.term.includes(query) || g.short.includes(query) || g.detail.includes(query)) : [];
  // 先に全条件で絞り込んでから表示用に切り取る（旧実装は30件に切ってから絞っていたため件数が実際とずれていた）
  const matchedQuestions = query ? ALL_QUESTIONS.filter((q) => q.prompt.includes(query) || q.syllabus.includes(query) || q.explanation.includes(query)) : [];
  const filteredQuestions = matchedQuestions.filter((q) => !noCalcOnly || !q.needsCalc);
  const questions = filteredQuestions.slice(0, 30);
  return (
    <div>
      <h1>横断検索</h1>
      <input aria-label="検索キーワード" placeholder="教材・辞典・問題を検索" value={query} onChange={(e) => setQuery(e.target.value)} />
      <label><input type="checkbox" checked={noCalcOnly} onChange={(e) => setNoCalcOnly(e.target.checked)} /> 計算不要の問題のみ</label>
      {query && (
        <div>
          <section className="panel"><h2>教材（{lessons.length}）</h2>
            {lessons.map((l) => <p key={l.id}><button className="linklike" onClick={() => go({ name: 'lesson', id: l.id })}>{l.title}</button></p>)}
          </section>
          <section className="panel"><h2>辞典（{terms.length}）</h2>
            {terms.map((g) => <p key={g.term + g.kind}><strong>{g.term}</strong>：{g.short}</p>)}
          </section>
          <section className="panel"><h2>問題（{filteredQuestions.length}）</h2>
            {filteredQuestions.length > questions.length && <p className="muted">全 {filteredQuestions.length} 件のうち先頭 {questions.length} 件を表示しています。キーワードを絞ると残りも確認できます。</p>}
            {questions.map((q) => (
              <p key={q.id}>{q.syllabus}｜{DIFF_LABEL[q.difficulty]}｜<button className="linklike" onClick={() => go({ name: 'practice', ids: [q.id], mode: 'practice' })}>この問題を解く</button><br /><span className="muted">{q.prompt.slice(0, 80)}…</span></p>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
