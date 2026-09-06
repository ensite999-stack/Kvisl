'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Mark, mergeAttributes } from '@tiptap/core';
import { uploadPresigned } from '@vercel/blob/client';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import type { Article, ArticleSource, ArticleStatus } from '@/lib/types';
import { cleanHttpUrl, publicImageUrl, sourceNameFromUrl } from '@/lib/media-url';
import { slugify } from '@/lib/utils';

type Language = 'zh' | 'en';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type NoticeKind = 'idle' | 'info' | 'success' | 'error';
type ResolvedEditorImage = { url: string; source?: string; sourceUrl?: string };

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
  coverSourceUrl: string;
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
  slug: '',
  title: '',
  subtitle: '',
  dek: '',
  body: '<p></p>',
  author: 'Kvisl Editors',
  publishedAt: new Date().toISOString().slice(0, 16),
  section: '',
  tagsText: '',
  coverImage: '',
  coverAlt: '',
  coverSource: '',
  coverSourceUrl: '',
  supportingImagesText: '',
  sourcesText: '',
  featured: false
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
    coverSourceUrl: article.coverSourceUrl || '',
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
    admin: 'Kvisl 后台', untitled: '文章编辑', newArticle: '新建文章', signOut: '退出', language: '语言',
    articles: '文章', total: '全部', published: '已发布', drafts: '草稿', publishedStatus: '已发布', draftStatus: '草稿',
    editingPublished: '正在修改已发布文章', editingDraft: '正在修改草稿', newStatus: '新文章',
    title: '标题', titlePlaceholder: '输入文章标题', subtitle: '副标题（可选）', subtitlePlaceholder: '输入副标题', subtitleHelp: '显示在文章标题下方；不填写则不显示。',
    summary: '简介', summaryHelp: '用一两句话告诉读者这篇文章讲什么。', author: '作者', date: '发布时间', category: '分类', categoryPlaceholder: '例如：Politics',
    tags: '标签', tagsHelp: '多个标签用逗号隔开。分类和标签只显示在文章末尾。', tagsPlaceholder: '欧洲，政治，权利',
    cover: '封面图', coverDescription: '封面图文字说明', coverDescriptionHelp: '简单描述图片内容，方便图片无法显示或读屏时理解。',
    imageCredit: '图片署名（可选）', creditHelp: 'Pexels 照片页解析成功后会自动填写摄影师署名。',
    imageUrl: 'Pexels 图片链接', imageUrlHelp: '只保留一个图片链接框：可粘贴 Pexels 照片页或 images.pexels.com 图片地址。',
    resolvePreview: '解析并预览', resolvingImage: '正在解析图片…', previewReady: '图片解析成功，预览可用', previewFailed: '图片解析失败',
    replaceSelectedHelp: '如果正文中已选中图片，确认后会替换该图片；否则按行号插入。', confirmInsert: '确认插入正文', confirmedInsert: '图片已确认插入正文。', confirmedReplace: '选中图片已确认替换。',
    uploadCover: '上传封面', replaceCover: '更换封面', removeCover: '移除封面', uploadInline: '上传正文图片',
    storageMissing: '图片上传尚未配置；Pexels 链接解析仍可使用。', pexelsKeyMissing: 'Pexels 照片页解析需要 PEXELS_API_KEY；images.pexels.com 直链仍可使用。',
    uploading: '正在上传', uploadSuccess: '上传成功。', uploadFailed: '图片上传失败。', uploadSlow: '上传连接较慢时进度可能短暂停在 0%。', coverUploaded: '封面上传成功并已显示预览。', imageInserted: '正文图片上传并插入成功。',
    body: '正文', compactBody: '收起正文', expandBody: '展开正文', bold: '粗体', italic: '斜体', heading: '小标题', smallerHeading: '次级标题', quote: '引用', list: '列表', link: '链接', undo: '撤销', redo: '重做',
    textColor: '文字颜色', selectedColor: '选中文字', clearColor: '清除颜色', imageLine: '插入到第几行', imageLineHelp: '按段落、标题、列表或图片顺序计算。',
    sources: '资料来源（可选）', sourcesHelp: '每行一条：名称｜链接｜备注。', sourcesPlaceholder: '资料名称｜https://example.com｜可选备注',
    saveDraft: '保存草稿', publish: '发布文章', updatePublished: '更新已发布文章', deleteDraft: '删除草稿', movePublished: '下线并移入回收状态',
    savingDraft: '正在保存草稿…', publishing: '正在发布文章…', updatingPublished: '正在更新已发布文章…', deleting: '正在处理删除…',
    draftSaved: '草稿保存成功。', publishedMessage: '文章发布成功，前台缓存已刷新。', updatedPublishedMessage: '已发布文章更新成功，线上内容已刷新。',
    deleteDraftConfirm: '删除这个草稿吗？它会从后台列表移除，但数据库保留可恢复记录。', publishedDeleteConfirm: '让这篇已发布文章下线吗？它会进入可恢复状态，不会永久删除。',
    deleted: '已移入可恢复状态，不是永久删除。', deleteFailed: '删除操作失败，文章没有被移除。',
    loadFailed: '文章加载失败，请稍后再试。', addTitle: '请先填写标题。', saveFailed: '保存失败，文章未更新。',
    invalidImageUrl: '链接无效，请使用 Pexels 照片页或 images.pexels.com 图片地址。', directImageRequired: '请使用 Pexels 照片页或 images.pexels.com 图片地址。', providerKeyMissing: 'Pexels API 未配置；请使用 images.pexels.com 直链或检查 PEXELS_API_KEY。',
    linkPrompt: '输入链接地址', noArticles: '还没有文章。', backToTop: '返回顶部'
  },
  en: {
    admin: 'Kvisl Admin', untitled: 'Article editor', newArticle: 'New article', signOut: 'Sign out', language: 'Language',
    articles: 'Articles', total: 'All', published: 'Published', drafts: 'Drafts', publishedStatus: 'Published', draftStatus: 'Draft',
    editingPublished: 'Editing a published article', editingDraft: 'Editing a draft', newStatus: 'New article',
    title: 'Title', titlePlaceholder: 'Type the article title', subtitle: 'Subtitle (optional)', subtitlePlaceholder: 'Type the subtitle', subtitleHelp: 'Shown below the title. Leave blank to hide it.',
    summary: 'Summary', summaryHelp: 'Describe the article in one or two sentences.', author: 'Author', date: 'Publish date', category: 'Category', categoryPlaceholder: 'e.g. Politics',
    tags: 'Tags', tagsHelp: 'Separate tags with commas. Category and tags are displayed only at the end of the article.', tagsPlaceholder: 'Europe, Politics, Rights',
    cover: 'Cover image', coverDescription: 'Cover image description', coverDescriptionHelp: 'Describe the image for accessibility.',
    imageCredit: 'Image credit (optional)', creditHelp: 'A resolved Pexels photo page fills the photographer credit automatically.',
    imageUrl: 'Pexels image link', imageUrlHelp: 'One image-link field only: paste a Pexels photo page or images.pexels.com URL.',
    resolvePreview: 'Resolve & preview', resolvingImage: 'Resolving image…', previewReady: 'Image resolved successfully; preview is working', previewFailed: 'Image resolution failed',
    replaceSelectedHelp: 'If an image is selected in the article it will be replaced after confirmation; otherwise the image is inserted at the chosen line.', confirmInsert: 'Confirm insert', confirmedInsert: 'Image confirmed and inserted.', confirmedReplace: 'Selected image confirmed and replaced.',
    uploadCover: 'Upload cover', replaceCover: 'Replace cover', removeCover: 'Remove cover', uploadInline: 'Upload body image',
    storageMissing: 'Image upload is not configured; Pexels links can still be used.', pexelsKeyMissing: 'Pexels photo-page resolution requires PEXELS_API_KEY; images.pexels.com direct URLs still work.',
    uploading: 'Uploading', uploadSuccess: 'Upload succeeded.', uploadFailed: 'Image upload failed.', uploadSlow: 'Upload progress can briefly remain at 0% while connecting.', coverUploaded: 'Cover uploaded and previewed successfully.', imageInserted: 'Body image uploaded and inserted successfully.',
    body: 'Article text', compactBody: 'Compact article text', expandBody: 'Expand article text', bold: 'Bold', italic: 'Italic', heading: 'Heading', smallerHeading: 'Smaller heading', quote: 'Quote', list: 'List', link: 'Link', undo: 'Undo', redo: 'Redo',
    textColor: 'Text color', selectedColor: 'Selected text', clearColor: 'Clear color', imageLine: 'Insert at line', imageLineHelp: 'Count paragraphs, headings, lists and images.',
    sources: 'Sources (optional)', sourcesHelp: 'One per line: name | link | note.', sourcesPlaceholder: 'Source name | https://example.com | optional note',
    saveDraft: 'Save draft', publish: 'Publish article', updatePublished: 'Update published article', deleteDraft: 'Delete draft', movePublished: 'Unpublish to recoverable trash',
    savingDraft: 'Saving draft…', publishing: 'Publishing article…', updatingPublished: 'Updating published article…', deleting: 'Processing deletion…',
    draftSaved: 'Draft saved successfully.', publishedMessage: 'Article published successfully; public caches were refreshed.', updatedPublishedMessage: 'Published article updated successfully; the live page was refreshed.',
    deleteDraftConfirm: 'Delete this draft? It will leave the editor list but remain recoverable in the database.', publishedDeleteConfirm: 'Take this published article offline? It will remain recoverable and will not be permanently deleted.',
    deleted: 'Moved to a recoverable state; it was not permanently deleted.', deleteFailed: 'Delete operation failed; the article was not removed.',
    loadFailed: 'Could not load articles. Please try again.', addTitle: 'Add a title first.', saveFailed: 'Save failed; the article was not updated.',
    invalidImageUrl: 'Use a Pexels photo page or images.pexels.com image URL.', directImageRequired: 'Use a Pexels photo page or images.pexels.com image URL.', providerKeyMissing: 'Pexels API is not configured; use an images.pexels.com URL or check PEXELS_API_KEY.',
    linkPrompt: 'Enter the link address', noArticles: 'No articles yet.', backToTop: 'Back to top'
  }
} as const;

export function EditorDashboardV2() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<Draft>(fresh);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<ArticleStatus | null>(null);
  const [uploadConfigured, setUploadConfigured] = useState<boolean | null>(null);
  const [pexelsConfigured, setPexelsConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState<NoticeKind>('idle');
  const [language, setLanguage] = useState<Language>('zh');
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [textColor, setTextColor] = useState('#1d1d1f');
  const [imageLine, setImageLine] = useState('1');
  const [inlineCredit, setInlineCredit] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [resolvedInlineImage, setResolvedInlineImage] = useState<ResolvedEditorImage | null>(null);
  const [inlinePreview, setInlinePreview] = useState('');
  const [coverUploadStatus, setCoverUploadStatus] = useState<UploadStatus>('idle');
  const [inlineUploadStatus, setInlineUploadStatus] = useState<UploadStatus>('idle');
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [inlineUploadProgress, setInlineUploadProgress] = useState(0);
  const titleRef = useRef<HTMLInputElement>(null);
  const t = copy[language];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      TextColor,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, autolink: true })
    ],
    content: draft.body,
    immediatelyRender: false,
    editorProps: { attributes: { 'aria-label': language === 'zh' ? '正文输入框' : 'Article text editor' } },
    onUpdate: ({ editor }) => setDraft((current) => ({ ...current, body: editor.getHTML() }))
  });

  function showNotice(kind: NoticeKind, message: string) {
    setNoticeKind(kind);
    setNotice(message);
  }

  async function load() {
    try {
      const response = await fetch('/api/admin/articles', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || copy[language].loadFailed);
      setArticles(data.articles || []);
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : copy[language].loadFailed);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('kvisl-admin-language');
    if (saved === 'zh' || saved === 'en') setLanguage(saved);
    else if (!navigator.language.toLowerCase().startsWith('zh')) setLanguage('en');
    void load();
    void fetch('/api/admin/media', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data && typeof data.uploadConfigured === 'boolean') setUploadConfigured(data.uploadConfigured);
        if (data && typeof data.pexelsConfigured === 'boolean') setPexelsConfigured(data.pexelsConfigured);
      })
      .catch(() => undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    window.localStorage.setItem('kvisl-admin-language', next);
    showNotice('idle', '');
  }

  function resetMediaState() {
    setCoverImageUrl('');
    setInlineImageUrl('');
    setResolvedInlineImage(null);
    setInlinePreview('');
    setInlineCredit('');
    setImageLine('1');
    setCoverUploadStatus('idle');
    setInlineUploadStatus('idle');
    setCoverUploadProgress(0);
    setInlineUploadProgress(0);
  }

  function select(article: Article) {
    const next = toDraft(article);
    setDraft(next);
    setEditingSlug(article.slug);
    setEditingStatus(article.status);
    editor?.commands.setContent(next.body);
    setBodyExpanded(false);
    resetMediaState();
    showNotice('idle', '');
  }

  function newArticle() {
    const next = fresh();
    setDraft(next);
    setEditingSlug(null);
    setEditingStatus(null);
    editor?.commands.setContent(next.body);
    setBodyExpanded(false);
    resetMediaState();
    showNotice('idle', '');
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  async function upload(file: File, onProgress: (value: number) => void) {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
    if (!allowed.has(file.type) || file.size > 50 * 1024 * 1024) throw new Error(t.uploadFailed);
    if (uploadConfigured === false) throw new Error(t.storageMissing);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'image';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5 * 60 * 1000);
    try {
      const blob = await uploadPresigned(`editorial/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
        multipart: file.size > 10 * 1024 * 1024,
        abortSignal: controller.signal,
        onUploadProgress: (progress) => onProgress(Math.max(0, Math.min(100, Math.round(progress.percentage))))
      });
      onProgress(100);
      return blob.url;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function resolveEditorImage(value: string): Promise<ResolvedEditorImage> {
    const url = cleanHttpUrl(value);
    if (!url) throw new Error(t.invalidImageUrl);
    const response = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (data.code === 'PROVIDER_KEY_MISSING') throw new Error(t.providerKeyMissing);
      if (data.code === 'DIRECT_IMAGE_REQUIRED') throw new Error(t.directImageRequired);
      throw new Error(data.message || t.invalidImageUrl);
    }
    return data as ResolvedEditorImage;
  }

  async function resolveCoverUrl() {
    if (!coverImageUrl.trim()) return showNotice('error', t.invalidImageUrl);
    setBusy(true);
    showNotice('info', t.resolvingImage);
    try {
      const image = await resolveEditorImage(coverImageUrl);
      setDraft((current) => ({
        ...current,
        coverImage: image.url,
        coverSource: image.source || current.coverSource.trim() || sourceNameFromUrl(image.url),
        coverSourceUrl: image.sourceUrl || current.coverSourceUrl.trim()
      }));
      setCoverImageUrl('');
      showNotice('success', t.previewReady);
    } catch (error) {
      showNotice('error', `${t.previewFailed}: ${error instanceof Error ? error.message : t.invalidImageUrl}`);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setCoverUploadStatus('uploading');
    setCoverUploadProgress(0);
    showNotice('info', t.uploading);
    try {
      const url = await upload(file, setCoverUploadProgress);
      setDraft((current) => ({ ...current, coverImage: url, coverAlt: '', coverSource: '', coverSourceUrl: '' }));
      setCoverUploadStatus('success');
      showNotice('success', t.coverUploaded);
    } catch (error) {
      setCoverUploadStatus('error');
      showNotice('error', error instanceof Error ? error.message : t.uploadFailed);
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

  function placeInlineImage(url: string, source = '', sourceUrl = '') {
    if (!editor) return false;
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { src: url }).run();
      return true;
    }
    const content: any[] = [{ type: 'image', attrs: { src: url, alt: '' } }];
    if (source) {
      const marks: any[] = [{ type: 'italic' }];
      if (sourceUrl) marks.push({ type: 'link', attrs: { href: sourceUrl } });
      content.push({ type: 'paragraph', content: [{ type: 'text', marks, text: source }] });
    }
    editor.chain().focus().insertContentAt(blockInsertPosition(Number(imageLine) || 1), content).run();
    return false;
  }

  async function previewInlineUrl() {
    if (!editor || !inlineImageUrl.trim()) return showNotice('error', t.invalidImageUrl);
    setBusy(true);
    showNotice('info', t.resolvingImage);
    try {
      const image = await resolveEditorImage(inlineImageUrl);
      setResolvedInlineImage(image);
      setInlinePreview(image.url);
      if (!inlineCredit.trim() && image.source) setInlineCredit(image.source);
      showNotice('success', t.previewReady);
    } catch (error) {
      setResolvedInlineImage(null);
      setInlinePreview('');
      showNotice('error', `${t.previewFailed}: ${error instanceof Error ? error.message : t.invalidImageUrl}`);
    } finally {
      setBusy(false);
    }
  }

  function confirmInlineImage() {
    if (!resolvedInlineImage || !editor) return showNotice('error', t.invalidImageUrl);
    const replaced = placeInlineImage(
      resolvedInlineImage.url,
      inlineCredit.trim() || resolvedInlineImage.source || sourceNameFromUrl(resolvedInlineImage.url),
      resolvedInlineImage.sourceUrl || ''
    );
    showNotice('success', replaced ? t.confirmedReplace : t.confirmedInsert);
    setInlineImageUrl('');
    setResolvedInlineImage(null);
  }

  async function uploadInline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setBusy(true);
    setInlineUploadStatus('uploading');
    setInlineUploadProgress(0);
    showNotice('info', t.uploading);
    try {
      const url = await upload(file, setInlineUploadProgress);
      const replaced = placeInlineImage(url, inlineCredit.trim());
      setInlinePreview(url);
      setInlineUploadStatus('success');
      showNotice('success', replaced ? t.confirmedReplace : t.imageInserted);
    } catch (error) {
      setInlineUploadStatus('error');
      showNotice('error', error instanceof Error ? error.message : t.uploadFailed);
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

  function applyColorToSelection() {
    editor?.chain().focus().setMark('textColor', { color: textColor }).run();
  }

  function clearColor() {
    editor?.chain().focus().unsetMark('textColor').run();
  }

  async function save(requestedStatus: ArticleStatus) {
    const title = draft.title.trim();
    if (!title) return showNotice('error', t.addTitle);
    const slug = draft.slug || slugify(title);
    const wasPublished = editingStatus === 'published';
    const status: ArticleStatus = wasPublished ? 'published' : requestedStatus;
    setBusy(true);
    showNotice('info', wasPublished ? t.updatingPublished : status === 'published' ? t.publishing : t.savingDraft);
    try {
      const endpoint = editingSlug ? `/api/admin/articles/${encodeURIComponent(editingSlug)}` : '/api/admin/articles';
      const response = await fetch(endpoint, {
        method: editingSlug ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          subtitle: draft.subtitle,
          dek: draft.dek,
          body: editor?.getHTML() || draft.body,
          author: draft.author,
          publishedAt: new Date(draft.publishedAt).toISOString(),
          status,
          section: draft.section,
          tags: parseTags(draft.tagsText),
          coverImage: draft.coverImage || undefined,
          coverAlt: draft.coverAlt || undefined,
          coverSource: draft.coverSource || undefined,
          coverSourceUrl: draft.coverSourceUrl || undefined,
          supportingImages: draft.supportingImagesText.split('\n').map((value) => value.trim()).filter(Boolean),
          sources: parseSources(draft.sourcesText),
          featured: draft.featured
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || t.saveFailed);
      const next = toDraft(data.article);
      setDraft(next);
      setEditingSlug(data.article.slug);
      setEditingStatus(data.article.status);
      editor?.commands.setContent(next.body);
      showNotice('success', wasPublished ? t.updatedPublishedMessage : status === 'published' ? t.publishedMessage : t.draftSaved);
      await load();
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const articleSlug = editingSlug;
    if (!articleSlug) return;
    const confirmText = editingStatus === 'published' ? t.publishedDeleteConfirm : t.deleteDraftConfirm;
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    showNotice('info', t.deleting);
    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(articleSlug)}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || t.deleteFailed);
      const message = t.deleted;
      newArticle();
      showNotice('success', message);
      await load();
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : t.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    window.location.reload();
  }

  const publishedCount = articles.filter((article) => article.status === 'published').length;
  const draftCount = articles.filter((article) => article.status === 'draft').length;
  const statusLabel = (status: ArticleStatus) => status === 'published' ? t.publishedStatus : t.draftStatus;
  const currentStateLabel = editingStatus === 'published' ? t.editingPublished : editingStatus === 'draft' ? t.editingDraft : t.newStatus;
  const uploadText = (status: UploadStatus, progress: number) => status === 'uploading' ? `${t.uploading} ${progress}%` : status === 'success' ? t.uploadSuccess : status === 'error' ? t.uploadFailed : '';
  const lineMax = (editor?.state.doc.childCount || 0) + 1;
  const coverPreview = publicImageUrl(draft.coverImage);

  const formatButtons = <>
    <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>{t.bold}</button>
    <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>{t.italic}</button>
    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>{t.heading}</button>
    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>{t.smallerHeading}</button>
    <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>{t.quote}</button>
    <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>{t.list}</button>
    <button type="button" onClick={setLink}>{t.link}</button>
    <button type="button" onClick={() => editor?.chain().focus().undo().run()}>{t.undo}</button>
    <button type="button" onClick={() => editor?.chain().focus().redo().run()}>{t.redo}</button>
  </>;

  return <div className="editor-dashboard editor-dashboard-v2">
    <div className="editor-topbar">
      <div>
        <p className="eyebrow">{t.admin}</p>
        <h1>{draft.title || t.untitled}</h1>
        <span className={`editor-status-pill ${editingStatus || 'new'}`}>{currentStateLabel}</span>
      </div>
      <div className="editor-top-actions" style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div aria-label={t.language} style={{ display: 'inline-flex', gap: 4 }}>
          <button type="button" aria-pressed={language === 'zh'} onClick={() => changeLanguage('zh')}>中文</button>
          <button type="button" aria-pressed={language === 'en'} onClick={() => changeLanguage('en')}>English</button>
        </div>
        {editingSlug && <button type="button" onClick={newArticle}>{t.newArticle}</button>}
        <button type="button" onClick={logout}>{t.signOut}</button>
      </div>
    </div>

    {notice && <div className={`editor-notice ${noticeKind}`} role="status" aria-live="polite">
      <strong aria-hidden="true">{noticeKind === 'success' ? '✓' : noticeKind === 'error' ? '!' : '•'}</strong>
      <span>{notice}</span>
    </div>}

    <div className="admin-counts" aria-label={t.articles}>
      <div><small>{t.total}</small><strong>{articles.length}</strong></div>
      <div><small>{t.published}</small><strong>{publishedCount}</strong></div>
      <div><small>{t.drafts}</small><strong>{draftCount}</strong></div>
    </div>

    <div className="editor-layout">
      <aside className="editor-list" aria-label={t.articles}>
        <h2>{t.articles} <small>({publishedCount} {t.published})</small></h2>
        {articles.length === 0 && <p className="editor-empty-note">{t.noArticles}</p>}
        {articles.map((article) => <button key={article.slug} type="button" className={`${editingSlug === article.slug ? 'active ' : ''}status-${article.status}`} onClick={() => select(article)}>
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
            {coverPreview && <div className="admin-preview-card is-ready">
              <img className="admin-image-preview" src={coverPreview} alt={draft.coverAlt || ''} onError={() => showNotice('error', t.previewFailed)} />
              <div className="admin-preview-meta"><strong>✓ {t.previewReady}</strong>{draft.coverSource && <small>{draft.coverSource}</small>}</div>
            </div>}
            <div className="admin-url-row">
              <input value={coverImageUrl} inputMode="url" placeholder="https://www.pexels.com/photo/…" aria-label={t.imageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} />
              <button type="button" className="text-button" disabled={busy} onClick={resolveCoverUrl}>{t.resolvePreview}</button>
            </div>
            <small>{t.imageUrlHelp}</small>
            {pexelsConfigured === false && <p className="upload-config-warning" role="note">{t.pexelsKeyMissing}</p>}
            {uploadConfigured === false && <p className="upload-config-warning" role="note">{t.storageMissing}</p>}
            <div className="admin-inline-controls">
              <label className={`upload-button${uploadConfigured === false ? ' is-disabled' : ''}`}>{draft.coverImage ? t.replaceCover : t.uploadCover}<input type="file" disabled={uploadConfigured === false || busy} accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={uploadCover} /></label>
              {draft.coverImage && <button type="button" className="text-button" onClick={() => setDraft((current) => ({ ...current, coverImage: '', coverAlt: '', coverSource: '', coverSourceUrl: '' }))}>{t.removeCover}</button>}
            </div>
            {coverUploadStatus !== 'idle' && <><p className={`upload-status ${coverUploadStatus}`}>{uploadText(coverUploadStatus, coverUploadProgress)}</p>{coverUploadStatus === 'uploading' && <progress className="upload-progress" max="100" value={coverUploadProgress} />}{coverUploadStatus === 'uploading' && <small className="upload-help">{t.uploadSlow}</small>}</>}
          </div>
          <label className="field full"><span>{t.coverDescription}</span><input value={draft.coverAlt} onChange={(event) => setDraft((current) => ({ ...current, coverAlt: event.target.value }))} /><small>{t.coverDescriptionHelp}</small></label>
          <label className="field full"><span>{t.imageCredit}</span><input value={draft.coverSource} onChange={(event) => setDraft((current) => ({ ...current, coverSource: event.target.value }))} /><small>{t.creditHelp}</small></label>
        </div>

        <div className="editor-block">
          <div className="editor-block-head">
            <span className="field-label">{t.body}</span>
            <button className="text-button" type="button" aria-expanded={bodyExpanded} onClick={() => setBodyExpanded((expanded) => !expanded)}>{bodyExpanded ? t.compactBody : t.expandBody}</button>
          </div>
          <div className={`editor-body-area ${bodyExpanded ? 'is-expanded' : 'is-compact'}`}>
            <div className="toolbar" aria-label={t.body}>{formatButtons}</div>
            <EditorContent editor={editor} className="tiptap-shell" />
            <div className="editor-format-row">
              <label><span>{t.textColor}</span><input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label>
              <button type="button" className="text-button" onClick={applyColorToSelection}>{t.selectedColor}</button>
              <button type="button" className="text-button" onClick={clearColor}>{t.clearColor}</button>
            </div>

            <div className="inline-image-tools">
              <label><span>{t.imageLine}</span><input type="number" min="1" max={lineMax} value={imageLine} onChange={(event) => setImageLine(event.target.value)} /></label>
              <label className="inline-source-field"><span>{t.imageCredit}</span><input value={inlineCredit} onChange={(event) => setInlineCredit(event.target.value)} /></label>
              <label className="inline-source-field"><span>{t.imageUrl}</span><input value={inlineImageUrl} inputMode="url" placeholder="https://www.pexels.com/photo/…" onChange={(event) => { setInlineImageUrl(event.target.value); setResolvedInlineImage(null); setInlinePreview(''); }} /></label>
              <button type="button" className="text-button" disabled={busy} onClick={previewInlineUrl}>{t.resolvePreview}</button>
              <label className={`upload-button${uploadConfigured === false ? ' is-disabled' : ''}`}>{t.uploadInline}<input type="file" disabled={uploadConfigured === false || busy} accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={uploadInline} /></label>
              <small>{t.imageLineHelp} {t.replaceSelectedHelp}</small>

              {inlinePreview && <div className="admin-preview-card inline-preview is-ready">
                <img className="admin-inline-preview" src={inlinePreview} alt="" onError={() => showNotice('error', t.previewFailed)} />
                <div className="admin-preview-meta">
                  <strong>✓ {t.previewReady}</strong>
                  {inlineCredit && <small>{inlineCredit}</small>}
                  {resolvedInlineImage && <button type="button" className="primary preview-confirm-button" onClick={confirmInlineImage}>{t.confirmInsert}</button>}
                </div>
              </div>}
              {inlineUploadStatus !== 'idle' && <p className={`upload-status ${inlineUploadStatus}`}>{uploadText(inlineUploadStatus, inlineUploadProgress)}</p>}
              {inlineUploadStatus === 'uploading' && <progress className="upload-progress" max="100" value={inlineUploadProgress} />}
            </div>
          </div>
        </div>

        <div className="field-grid">
          <label className="field full"><span>{t.sources}</span><textarea rows={5} value={draft.sourcesText} placeholder={t.sourcesPlaceholder} onChange={(event) => setDraft((current) => ({ ...current, sourcesText: event.target.value }))} /><small>{t.sourcesHelp}</small></label>
        </div>

        <div className="editor-actions editor-actions-v2">
          {editingStatus === 'published'
            ? <button type="button" className="primary" disabled={busy} onClick={() => save('published')}>{t.updatePublished}</button>
            : <>
                <button type="button" disabled={busy} onClick={() => save('draft')}>{t.saveDraft}</button>
                <button type="button" className="primary" disabled={busy} onClick={() => save('published')}>{t.publish}</button>
              </>}
          {editingSlug && <button type="button" className="danger" disabled={busy} onClick={remove}>{editingStatus === 'published' ? t.movePublished : t.deleteDraft}</button>}
        </div>
      </section>
    </div>

    <button className="admin-back-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t.backToTop}>↑<span>{t.backToTop}</span></button>
  </div>;
}
