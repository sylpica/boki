import type { CardStat, GlossaryEntry, JournalLine } from '../types';
import { mulberry32, shuffle } from './shuffle';

/** 単語帳カード。問題ブックマークと混ざらないよう ID は 'card:' 名前空間で一意にする */
export interface FlashCard {
  id: string;
  term: string;
  kind: 'account' | 'term';
  category?: string;
  /** 表面：用語・科目名（問い） */
  front: string;
  /** 裏面の要約（定義） */
  back: string;
  detail: string;
  normalSide?: 'debit' | 'credit';
  statement?: string;
  exampleJournal?: JournalLine[];
  confusable?: string[];
  lessonId?: string;
}

/**
 * 辞典から単語帳カードを生成する。辞典には同名で科目（account）と概念（term）の
 * 両方で登録された語が4語あるため、ID は kind を含めて一意化する。
 */
export function buildCards(glossary: GlossaryEntry[]): FlashCard[] {
  const seen = new Map<string, number>();
  return glossary.map((g) => {
    const base = `card:${g.kind}:${g.term}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return {
      id: n > 1 ? `${base}#${n}` : base,
      term: g.term,
      kind: g.kind,
      category: g.category,
      front: g.term,
      back: g.short,
      detail: g.detail,
      normalSide: g.normalSide,
      statement: g.statement,
      exampleJournal: g.exampleJournal,
      confusable: g.confusable,
      lessonId: g.lessonId,
    };
  });
}

export type CardEval = 'known' | 'unsure' | 'unknown';

/** 自己評価に応じた次回復習までの間隔（ミリ秒）。根拠のない精密な予測はせず、単純で説明可能な規則にする */
export const CARD_INTERVAL_MS: Record<CardEval, number> = {
  known: 7 * 24 * 60 * 60 * 1000,
  unsure: 2 * 24 * 60 * 60 * 1000,
  unknown: 0, // その日のうちに再出題対象
};

export function recordCardEval(stats: Record<string, CardStat>, cardId: string, ev: CardEval, now: number): Record<string, CardStat> {
  const prev: CardStat = stats[cardId] ?? { seen: 0, known: 0, unsure: 0, unknown: 0, lastSeenAt: 0, dueAt: 0 };
  const next: CardStat = {
    seen: prev.seen + 1,
    known: prev.known + (ev === 'known' ? 1 : 0),
    unsure: prev.unsure + (ev === 'unsure' ? 1 : 0),
    unknown: prev.unknown + (ev === 'unknown' ? 1 : 0),
    lastSeenAt: now,
    dueAt: now + CARD_INTERVAL_MS[ev],
  };
  return { ...stats, [cardId]: next };
}

/** 復習対象：未学習、または復習期限が来ているカード */
export function isDue(stat: CardStat | undefined, now: number): boolean {
  if (!stat || stat.seen === 0) return true;
  return stat.dueAt <= now;
}

export interface DeckOptions {
  category?: string; // 'all' のとき全分類
  onlyBookmarked?: boolean;
  onlyDue?: boolean;
  shuffle?: boolean;
  seed?: number;
}

/** 条件に合うカードのID列を作る。シャッフル時は重複・欠落なく並べ替える */
export function buildDeck(cards: FlashCard[], bookmarks: string[], stats: Record<string, CardStat>, opts: DeckOptions, now = Date.now()): string[] {
  const bm = new Set(bookmarks);
  const picked = cards.filter((c) =>
    (opts.category === undefined || opts.category === 'all' || c.category === opts.category || (opts.category === '用語' && c.kind === 'term')) &&
    (!opts.onlyBookmarked || bm.has(c.id)) &&
    (!opts.onlyDue || isDue(stats[c.id], now))
  );
  const ids = picked.map((c) => c.id);
  if (opts.shuffle === false) return ids;
  const rng = mulberry32(opts.seed ?? ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0));
  return shuffle(ids, rng);
}

/**
 * スワイプの方向判定（FP・AI総合マスターと同方式）。
 * 開始位置には依存せず移動量だけで決めるため、カードの左寄り・右寄りを触っても同じ感度で判定できる。
 * 水平移動がしきい値以上で、かつ縦移動の1.5倍を超えるときだけカード移動とみなす（縦スクロールと誤認しない）。
 * 戻り値: 'next'（左スワイプ＝次のカード）/ 'prev'（右スワイプ＝前のカード）/ null（スワイプではない）
 */
export function swipeNav(dx: number, dy: number, threshold = 40): 'next' | 'prev' | null {
  if (Math.abs(dx) < threshold) return null;
  if (Math.abs(dx) <= Math.abs(dy) * 1.5) return null;
  return dx < 0 ? 'next' : 'prev';
}
/**
 * 再シャッフル：現在表示中のカードはその位置に残し、それ以降のカードだけを並べ替える
 * （学習中の現在カードや採点済みの流れを不意に飛ばさないための継続ルール）。
 */
export function reshuffleRemaining(ids: string[], currentIdx: number, seed?: number): string[] {
  if (currentIdx >= ids.length - 1) return [...ids];
  const rng = mulberry32(seed ?? ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0));
  const head = ids.slice(0, currentIdx + 1);
  const tail = shuffle(ids.slice(currentIdx + 1), rng);
  return [...head, ...tail];
}
