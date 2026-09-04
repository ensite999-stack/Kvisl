'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import type { Article, ArticleSource, ArticleStatus } from '@/lib/types';
import { slugify } from '@/lib/utils';

type Draft = {
  slug: string; title: string; dek: string; body: string; author: string;
  publishedAt: string; section: string; coverImage: string; coverAlt: string;
  supportingImagesText: string; sourcesText: string; featured: boolean;
};

const fresh = (): Draft => ({
  slug: '', title: '', dek: '', body: '<p></p>', author: 'Kvisl Editors',
  publishedAt: new Date().toISOString().slice(0, 16), section: 'Essay',
  coverImage: '', coverAlt: '', supportingImagesText: '', sourcesText: '', featured: false
});

function toDraft(a: Article): Draft {
  return {
    slug: a.slug, title: a.title, dek: a.dek, body: a.body, author: a.author,
    publishedAt: new Date(a.publishedAt).toISOString().slice(0, 16), section: a.section,
    coverImage: a.coverImage || '', coverAlt: a.coverAlt || '',
    supportingImagesText: a.supportingImages.join('\n'),
    sourcesText: a.sources.map((s) => [s.label, s.url || '', s.note || ''].join(' | ')).join('\n'),
    featured: Boolean(a.featured)
  };
}

function parseSources(value: string): ArticleSource[] {
  return value.split('\n').map((line) => {
    const [label, url, note] = line.split('|').map((v) => v.trim());
    return { label, url: url || undefined, note: note || undefined };
  }).filter((source) => source.label);
}

export function EditorDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<Draft>(fresh);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: draft.body,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setDraft((d) => ({ ...d, body: editor.getHTML() }))
  });

  async function load() {
    const res = await fetch('/api/admin/articles', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setArticles(data.articles || []);
    else setMessage(data.message || 'Unable to load articles.');
  }

  useEffect(() => { void load(); }, []);

  function select(article: Article) {
    const next = toDraft(article);
    setDraft(next); editor?.commands.setContent(next.body); setMessage('');
  }

  function newArticle() {
    const next = fresh(); setDraft(next); editor?.commands.setContent(next.body); setMessage('');
  }

  async function upload(file: File) {
    const form = new FormData(); form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed.');
    return String(data.url);
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { const url = await upload(file); setDraft((d) => ({ ...d, coverImage: url })); setMessage('Cover uploaded.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setBusy(false); event.target.value = ''; }
  }

  async function uploadInline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !editor) return;
    setBusy(true);
    try { editor.chain().focus().setImage({ src: await upload(file), alt: '' }).run(); setMessage('Image inserted.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setBusy(false); event.target.value = ''; }
  }

  function setLink() {
    if (!editor) return;
    const href = window.prompt('Link URL', editor.getAttributes('link').href || 'https://');
    if (href === null) return;
    if (!href) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  async function save(status: ArticleStatus) {
    const title = draft.title.trim(); if (!title) return setMessage('Add a title before saving.');
    const slug = draft.slug || slugify(title); setBusy(true); setMessage('');
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug, title, dek: draft.dek, body: editor?.getHTML() || draft.body,
          author: draft.author, publishedAt: new Date(draft.publishedAt).toISOString(), status,
          section: draft.section, coverImage: draft.coverImage || undefined, coverAlt: draft.coverAlt || undefined,
          supportingImages: draft.supportingImagesText.split('\n').map((v) => v.trim()).filter(Boolean),
          sources: parseSources(draft.sourcesText), featured: draft.featured
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Save failed.');
      const next = toDraft(data.article); setDraft(next); editor?.commands.setContent(next.body);
      setMessage(status === 'published' ? 'Published.' : 'Draft saved.'); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!draft.slug || !window.confirm(`Delete “${draft.title}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/articles/${encodeURIComponent(draft.slug)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed.');
      newArticle(); setMessage('Deleted.'); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch('/api/admin/session', { method: 'DELETE' }); window.location.reload(); }

  return <div className="editor-dashboard">
    <div className="editor-topbar"><div><p className="eyebrow">Kvisl editorial</p><h1>{draft.title || 'Untitled article'}</h1></div>
      <div className="editor-top-actions"><button type="button" onClick={newArticle}>New</button><button type="button" onClick={logout}>Sign out</button></div></div>
    <div className="editor-layout">
      <aside className="editor-list" aria-label="Articles"><h2>Articles</h2>{articles.map((a) =>
        <button key={a.slug} type="button" className={draft.slug === a.slug ? 'active' : ''} onClick={() => select(a)}>
          <span>{a.title}</span><small>{a.status} · {a.section}</small>
        </button>)}</aside>
      <section className="editor-panel">
        <div className="field-grid">
          <label className="field full"><span>Title</span><input className="title-input" value={draft.title} placeholder="Click and type the title" onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value, slug: d.slug || slugify(e.target.value) }))} /></label>
          <label className="field full"><span>Overview / dek</span><textarea rows={3} value={draft.dek} onChange={(e) => setDraft((d) => ({ ...d, dek: e.target.value }))} /></label>
          <label className="field"><span>Author</span><input value={draft.author} onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))} /></label>
          <label className="field"><span>Date</span><input type="datetime-local" value={draft.publishedAt} onChange={(e) => setDraft((d) => ({ ...d, publishedAt: e.target.value }))} /></label>
          <label className="field"><span>Section</span><input value={draft.section} onChange={(e) => setDraft((d) => ({ ...d, section: e.target.value }))} /></label>
          <label className="field"><span>Slug</span><input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} /></label>
          <label className="field full"><span>Cover image URL</span><div className="inline-field"><input value={draft.coverImage} onChange={(e) => setDraft((d) => ({ ...d, coverImage: e.target.value }))} /><label className="upload-button">Upload<input type="file" accept="image/*" onChange={uploadCover} /></label></div></label>
          <label className="field full"><span>Cover alt text</span><input value={draft.coverAlt} onChange={(e) => setDraft((d) => ({ ...d, coverAlt: e.target.value }))} /></label>
        </div>
        <div className="editor-block"><div className="editor-block-head"><div><span className="field-label">Body</span></div>
          <div className="toolbar" aria-label="Editor formatting">
            <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>B</button><button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button><button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</button><button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>List</button>
            <button type="button" onClick={setLink}>Link</button><label className="toolbar-upload">Image<input type="file" accept="image/*" onChange={uploadInline} /></label>
            <button type="button" onClick={() => editor?.chain().focus().undo().run()}>Undo</button><button type="button" onClick={() => editor?.chain().focus().redo().run()}>Redo</button>
          </div></div><EditorContent editor={editor} className="tiptap-shell" /></div>
        <div className="field-grid">
          <label className="field full"><span>Supporting image URLs</span><textarea rows={4} value={draft.supportingImagesText} placeholder="One image URL per line" onChange={(e) => setDraft((d) => ({ ...d, supportingImagesText: e.target.value }))} /></label>
          <label className="field full"><span>Sources & data</span><textarea rows={5} value={draft.sourcesText} placeholder="Label | URL | Note" onChange={(e) => setDraft((d) => ({ ...d, sourcesText: e.target.value }))} /></label>
          <label className="check-field"><input type="checkbox" checked={draft.featured} onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))} /><span>Feature on homepage</span></label>
        </div>
        <div className="editor-actions"><button type="button" disabled={busy} onClick={() => save('draft')}>Save draft</button><button type="button" className="primary" disabled={busy} onClick={() => save('published')}>Publish</button>{draft.slug && <button type="button" className="danger" disabled={busy} onClick={remove}>Delete</button>}<span role="status" aria-live="polite">{message}</span></div>
      </section>
    </div>
  </div>;
}
