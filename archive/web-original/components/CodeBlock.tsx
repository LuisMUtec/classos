'use client';

import {
  CodeBlock as AICodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from './ai-elements/code-block';

interface Props {
  code: string;
  language?: 'python' | 'plain';
  className?: string;
  small?: boolean;
  filename?: string;
}

/**
 * Wrapper around AI Elements CodeBlock with our app's API.
 * Forces dark theme via `.dark` class so syntax highlighting matches our deck/UI palette.
 * `small` keeps the older API for inline contexts (iteration cards, examples).
 */
export function CodeBlock({
  code,
  language = 'python',
  className = '',
  small = false,
  filename,
}: Props) {
  const lang = language === 'plain' ? 'text' : 'python';
  return (
    <div className={`dark ${small ? 'text-[12px]' : ''} ${className}`}>
      <AICodeBlock code={code} language={lang}>
        {filename && (
          <CodeBlockHeader>
            <CodeBlockTitle>
              <span className="font-mono text-[11px]">{filename}</span>
            </CodeBlockTitle>
            <CodeBlockActions>
              <CodeBlockCopyButton />
            </CodeBlockActions>
          </CodeBlockHeader>
        )}
      </AICodeBlock>
    </div>
  );
}
