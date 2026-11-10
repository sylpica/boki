import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

/** 描画クラッシュ時の復帰画面（BOKI-03）。学習履歴は残したまま、下書きだけを消して復帰できる */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  resetDrafts = () => {
    try {
      const raw = localStorage.getItem('boki-userdata-v1');
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        d.draft = null;
        d.practiceDraft = null;
        d.cardSession = null;
        localStorage.setItem('boki-userdata-v1', JSON.stringify(d));
      }
    } catch { /* 読み書きできない場合はそのまま再読み込みする */ }
    window.location.reload();
  };
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ padding: '2rem 1rem', maxWidth: 560, margin: '0 auto', fontFamily: 'sans-serif' }}>
        <h1>画面の表示で問題が発生しました</h1>
        <p>学習の履歴そのものは保持されています。まず再読み込みを試してください。直らない場合は、途中状態（下書き）だけを削除して復帰できます。履歴は削除されません。</p>
        <button onClick={() => window.location.reload()} style={{ marginRight: 8, padding: '0.6rem 1rem' }}>再読み込み</button>
        <button onClick={this.resetDrafts} style={{ padding: '0.6rem 1rem' }}>下書きだけを削除して復帰</button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
