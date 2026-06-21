import type { ReactNode } from "react";
import ArticleToc from "@/components/ArticleToc";
import CodeCopyButton from "@/components/CodeCopyButton";

type Heading = {
  id: string;
  level: 2 | 3;
  text: string;
};

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "rule" };

const BLOCK_START = /^(#{2,3})\s|^```|^>\s?|^(?:-|\*|\+)\s+|^\d+\.\s+|^---+$|^\|/;

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseMarkdown(markdown: string): { blocks: MarkdownBlock[]; headings: Heading[] } {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  const headings: Heading[] = [];
  let headingIndex = 0;
  let index = lines[0]?.startsWith("# ") ? 1 : 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "text";
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, code: code.join("\n") });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(##|###)\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3;
      const text = headingMatch[2].trim();
      const id = `section-${++headingIndex}`;
      blocks.push({ type: "heading", level, id, text });
      headings.push({ level, id, text });
      index += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quote.join(" ") });
      continue;
    }

    if (/^(?:-|\*|\+)\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const pattern = ordered ? /^\d+\.\s+/ : /^(?:-|\*|\+)\s+/;
      const items: string[] = [];
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].replace(pattern, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (
      line.trim().startsWith("|") &&
      index + 1 < lines.length &&
      /^\|?[\s:|-]+\|[\s:|-|]*$/.test(lines[index + 1].trim())
    ) {
      const headers = parseTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !BLOCK_START.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return { blocks, headings };
}

export default function MarkdownArticle({
  markdown,
  header,
}: {
  markdown: string;
  header?: ReactNode;
}) {
  const { blocks, headings } = parseMarkdown(markdown);

  return (
    <div className="article-layout">
      <ArticleToc headings={headings} />

      <div className="article-main">
        {header}
        <div className="prose article-prose">
          {blocks.map((block, index) => {
          if (block.type === "heading") {
            const content = (
              <a className="article-heading__anchor" href={`#${block.id}`} aria-label={`链接到${block.text}`}>
                #
              </a>
            );
            return block.level === 2 ? (
              <h2 id={block.id} key={block.id}>
                {parseInline(block.text)}
                {content}
              </h2>
            ) : (
              <h3 id={block.id} key={block.id}>
                {parseInline(block.text)}
                {content}
              </h3>
            );
          }

          if (block.type === "paragraph") {
            return <p key={index}>{parseInline(block.text)}</p>;
          }

          if (block.type === "blockquote") {
            return <blockquote key={index}>{parseInline(block.text)}</blockquote>;
          }

          if (block.type === "rule") {
            return <hr key={index} />;
          }

          if (block.type === "code") {
            return (
              <figure className="article-code-block" key={index}>
                <figcaption>
                  <span className="article-code-block__language">{block.language}</span>
                  <CodeCopyButton code={block.code} />
                </figcaption>
                <pre tabIndex={0}>
                  <code>{block.code}</code>
                </pre>
              </figure>
            );
          }

          if (block.type === "list") {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{parseInline(item)}</li>
                ))}
              </List>
            );
          }

          return (
            <div className="article-table-wrap" key={index} tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    {block.headers.map((header, cellIndex) => (
                      <th key={cellIndex}>{parseInline(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{parseInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
