'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import type { Article, ArticleSource, ArticleStatus } from '@/lib/types';
import { slugify } from '@/lib/utils';

type Language = 'zh' | 'en';

type Draft = {
  slug: string; title: string; dek: string; body: string; author: string;
  publishedAt: string; section: string; tagsText: string; coverImage: string; coverAlt: string;
  supportingImagesText: string; sourcesText: string; featured: boolean;
};

const fresh = (): Draft => ({
  slug: '', title: '', dek: '', body: '<p></p>', author: 'Kvisl Editors',
  publishedAt: new Date().toISOString().slice(0, 16), section: '', tagsText: '',
  coverImage: '', coverAlt: '', supportingImagesText: '', sourcesText: '', featured: false
});

function toDraft(a: Article): Draft {
  return {
    slug: a.slug, title: a.title, dek: a.dek, body: a.body, author: a.author,
    publishedAt: new Date(a.publishedAt).toISOString().slice(0, 16), section: a.section,
    tagsText: (a.tags || []).join(', '), coverImage: a.coverImage || '', coverAlt: a.coverAlt || '',
    supportingImagesText: a.supportingImages.join('\n'),
    sourcesText: a.sources.map((s) => [s.label, s.url || '', s.note || ''].join(' | ')).join('\n'),
    featured: Boolean(a.featured)
  };
}

function parseSources(value: string): ArticleSource[] {
  return value.split('\n').map((line) => {
    const [label, url, note] = line.split(/[|｜]/).map((v) => v.trim());
    return { label, url: url || undefined, note: note || undefined };
  }).filter((source) => source.label);
}

function parseTags(value: string): string[] {
  return value.split(/[,，\n]/).map((tag) => tag.trim()).filter(Boolean);
}

const copy = {
  zh: {
    admin: 'Kvisl 后台', untitled: '文章编辑', newArticle: '新建文章', signOut: '退出',
    language: '语言', articles: '文章', total: '全部', published: '已发布', drafts: '草稿',
    title: '标题', titlePlaceholder: '输入文章标题', summary: '简介', summaryHelp: '用一两句话告诉读者这篇文章讲什么。',
    author: '作者', date: '发布时间', category: '分类', categoryPlaceholder: '例如：自然', tags: '标签', tagsHelp: '多个标签用逗号隔开。发布后会自动进入站内分类与标签列表。',
    tagsPlaceholder: '自然，文化，思想', cover: '封面图', uploadCover: '上传封面', replaceCover: '更换封面', removeCover: '移除封面',
    coverDescription: '封面图文字说明', coverDescriptionHelp: '简单描述图片内容，方便图片无法显示或读屏时理解。',
    body: '正文', bold: '粗体', italic: '斜体', heading: '小标题', smallerHeading: '次级标题', quote: '引用', list: '列表', link: '链接', image: '插入图片', undo: '撤销', redo: '重做',
    sources: '资料来源（可选）', sourcesHelp: '每行一条：名称｜链接｜备注。只有名称也可以。', sourcesPlaceholder: '资料名称｜https://example.com｜可选备注',
    saveDraft: '存为草稿', publish: '发布', delete: '删除',
    draftStatus: '草稿', publishedStatus: '已发布',
    loadFailed: '文章加载失败，请稍后再试。', uploadFailed: '图片上传失败，请稍后再试。', coverUploaded: '封面已上传。', imageInserted: '图片已插入。',
    addTitle: '请先填写标题。', saveFailed: '保存失败，请稍后再试。', publishedMessage: '文章已发布。', draftSaved: '草稿已保存。',
    deleteConfirm: '确定删除这篇文章吗？删除后无法恢复。', deleteFailed: '删除失败，请稍后再试。', deleted: '文章已删除。',
    linkPrompt: '输入链接地址', noArticles: '还没有文章。'
  },
  en: {
    admin: 'Kvisl Admin', untitled: 'Article editor', newArticle: 'New article', signOut: 'Sign out',
    language: 'Language', articles: 'Articles', total: 'All', published: 'Published', drafts: 'Drafts',
    title: 'Title', titlePlaceholder: 'Type the article title', summary: 'Summary', summaryHelp: 'Describe what the article is about in one or two sentences.',
    author: 'Author', date: 'Publish date', category: 'Category', categoryPlaceholder: 'e.g. Nature', tags: 'Tags', tagsHelp: 'Separate multiple tags with commas. Published terms are added automatically to site search.',
    tagsPlaceholder: 'Nature, Culture, Ideas', cover: 'Cover image', uploadCover: 'Upload cover', replaceCover: 'Replace cover', removeCover: 'Remove cover',
    coverDescription: 'Cover image description', coverDescriptionHelp: 'Briefly describe the image for readers when it cannot be seen or loaded.',
    body: 'Article text', bold: 'Bold', italic: 'Italic', heading: 'Heading', smallerHeading: 'Smaller heading', quote: 'Quote', list: 'List', link: 'Link', image: 'Insert image', undo: 'Undo', redo: 'Redo',
    sources: 'Sources (optional)', sourcesHelp: 'One per line: name | link | note. A name by itself is also fine.', sourcesPlaceholder: 'Source name | https://example.com | optional note',
    saveDraft: 'Save draft', publish: 'Publish', delete: 'Delete',
    draftStatus: 'Draft', publishedStatus: 'Published',
    loadFailed: 'Could not load the articles. Please try again.', uploadFailed: 'Could not upload the image. Please try again.', coverUploaded: 'Cover uploaded.', imageInserted: 'Image inserted.',
    addTitle: 'Add a title first.', saveFailed: 'Could not save. Please try again.', publishedMessage: 'Article published.', draftSaved: 'Draft saved.',
    deleteConfirm: 'Delete this article? This cannot be undone.', deleteFailed: 'Could not delete the article. Please try again.', deleted: 'Article deleted.',
    linkPrompt: 'Enter the link address', noArticles: 'No articles yet.'
  }
} as const;

export function EditorDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<Draft>(fresh);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<Language>('zh');
  const titleRef = useRef<HTMLInputElement>(null);
  const t = copy[language];

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), Image.configure({ inline: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: draft.body,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setDraft((d) => ({ ...d, body: editor.getHTML() }))
  });

  async function load() {
    const res = await fetch('/api/admin/articles', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setArticles(data.articles || []);
    else setMessage(copy[language].loadFailed);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('kvisl-admin-language');
    if (saved === 'zh' || saved === 'en') setLanguage(saved);
    else if (!navigator.language.toLowerCase().startsWith('zh')) setLanguage('en');
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    window.localStorage.setItem('kvisl-admin-language', next);
    setMessage('');
  }

  function select(article: Article) {
    const next = toDraft(article);
    setDraft(next); editor?.commands.setContent(next.body); setMessage('');
  }

  function newArticle() {
    const next = fresh();
    setDraft(next);
    editor?.commands.setContent(next.body);
    setMessage('');
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  async function upload(file: File) {
    const form = new FormData(); form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(t.uploadFailed);
    return String(data.url);
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { const url = await upload(file); setDraft((d) => ({ ...d, coverImage: url })); setMessage(t.coverUploaded); }
    catch { setMessage(t.uploadFailed); }
    finally { setBusy(false); event.target.value = ''; }
  }

  async function uploadInline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !editor) return;
    setBusy(true);
    try { editor.chain().focus().setImage({ src: await upload(file), alt: '' }).run(); setMessage(t.imageInserted); }
    catch { setMessage(t.uploadFailed); }
    finally { setBusy(false); event.target.value = ''; }
  }

  function setLink() {
    if (!editor) return;
    const href = window.prompt(t.linkPrompt, editor.getAttributes('link').href || 'https://');
    if (href === null) return;
    if (!href) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  async function save(status: ArticleStatus) {
    const title = draft.title.trim(); if (!title) return setMessage(t.addTitle);
    const slug = draft.slug || slugify(title); setBusy(true); setMessage('');
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug, title, dek: draft.dek, body: editor?.getHTML() || draft.body,
          author: draft.author, publishedAt: new Date(draft.publishedAt).toISOString(), status,
          section: draft.section, tags: parseTags(draft.tagsText), coverImage: draft.coverImage || undefined, coverAlt: draft.coverAlt || undefined,
          supportingImages: draft.supportingImagesText.split('\n').map((v) => v.trim()).filter(Boolean),
          sources: parseSources(draft.sourcesText), featured: draft.featured
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(t.saveFailed);
      const next = toDraft(data.article); setDraft(next); editor?.commands.setContent(next.body);
      setMessage(status === 'published' ? t.publishedMessage : t.draftSaved); await load();
    } catch { setMessage(t.saveFailed); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!draft.slug || !window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/articles/${encodeURIComponent(draft.slug)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t.deleteFailed);
      newArticle(); setMessage(t.deleted); await load();
    } catch { setMessage(t.deleteFailed); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch('/api/admin/session', { method: 'DELETE' }); window.location.reload(); }

  const publishedCount = articles.filter((article) => article.status === 'published').length;
  const draftCount = articles.filter((article) => article.status === 'draft').length;
  const statusLabel = (status: ArticleStatus) => status === 'published' ? t.publishedStatus : t.draftStatus;

  return <div className="editor-dashboard">
    <div className="editor-topbar">
      <div><p className="eyebrow">{t.admin}</p><h1>{draft.title || t.untitled}</h1></div>
      <div className="editor-top-actions" style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div aria-label={t.language} style={{ display: 'inline-flex', gap: 4 }}>
          <button type="button" aria-pressed={language === 'zh'} onClick={() => changeLanguage('zh')}>中文</button>
          <button type="button" aria-pressed={language === 'en'} onClick={() => changeLanguage('en')}>English</button>
        </div>
        {draft.slug && <button type="button" onClick={newArticle}>{t.newArticle}</button>}
        <button type="button" onClick={logout}>{t.signOut}</button>
      </div>
    </div>

    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 24px' }} aria-label={t.articles}>
      <div style={{ border: '1px solid var(--line)', padding: '10px 14px', minWidth: 110 }}><small style={{ display: 'block', color: 'var(--muted)' }}>{t.total}</small><strong style={{ fontSize: 24 }}>{articles.length}</strong></div>
      <div style={{ border: '1px solid var(--line)', padding: '10px 14px', minWidth: 110 }}><small style={{ display: 'block', color: 'var(--muted)' }}>{t.published}</small><strong style={{ fontSize: 24 }}>{publishedCount}</strong></div>
      <div style={{ border: '1px solid var(--line)', padding: '10px 14px', minWidth: 110 }}><small style={{ display: 'block', color: 'var(--muted)' }}>{t.drafts}</small><strong style={{ fontSize: 24 }}>{draftCount}</strong></div>
    </div>

    <div className="editor-layout">
      <aside className="editor-list" aria-label={t.articles}>
        <h2>{t.articles} <small style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: 'var(--muted)' }}>({publishedCount} {t.published})</small></h2>
        {articles.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>{t.noArticles}</p>}
        {articles.map((a) =>
          <button key={a.slug} type="button" className={draft.slug === a.slug ? 'active' : ''} onClick={() => select(a)}>
            <span>{a.title}</span><small>{statusLabel(a.status)} · {a.section || '—'}</small>
          </button>)}
      </aside>

      <section className="editor-panel">
        <div className="field-grid">
          <label className="field full"><span>{t.title}</span><input ref={titleRef} className="title-input" value={draft.title} placeholder={t.titlePlaceholder} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} /></label>
          <label className="field full"><span>{t.summary}</span><textarea rows={3} value={draft.dek} onChange={(e) => setDraft((d) => ({ ...d, dek: e.target.value }))} /><small>{t.summaryHelp}</small></label>
          <label className="field"><span>{t.author}</span><input value={draft.author} onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))} /></label>
          <label className="field"><span>{t.date}</span><input type="datetime-local" value={draft.publishedAt} onChange={(e) => setDraft((d) => ({ ...d, publishedAt: e.target.value }))} /></label>
          <label className="field"><span>{t.category}</span><input value={draft.section} placeholder={t.categoryPlaceholder} onChange={(e) => setDraft((d) => ({ ...d, section: e.target.value }))} /></label>
          <label className="field"><span>{t.tags}</span><input value={draft.tagsText} placeholder={t.tagsPlaceholder} onChange={(e) => setDraft((d) => ({ ...d, tagsText: e.target.value }))} /><small>{t.tagsHelp}</small></label>

          <div className="field full">
            <span>{t.cover}</span>
            {draft.coverImage && <img src={draft.coverImage} alt={draft.coverAlt || ''} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', marginBottom: 10, border: '1px solid var(--line)' }} />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label className="upload-button">{draft.coverImage ? t.replaceCover : t.uploadCover}<input type="file" accept="image/*" onChange={uploadCover} /></label>
              {draft.coverImage && <button type="button" className="text-button" onClick={() => setDraft((d) => ({ ...d, coverImage: '', coverAlt: '' }))}>{t.removeCover}</button>}
            </div>
          </div>
          <label className="field full"><span>{t.coverDescription}</span><input value={draft.coverAlt} onChange={(e) => setDraft((d) => ({ ...d, coverAlt: e.target.value }))} /><small>{t.coverDescriptionHelp}</small></label>
        </div>

        <div className="editor-block"><div className="editor-block-head"><span className="field-label">{t.body}</span>
          <div className="toolbar" aria-label={t.body}>
            <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>{t.bold}</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>{t.italic}</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>{t.heading}</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>{t.smallerHeading}</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>{t.quote}</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>{t.list}</button>
            <button type="button" onClick={setLink}>{t.link}</button>
            <label className="toolbar-upload">{t.image}<input type="file" accept="image/*" onChange={uploadInline} /></label>
            <button type="button" onClick={() => editor?.chain().focus().undo().run()}>{t.undo}</button>
            <button type="button" onClick={() => editor?.chain().focus().redo().run()}>{t.redo}</button>
          </div></div><EditorContent editor={editor} className="tiptap-shell" /></div>

        <div className="field-grid">
          <label className="field full"><span>{t.sources}</span><textarea rows={5} value={draft.sourcesText} placeholder={t.sourcesPlaceholder} onChange={(e) => setDraft((d) => ({ ...d, sourcesText: e.target.value }))} /><small>{t.sourcesHelp}</small></label>
        </div>

        <div className="editor-actions">
          <button type="button" disabled={busy} onClick={() => save('draft')}>{t.saveDraft}</button>
          <button type="button" className="primary" disabled={busy} onClick={() => save('published')}>{t.publish}</button>
          {draft.slug && <button type="button" className="danger" disabled={busy} onClick={remove}>{t.delete}</button>}
          <span role="status" aria-live="polite">{message}</span>
        </div>
      </section>
    </div>
  </div>;
}
