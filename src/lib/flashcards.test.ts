import { describe, expect, it } from 'vitest';
import { GLOSSARY } from '../data';
import { buildCards, buildDeck, isDue, recordCardEval, reshuffleRemaining, swipeNav, CARD_INTERVAL_MS } from './flashcards';

const cards = buildCards(GLOSSARY);

describe('単語帳カードの生成', () => {
  it('辞典151件から151枚、IDはすべて一意で card: 名前空間', () => {
    expect(cards.length).toBe(151);
    expect(new Set(cards.map((c) => c.id)).size).toBe(151);
    expect(cards.every((c) => c.id.startsWith('card:'))).toBe(true);
  });
  it('同名で科目と用語の両方に登録された語も別カードになる', () => {
    const dup = cards.filter((c) => c.term === '現金過不足');
    expect(dup.length).toBe(2);
    expect(dup[0]!.id).not.toBe(dup[1]!.id);
  });
});

describe('buildDeck', () => {
  it('シャッフルは重複・欠落のない並べ替え（複数シード）', () => {
    for (const seed of [1, 42, 2027]) {
      const deck = buildDeck(cards, [], {}, { shuffle: true, seed });
      expect(deck.length).toBe(cards.length);
      expect(new Set(deck).size).toBe(cards.length);
      expect([...deck].sort()).toEqual(cards.map((c) => c.id).sort());
    }
  });
  it('シャッフルOFFでは辞典の順序を保つ', () => {
    const deck = buildDeck(cards, [], {}, { shuffle: false });
    expect(deck).toEqual(cards.map((c) => c.id));
  });
  it('再シャッフル（同条件・別シード）で順序が再抽選される', () => {
    const a = buildDeck(cards, [], {}, { shuffle: true, seed: 1 });
    const b = buildDeck(cards, [], {}, { shuffle: true, seed: 2 });
    expect(a).not.toEqual(b);
  });
  it('ブックマーク限定はブックマークしたカードだけ', () => {
    const bm = [cards[0]!.id, cards[5]!.id];
    const deck = buildDeck(cards, bm, {}, { onlyBookmarked: true, shuffle: false });
    expect(deck).toEqual(bm);
  });
  it('復習対象は未学習と期限到来のみ', () => {
    const now = 1_000_000_000_000;
    const stats = {
      [cards[0]!.id]: { seen: 1, known: 1, unsure: 0, unknown: 0, lastSeenAt: now - 1000, dueAt: now + CARD_INTERVAL_MS.known },
      [cards[1]!.id]: { seen: 1, known: 0, unsure: 0, unknown: 1, lastSeenAt: now - 1000, dueAt: now - 1 },
    };
    const deck = buildDeck(cards, [], stats, { onlyDue: true, shuffle: false }, now);
    expect(deck).not.toContain(cards[0]!.id);
    expect(deck).toContain(cards[1]!.id);
    expect(deck).toContain(cards[2]!.id); // 未学習
  });
  it('分類フィルタ（用語）', () => {
    const deck = buildDeck(cards, [], {}, { category: '用語', shuffle: false });
    expect(deck.length).toBe(cards.filter((c) => c.kind === 'term').length);
  });
});

describe('reshuffleRemaining', () => {
  it('現在位置までのカードは固定され、以降は同じ集合の並べ替え', () => {
    const ids = cards.slice(0, 20).map((c) => c.id);
    const out = reshuffleRemaining(ids, 3, 7);
    expect(out.slice(0, 4)).toEqual(ids.slice(0, 4));
    expect([...out.slice(4)].sort()).toEqual([...ids.slice(4)].sort());
    expect(out.length).toBe(ids.length);
  });
  it('最後のカードでは何も変わらない', () => {
    const ids = cards.slice(0, 5).map((c) => c.id);
    expect(reshuffleRemaining(ids, 4, 7)).toEqual(ids);
  });
});

describe('recordCardEval と isDue', () => {
  it('評価ごとに回数が増え、間隔どおりに復習予定が立つ', () => {
    const now = 1_700_000_000_000;
    let stats = recordCardEval({}, cards[0]!.id, 'known', now);
    expect(stats[cards[0]!.id]).toMatchObject({ seen: 1, known: 1, dueAt: now + CARD_INTERVAL_MS.known });
    expect(isDue(stats[cards[0]!.id], now)).toBe(false);
    expect(isDue(stats[cards[0]!.id], now + CARD_INTERVAL_MS.known)).toBe(true);
    stats = recordCardEval(stats, cards[0]!.id, 'unknown', now);
    expect(stats[cards[0]!.id]).toMatchObject({ seen: 2, unknown: 1, dueAt: now });
    expect(isDue(stats[cards[0]!.id], now)).toBe(true);
    stats = recordCardEval(stats, cards[0]!.id, 'unsure', now);
    expect(stats[cards[0]!.id]!.dueAt).toBe(now + CARD_INTERVAL_MS.unsure);
  });
  it('未学習は常に復習対象', () => {
    expect(isDue(undefined, Date.now())).toBe(true);
  });
});

describe('スワイプ判定（swipeNav）', () => {
  it('左スワイプは next、右スワイプは prev', () => {
    expect(swipeNav(-60, 0)).toBe('next');
    expect(swipeNav(60, 0)).toBe('prev');
    expect(swipeNav(-200, 10)).toBe('next');
  });
  it('しきい値未満の移動はスワイプとみなさない', () => {
    expect(swipeNav(-39, 0)).toBeNull();
    expect(swipeNav(0, 0)).toBeNull();
    expect(swipeNav(-40, 0)).toBe('next');
  });
  it('縦方向が大きい移動はスクロールとして扱い、カードを動かさない', () => {
    expect(swipeNav(0, 120)).toBeNull();
    expect(swipeNav(-60, 50)).toBeNull();
    expect(swipeNav(-80, 50)).toBe('next');
    expect(swipeNav(90, -100)).toBeNull();
  });
});
