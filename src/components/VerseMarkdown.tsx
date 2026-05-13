import ReactMarkdown from "react-markdown";

interface VerseMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders translation text as markdown with editorial typography.
 * Supports emphasis, parentheticals, footnote refs, and line breaks while
 * keeping the drop-cap and serif treatment from `.verse-translation`.
 */
const VerseMarkdown = ({ content, className = "" }: VerseMarkdownProps) => (
  <div className={`verse-translation ${className}`}>
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        em: ({ children }) => (
          <em className="italic text-foreground/70">{children}</em>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/40 pl-3 my-2 italic text-foreground/70">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
        ),
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded bg-secondary/60 text-[0.92em] font-mono">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default VerseMarkdown;
