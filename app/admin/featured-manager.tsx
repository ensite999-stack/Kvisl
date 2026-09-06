'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Article } from '@/lib/types';

export function FeaturedManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState('');
  const [current, setCurrent] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const published = useMemo(() => articles.filter((article) => article.status === 'published'), [articles]);

  async function load() {
    const response = await fetch('/api/admin/articles', { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(data.message || '置顶文章加载失败。');
    const next: Article[] = data.articles || [];
    const featured = next.find((article) => article.status === 'published' && article.featured)?.slug || '';
    setArticles(next);
    setCurrent(featured);
    setSelected(featured);
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    if (selected === current) return setMessage(selected ? '当前文章已经置顶。' : '当前由最新发布文章自动排在首页第一位。');
    setBusy(true);
    setMessage('正在更新首页置顶…');
    try {
      if (!selected && current) {
        const response = await fetch(`/api/admin/articles/${encodeURIComponent(current)}/featured`, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ featured: false })
        });
        if (!response.ok) throw new Error('取消置顶失败。');
      } else if (selected) {
        const response = await fetch(`/api/admin/articles/${encodeURIComponent(selected)}/featured`, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ featured: true })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || '置顶失败。');
      }
      await load();
      setMessage(selected ? '置顶文章已更新，首页会优先显示它。' : '已取消固定置顶，首页按最新发布时间排序。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '置顶操作失败。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="editor-block" style={{ marginBottom: 24 }} aria-labelledby="featured-manager-title">
      <div className="editor-block-head">
        <div>
          <span className="field-label" id="featured-manager-title">首页置顶文章</span>
          <small style={{ display: 'block', marginTop: 6 }}>只允许一篇已发布文章置顶；取消后首页自动显示最新文章。</small>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={busy} style={{ minWidth: 260, flex: '1 1 320px' }}>
          <option value="">不固定置顶（按最新发布）</option>
          {published.map((article) => <option key={article.slug} value={article.slug}>{article.title}</option>)}
        </select>
        <button type="button" className="primary" disabled={busy} onClick={save}>{busy ? '保存中…' : '保存置顶'}</button>
      </div>
      {message && <p className="upload-status" role="status" style={{ marginTop: 10 }}>{message}</p>}
    </section>
  );
}
