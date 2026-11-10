import { useMemo, useState } from 'react';
import type { UserData } from './types';
import { GLOSSARY } from './data';
import { buildCards, buildDeck, isDue, recordCardEval, reshuffleRemaining, type CardEval } from './lib/flashcards';
import { JournalTable } from './App';

type StartSide = 'front' | 'back';
type Source = 'all' | 'bookmarked' | 'due' | 'unseen';

const EVAL_LABEL: Record<CardEval, string> = { known: '覚えた', unsure: '不安', unknown: '分からない' };

/**
 * 単語帳（フラッシュカード）。開始時に表面／裏面を同じ重みで選べ、
 * 選んだ面が1枚目から全カードに一貫して適用される（第7部）。
 */
export default function CardsView({ data, update, goLesson, goHome }: {
  data: UserData;
  update: (fn: (d: UserData) => UserData) => void;
  goLesson: (id: string) => void;
  goHome: () => void;
}) {
  const cards = useMemo(() => buildCards(GLOSSARY), []);
  const cardMap = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const [category, setCategory] = useState('all');
  const [source, setSource] = useState<Source>('all');
  const [shuffleOn, setShuffleOn] = useState(true);

  const resumeSession = data.cardSession && data.cardSession.ids.length > 0 ? data.cardSession : null;
  const [session, setSession] = useState<{ ids: string[]; idx: number; startSide: StartSide; shuffle: boolean } | null>(null);
  const [faceFlipped, setFaceFlipped] = useState(false);
  const [evals, setEvals] = useState<Record<CardEval, number>>({ known: 0, unsure: 0, unknown: 0 });
  const [finished, setFinished] = useState(false);

  const categories = ['all', '資産', '負債', '純資産', '収益', '費用', '用語'];
  const now = Date.now();
  const dueCount = cards.filter((c) => isDue(data.cardStats[c.id], now)).length;
  const unseenCount = cards.filter((c) => !data.cardStats[c.id] || data.cardStats[c.id]!.seen === 0).length;

  const matchingCount = (src: Source, cat: string) => buildDeck(cards, data.cardBookmarks, data.cardStats, {
    category: cat === '用語' ? '用語' : cat,
    onlyBookmarked: src === 'bookmarked',
    onlyDue: src === 'due',
    shuffle: false,
  }, now).filter((id) => (src !== 'unseen' || !data.cardStats[id] || data.cardStats[id]!.seen === 0)).length;

  const start = (startSide: StartSide, idsOverride?: string[]) => {
    const ids = idsOverride ?? buildDeck(cards, data.cardBookmarks, data.cardStats, {
      category: category === '用語' ? '用語' : category,
      onlyBookmarked: source === 'bookmarked',
      onlyDue: source === 'due',
      shuffle: shuffleOn,
    }, now).filter((id) => (source !== 'unseen' || !data.cardStats[id] || data.cardStats[id]!.seen === 0));
    if (ids.length === 0) return;
    setEvals({ known: 0, unsure: 0, unknown: 0 });
    setFaceFlipped(false);
    setFinished(false);
    setSession({ ids, idx: 0, startSide, shuffle: shuffleOn });
    update((d) => ({ ...d, cardSession: { ids, idx: 0, startSide, shuffle: shuffleOn, savedAt: Date.now() } }));
  };

  const resume = () => {
    if (!resumeSession) return;
    setEvals({ known: 0, unsure: 0, unknown: 0 });
    setFaceFlipped(false);
    setFinished(false);
    setSession({ ids: resumeSession.ids, idx: resumeSession.idx, startSide: resumeSession.startSide, shuffle: resumeSession.shuffle });
  };

  if (!session) {
    const total = matchingCount(source, category);
    return (
      <div>
        <h1>単語帳</h1>
        <section className="panel">
          <p className="muted">辞典の{ cards.length }枚のカードで、科目と用語を覚えます。問題演習とは別の記憶モードです。</p>
          <div className="card-summary">
            <span>復習対象 {dueCount} 枚</span>
            <span>未学習 {unseenCount} 枚</span>
            <span>ブックマーク {data.cardBookmarks.length} 枚</span>
          </div>
          <div className="filters">
            <select aria-label="分類" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c === 'all' ? '分類すべて' : c}</option>)}
            </select>
            <select aria-label="出題範囲" value={source} onChange={(e) => setSource(e.target.value as Source)}>
              <option value="all">すべて</option>
              <option value="due">復習対象のみ</option>
              <option value="unseen">未学習のみ</option>
              <option value="bookmarked">ブックマークのみ</option>
            </select>
            <label><input type="checkbox" checked={shuffleOn} onChange={(e) => setShuffleOn(e.target.checked)} /> シャッフル</label>
          </div>
          <p aria-live="polite">{total === 0 ? '条件に合うカードがありません。条件を変えてください。' : `条件に合うカード ${total} 枚`}</p>
          <p className="muted">開始する面を選んでください。どちらから始めても、1枚目の表示はその面になります。</p>
          <div className="card-start-buttons">
            <button className="primary" disabled={total === 0} onClick={() => start('front')}>表面から開始</button>
            <button className="primary" disabled={total === 0} onClick={() => start('back')}>裏面から開始</button>
          </div>
        </section>
        {resumeSession && (
          <section className="panel warn-panel">
            <p>単語帳の途中データがあります（{resumeSession.ids.length}枚中 {resumeSession.idx + 1} 枚目、{resumeSession.startSide === 'front' ? '表面' : '裏面'}から開始）。</p>
            <button className="primary" onClick={resume}>単語帳を再開する</button>{' '}
            <button onClick={() => update((d) => ({ ...d, cardSession: null }))}>破棄する</button>
          </section>
        )}
      </div>
    );
  }

  const card = cardMap.get(session.ids[session.idx]!);
  if (!card) return <div><p>カードがありません。</p><button onClick={goHome}>ホームへ</button></div>;
  const shownSide: StartSide = faceFlipped ? (session.startSide === 'front' ? 'back' : 'front') : session.startSide;
  const isBookmarked = data.cardBookmarks.includes(card.id);

  const moveTo = (nextIdx: number) => {
    if (nextIdx >= session.ids.length) {
      setFinished(true);
      update((d) => ({ ...d, cardSession: null }));
      return;
    }
    setFaceFlipped(false);
    const next = { ...session, idx: nextIdx };
    setSession(next);
    update((d) => ({ ...d, cardSession: { ids: next.ids, idx: nextIdx, startSide: next.startSide, shuffle: next.shuffle, savedAt: Date.now() } }));
  };

  const evaluate = (ev: CardEval) => {
    update((d) => ({ ...d, cardStats: recordCardEval(d.cardStats, card.id, ev, Date.now()) }));
    setEvals((e) => ({ ...e, [ev]: e[ev] + 1 }));
    moveTo(session.idx + 1);
  };

  const reshuffle = () => {
    const ids = reshuffleRemaining(session.ids, session.idx);
    const next = { ...session, ids };
    setSession(next);
    update((d) => ({ ...d, cardSession: { ids, idx: next.idx, startSide: next.startSide, shuffle: next.shuffle, savedAt: Date.now() } }));
  };

  const switchStartSide = () => {
    const nextSide: StartSide = session.startSide === 'front' ? 'back' : 'front';
    setFaceFlipped(false);
    const next = { ...session, startSide: nextSide };
    setSession(next);
    update((d) => ({ ...d, cardSession: { ids: next.ids, idx: next.idx, startSide: nextSide, shuffle: next.shuffle, savedAt: Date.now() } }));
  };

  if (finished) {
    const totalEval = evals.known + evals.unsure + evals.unknown;
    return (
      <div>
        <h1>単語帳の結果</h1>
        <section className="panel">
          <p>{session.ids.length} 枚を終えました。覚えた {evals.known} 枚、不安 {evals.unsure} 枚、分からない {evals.unknown} 枚（{totalEval} 枚評価）。</p>
          <p className="muted">「分からない」は今日中に再出題の対象に、「不安」は2日後、「覚えた」は7日後に復習予定として記録しました。カードの評価だけで模試の点数や合格を予測しません。</p>
          <button className="primary" onClick={() => start(session.startSide)}>同じ条件でもう一度</button>{' '}
          <button onClick={() => { setSession(null); }}>条件を変える</button>{' '}
          <button onClick={goHome}>ホームへ</button>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="session-head">
        <span>単語帳 {session.idx + 1} / {session.ids.length}（{session.startSide === 'front' ? '表面' : '裏面'}から開始）</span>
        <button onClick={() => { setSession(null); }}>終了する</button>
      </div>
      <section className="panel">
        <div
          className="flashcard"
          role="button"
          tabIndex={0}
          aria-label={`カードをめくる（現在は${shownSide === 'front' ? '表面' : '裏面'}）`}
          onClick={() => setFaceFlipped((f) => !f)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFaceFlipped((f) => !f); } }}
        >
          <span className="card-side-label">{shownSide === 'front' ? '表面' : '裏面'}（タップでめくる）</span>
          {shownSide === 'front' ? (
            <div className="card-face">
              <strong className="card-term">{card.front}</strong>
              <p className="muted">{card.kind === 'account' ? `勘定科目（${card.category ?? ''}）` : '専門用語'}</p>
            </div>
          ) : (
            <div className="card-face">
              <strong>{card.back}</strong>
              <p>{card.detail}</p>
              {card.normalSide && <p className="muted">通常残高：{card.normalSide === 'debit' ? '借方' : '貸方'}{card.statement ? `｜財務諸表：${card.statement}` : ''}</p>}
              {card.exampleJournal && <JournalTable journal={card.exampleJournal} />}
              {card.confusable && card.confusable.length > 0 && <p className="muted">間違いやすい科目：{card.confusable.join('、')}</p>}
            </div>
          )}
        </div>
        <div className="actions">
          <button onClick={() => update((d) => ({ ...d, cardBookmarks: isBookmarked ? d.cardBookmarks.filter((x) => x !== card.id) : [...d.cardBookmarks, card.id] }))}>
            {isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}
          </button>
          <button onClick={reshuffle}>以降を並び替え</button>
          <button onClick={switchStartSide}>開始面を{session.startSide === 'front' ? '裏面' : '表面'}に切替</button>
          {card.lessonId && <button onClick={() => goLesson(card.lessonId!)}>関連教材を開く</button>}
        </div>
        <div className="card-eval">
          <p className="muted">このカードの自己評価（評価して次へ進みます）</p>
          <button className="primary" onClick={() => evaluate('known')}>覚えた</button>
          <button onClick={() => evaluate('unsure')}>不安</button>
          <button onClick={() => evaluate('unknown')}>分からない</button>
        </div>
        <div className="actions">
          <button disabled={session.idx === 0} onClick={() => moveTo(session.idx - 1)}>前へ</button>
          <button className="primary" disabled={session.idx + 1 >= session.ids.length} onClick={() => moveTo(session.idx + 1)}>次へ</button>
        </div>
        <p className="muted">並び替えは、表示中のカードをその場に残し、それ以降のカードだけを並べ替えます。</p>
      </section>
    </div>
  );
}
