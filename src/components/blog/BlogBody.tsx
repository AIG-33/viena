import type { ReactNode } from "react";
import type { BlogBlock } from "@/types/blog";

/**
 * Render a string with minimal Markdown-style inline formatting:
 *  - [label](url)        → external link
 *  - **bold**            → <strong>
 *  - *italic*            → <em>
 *  - `code`              → <code>
 *
 * Splits on tokens via a single regex; everything else is plain text. No
 * `dangerouslySetInnerHTML`, no `react-markdown` — the contract is narrow
 * enough that explicit handling is safer and ~2 kB cheaper.
 */
function renderInline(input: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  // Greedy, ordered: links first (since `[` doesn't conflict), then bold,
  // italic, code.
  const pattern =
    /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(input.slice(lastIdx, match.index));
    }
    const m = match[0];
    if (m.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(m);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        const isExternal = /^https?:\/\//.test(url);
        tokens.push(
          <a
            key={`l-${key++}`}
            href={url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-green-700 underline decoration-green-300 underline-offset-2 hover:decoration-green-700 transition-colors"
          >
            {label}
          </a>
        );
      } else {
        tokens.push(m);
      }
    } else if (m.startsWith("**")) {
      tokens.push(
        <strong key={`b-${key++}`} className="font-semibold text-ink-900">
          {m.slice(2, -2)}
        </strong>
      );
    } else if (m.startsWith("*")) {
      tokens.push(
        <em key={`i-${key++}`} className="italic">
          {m.slice(1, -1)}
        </em>
      );
    } else if (m.startsWith("`")) {
      tokens.push(
        <code
          key={`c-${key++}`}
          className="px-1.5 py-0.5 rounded bg-paper-100 text-[0.92em] font-mono text-ink-800"
        >
          {m.slice(1, -1)}
        </code>
      );
    }
    lastIdx = match.index + m.length;
  }
  if (lastIdx < input.length) tokens.push(input.slice(lastIdx));
  return tokens;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]+/giu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="prose-blog space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-ink-700">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "p":
            return (
              <p key={idx} className="leading-[1.75]">
                {renderInline(block.text)}
              </p>
            );
          case "h2": {
            const id = block.id || slugifyHeading(block.text);
            return (
              <h2
                key={idx}
                id={id}
                className="display-heading text-ink-900 text-2xl md:text-[28px] mt-12 mb-4 scroll-mt-24"
              >
                {renderInline(block.text)}
              </h2>
            );
          }
          case "h3": {
            const id = block.id || slugifyHeading(block.text);
            return (
              <h3
                key={idx}
                id={id}
                className="font-display text-ink-900 text-xl md:text-[22px] mt-8 mb-3 scroll-mt-24"
              >
                {renderInline(block.text)}
              </h3>
            );
          }
          case "ul":
            return (
              <ul
                key={idx}
                className="list-disc pl-6 space-y-2 marker:text-green-600"
              >
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={idx}
                className="list-decimal pl-6 space-y-2 marker:text-green-600 marker:font-semibold"
              >
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-green-600 bg-paper-50 px-5 py-4 italic text-ink-700"
              >
                <p>{renderInline(block.text)}</p>
                {block.cite && (
                  <cite className="block not-italic text-[13px] text-ink-500 mt-2">
                    — {renderInline(block.cite)}
                  </cite>
                )}
              </blockquote>
            );
          case "callout": {
            const tone = block.tone ?? "info";
            const styles =
              tone === "warn"
                ? "border-amber-300 bg-amber-50"
                : tone === "ok"
                  ? "border-green-300 bg-green-50"
                  : "border-paper-300 bg-paper-50";
            return (
              <aside
                key={idx}
                className={`border-l-4 ${styles} px-5 py-4 rounded-r-lg`}
              >
                {block.title && (
                  <p className="font-display text-ink-900 mb-1 not-italic">
                    {block.title}
                  </p>
                )}
                <p className="text-[15px] leading-relaxed text-ink-700">
                  {renderInline(block.text)}
                </p>
              </aside>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
