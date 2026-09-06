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
  const text = (element.textContent || '').trim();
  return /^Photo\b/i.test(text) && Boolean(element.querySelector('em'));
}

function sameUrl(left: string, right: string) {
  try {
    return new URL(left, window.location.origin).href === new URL(right, window.location.origin).href;
  } catch {
    return left === right;
  }
}

function moveImageToParagraph(html: string, paragraphNumber: number, preferredImageUrl = '') {
  if (!html.trim()) return html;

  const documentHtml = new DOMParser().parseFromString(html, 'text/html');
  const body = documentHtml.body;
  const images = Array.from(body.querySelectorAll('img'));
  if (images.length === 0) return html;

  let target = preferredImageUrl
    ? images.find((image) => sameUrl(image.getAttribute('src') || '', preferredImageUrl))
    : undefined;

  if (!target) {
    target = [...images].reverse().find((image) => {
      try {
        return new URL(image.getAttribute('src') || '', window.location.origin).hostname.toLowerCase() === 'images.pexels.com';
      } catch {
        return false;
      }
    });
  }
  if (!target) return html;

  const credit = isImageCreditElement(target.nextElementSibling) ? target.nextElementSibling : null;
  target.remove();
  credit?.remove();

  const paragraphs = Array.from(body.children).filter((element) => element.tagName === 'P' && !isImageCreditElement(element));
  const requested = Math.max(0, Math.floor(paragraphNumber));

  if (requested === 0 || paragraphs.length === 0) {
    const first = body.firstChild;
    if (first) {
      body.insertBefore(target, first);
      if (credit) target.after(credit);
    } else {
      body.append(target);
      if (credit) body.append(credit);
    }
    return body.innerHTML;
  }

  const anchor = paragraphs[Math.min(requested, paragraphs.length) - 1];
  if (!anchor) {
    body.append(target);
    if (credit) body.append(credit);
    return body.innerHTML;
  }

  anchor.after(target);
  if (credit) target.after(credit);
  return body.innerHTML;
}

function ParagraphPositionEnhancer() {
  useEffect(() => {
    let frame = 0;
    const nativeFetch = window.fetch.bind(window);

    const getTools = () => document.querySelector('.editor-dashboard-v2 .inline-image-tools');
    const getParagraphSelect = () => getTools()?.querySelector('select[data-paragraph-position]') as HTMLSelectElement | null;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const isArticleWrite = (method === 'POST' || method === 'PATCH') && /\/api\/admin\/articles(?:\/|$)/.test(requestUrl);

      if (isArticleWrite && typeof init?.body === 'string') {
        try {
          const payload = JSON.parse(init.body) as { body?: string };
          const select = getParagraphSelect();
          if (select?.dataset.userSelected === 'true' && typeof payload.body === 'string') {
            const paragraphNumber = Number(select.value || '0');
            const preview = document.querySelector('.editor-dashboard-v2 .admin-inline-preview') as HTMLImageElement | null;
            payload.body = moveImageToParagraph(payload.body, paragraphNumber, preview?.src || '');
            init = { ...init, body: JSON.stringify(payload) };
          }
        } catch {
          // Leave the original request untouched if the body is not article JSON.
        }
      }

      return nativeFetch(input, init);
    };

    const refresh = () => {
      frame = 0;
      const tools = getTools();
      const editor = document.querySelector('.editor-dashboard-v2 .tiptap-shell .ProseMirror');
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
        select.dataset.userSelected = 'false';
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
          select.dataset.userSelected = 'true';
          const option = select.selectedOptions[0];
          const legacyLine = option?.dataset.legacyLine || '1';
          setReactInputValue(original, legacyLine);
        });
      }

      select.setAttribute('aria-label', chinese ? '选择图片插入到哪个正文段落之后' : 'Choose the paragraph after which to insert the image');

      const choices: Array<{ paragraph: number; line: number; label: string }> = [
        { paragraph: 0, line: 1, label: chinese ? '正文最前面' : 'Before the first paragraph' }
      ];
      let paragraphNumber = 0;

      Array.from(editor.children).forEach((element, index) => {
        if (!(element instanceof HTMLElement) || element.tagName !== 'P') return;
        const text = (element.textContent || '').trim();
        const isCredit = /^Photo\b/i.test(text) && Boolean(element.querySelector('em'));
        if (isCredit) return;

        paragraphNumber += 1;
        const preview = text.replace(/\s+/g, ' ').slice(0, 42);
        choices.push({
          paragraph: paragraphNumber,
          line: index + 2,
          label: chinese
            ? `第 ${paragraphNumber} 段后${preview ? ` · ${preview}${text.length > 42 ? '…' : ''}` : ''}`
            : `After paragraph ${paragraphNumber}${preview ? ` · ${preview}${text.length > 42 ? '…' : ''}` : ''}`
        });
      });

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

      const help = tools.querySelector('small');
      if (help) {
        const next = chinese
          ? '选择第 N 段后，保存时会再次校验正文 HTML，确保图片真正写在该段之后；标题、列表、已有图片和图片署名不算段落。'
          : 'Choose a paragraph and the saved HTML is validated again so the image is persisted directly after it; headings, lists, images and credits are not counted.';
        if (help.textContent !== next) help.textContent = next;
      }
    };

    const scheduleRefresh = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(refresh);
    };

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    scheduleRefresh();

    return () => {
      observer.disconnect();
      window.fetch = nativeFetch;
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
