'use client';

import { useEffect } from 'react';
import { EditorDashboardV2 } from './editor-dashboard-v2';

function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

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

function normalizedImageUrl(value: string) {
  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return value;
  }
}

function paragraphChoices(editor: Element, chinese: boolean) {
  const choices: Array<{ paragraph: number; line: number; label: string }> = [
    { paragraph: 0, line: 1, label: chinese ? '正文最前面' : 'Before the first paragraph' }
  ];
  let paragraphNumber = 0;

  Array.from(editor.children).forEach((element, index) => {
    if (!(element instanceof HTMLElement) || element.tagName !== 'P' || isImageCreditElement(element)) return;
    paragraphNumber += 1;
    const text = (element.textContent || '').trim();
    const preview = text.replace(/\s+/g, ' ').slice(0, 42);
    choices.push({
      paragraph: paragraphNumber,
      line: index + 2,
      label: chinese
        ? `第 ${paragraphNumber} 段后${preview ? ` · ${preview}${text.length > 42 ? '…' : ''}` : ''}`
        : `After paragraph ${paragraphNumber}${preview ? ` · ${preview}${text.length > 42 ? '…' : ''}` : ''}`
    });
  });

  return choices;
}

function paragraphBeforeImage(editor: Element, image: HTMLImageElement) {
  let count = 0;
  for (const child of Array.from(editor.children)) {
    if (child === image || child.contains(image)) break;
    if (child.tagName === 'P' && !isImageCreditElement(child)) count += 1;
  }
  return count;
}

function bodyImages(editor: Element) {
  const images = Array.from(editor.querySelectorAll('img')) as HTMLImageElement[];
  const totals = new Map<string, number>();
  images.forEach((image) => {
    const key = normalizedImageUrl(image.getAttribute('src') || '');
    totals.set(key, (totals.get(key) || 0) + 1);
  });

  const seen = new Map<string, number>();
  return images.map((image, index) => {
    const src = image.getAttribute('src') || '';
    const key = normalizedImageUrl(src);
    const occurrence = (seen.get(key) || 0) + 1;
    seen.set(key, occurrence);
    return {
      image,
      src,
      index,
      paragraph: paragraphBeforeImage(editor, image),
      duplicateCount: totals.get(key) || 1,
      occurrence
    };
  });
}

function removeImageFromEditor(editor: HTMLElement, image: HTMLImageElement) {
  const parent = image.parentElement;
  const credit = image.parentElement === editor && isImageCreditElement(image.nextElementSibling)
    ? image.nextElementSibling
    : null;
  image.remove();
  credit?.remove();
  if (parent && parent !== editor && parent.children.length === 0 && !(parent.textContent || '').trim()) parent.remove();
}

function moveImageInEditor(editor: HTMLElement, image: HTMLImageElement, paragraphNumber: number) {
  const parent = image.parentElement;
  const credit = image.parentElement === editor && isImageCreditElement(image.nextElementSibling)
    ? image.nextElementSibling as HTMLElement
    : null;
  image.remove();
  credit?.remove();
  if (parent && parent !== editor && parent.children.length === 0 && !(parent.textContent || '').trim()) parent.remove();

  const paragraphs = Array.from(editor.children).filter((element) => element.tagName === 'P' && !isImageCreditElement(element));
  const requested = Math.max(0, Math.floor(paragraphNumber));

  if (requested === 0 || paragraphs.length === 0) {
    const first = editor.firstChild;
    if (first) editor.insertBefore(image, first);
    else editor.append(image);
    if (credit) image.after(credit);
    return;
  }

  const anchor = paragraphs[Math.min(requested, paragraphs.length) - 1];
  if (!anchor) editor.append(image);
  else anchor.after(image);
  if (credit) image.after(credit);
}

function notifyEditorChanged(editor: HTMLElement) {
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

function cleanEditorHtml(editor: HTMLElement) {
  const clone = editor.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.ProseMirror-trailingBreak').forEach((element) => element.remove());
  clone.querySelectorAll('[contenteditable]').forEach((element) => element.removeAttribute('contenteditable'));
  clone.querySelectorAll('[draggable]').forEach((element) => element.removeAttribute('draggable'));
  clone.querySelectorAll('*').forEach((element) => {
    const classes = Array.from(element.classList).filter((name) => !name.startsWith('ProseMirror'));
    if (classes.length) element.setAttribute('class', classes.join(' '));
    else element.removeAttribute('class');
  });
  return clone.innerHTML;
}

function ParagraphPositionEnhancer() {
  useEffect(() => {
    let frame = 0;
    const nativeFetch = window.fetch.bind(window);
    const style = document.createElement('style');
    style.dataset.bodyImageManagerStyle = 'true';
    style.textContent = `
      .body-image-manager { margin-top: 18px; border-top: 1px solid var(--line); padding-top: 16px; }
      .body-image-manager-head { display:flex; gap:12px; align-items:baseline; justify-content:space-between; flex-wrap:wrap; margin-bottom:10px; }
      .body-image-manager-head strong { font-size:14px; }
      .body-image-manager-head small, .body-image-manager-empty { color:var(--muted); }
      .body-image-manager-list { display:grid; gap:10px; }
      .body-image-manager-card { display:grid; grid-template-columns:132px minmax(0, 1fr); gap:14px; border:1px solid var(--line); padding:10px; background:color-mix(in srgb, var(--surface) 62%, transparent); }
      .body-image-manager-thumb { width:132px; height:94px; object-fit:cover; background:var(--surface); border:1px solid var(--line); }
      .body-image-manager-meta { min-width:0; display:grid; gap:8px; align-content:start; }
      .body-image-manager-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
      .body-image-manager-position { font-size:12px; color:var(--muted); }
      .body-image-manager-duplicate { font-size:11px; border:1px solid var(--danger); color:var(--danger); padding:2px 6px; border-radius:999px; }
      .body-image-manager-url { display:block; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; color:var(--muted); }
      .body-image-manager-select { min-width:min(100%, 380px); min-height:40px; padding:7px 9px; border:1px solid var(--line); background:var(--bg); color:var(--text); font:inherit; }
      .body-image-manager-remove { border:1px solid var(--danger); color:var(--danger); background:transparent; min-height:38px; padding:7px 10px; cursor:pointer; }
      @media (max-width: 620px) {
        .body-image-manager-card { grid-template-columns:88px minmax(0, 1fr); }
        .body-image-manager-thumb { width:88px; height:72px; }
      }
    `;
    document.head.appendChild(style);

    const getTools = () => document.querySelector('.editor-dashboard-v2 .inline-image-tools') as HTMLElement | null;
    const getEditor = () => document.querySelector('.editor-dashboard-v2 .tiptap-shell .ProseMirror') as HTMLElement | null;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const isArticleWrite = (method === 'POST' || method === 'PATCH') && /\/api\/admin\/articles(?:\/|$)/.test(requestUrl);

      if (isArticleWrite && typeof init?.body === 'string') {
        try {
          const payload = JSON.parse(init.body) as { body?: string };
          const editor = getEditor();
          if (editor && typeof payload.body === 'string') {
            payload.body = cleanEditorHtml(editor);
            init = { ...init, body: JSON.stringify(payload) };
          }
        } catch {
          // Leave the original request untouched if the body is not article JSON.
        }
      }

      return nativeFetch(input, init);
    };

    const renderManager = (
      tools: HTMLElement,
      editor: HTMLElement,
      chinese: boolean,
      choices: ReturnType<typeof paragraphChoices>
    ) => {
      let manager = tools.querySelector('[data-body-image-manager]') as HTMLElement | null;
      if (!manager) {
        manager = document.createElement('div');
        manager.dataset.bodyImageManager = 'true';
        manager.className = 'body-image-manager';
        tools.appendChild(manager);
      }

      const records = bodyImages(editor);
      const signature = [
        chinese ? 'zh' : 'en',
        choices.map((choice) => `${choice.paragraph}:${choice.label}`).join('|'),
        records.map((record) => `${normalizedImageUrl(record.src)}:${record.occurrence}:${record.paragraph}:${record.duplicateCount}`).join('|')
      ].join('::');
      if (manager.dataset.signature === signature) return;
      manager.dataset.signature = signature;
      manager.replaceChildren();

      const head = document.createElement('div');
      head.className = 'body-image-manager-head';
      const title = document.createElement('strong');
      title.textContent = chinese ? `正文图片（${records.length}）` : `Body images (${records.length})`;
      const help = document.createElement('small');
      help.textContent = chinese
        ? '正文中的图片统一显示在这里。选择新位置会立即移动；重复图片会标记出来。'
        : 'Every body image is listed here. Choose a new position to move it immediately; duplicates are flagged.';
      head.append(title, help);
      manager.append(head);

      if (records.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'body-image-manager-empty';
        empty.textContent = chinese ? '正文中还没有图片。' : 'There are no images in the article text yet.';
        manager.append(empty);
        return;
      }

      const list = document.createElement('div');
      list.className = 'body-image-manager-list';
      manager.append(list);

      records.forEach((record) => {
        const card = document.createElement('div');
        card.className = 'body-image-manager-card';

        const preview = document.createElement('img');
        preview.className = 'body-image-manager-thumb';
        preview.src = record.src;
        preview.alt = '';

        const meta = document.createElement('div');
        meta.className = 'body-image-manager-meta';
        const row = document.createElement('div');
        row.className = 'body-image-manager-row';
        const position = document.createElement('span');
        position.className = 'body-image-manager-position';
        position.textContent = record.paragraph === 0
          ? (chinese ? `图片 ${record.index + 1} · 正文最前面` : `Image ${record.index + 1} · before the first paragraph`)
          : (chinese ? `图片 ${record.index + 1} · 第 ${record.paragraph} 段后` : `Image ${record.index + 1} · after paragraph ${record.paragraph}`);
        row.append(position);

        if (record.duplicateCount > 1) {
          const duplicate = document.createElement('span');
          duplicate.className = 'body-image-manager-duplicate';
          duplicate.textContent = chinese ? `重复图片 ×${record.duplicateCount}` : `Duplicate ×${record.duplicateCount}`;
          row.append(duplicate);
        }

        const url = document.createElement('span');
        url.className = 'body-image-manager-url';
        url.textContent = record.src;
        url.title = record.src;

        const controls = document.createElement('div');
        controls.className = 'body-image-manager-row';
        const select = document.createElement('select');
        select.className = 'body-image-manager-select';
        select.setAttribute('aria-label', chinese ? `更改图片 ${record.index + 1} 的位置` : `Change position for image ${record.index + 1}`);
        select.replaceChildren(...choices.map((choice) => {
          const option = document.createElement('option');
          option.value = String(choice.paragraph);
          option.textContent = choice.label;
          return option;
        }));
        select.value = String(Math.min(record.paragraph, choices[choices.length - 1]?.paragraph || 0));
        select.addEventListener('change', () => {
          moveImageInEditor(editor, record.image, Number(select.value || '0'));
          notifyEditorChanged(editor);
          scheduleRefresh();
        });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'body-image-manager-remove';
        remove.textContent = chinese ? '移除' : 'Remove';
        remove.addEventListener('click', () => {
          const confirmed = window.confirm(chinese ? '确定从正文移除这张图片吗？' : 'Remove this image from the article text?');
          if (!confirmed) return;
          removeImageFromEditor(editor, record.image);
          notifyEditorChanged(editor);
          scheduleRefresh();
        });

        controls.append(select, remove);
        meta.append(row, url, controls);
        card.append(preview, meta);
        list.append(card);
      });
    };

    const refresh = () => {
      frame = 0;
      const tools = getTools();
      const editor = getEditor();
      const original = tools?.querySelector('input[type="number"]') as HTMLInputElement | null;
      if (!tools || !editor || !original) return;

      const label = original.closest('label');
      if (!label) return;
      const labelText = label.querySelector('span');
      const chinese = Array.from(document.querySelectorAll('.editor-dashboard-v2 .editor-top-actions button[aria-pressed="true"]'))
        .some((button) => button.textContent?.trim() === '中文');

      if (labelText) {
        const next = chinese ? '正文图片插入位置' : 'Body image position';
        if (labelText.textContent !== next) labelText.textContent = next;
      }

      original.style.display = 'none';
      original.setAttribute('aria-hidden', 'true');
      original.tabIndex = -1;

      let select = label.querySelector('select[data-paragraph-position]') as HTMLSelectElement | null;
      if (!select) {
        select = document.createElement('select');
        select.dataset.paragraphPosition = 'true';
        select.style.minWidth = 'min(100%, 360px)';
        select.style.minHeight = '42px';
        select.style.padding = '8px 10px';
        select.style.border = '1px solid var(--line)';
        select.style.background = 'var(--bg)';
        select.style.color = 'var(--text)';
        select.style.font = 'inherit';
        label.appendChild(select);
        select.addEventListener('change', () => {
          if (!select) return;
          const option = select.selectedOptions[0];
          setReactInputValue(original, option?.dataset.legacyLine || '1');
        });
      }

      select.setAttribute('aria-label', chinese ? '选择图片插入到哪个正文段落之后' : 'Choose the paragraph after which to insert the image');
      const choices = paragraphChoices(editor, chinese);
      const signature = choices.map((choice) => `${choice.paragraph}:${choice.line}:${choice.label}`).join('|');
      if (select.dataset.signature !== signature) {
        const previousParagraph = select.value || '0';
        select.replaceChildren(...choices.map((choice) => {
          const option = document.createElement('option');
          option.value = String(choice.paragraph);
          option.dataset.legacyLine = String(choice.line);
          option.textContent = choice.label;
          return option;
        }));
        select.dataset.signature = signature;
        select.value = choices.some((choice) => String(choice.paragraph) === previousParagraph) ? previousParagraph : '0';
        const selected = select.selectedOptions[0];
        setReactInputValue(original, selected?.dataset.legacyLine || '1');
      }

      const help = Array.from(tools.children).find((child) => child.tagName === 'SMALL') as HTMLElement | undefined;
      if (help) {
        const next = chinese
          ? '选择第 N 段后插入。正文图片会在下方统一列出，可直接查看、移动或移除；标题、列表和图片署名不算段落。'
          : 'Choose a paragraph for insertion. All body images are listed below so you can inspect, move or remove them; headings, lists and credits are not counted.';
        if (help.textContent !== next) help.textContent = next;
      }

      renderManager(tools, editor, chinese, choices);
    };

    const scheduleRefresh = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(refresh);
    };

    const observer = new MutationObserver((mutations) => {
      const manager = document.querySelector('[data-body-image-manager]');
      if (manager && mutations.every((mutation) => manager.contains(mutation.target))) return;
      scheduleRefresh();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src'] });
    scheduleRefresh();

    return () => {
      observer.disconnect();
      window.fetch = nativeFetch;
      style.remove();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

export function EditorDashboardParagraph() {
  return (
    <>
      <EditorDashboardV2 />
      <ParagraphPositionEnhancer />
    </>
  );
}
