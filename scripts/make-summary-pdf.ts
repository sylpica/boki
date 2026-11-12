// 要点まとめPDF生成スクリプト。
// 教材データ（概要・仕訳例・用語の短い定義）を機械的にそのまま組み立ててHTMLを出力する。
// 手で要約し直さない（誤字・脱字の混入防止）。PDF化はヘッドレスChromiumの印刷機能で行う。
// 使い方: npx tsx scripts/make-summary-pdf.ts <出力HTMLパス> <画像ディレクトリ>
import { writeFileSync } from 'node:fs';
import { LESSONS, GLOSSARY } from '../src/data/index';

const outPath = process.argv[2];
const imgDir = process.argv[3];
if (!outPath || !imgDir) {
  console.error('usage: make-summary-pdf.ts <out.html> <imgDir>');
  process.exit(1);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const yen = (n: number) => n.toLocaleString('ja-JP');
const glossary = new Map(GLOSSARY.map((e) => [e.term, e]));

function journalTable(lesson: (typeof LESSONS)[number]): string {
  if (!lesson.exampleJournal) return '';
  const debits = lesson.exampleJournal.filter((j) => j.side === 'debit');
  const credits = lesson.exampleJournal.filter((j) => j.side === 'credit');
  const rows = Math.max(debits.length, credits.length);
  let body = '';
  for (let i = 0; i < rows; i++) {
    const d = debits[i];
    const c = credits[i];
    body += `<tr><td>${d ? esc(d.account) : ''}</td><td class="num">${d ? yen(d.amount) : ''}</td><td>${c ? esc(c.account) : ''}</td><td class="num">${c ? yen(c.amount) : ''}</td></tr>`;
  }
  const note = lesson.exampleNote ? `（${esc(lesson.exampleNote)}）` : '';
  return `<h3>仕訳例${note}</h3><table class="journal"><thead><tr><th>借方科目</th><th>金額</th><th>貸方科目</th><th>金額</th></tr></thead><tbody>${body}</tbody></table>`;
}

function termsSection(lesson: (typeof LESSONS)[number]): string {
  const items = lesson.terms.map((t) => {
    const e = glossary.get(t);
    return e ? `<li><strong>${esc(t)}</strong>：${esc(e.short)}</li>` : `<li><strong>${esc(t)}</strong></li>`;
  }).join('');
  return `<h3>関連用語</h3><ul class="terms">${items}</ul>`;
}

const lessonSections = LESSONS.map((l) => `
<section class="lesson">
  <h2>${esc(l.id)} ${esc(l.title)}</h2>
  <p class="syllabus">対応区分：${esc(l.syllabus)}</p>
  <p class="overview">${esc(l.stages.overview)}</p>
  <figure><img src="${imgDir}/${l.id}.jpg" alt=""><figcaption>概念イラスト（${esc(l.id)}）</figcaption></figure>
  ${journalTable(l)}
  ${termsSection(l)}
</section>`).join('\n');

const index = LESSONS.map((l) => `<li>${esc(l.id)} ${esc(l.title)}</li>`).join('');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>簿記3級 要点まとめ</title>
<style>
  @page { size: A4; margin: 16mm 15mm; }
  body { font-family: "Noto Sans CJK JP", sans-serif; color: #1a2332; font-size: 10.5pt; line-height: 1.75; }
  .cover { page-break-after: always; padding-top: 40mm; }
  .cover h1 { font-size: 26pt; margin: 0 0 6mm; color: #123a6d; }
  .cover .sub { font-size: 11.5pt; color: #44536b; margin-bottom: 12mm; }
  .cover h2 { font-size: 13pt; color: #123a6d; border-bottom: 2px solid #123a6d; padding-bottom: 2mm; }
  .cover ul { columns: 1; padding-left: 6mm; }
  .cover li { margin: 1.2mm 0; }
  .lesson { page-break-before: always; }
  .lesson h2 { font-size: 15pt; color: #123a6d; border-bottom: 2px solid #123a6d; padding-bottom: 2mm; margin: 0 0 4mm; }
  .lesson h3 { font-size: 11.5pt; color: #0e5a54; margin: 6mm 0 2mm; }
  .syllabus { color: #44536b; font-size: 9.5pt; margin: 0 0 3mm; }
  .overview { margin: 0 0 4mm; text-align: justify; }
  figure { margin: 0 auto 4mm; text-align: center; }
  figure img { width: 76%; height: auto; border-radius: 4px; }
  figcaption { font-size: 8.5pt; color: #66738a; margin-top: 1.5mm; }
  table.journal { border-collapse: collapse; width: 100%; font-size: 10pt; }
  table.journal th, table.journal td { border: 1px solid #b9c4d4; padding: 1.4mm 2.5mm; }
  table.journal th { background: #eef3fa; text-align: left; }
  table.journal td.num { text-align: right; font-variant-numeric: tabular-nums; }
  ul.terms { padding-left: 6mm; margin: 0; }
  ul.terms li { margin: 1mm 0; }
</style>
</head>
<body>
<div class="cover">
  <h1>簿記3級 要点まとめ</h1>
  <p class="sub">日商簿記3級 学習アプリ「boki」の教材データ（全16レッスン）から作成した要点まとめです。各レッスンの概要、概念イラスト、仕訳例、関連用語を収録しています。</p>
  <h2>収録レッスン</h2>
  <ul>${index}</ul>
</div>
${lessonSections}
</body>
</html>`;

writeFileSync(outPath, html);
console.log('wrote', outPath, html.length, 'chars');
