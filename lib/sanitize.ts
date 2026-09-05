import sanitizeHtml from 'sanitize-html';

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'span', 'strong', 'em', 'u', 's', 'blockquote', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading'],
      span: ['style']
    },
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,8}$/]
      }
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true)
    }
  });
}
