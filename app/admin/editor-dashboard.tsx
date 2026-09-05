'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Mark, mergeAttributes } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import type { Article, ArticleSource, ArticleStatus } from '@/lib/types';
import { slugify } from '@/lib/utils';

type Language = 'zh' | 'en';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type Draft = {
  slug: string;
  title: string;
  subtitle: string;
  dek: string;
  body: string;
  author: string;
  publishedAt: string;
  section: string;
  tagsText: string;
  coverImage: string;
  coverAlt: string;
  coverSource: string;
  supportingImagesText: string;
  sourcesText: string;
  featured: boolean;
};

const TextColor = Mark.create({
  name: 'textColor',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute('style') || '';
          return style.match(/color\s*:\s*(#[0-9a-fA-F]{3,8})/)?.[1] || null;
        },
        renderHTML: (attributes) => attributes.color ? { style: `color: ${attributes.color}` } : {}
      }
    };
  },
  parseHTML() { return [{ tag: 'span[style*="color"]' }]; },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0]; }
});

const fresh = (): Draft => ({
  slug: '', title: '', subtitle: '', dek: '', body: '<p></p>', author: 'Kvisl Editors',
  publishedAt: new Date().toISOString().slice(0, 16), section: '', tagsText: '',
  coverImage: '', coverAlt: '', coverSource: '', supportingImagesText: '', sourcesText: '', featured: false
});

function toDraft(article: Article): Draft {
  return {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle || '',
    dek: article.dek,
    body: article.body,
    author: article.author,
    publishedAt: new Date(article.publishedAt).toISOString().slice(0, 16),
    section: article.section,
    tagsText: (article.tags || []).join(', '),
    coverImage: article.coverImage || '',
    coverAlt: article.coverAlt || '',
    coverSource: article.coverSource || '',
    supportingImagesText: article.supportingImages.join('\n'),
    sourcesText: article.sources.map((source) => [source.label, source.url || '', source.note || ''].join(' | ')).join('\n'),
    featured: Boolean(article.featured)
  };
}

function parseSources(value: string): ArticleSource[] {
  return value.split('\n').map((line) => {
    const [label, url, note] = line.split(/[|｜]/).map((part) => part.trim());
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
    title: '标题', titlePlaceholder: '输入文章标题', subtitle: '副标题（可选）', subtitlePlaceholder: '输入副标题', subtitleHelp: '显示在文章标题下方；不填写则不显示。',
    summary: '简介', summaryHelp: '用一两句话告诉读者这篇文章讲什么。', author: '作者', date: '发布时间', category: '分类', categoryPlaceholder: '例如：自然',
    tags: '标签', tagsHelp: '多个标签用逗号隔开。发布后会自动进入站内分类与标签列表。', tagsPlaceholder: '自然，文化，思想',
    cover: '封面图', uploadCover: '上传封面', replaceCover: '更换封面', removeCover: '移除封面', coverDescription: '封面图文字说明', coverDescriptionHelp: '简单描述图片内容，方便图片无法显示或读屏时理解。',
    imageSource: '图片来源说明（可选）', coverSourceHelp: '例如摄影者、机构或图片出处，会显示在封面图下方。',
    body: '正文', collapseBody: '折叠正文', expandBody: '展开正文', bold: '粗体', italic: '斜体', heading: '小标题', smallerHeading: '次级标题', quote: '引用', list: '列表', link: '链接', undo: '撤销', redo: '重做',
    textColor: '文字颜色', paragraphColor: '整段颜色', clearColor: '清除颜色', imageLine: '插入到第几行', imageLineHelp: '按正文中的段落、标题、列表或图片顺序计算。', inlineSourceHelp: '填写后会按原样插在图片下一行。', insertImage: '选择并插入图片',
    uploading: '正在上传…', uploadSuccess: '上传成功，图片已显示。', uploadFailed: '图片上传失败，请稍后再试。', imageLoadFailed: '图片已上传，但预览加载失败。', coverUploaded: '封面已上传。', imageInserted: '图片已插入正文。',
    sources: '资料来源（可选）', sourcesHelp: '每行一条：名称｜链接｜备注。只有名称也可以。', sourcesPlaceholder: '资料名称｜https://example.com｜可选备注',
    saveDraft: '存为草稿', publish: '发布', delete: '删除', draftStatus: '草稿', publishedStatus: '已发布', loadFailed: '文章加载失败，请稍后再试。',
    addTitle: '请先填写标题。', saveFailed: '保存失败，请稍后再试。', publishedMessage: '文章已发布。', draftSaved: '草稿已保存。', deleteConfirm: '确定删除这篇文章吗？删除后无法恢复。', deleteFailed: '删除失败，请稍后再试。', deleted: '文章已删除。', linkPrompt: '输入链接地址', noArticles: '还没有文章。'
  },
  en: {
    admin: 'Kvisl Admin', untitled: 'Article editor', newArticle: 'New article', signOut: 'Sign out',
    language: 'Language', articles: 'Articles', total: 'All', published: 'Published', drafts: 'Drafts',
    title: 'Title', titlePlaceholder: 'Type the article title', subtitle: 'Subtitle (optional)', subtitlePlaceholder: 'Type the subtitle', subtitleHelp: 'Shown directly below the article title. Leave blank to hide it.',
    summary: 'Summary', summaryHelp: 'Describe what the article is about in one or two sentences.', author: 'Author', date: 'Publish date', category: 'Category', categoryPlaceholder: 'e.g. Nature',
    tags: 'Tags', tagsHelp: 'Separate multiple tags with commas. Published terms are added automatically to site search.', tagsPlaceholder: 'Nature, Culture, Ideas',
    cover: 'Cover image', uploadCover: 'Upload cover', replaceCover: 'Replace cover', removeCover: 'Remove cover', coverDescription: 'Cover image description', coverDescriptionHelp: 'Briefly describe the image for readers when it cannot be seen or loaded.',
    imageSource: 'Image source / credit (optional)', coverSourceHelp: 'Photographer, institution or image source. It is shown below the cover image.',
    body: 'Article text', collapseBody: 'Collapse article text', expandBody: 'Expand article text', bold: 'Bold', italic: 'Italic', heading: 'Heading', smallerHeading: 'Smaller heading', quote: 'Quote', list: 'List', link: 'Link', undo: 'Undo', redo: 'Redo',
    textColor: 'Text color', paragraphColor: 'Whole paragraph color', clearColor: 'Clear color', imageLine: 'Insert at line', imageLineHelp: 'Lines are counted by paragraphs, headings, lists and images in the editor.', inlineSourceHelp: 'When supplied, this text is inserted exactly as written on the line below the image.', insertImage: 'Choose and insert image',
    uploading: 'Uploading…', uploadSuccess: 'Upload succeeded and the image is visible.', uploadFailed: 'Could not upload the image. Please try again.', imageLoadFailed: 'The image uploaded, but its preview could not be loaded.', coverUploaded: 'Cover uploaded.', imageInserted: 'Image inserted into the article.',
    sources: 'Sources (optional)', sourcesHelp: 'One per line: name | link | note. A name by itself is also fine.', sourcesPlaceholder: 'Source name | https://example.com | optional note',
    saveDraft: 'Save draft', publish: 'Publish', delete: 'Delete', draftStatus: 'Draft', publishedStatus: 'Published', loadFailed: 'Could not load the articles. Please try again.',
    addTitle: 'Add a title first.', saveFailed: 'Could not save. Please try again.', publishedMessage: 'Article published.', draftSaved: 'Draft saved.', deleteConfirm: 'Delete this article? This cannot be undone.', deleteFailed: 'Could not delete the article. Please try again.', deleted: 'Article deleted.', linkPrompt: 'Enter the link address', noArticles: 'No articles yet.'
  }
} as const;

export function EditorDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<Draft>(fresh);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<Language>('zh');
  const [bodyOpen, setBodyOpen] = useState(true);
  const [textColor, setTextColor] = useState('#1d1d1f');
  const [imageLine, setImageLine] = useState('1');
  const [inlineSource, setInlineSource] = useState('');
  const [coverUploadStatus, setCoverUploadStatus] = useState<UploadStatus>('idle');
  const [inlineUploadStatus, setInlineUploadStatus] = useState<UploadStatus>('idle');
  const [inlinePreview, setInlinePreview] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const t = copy[language];

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), TextColor, Image.configure({ inline: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: draft.body,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setDraft((current) => ({ ...current, body: editor.getHTML() }))
  });

  async function load() {
    const response = await fetch('/api/admin/articles', { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setArticles(data.articles || []);
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

  function resetUploadState() {
    setCoverUploadStatus('idle');
    setInlineUploadStatus('idle');
    setInlinePreview('');
    setInlineSource('');
    setImageLine('1');
  }

  function select(article: Article) {
    const next = toDraft(article);
    setDraft(next);
    editor?.commands.setContent(next.body);
    setMessage('');
    resetUploadState();
  }

  function newArticle() {
    const next = fresh();
    setDraft(next);
    editor?.commands.setContent(next.body);
    setMessage('');
    setBodyOpen(true);
    resetUploadState();
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  async function upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(t.uploadFailed);
    return String(data.url);
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setCoverUploadStatus('uploading');
    try {
      const url = await upload(file);
      setDraft((current) => ({ ...current, coverImage: url }));
      setCoverUploadStatus('success');
      setMessage(t.coverUploaded);
    } catch {
      setCoverUploadStatus('error');
      setMessage(t.uploadFailed);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  function blockInsertPosition(line: number) {
    if (!editor) return 0;
    const doc = editor.state.doc;
    const targetIndex = Math.max(0, Math.min(Math.floor(line) - 1, doc.childCount));
    let position = 0;
    for (let index = 0; index < targetIndex; index += 1) position += doc.child(index).nodeSize;
    return position;
  }

  async function uploadInline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setBusy(true);
    setInlineUploadStatus('uploading');
    try {
      const url = await upload(file);
      const line = Number(imageLine) || 1;
      const content: any[] = [{ type: 'image', attrs: { src: url, alt: '' } }];
      const source = inlineSource.trim();
      if (source) content.push({ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: source }] });
      editor.chain().focus().insertContentAt(blockInsertPosition(line), content).run();
      setInlinePreview(url);
      setInlineUploadStatus('success');
      setMessage(t.imageInserted);
    } catch {
      setInlineUploadStatus('error');
      setMessage(t.uploadFailed);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  function setLink() {
    if (!editor) return;
    const href = window.prompt(t.linkPrompt, editor.getAttributes('link').href || 'https://');
    if (href === null) return;
    if (!href) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  function applyColor(wholeParagraph = false) {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (wholeParagraph) {
      const { $from } = editor.state.selection;
      if ($from.parent.isTextblock) chain.setTextSelection({ from: $from.start(), to: $from.end() });
    }
    chain.setMark('textColor', { color: textColor }).run();
  }

  function clearColor() {
    editor?.chain().focus().unsetMark('textColor').run();
  }

  async function save(status: ArticleStatus) {
    const title = draft.title.trim();
    if (!title) return setMessage(t.addTitle);
    const slug = draft.slug || slugify(title);
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug, title, subtitle: draft.subtitle, dek: draft.dek, body: editor?.getHTML() || draft.body,
          author: draft.author, publishedAt: new Date(draft.publishedAt).toISOString(), status,
          section: draft.section, tags: parseTags(draft.tagsText), coverImage: draft.coverImage || undefined,
          coverAlt: draft.coverAlt || undefined, coverSource: draft.coverSource || undefined,
          supportingImages: draft.supportingImagesText.split('\n').map((value) => value.trim()).filter(Boolean),
          sources: parseSources(draft.sourcesText), featured: draft.featured
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(t.saveFailed);
      const next = toDraft(data.article);
      setDraft(next);
      editor?.commands.setContent(next.body);
      setMessage(status === 'published' ? t.publishedMessage : t.draftSaved);
      await load();
    } catch {
      setMessage(t.saveFailed);
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!draft.slug || !window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(draft.slug)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(t.deleteFailed);
      newArticle();
      setMessage(t.deleted);
      await load();
    } catch { setMessage(t.deleteFailed); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    window.location.reload();
  }

  const publishedCount = articles.filter((article) => article.status === 'published').length;
  const draftCount = articles.filter((article) => article.status === 'draft').length;
  const statusLabel = (status: ArticleStatus) => status === 'published' ? t.publishedStatus : t.draftStatus;
  const uploadText = (status: UploadStatus) => status === 'uploading' ? t.uploading : status === 'success' ? t.uploadSuccess : status === 'error' ? t.uploadFailed : '';
  const lineMax = (editor?.state.doc.childCount || 0) + 1;

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

    <div className="admin-counts" aria-label={t.articles}>
      <div><small>{t.total}</small><strong>{articles.length}</strong></div>
      <div><small>{t.published}</small><strong>{publishedCount}</strong></div>
      <div><small>{t.drafts}</small><strong>{draftCount}</strong></div>
    </div>

    <div className="editor-layout">
      <aside className="editor-list" aria-label={t.articles}>
        <h2>{t.articles} <small>({publishedCount} {t.published})</small></h2>
        {articles.length === 0 && <p className="editor-empty-note">{t.noArticles}</p>}
        {articles.map((article) =>
          <button key={article.slug} type="button" className={draft.slug === article.slug ? 'active' : ''} onClick={() => select(article)}>
            <span>{article.title}</span><small>{statusLabel(article.status)} · {article.section || '—'}</small>
          </button>)}
      </aside>

      <section className="editor-panel">
        <div className="field-grid">
          <label className="field full"><span>{t.title}</span><input ref={titleRef} className="title-input" value={draft.title} placeholder={t.titlePlaceholder} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label className="field full"><span>{t.subtitle}</span><input value={draft.subtitle} placeholder={t.subtitlePlaceholder} onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))} /><small>{t.subtitleHelp}</small></label>
          <label className="field full"><span>{t.summary}</span><textarea rows={3} value={draft.dek} onChange={(event) => setDraft((current) => ({ ...current, dek: event.target.value }))} /><small>{t.summaryHelp}</small></label>
          <label className="field"><span>{t.author}</span><input value={draft.author} onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))} /></label>
          <label className="field"><span>{t.date}</span><input type="datetime-local" value={draft.publishedAt} onChange={(event) => setDraft((current) => ({ ...current, publishedAt: event.target.value }))} /></label>
          <label className="field"><span>{t.category}</span><input value={draft.section} placeholder={t.categoryPlaceholder} onChange={(event) => setDraft((current) => ({ ...current, section: event.target.value }))} /></label>
          <label className="field"><span>{t.tags}</span><input value={draft.tagsText} placeholder={t.tagsPlaceholder} onChange={(event) => setDraft((current) => ({ ...current, tagsText: event.target.value }))} /><small>{t.tagsHelp}</small></label>

          <div className="field full">
            <span>{t.cover}</span>
            {draft.coverImage && <img className="admin-image-preview" src={draft.coverImage} alt={draft.coverAlt || ''} onError={() => setCoverUploadStatus('error')} />}
            <div className="admin-inline-controls">
              <label className="upload-button">{draft.coverImage ? t.replaceCover : t.uploadCover}<input type="file" accept="image/*" onChange={uploadCover} /></label>
              {draft.coverImage && <button type="button" className="text-button" onClick={() => setDraft((current) => ({ ...current, coverImage: '', coverAlt: '', coverSource: '' }))}>{t.removeCover}</button>}
            </div>
            {coverUploadStatus !== 'idle' && <p className={`upload-status ${coverUploadStatus}`}>{uploadText(coverUploadStatus)}</p>}
          </div>
          <label className="field full"><span>{t.coverDescription}</span><input value={draft.coverAlt} onChange={(event) => setDraft((current) => ({ ...current, coverAlt: event.target.value }))} /><small>{t.coverDescriptionHelp}</small></label>
          <label className="field full"><span>{t.imageSource}</span><input value={draft.coverSource} onChange={(event) => setDraft((current) => ({ ...current, coverSource: event.target.value }))} /><small>{t.coverSourceHelp}</small></label>
        </div>

        <div className="editor-block">
          <div className="editor-block-head">
            <span className="field-label">{t.body}</span>
            <button className="text-button" type="button" aria-expanded={bodyOpen} onClick={() => setBodyOpen((open) => !open)}>{bodyOpen ? t.collapseBody : t.expandBody}</button>
          </div>
          <div hidden={!bodyOpen}>
            <div className="toolbar" aria-label={t.body}>
              <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>{t.bold}</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>{t.italic}</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>{t.heading}</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>{t.smallerHeading}</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>{t.quote}</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>{t.list}</button>
              <button type="button" onClick={setLink}>{t.link}</button>
              <button type="button" onClick={() => editor?.chain().focus().undo().run()}>{t.undo}</button>
              <button type="button" onClick={() => editor?.chain().focus().redo().run()}>{t.redo}</button>
            </div>

            <div className="editor-format-row">
              <label><span>{t.textColor}</span><input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label>
              <button type="button" className="text-button" onClick={() => applyColor(false)}>{t.textColor}</button>
              <button type="button" className="text-button" onClick={() => applyColor(true)}>{t.paragraphColor}</button>
              <button type="button" className="text-button" onClick={clearColor}>{t.clearColor}</button>
            </div>

            <div className="inline-image-tools">
              <label><span>{t.imageLine}</span><input type="number" min="1" max={lineMax} value={imageLine} onChange={(event) => setImageLine(event.target.value)} /></label>
              <label className="inline-source-field"><span>{t.imageSource}</span><input value={inlineSource} onChange={(event) => setInlineSource(event.target.value)} /></label>
              <label className="upload-button">{t.insertImage}<input type="file" accept="image/*" onChange={uploadInline} /></label>
              <small>{t.imageLineHelp} {t.inlineSourceHelp}</small>
              {inlineUploadStatus !== 'idle' && <p className={`upload-status ${inlineUploadStatus}`}>{uploadText(inlineUploadStatus)}</p>}
              {inlinePreview && <img className="admin-inline-preview" src={inlinePreview} alt="" onError={() => setInlineUploadStatus('error')} />}
            </div>

            <EditorContent editor={editor} className="tiptap-shell" />
          </div>
        </div>

        <div className="field-grid">
          <label className="field full"><span>{t.sources}</span><textarea rows={5} value={draft.sourcesText} placeholder={t.sourcesPlaceholder} onChange={(event) => setDraft((current) => ({ ...current, sourcesText: event.target.value }))} /><small>{t.sourcesHelp}</small></label>
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
