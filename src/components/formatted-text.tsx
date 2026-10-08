import { cn } from "@/lib/utils";

/** "1)" / "1." markers; "1." needs a following space so decimals like 1.5 are left alone. */
const INLINE_MARKER = /(^|[\s?!:;])(\d{1,2})(?:\)\s*|\.\s+)/g;
const LIST_LINE = /^(\s*)(\d{1,2}\)|\d{1,2}\.(?=\s)|[-*•](?=\s))\s*(.*)$/;
const PREVIEW_CHAR_LIMIT = 280;
const PREVIEW_LINE_LIMIT = 4;

function normalize(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\s+$/g, "");
}

/** Puts "Intro 1) first 2) second" on separate lines, but only when the numbers run 1, 2, 3… */
function splitInlineList(line: string): string[] {
  const starts: number[] = [];
  let expected = 1;
  for (const m of line.matchAll(INLINE_MARKER)) {
    if (Number(m[2]) !== expected) continue;
    starts.push((m.index ?? 0) + (m[1] ?? "").length);
    expected++;
  }
  if (starts.length < 2) return [line];
  const parts = [line.slice(0, starts[0])];
  starts.forEach((start, i) => parts.push(line.slice(start, starts[i + 1])));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function toDisplayLines(text: string) {
  return normalize(text).split("\n").flatMap(splitInlineList);
}

/**
 * Renders user-written text keeping its line breaks and indentation, with numbered or
 * bulleted lines shown as a list. Renders only spans so it can sit inside headings and links.
 */
export function FormattedText({
  text,
  preview = false,
  className,
}: {
  text: string;
  /** Cuts long text down to a few faded lines, for cards. */
  preview?: boolean;
  className?: string;
}) {
  const lines = toDisplayLines(text);
  const truncated =
    preview && (lines.length > PREVIEW_LINE_LIMIT || text.length > PREVIEW_CHAR_LIMIT);

  return (
    <span
      className={cn(
        "block space-y-1 break-words [tab-size:4]",
        truncated &&
          "max-h-28 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]",
        className,
      )}
    >
      {lines.map((line, i) => {
        if (!line.trim()) return <span key={i} className="block h-2" aria-hidden />;
        const list = LIST_LINE.exec(line);
        if (list) {
          return (
            <span key={i} className={cn("flex gap-2", (list[1] ?? "").length >= 2 && "pl-5")}>
              <span className="shrink-0 tabular-nums">{list[2]}</span>
              <span className="min-w-0 whitespace-pre-wrap">{list[3]}</span>
            </span>
          );
        }
        return (
          <span key={i} className="block whitespace-pre-wrap">
            {line}
          </span>
        );
      })}
    </span>
  );
}
