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
  slug: '', title: '', subtitle: '', dek: '', body: '<p></p>', author: 'Kvisl Editors',
  publishedAt: new Date().toISOString().slice(0, 16), section: '', tagsText: '',
  coverImage: '', coverAlt: '', coverSource: '', coverSourceUrl: '', supportingImagesText: '', sourcesText: '', featured: false
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
    admin: 'Kvisl 后台', untitled: '文章编辑', newArticle: '新建文章', signOut: '退出', language: '语言', articles: '文章', total: '全部', published: '已发布', drafts: '草稿',
    title: '标题', titlePlaceholder: '输入文章标题', subtitle: '副标题（可选）', subtitlePlaceholder: '输入副标题', subtitleHelp: '显示在文章标题下方；不填写则不显示。', summary: '简介', summaryHelp: '用一两句话告诉读者这篇文章讲什么。',
    author: '作者', date: '发布时间', category: '分类', categoryPlaceholder: '例如：自然', tags: '标签', tagsHelp: '多个标签用逗号隔开。发布后会自动进入站内分类与标签列表。', tagsPlaceholder: '自然，文化，思想',
    cover: '封面图', uploadCover: '上传封面', replaceCover: '更换封面', removeCover: '移除封面', coverDescription: '封面图文字说明', coverDescriptionHelp: '简单描述图片内容，方便图片无法显示或读屏时理解。', imageSource: '图片署名（可选）', coverSourceHelp: '推荐格式：Photo by 摄影师姓名 on Pexels。使用 Pexels 照片页时会自动填写。', imageSourceUrl: 'Pexels 照片页链接（可选）', imageSourceUrlHelp: '应链接到原始 Pexels 照片页；使用照片页解析时会自动填写。',
    imageUrl: 'Pexels 图片链接', imageUrlHelp: '推荐粘贴 Pexels 照片详情页，系统会自动取得图片、摄影师署名与来源链接。', useImageUrl: '解析 Pexels 链接', insertImageUrl: '插入或替换 Pexels 图片', invalidImageUrl: '链接无效，请使用 Pexels 照片页、images.pexels.com 地址，或上传来自 Pexels 的文件。', linkedImageReady: 'Pexels 图片及署名已准备好。', linkedImageInserted: 'Pexels 图片与署名已插入正文。', imageReplaced: '选中的正文图片已替换。', replaceSelectedHelp: '先在正文中点选一张图片，再使用链接或上传新图即可替换。', resolvingImage: '正在解析 Pexels 链接…', directImageRequired: '请使用 Pexels 照片页、images.pexels.com 地址，或上传来自 Pexels 的图片文件。', providerKeyMissing: '请先在 Vercel 添加服务端环境变量 PEXELS_API_KEY，或改用 images.pexels.com 图片地址。', pexelsKeyMissing: 'Pexels 照片页自动解析尚未启用：请在 Vercel 添加 PEXELS_API_KEY。', storageMissing: '图片上传尚未配置。请先在 Vercel 为项目连接公开 Blob Store；Pexels 链接仍可使用。',
    body: '正文', compactBody: '收起正文', expandBody: '展开正文', bold: '粗体', italic: '斜体', heading: '小标题', smallerHeading: '次级标题', quote: '引用', list: '列表', link: '链接', undo: '撤销', redo: '重做',
    textColor: '文字颜色', selectedColor: '选中文字', lineColor: '当前行颜色', paragraphColor: '整段颜色', clearColor: '清除颜色', imageLine: '插入在第几段之后', imageLineHelp: '只按正文段落计算位置；标题、列表、图片和图片署名不计入段落。', inlineSourceHelp: '使用 Pexels 照片页时会自动插入摄影师署名；上传文件时请手动填写“Photo by 摄影师姓名 on Pexels”。', insertImage: '上传 Pexels 图片',
    uploading: '正在上传', uploadSuccess: '上传成功，图片已显示。', uploadFailed: '图片上传失败。当前允许单张图片最大 50 MB；如果一直停在 0%，可直接使用图片链接。', uploadSlow: '0% 通常表示浏览器还在连接 Blob；移动网络或 VPN 可能让直传连接变慢。', coverUploaded: '封面已上传。', imageInserted: '图片已插入正文。',
    sources: '资料来源（可选）', sourcesHelp: '每行一条：名称｜链接｜备注。只有名称也可以。', sourcesPlaceholder: '资料名称｜https://example.com｜可选备注', saveDraft: '存为草稿', publish: '发布', delete: '删除', draftStatus: '草稿', publishedStatus: '已发布',
    loadFailed: '文章加载失败，请稍后再试。', addTitle: '请先填写标题。', saveFailed: '保存失败，请稍后再试。', publishedMessage: '文章已发布。', draftSaved: '草稿已保存。', deleteConfirm: '确定删除这篇文章吗？删除后无法恢复。', deleteFailed: '删除失败，请稍后再试。', deleted: '文章已删除。', linkPrompt: '输入链接地址', noArticles: '还没有文章。', backToTop: '返回顶部'
  },
  en: {
    admin: 'Kvisl Admin', untitled: 'Article editor', newArticle: 'New article', signOut: 'Sign out', language: 'Language', articles: 'Articles', total: 'All', published: 'Published', drafts: 'Drafts',
    title: 'Title', titlePlaceholder: 'Type the article title', subtitle: 'Subtitle (optional)', subtitlePlaceholder: 'Type the subtitle', subtitleHelp: 'Shown directly below the article title. Leave blank to hide it.', summary: 'Summary', summaryHelp: 'Describe what the article is about in one or two sentences.',
    author: 'Author', date: 'Publish date', category: 'Category', categoryPlaceholder: 'e.g. Nature', tags: 'Tags', tagsHelp: 'Separate multiple tags with commas. Published terms are added automatically to site search.', tagsPlaceholder: 'Nature, Culture, Ideas',
    cover: 'Cover image', uploadCover: 'Upload cover', replaceCover: 'Replace cover', removeCover: 'Remove cover', coverDescription: 'Cover image description', coverDescriptionHelp: 'Briefly describe the image for readers when it cannot be seen or loaded.', imageSource: 'Image credit (optional)', coverSourceHelp: 'Recommended: Photo by [photographer] on Pexels. It is filled automatically from a Pexels photo page.', imageSourceUrl: 'Pexels photo-page link (optional)', imageSourceUrlHelp: 'Link to the original Pexels photo page. It is filled automatically when that page is resolved.',
    imageUrl: 'Pexels image link', imageUrlHelp: 'Paste the Pexels photo page to retrieve the image, photographer credit and source link automatically.', useImageUrl: 'Resolve Pexels link', insertImageUrl: 'Insert or replace Pexels image', invalidImageUrl: 'Use a Pexels photo page, an images.pexels.com URL, or upload a file sourced from Pexels.', linkedImageReady: 'The Pexels image and credit are ready.', linkedImageInserted: 'The Pexels image and credit were inserted.', imageReplaced: 'The selected article image was replaced.', replaceSelectedHelp: 'Select an image in the article, then use a URL or upload a new file to replace it.', resolvingImage: 'Resolving Pexels link…', directImageRequired: 'Use a Pexels photo page, an images.pexels.com URL, or upload a Pexels image file.', providerKeyMissing: 'Add the server-side PEXELS_API_KEY in Vercel, or use an images.pexels.com URL.', pexelsKeyMissing: 'Automatic Pexels photo-page resolution is not enabled. Add PEXELS_API_KEY in Vercel.', storageMissing: 'Image upload is not configured. Connect a public Blob Store to this Vercel project; Pexels links still work.',
    body: 'Article text', compactBody: 'Compact article text', expandBody: 'Expand article text', bold: 'Bold', italic: 'Italic', heading: 'Heading', smallerHeading: 'Smaller heading', quote: 'Quote', list: 'List', link: 'Link', undo: 'Undo', redo: 'Redo',
    textColor: 'Text color', selectedColor: 'Selected text', lineColor: 'Current line', paragraphColor: 'Whole paragraph', clearColor: 'Clear color', imageLine: 'Insert after paragraph', imageLineHelp: 'Only body paragraphs are counted; headings, lists, images and image credits are ignored.', inlineSourceHelp: 'A Pexels photo page adds the photographer credit automatically. For uploads, enter “Photo by [photographer] on Pexels” manually.', insertImage: 'Upload Pexels image',
    uploading: 'Uploading', uploadSuccess: 'Upload succeeded and the image is visible.', uploadFailed: 'Image upload failed. Images up to 50 MB are allowed. If it stays at 0%, use an image URL instead.', uploadSlow: '0% usually means the browser is still connecting to Blob; mobile networks or VPNs can slow that direct connection.', coverUploaded: 'Cover uploaded.', imageInserted: 'Image inserted into the article.',
    sources: 'Sources (optional)', sourcesHelp: 'One per line: name | link | note. A name by itself is also fine.', sourcesPlaceholder: 'Source name | https://example.com | optional note', saveDraft: 'Save draft', publish: 'Publish', delete: 'Delete', draftStatus: 'Draft', publishedStatus: 'Published',
    loadFailed: 'Could not load the articles. Please try again.', addTitle: 'Add a title first.', saveFailed: 'Could not save. Please try again.', publishedMessage: 'Article published.', draftSaved: 'Draft saved.', deleteConfirm: 'Delete this article? This cannot be undone.', deleteFailed: 'Could not delete the article. Please try again.', deleted: 'Article deleted.', linkPrompt: 'Enter the link address', noArticles: 'No articles yet.', backToTop: 'Back to top'
  }
} as const;

export function EditorDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<Draft>(fresh);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [uploadConfigured, setUploadConfigured] = useState<boolean | null>(null);
  const [pexelsConfigured, setPexelsConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<Language>('zh');
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [textColor, setTextColor] = useState('#1d1d1f');
  const [imageLine, setImageLine] = useState('1');
  const [inlineSource, setInlineSource] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [coverUploadStatus, setCoverUploadStatus] = useState<UploadStatus>('idle');
  const [inlineUploadStatus, setInlineUploadStatus] = useState<UploadStatus>('idle');
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [inlineUploadProgress, setInlineUploadProgress] = useState(0);
  const [inlinePreview, setInlinePreview] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const t = copy[language];

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), TextColor, Image.configure({ inline: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: draft.body,
    immediatelyRender: false,
    editorProps: { attributes: { 'aria-label': language === 'zh' ? '正文输入框' : 'Article text editor' } },
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
    setMessage('');
  }

  function resetUploadState() {
    setCoverUploadStatus('idle');
    setInlineUploadStatus('idle');
    setCoverUploadProgress(0);
    setInlineUploadProgress(0);
    setInlinePreview('');
    setInlineSource('');
    setCoverImageUrl('');
    setInlineImageUrl('');
    setImageLine('1');
  }

  function select(article: Article) {
    const next = toDraft(article);
    setDraft(next);
    setEditingSlug(article.slug);
    editor?.commands.setContent(next.body);
    setMessage('');
    setBodyExpanded(false);
    resetUploadState();
    setCoverImageUrl(next.coverImage);
  }

  function newArticle() {
    const next = fresh();
    setDraft(next);
    setEditingSlug(null);
    editor?.commands.setContent(next.body);
    setMessage('');
    setBodyExpanded(false);
    resetUploadState();
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

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setCoverUploadProgress(0);
    setCoverUploadStatus('uploading');
    try {
      const url = await upload(file, setCoverUploadProgress);
      setDraft((current) => ({
        ...current,
        coverImage: url,
        coverAlt: '',
        coverSource: '',
        coverSourceUrl: ''
      }));
      setCoverImageUrl('');
      setCoverUploadStatus('success');
      setMessage(t.coverUploaded);
    } catch (error) {
      setCoverUploadStatus('error');
      setMessage(error instanceof Error ? error.message : t.uploadFailed);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function resolveEditorImage(value: string) {
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

    return data as { url: string; source?: string; sourceUrl?: string };
  }

  async function useCoverUrl() {
    setBusy(true);
    setMessage(t.resolvingImage);
    try {
      const image = await resolveEditorImage(coverImageUrl);
      setDraft((current) => ({
        ...current,
        coverImage: image.url,
        coverSource: current.coverSource.trim() || image.source || sourceNameFromUrl(image.url),
        coverSourceUrl: current.coverSourceUrl.trim() || image.sourceUrl || ''
      }));
      setCoverImageUrl(image.url);
      setCoverUploadStatus('success');
      setCoverUploadProgress(100);
      setMessage(t.linkedImageReady);
    } catch (error) {
      setCoverUploadStatus('error');
      setMessage(error instanceof Error ? error.message : t.invalidImageUrl);
    } finally {
      setBusy(false);
    }
  }

  function isImageCreditParagraph(node: any) {
    if (node.type?.name !== 'paragraph') return false;
    const text = node.textContent.trim();
    if (!/^Photo\b/i.test(text)) return false;
    let italic = false;
    node.descendants((child: any) => {
      if (child.isText && child.marks?.some((mark: any) => mark.type.name === 'italic')) italic = true;
    });
    return italic;
  }

  function paragraphInsertPosition(afterParagraph: number) {
    if (!editor) return 0;
    const doc = editor.state.doc;
    const target = Math.max(0, Math.floor(afterParagraph));
    if (target <= 0) return 0;

    let paragraph = 0;
    let position = doc.content.size;
    let found = false;
    doc.forEach((node, offset) => {
      if (found || node.type.name !== 'paragraph' || isImageCreditParagraph(node)) return;
      paragraph += 1;
      if (paragraph === target) {
        position = offset + node.nodeSize;
        found = true;
      }
    });
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
    editor.chain().focus().insertContentAt(paragraphInsertPosition(Number(imageLine) || 1), content).run();
    return false;
  }

  async function insertInlineUrl() {
    if (!editor) return;
    setBusy(true);
    setMessage(t.resolvingImage);
    try {
      const image = await resolveEditorImage(inlineImageUrl);
      const replaced = placeInlineImage(
        image.url,
        inlineSource.trim() || image.source || sourceNameFromUrl(image.url),
        image.sourceUrl || ''
      );
      setInlinePreview(image.url);
      setInlineImageUrl(image.url);
      setInlineUploadStatus('success');
      setInlineUploadProgress(100);
      setMessage(replaced ? t.imageReplaced : t.linkedImageInserted);
    } catch (error) {
      setInlineUploadStatus('error');
      setMessage(error instanceof Error ? error.message : t.invalidImageUrl);
    } finally {
      setBusy(false);
    }
  }

  async function uploadInline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setBusy(true);
    setInlineUploadProgress(0);
    setInlineUploadStatus('uploading');
    try {
      const url = await upload(file, setInlineUploadProgress);
      const replaced = placeInlineImage(url, inlineSource.trim());
      setInlinePreview(url);
      setInlineImageUrl('');
      setInlineUploadStatus('success');
      setMessage(replaced ? t.imageReplaced : t.imageInserted);
    } catch (error) {
      setInlineUploadStatus('error');
      setMessage(error instanceof Error ? error.message : t.uploadFailed);
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
    if (!editor) return;
    editor.chain().focus().setMark('textColor', { color: textColor }).run();
  }

  function applyColorToLine() {
    if (!editor) return;
    const { $from } = editor.state.selection;
    if (!$from.parent.isTextblock) return;
    const blockStart = $from.start();
    const cursorOffset = $from.parentOffset;
    let lineStart = 0;
    let lineEnd = $from.parent.content.size;
    let foundEnd = false;
    $from.parent.forEach((node, offset) => {
      if (node.type.name !== 'hardBreak') return;
      if (offset < cursorOffset) lineStart = offset + node.nodeSize;
      else if (!foundEnd) {
        lineEnd = offset;
        foundEnd = true;
      }
    });
    if (lineEnd <= lineStart) return;
    editor.chain().focus().setTextSelection({ from: blockStart + lineStart, to: blockStart + lineEnd }).setMark('textColor', { color: textColor }).run();
  }

  function applyColorToParagraph() {
    if (!editor) return;
    const { $from } = editor.state.selection;
    if (!$from.parent.isTextblock) return;
    editor.chain().focus().setTextSelection({ from: $from.start(), to: $from.end() }).setMark('textColor', { color: textColor }).run();
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
      const endpoint = editingSlug
        ? `/api/admin/articles/${encodeURIComponent(editingSlug)}`
        : '/api/admin/articles';
      const response = await fetch(endpoint, {
        method: editingSlug ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug, title, subtitle: draft.subtitle, dek: draft.dek, body: editor?.getHTML() || draft.body,
          author: draft.author, publishedAt: new Date(draft.publishedAt).toISOString(), status,
          section: draft.section, tags: parseTags(draft.tagsText), coverImage: draft.coverImage || undefined,
          coverAlt: draft.coverAlt || undefined, coverSource: draft.coverSource || undefined,
          coverSourceUrl: draft.coverSourceUrl || undefined,
          supportingImages: draft.supportingImagesText.split('\n').map((value) => value.trim()).filter(Boolean),
          sources: parseSources(draft.sourcesText), featured: draft.featured
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || t.saveFailed);
      const next = toDraft(data.article);
      setDraft(next);
      setEditingSlug(data.article.slug);
      editor?.commands.setContent(next.body);
      setMessage(status === 'published' ? t.publishedMessage : t.draftSaved);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const articleSlug = editingSlug || draft.slug;
    if (!articleSlug || !window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(articleSlug)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(t.deleteFailed);
      newArticle();
      setMessage(t.deleted);
      await load();
    } catch {
      setMessage(t.deleteFailed);
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
  const uploadText = (status: UploadStatus, progress: number) => status === 'uploading' ? `${t.uploading} ${progress}%` : status === 'success' ? t.uploadSuccess : status === 'error' ? t.uploadFailed : '';
  let paragraphCount = 0;
  editor?.state.doc.forEach((node) => {
    if (node.type.name === 'paragraph' && !isImageCreditParagraph(node)) paragraphCount += 1;
  });
  const lineMax = Math.max(1, paragraphCount);

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
        {articles.map((article) => <button key={article.slug} type="button" className={editingSlug === article.slug ? 'active' : ''} onClick={() => select(article)}><span>{article.title}</span><small>{statusLabel(article.status)} · {article.section || '—'}</small></button>)}
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
            {draft.coverImage && <img className="admin-image-preview" src={publicImageUrl(draft.coverImage)} alt={draft.coverAlt || ''} onError={() => setMessage(t.invalidImageUrl)} />}
            <div className="admin-url-row">
              <input value={coverImageUrl} inputMode="url" placeholder="https://…" aria-label={t.imageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} />
              <button type="button" className="text-button" disabled={busy} onClick={useCoverUrl}>{t.useImageUrl}</button>
            </div>
            <small>{t.imageUrlHelp}</small>
            {pexelsConfigured === false && <p className="upload-config-warning" role="note">{t.pexelsKeyMissing}</p>}
            {uploadConfigured === false && <p className="upload-config-warning" role="note">{t.storageMissing}</p>}
            <div className="admin-inline-controls">
              <label className={`upload-button${uploadConfigured === false ? ' is-disabled' : ''}`}>{draft.coverImage ? t.replaceCover : t.uploadCover}<input type="file" disabled={uploadConfigured === false || busy} accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={uploadCover} /></label>
              {draft.coverImage && <button type="button" className="text-button" onClick={() => { setDraft((current) => ({ ...current, coverImage: '', coverAlt: '', coverSource: '', coverSourceUrl: '' })); setCoverImageUrl(''); setCoverUploadStatus('idle'); }}>{t.removeCover}</button>}
            </div>
            {coverUploadStatus !== 'idle' && <><p className={`upload-status ${coverUploadStatus}`}>{uploadText(coverUploadStatus, coverUploadProgress)}</p>{coverUploadStatus === 'uploading' && <progress className="upload-progress" max="100" value={coverUploadProgress} aria-label={uploadText(coverUploadStatus, coverUploadProgress)} />}{coverUploadStatus === 'uploading' && <small className="upload-help">{t.uploadSlow}</small>}</>}
          </div>
          <label className="field full"><span>{t.coverDescription}</span><input value={draft.coverAlt} onChange={(event) => setDraft((current) => ({ ...current, coverAlt: event.target.value }))} /><small>{t.coverDescriptionHelp}</small></label>
          <label className="field full"><span>{t.imageSource}</span><input value={draft.coverSource} onChange={(event) => setDraft((current) => ({ ...current, coverSource: event.target.value }))} /><small>{t.coverSourceHelp}</small></label>
          <label className="field full"><span>{t.imageSourceUrl}</span><input value={draft.coverSourceUrl} inputMode="url" onChange={(event) => setDraft((current) => ({ ...current, coverSourceUrl: event.target.value }))} /><small>{t.imageSourceUrlHelp}</small></label>
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
              <button type="button" className="text-button" onClick={applyColorToLine}>{t.lineColor}</button>
              <button type="button" className="text-button" onClick={applyColorToParagraph}>{t.paragraphColor}</button>
              <button type="button" className="text-button" onClick={clearColor}>{t.clearColor}</button>
            </div>

            <div className="inline-image-tools">
              <label><span>{t.imageLine}</span><input type="number" min="1" max={lineMax} value={imageLine} onChange={(event) => setImageLine(event.target.value)} /></label>
              <label className="inline-source-field"><span>{t.imageSource}</span><input value={inlineSource} onChange={(event) => setInlineSource(event.target.value)} /></label>
              <label className="inline-source-field"><span>{t.imageUrl}</span><input value={inlineImageUrl} inputMode="url" placeholder="https://…" onChange={(event) => setInlineImageUrl(event.target.value)} /></label>
              <button type="button" className="text-button" disabled={busy} onClick={insertInlineUrl}>{t.insertImageUrl}</button>
              <label className={`upload-button${uploadConfigured === false ? ' is-disabled' : ''}`}>{t.insertImage}<input type="file" disabled={uploadConfigured === false || busy} accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={uploadInline} /></label>
              <small>{t.imageLineHelp} {t.inlineSourceHelp} {t.replaceSelectedHelp}</small>
              {inlineUploadStatus !== 'idle' && <p className={`upload-status ${inlineUploadStatus}`}>{uploadText(inlineUploadStatus, inlineUploadProgress)}</p>}
              {inlineUploadStatus === 'uploading' && <progress className="upload-progress" max="100" value={inlineUploadProgress} aria-label={uploadText(inlineUploadStatus, inlineUploadProgress)} />}
              {inlineUploadStatus === 'uploading' && <small className="upload-help">{t.uploadSlow}</small>}
              {inlinePreview && <img className="admin-inline-preview" src={inlinePreview} alt="" onError={() => setMessage(t.invalidImageUrl)} />}
            </div>
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

    <button className="admin-back-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t.backToTop}>↑<span>{t.backToTop}</span></button>
  </div>;
}
