/**
 * Small, dependency-free markdown to HTML renderer for blog posts (the admin editor writes markdown).
 * Input is HTML-escaped first; the result is always run through DOMPurify by the caller.
 * Content that already looks like HTML (older posts) is passed through unchanged.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Only http(s), mailto, tel, relative paths and #anchors. */
function safeUrl(raw: string): string {
  const url = raw.trim().replace(/&amp;/g, '&');
  const compact = url.replace(/[\u0000- \u007f-\u009f]/g, '');
  if (/^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(compact) || !/^[a-z][a-z0-9+.-]*:/i.test(compact)) {
    return url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  return '#';
}

const looksLikeHtml = (s: string) => /<\/?(p|h[1-6]|ul|ol|li|div|img|iframe|blockquote|figure|br|table|pre|a|strong|em)\b[^>]*>/i.test(s);

function inline(src: string): string {
  const stash: string[] = [];
  const keep = (html: string) => `\u0000${stash.push(html) - 1}\u0000`;
  let s = esc(src);
  s = s.replace(/`([^`]+)`/g, (_m, c) => keep(`<code>${c}</code>`));
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_m, alt, url) =>
    keep(`<img src="${safeUrl(url)}" alt="${escAttr(alt)}" width="1200" height="675" loading="lazy" decoding="async">`),
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
    const u = safeUrl(url);
    const ext = /^https?:/i.test(u);
    return keep(`<a href="${u}"${ext ? ' target="_blank"' : ''} rel="noopener noreferrer">${text}</a>`);
  });
  s = s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_([^_\s][^_]*?)_(?![_\w])/g, '$1<em>$2</em>')
    .replace(/~~([^~]+?)~~/g, '<s>$1</s>');
  return s.replace(/\u0000(\d+)\u0000/g, (_m, i) => stash[Number(i)]);
}

export function renderPostMarkdown(md: string): string {
  const src = (md || '').replace(/\r\n?/g, '\n');
  if (!src.trim()) return '';
  if (looksLikeHtml(src)) return src;

  const lines = src.split('\n');
  const out: string[] = [];
  let i = 0;
  const isBlockStart = (l: string) =>
    /^(#{1,6})\s+/.test(l) || /^\s*([-*+]|\d+[.)])\s+/.test(l) || /^>\s?/.test(l) || /^```/.test(l) || /^\s*([-*_])(\s*\1){2,}\s*$/.test(l) || /^<iframe\b.*<\/iframe>\s*$/i.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // fenced code
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    // raw YouTube iframe on its own line (DOMPurify hook drops any other host)
    if (/^<iframe\b.*<\/iframe>\s*$/i.test(line)) {
      out.push(`<div class="embed">${line.trim()}</div>`);
      i++;
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      // the page title is the only h1: # becomes h2, ## h2, ### h3 ...
      const level = Math.min(Math.max(h[1].length, 2), 4);
      out.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      continue;
    }
    const li = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (li) {
      const ordered = /\d/.test(li[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
        if (!m || /\d/.test(m[1]) !== ordered) break;
        items.push(`<li>${inline(m[2])}</li>`);
        i++;
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    // paragraph (consecutive plain lines join)
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++].trim());
    if (!buf.length) {
      buf.push(lines[i++].trim());
    }
    // a paragraph that is only an image becomes a figure
    const solo = buf.length === 1 && buf[0].match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (solo) {
      out.push(`<figure>${inline(buf[0])}${solo[1] ? `<figcaption>${esc(solo[1])}</figcaption>` : ''}</figure>`);
    } else {
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}
