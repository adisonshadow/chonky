import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import bash from 'refractor/bash';
import json from 'refractor/json';
import typescript from 'refractor/typescript';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('json', json);

export type CodeBlockLanguage = 'bash' | 'typescript' | 'json' | 'tsx';

type CodeBlockProps = {
  code: string;
  label?: string;
  language: CodeBlockLanguage;
};

export function CodeBlock({ code, label, language }: CodeBlockProps) {
  const prismLanguage = language === 'tsx' ? 'typescript' : language;
  const trimmed = code.replace(/\n$/, '');

  return (
    <figure className="code-block">
      {label ? <figcaption className="code-block__label">{label}</figcaption> : null}
      <SyntaxHighlighter
        language={prismLanguage}
        style={vscDarkPlus}
        showLineNumbers={false}
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: '#0a0f1c',
          fontSize: '0.82rem',
          lineHeight: 1.45,
          fontFamily: 'var(--font-mono)',
          overflowX: 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      >
        {trimmed}
      </SyntaxHighlighter>
    </figure>
  );
}
