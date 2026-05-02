/**
 * Strips the most dangerous HTML patterns from newsletter body content before
 * it is passed to dangerouslySetInnerHTML. This is a targeted defence against
 * script injection in case the n8n pipeline or Supabase is ever compromised.
 * It is intentionally conservative — only removing known-dangerous constructs
 * rather than trying to allowlist every safe tag (which would break email HTML).
 */
export function sanitizeNewsletterHtml(html: string): string {
  return html
    // 1. Remove <script> blocks and their entire content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 2. Remove inline event handlers (onclick, onload, onerror, etc.)
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // 3. Neutralise javascript: and vbscript: in href/src/action
    .replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript):[^"'>]*/gi, '$1="#"')
    // 4. Remove data: URI sources (potential XSS vector via SVG/HTML data URIs)
    .replace(/src\s*=\s*["']\s*data:[^"']*/gi, 'src=""')
    // 5. Remove <object>, <embed>, and <base> tags
    .replace(/<(object|embed|base)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(object|embed|base)\b[^>]*\/?>/gi, '');
}
