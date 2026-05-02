/**
 * Injects a JSON-LD structured data block into the page <head>.
 * Pass any valid Schema.org object (or array of objects) as `data`.
 * Used by layout, homepage, and issue pages for SEO + AEO signals.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
