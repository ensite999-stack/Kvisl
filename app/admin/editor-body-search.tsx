'use client';

import { useEffect } from 'react';

function isImageCreditElement(element: Element | null) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'P') return false;
  if (element.previousElementSibling?.tagName !== 'IMG') return false;
  const text = (element.textContent || '').trim();
  if (!text || text.length > 240 || !element.querySelector('em')) return false;
  if (/^Photo\b/i.test(text)) return true;
  return Array.from(element.children).every((child) => {
    if (child.tagName === 'EM') return true;
    return child.tagName === 'A' && Boolean(child.querySelector('em'));
  });
}

function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function bodyParagraphs(editor: HTMLElement) {
  return Array.from(editor.children).filter(
    (element): element is HTMLParagraphElement => element instanceof HTMLParagraphElement && !isImageCreditElement(element)
  );
}

function isChineseAdmin() {
  return Array.from(document.querySelectorAll('.editor-dashboard-v2 .editor-top-actions button[aria-pressed="true"]'))
    .some((button) => button.textContent?.trim() === '中文');
}

export function EditorBodySearch() {
  useEffect(() => {
    let frame = 0;
    let highlightTimer = 0;

    const style = document.createElement('style');
    style.dataset.editorBodySearchStyle = 'true';
    style.textContent = `
      .editor-body-search { border:1px solid var(--line); background:color-mix(in srgb, var(--surface) 52%, transparent); padding:14px; margin:0 0 16px; display:grid; gap:10px; }
      .editor-body-search-head { display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap; }
      .editor-body-search-head strong { font-size:14px; }
      .editor-body-search-head small { color:var(--muted); }
      .editor-body-search-row { display:flex; gap:8px; align-items:stretch; }
      .editor-body-search-input { min-width:0; flex:1; border:1px solid var(--line); background:var(--bg); color:var(--text); padding:10px 12px; font:inherit; }
      .editor-body-search-button { border:1px solid var(--strong-line); background:var(--text); color:var(--bg); padding:9px 14px; cursor:pointer; white-space:nowrap; }
      .editor-body-search-status { min-height:18px; margin:0; color:var(--muted); font-size:12px; }
      .editor-body-search-results { display:grid; gap:6px; }
      .editor-body-search-result { width:100%; text-align:left; display:grid; gap:3px; border:1px solid var(--line); background:var(--bg); color:var(--text); padding:9px 10px; cursor:pointer; }
      .editor-body-search-result:hover, .editor-body-search-result:focus-visible { border-color:var(--strong-line); }
      .editor-body-search-result strong { font-size:12px; }
      .editor-body-search-result span { color:var(--muted); font-size:12px; line-height:1.35; }
      .editor-body-search-target { outline:3px solid var(--text) !important; outline-offset:5px; background:color-mix(in srgb, var(--text) 8%, transparent) !important; transition:background .18s ease; }
      @media (max-width:620px) {
        .editor-body-search-row { flex-direction:column; }
        .editor-body-search-button { width:100%; }
      }
    `;
    document.head.appendChild(style);

    const getEditor = () => document.querySelector('.editor-dashboard-v2 .tiptap-shell .ProseMirror') as HTMLElement | null;
    const getTools = () => document.querySelector('.editor-dashboard-v2 .inline-image-tools') as HTMLElement | null;
    const getInsertSelect = () => getTools()?.querySelector('select[data-paragraph-position]') as HTMLSelectElement | null;

    const clearHighlight = () => {
      document.querySelectorAll('.editor-body-search-target').forEach((element) => element.classList.remove('editor-body-search-target'));
      if (highlightTimer) window.clearTimeout(highlightTimer);
      highlightTimer = 0;
    };

    const expandBody = () => {
      const button = document.querySelector('.editor-dashboard-v2 .editor-block-head button[aria-expanded="false"]') as HTMLButtonElement | null;
      button?.click();
    };

    const positionAtParagraph = (paragraph: HTMLParagraphElement, paragraphNumber: number, status: HTMLElement) => {
      const chinese = isChineseAdmin();
      const select = getInsertSelect();
      if (select) {
        select.value = String(paragraphNumber);
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      expandBody();
      clearHighlight();
      paragraph.classList.add('editor-body-search-target');
      window.requestAnimationFrame(() => paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      highlightTimer = window.setTimeout(() => paragraph.classList.remove('editor-body-search-target'), 4500);
      status.textContent = chinese
        ? `已定位第 ${paragraphNumber} 段，并把正文图片插入位置设为“第 ${paragraphNumber} 段后”。`
        : `Located paragraph ${paragraphNumber} and set the body-image insertion point after it.`;
    };

    const ensureSearch = () => {
      frame = 0;
      const editor = getEditor();
      const tools = getTools();
      if (!editor || !tools) return;

      let panel = tools.querySelector('[data-editor-body-search]') as HTMLElement | null;
      if (!panel) {
        panel = document.createElement('section');
        panel.dataset.editorBodySearch = 'true';
        panel.className = 'editor-body-search';

        const head = document.createElement('div');
        head.className = 'editor-body-search-head';
        const title = document.createElement('strong');
        title.dataset.role = 'title';
        const help = document.createElement('small');
        help.dataset.role = 'help';
        head.append(title, help);

        const row = document.createElement('div');
        row.className = 'editor-body-search-row';
        const input = document.createElement('input');
        input.type = 'search';
        input.className = 'editor-body-search-input';
        input.dataset.role = 'input';
        input.autocomplete = 'off';
        input.spellcheck = false;
        const search = document.createElement('button');
        search.type = 'button';
        search.className = 'editor-body-search-button';
        search.dataset.role = 'search';
        row.append(input, search);

        const status = document.createElement('p');
        status.className = 'editor-body-search-status';
        status.dataset.role = 'status';
        status.setAttribute('aria-live', 'polite');
        const results = document.createElement('div');
        results.className = 'editor-body-search-results';
        results.dataset.role = 'results';

        const runSearch = () => {
          const currentEditor = getEditor();
          if (!currentEditor) return;
          const chinese = isChineseAdmin();
          const query = normalizeSearchText(input.value);
          results.replaceChildren();
          clearHighlight();

          if (!query) {
            status.textContent = chinese ? '输入正文中的一句话或一段文字。' : 'Enter a sentence or phrase from the article text.';
            return;
          }

          const paragraphs = bodyParagraphs(currentEditor);
          const matches = paragraphs
            .map((paragraph, index) => ({ paragraph, paragraphNumber: index + 1, text: (paragraph.textContent || '').replace(/\s+/g, ' ').trim() }))
            .filter((item) => normalizeSearchText(item.text).includes(query));

          if (matches.length === 0) {
            status.textContent = chinese ? '没有找到匹配的正文段落。可缩短句子后再搜。' : 'No matching paragraph. Try a shorter phrase.';
            return;
          }

          status.textContent = chinese
            ? `找到 ${matches.length} 个结果。点击结果会定位正文，并自动设为图片插入位置。`
            : `Found ${matches.length} result${matches.length === 1 ? '' : 's'}. Click one to locate it and set the image insertion point.`;

          matches.slice(0, 20).forEach((match) => {
            const result = document.createElement('button');
            result.type = 'button';
            result.className = 'editor-body-search-result';
            const label = document.createElement('strong');
            label.textContent = chinese ? `第 ${match.paragraphNumber} 段 · 定位并设为图片位置` : `Paragraph ${match.paragraphNumber} · locate & use for image position`;
            const snippet = document.createElement('span');
            snippet.textContent = match.text.length > 150 ? `${match.text.slice(0, 149)}…` : match.text;
            result.append(label, snippet);
            result.addEventListener('click', () => positionAtParagraph(match.paragraph, match.paragraphNumber, status));
            results.append(result);
          });

          if (matches.length > 20) {
            const more = document.createElement('small');
            more.textContent = chinese ? `仅显示前 20 个结果（共 ${matches.length} 个）。` : `Showing the first 20 of ${matches.length} results.`;
            results.append(more);
          }
        };

        search.addEventListener('click', runSearch);
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            runSearch();
          }
          if (event.key === 'Escape') {
            input.value = '';
            results.replaceChildren();
            status.textContent = '';
            clearHighlight();
          }
        });

        panel.append(head, row, status, results);
        tools.insertBefore(panel, tools.firstChild);
      }

      const chinese = isChineseAdmin();
      const title = panel.querySelector('[data-role="title"]');
      const help = panel.querySelector('[data-role="help"]');
      const input = panel.querySelector('[data-role="input"]') as HTMLInputElement | null;
      const search = panel.querySelector('[data-role="search"]');
      if (title) title.textContent = chinese ? '正文搜索定位' : 'Find in article text';
      if (help) help.textContent = chinese ? '搜索一句话，点击结果即可定位并设为图片插入位置。' : 'Search a sentence, then click a result to locate it and set the image insertion point.';
      if (input) {
        input.placeholder = chinese ? '输入正文中的一句话或关键词…' : 'Type a sentence or phrase from the article…';
        input.setAttribute('aria-label', chinese ? '搜索正文句子' : 'Search article text');
      }
      if (search) search.textContent = chinese ? '搜索正文' : 'Search text';
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(ensureSearch);
    };

    const observer = new MutationObserver((mutations) => {
      const panel = document.querySelector('[data-editor-body-search]');
      if (panel && mutations.every((mutation) => panel.contains(mutation.target))) return;
      schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    schedule();

    return () => {
      observer.disconnect();
      clearHighlight();
      style.remove();
      document.querySelector('[data-editor-body-search]')?.remove();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
