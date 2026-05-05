/**
 * Renders a JSON-LD `<script>` tag with safe escaping.
 *
 * The `<` characters are replaced with `\u003c` to defeat any HTML-tag
 * injection contained in user/data fields (Next.js docs recommendation).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
