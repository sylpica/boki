// シード付き乱数とシャッフル、出題プール選定（指示書8章）
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * 計算問題除外の単一の適用点（BOKI-04）。
 * 通常演習の全入口（演習設定・教材起点・復習・検索起点）はこの関数を通して対象を絞る。
 * 模擬試験には適用しない。
 */
export function applyNoCalc<T extends { needsCalc: boolean }>(pool: readonly T[], noCalcMode: boolean): T[] {
  return noCalcMode ? pool.filter((q) => !q.needsCalc) : [...pool];
}

export interface PoolOptions {
  count: number;
  /** 直近の演習で出題された問題ID（優先的に避ける） */
  recentIds?: string[];
  /** 既に正解済み等で後回しにしたいID */
  deprioritizeIds?: string[];
  seed?: number;
  /** false のときはプールの並び順を保つ（シャッフルOFF設定用） */
  shuffle?: boolean;
}

/**
 * 出題選定の優先順位（指示書8.2）:
 * 1. 条件に一致する問題 2. セット内で未出題 3. 直近演習で未出題 4. 復習対象
 * プールを一巡するまでは同一セット内で重複させない。
 */
export function pickQuestions<T extends { id: string }>(pool: readonly T[], opts: PoolOptions): T[] {
  const rng = mulberry32(opts.seed ?? ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0));
  const recent = new Set(opts.recentIds ?? []);
  const dep = new Set(opts.deprioritizeIds ?? []);
  const maybeShuffle = (arr: T[]) => (opts.shuffle === false ? arr : shuffle(arr, rng));
  const fresh = maybeShuffle(pool.filter((q) => !recent.has(q.id) && !dep.has(q.id)));
  const recentOk = maybeShuffle(pool.filter((q) => recent.has(q.id) && !dep.has(q.id)));
  const depOk = maybeShuffle(pool.filter((q) => dep.has(q.id)));
  const ordered = [...fresh, ...recentOk, ...depOk];
  const seen = new Set<string>();
  const picked: T[] = [];
  for (const q of ordered) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    picked.push(q);
    if (picked.length >= opts.count) break;
  }
  return picked;
}
