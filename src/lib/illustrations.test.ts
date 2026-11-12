import { describe, it, expect } from 'vitest';
import { LESSONS } from '../data';
import { ILLUSTRATIONS } from '../data/illustrations';

// 同梱した Base64 画像（public/img64/*.b64）をテストから直接読み込む
const B64_FILES = import.meta.glob('../../public/img64/*.b64', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('レッスン概念イラストのメタデータと同梱ファイル', () => {
  it('全レッスンにイラストのメタデータがある', () => {
    for (const l of LESSONS) {
      expect(ILLUSTRATIONS[l.id], l.id).toBeTruthy();
      expect(ILLUSTRATIONS[l.id].alt.length).toBeGreaterThan(0);
      expect(ILLUSTRATIONS[l.id].caption.length).toBeGreaterThan(0);
    }
    expect(Object.keys(ILLUSTRATIONS)).toHaveLength(LESSONS.length);
  });

  it('差し込み位置（after）が概要の文数の範囲内にある', () => {
    for (const l of LESSONS) {
      const sentences = l.stages.overview.split('。').filter((s) => s.trim()).length;
      const { after } = ILLUSTRATIONS[l.id];
      expect(after, l.id).toBeGreaterThanOrEqual(1);
      expect(after, l.id).toBeLessThan(sentences);
    }
  });

  it('Base64画像ファイルが実在し、WebPとして妥当な容量と中身を持つ', () => {
    expect(Object.keys(B64_FILES)).toHaveLength(LESSONS.length);
    for (const l of LESSONS) {
      const content = B64_FILES[`../../public/img64/${l.id}.b64`];
      expect(content, l.id).toBeTruthy();
      const b64 = content.trim();
      // 最適化済みWebP（1152px・q78）のBase64として 10KB〜120KB の範囲
      expect(b64.length, l.id).toBeGreaterThan(10_000);
      expect(b64.length, l.id).toBeLessThan(120_000);
      const head = atob(b64.slice(0, 24));
      // WebPのマジックナンバー RIFF....WEBP
      expect(head.slice(0, 4)).toBe('RIFF');
      expect(head.slice(8, 12)).toBe('WEBP');
    }
  });
});

describe('要点まとめPDFの同梱ファイル', () => {
  const PDF_FILES = import.meta.glob('../../public/pdf64/*.b64', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

  it('boki-summary.b64 が実在し、PDFとして復元できる', () => {
    const content = PDF_FILES['../../public/pdf64/boki-summary.b64'];
    expect(content).toBeTruthy();
    const b64 = content.replace(/\s+/g, '');
    expect(atob(b64.slice(0, 8)).slice(0, 5)).toBe('%PDF-');
    // 末尾に EOF マーカーがあること
    const tail = atob(b64.slice(-32));
    expect(tail).toContain('%%EOF');
    // 17ページ分の内容を含む容量（2MB前後）であること
    const bytes = Math.floor((b64.length * 3) / 4);
    expect(bytes).toBeGreaterThan(2_000_000);
    expect(bytes).toBeLessThan(2_600_000);
  });
});
