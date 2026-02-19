import ReactMarkdown from "react-markdown";

interface AiMarkdownProps {
  content: string;
}

const AiMarkdown = ({ content }: AiMarkdownProps) => (
  <div className="ai-markdown">
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="text-sm font-semibold text-primary mt-5 mb-2 pb-1.5 border-b border-border/40 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-medium text-foreground mt-4 mb-1.5">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-[13px] leading-[1.8] text-foreground/80 mb-3">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="space-y-2 my-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-2 my-2 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-[13px] leading-[1.8] text-foreground/80 pl-1">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/40 pl-3 my-3 italic text-foreground/60 text-[13px]">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default AiMarkdown;
