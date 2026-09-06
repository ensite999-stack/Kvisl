'use client';

import { useEffect } from 'react';
import { EditorDashboardV2 } from './editor-dashboard-v2';

function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function ParagraphPositionEnhancer() {
  useEffect(() => {
    let frame = 0;

    const refresh = () => {
      frame = 0;
      const tools = document.querySelector('.editor-dashboard-v2 .inline-image-tools');
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
        select.style.minWidth = 'min(100%, 320px)';
        select.style.minHeight = '42px';
        select.style.padding = '8px 10px';
        select.style.border = '1px solid var(--line)';
        select.style.background = 'var(--bg)';
        select.style.color = 'var(--text)';
        select.style.font = 'inherit';
        label.appendChild(select);
        select.addEventListener('change', () => {
          if (!select) return;
          setReactInputValue(original, select.value);
        });
      }

      select.setAttribute('aria-label', chinese ? '选择图片插入到哪个正文段落之后' : 'Choose the paragraph after which to insert the image');

      const choices: Array<{ value: string; label: string }> = [
        { value: '1', label: chinese ? '正文最前面' : 'Before the first body block' }
      ];
      let paragraphNumber = 0;

      Array.from(editor.children).forEach((element, index) => {
        if (!(element instanceof HTMLElement) || element.tagName !== 'P') return;
        const text = (element.textContent || '').trim();
        const isCredit = /^Photo\b/i.test(text) && Boolean(element.querySelector('em'));
        if (isCredit) return;

        paragraphNumber += 1;
        const preview = text.replace(/\s+/g, ' ').slice(0, 42);
        const labelValue = chinese
          ? `第 ${paragraphNumber} 段后${preview ? ` · ${preview}${text.length > 42 ? '…' : ''}` : ''}`
          : `After paragraph ${paragraphNumber}${preview ? ` · ${preview}${text.length > 42 ? '…' : ''}` : ''}`;
        // V2 internally inserts before top-level block (line - 1). Using index + 2
        // places the image immediately after this paragraph while ignoring headings,
        // lists, existing images and credit paragraphs in the user-facing count.
        choices.push({ value: String(index + 2), label: labelValue });
      });

      const signature = choices.map((choice) => `${choice.value}:${choice.label}`).join('|');
      if (select.dataset.signature !== signature) {
        const previous = original.value || '1';
        select.replaceChildren(...choices.map((choice) => {
          const option = document.createElement('option');
          option.value = choice.value;
          option.textContent = choice.label;
          return option;
        }));
        select.dataset.signature = signature;
        select.value = choices.some((choice) => choice.value === previous) ? previous : '1';
        if (select.value !== previous) setReactInputValue(original, select.value);
      } else if (select.value !== original.value && choices.some((choice) => choice.value === original.value)) {
        select.value = original.value;
      }

      const help = tools.querySelector('small');
      if (help) {
        const next = chinese
          ? '只按正文段落选择位置；标题、列表、已有图片和图片署名不算段落。若正文中选中了图片，确认后仍会直接替换该图片。'
          : 'Position is selected by body paragraph only; headings, lists, existing images and image credits are not counted. A selected image is still replaced directly.';
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
