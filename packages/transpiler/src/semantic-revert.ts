import * as path from 'node:path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { preprocess } from './preprocessor';

export interface SemanticRevertOptions {
  projectRoot?: string;
  compact?: boolean;
}

export interface SemanticRevertResult {
  code: string;
  hadTransforms: boolean;
}

/**
 * Reverse-compile human-readable semantic code back to machine-optimized format.
 *
 * Steps:
 * 1. Preprocess machine:assert blocks -> __chonky_assert__() calls
 * 2. Strip semantic comments injected by toSemanticView()
 * 3. Strip trailing chonky: comments from JSX elements
 * 4. Re-generate compact code
 */
export function fromSemanticView(
  code: string,
  filename: string,
  options: SemanticRevertOptions = {},
): SemanticRevertResult {
  let processed = code;
  let hadTransforms = false;

  // Step 1: preprocess machine:assert blocks back to __chonky_assert__()
  if (processed.includes('machine:assert') || processed.includes('machine :assert')) {
    const result = preprocess(processed, filename);
    if (result.hadTransforms) {
      processed = result.code;
      hadTransforms = true;
    }
  }

  // Step 2 & 3: Parse AST and strip semantic annotations
  const isTSX = filename.endsWith('.tsx') || filename.endsWith('.jsx');
  const ast = parse(processed, {
    sourceType: 'module',
    plugins: ['typescript', ...(isTSX ? ['jsx' as const] : [])],
  });

  traverse(ast, {
    enter(nodePath) {
      const node = nodePath.node;
      if (!node.leadingComments && !node.trailingComments) return;

      // Strip @requirement and description comments added by toSemanticView
      if (node.leadingComments) {
        node.leadingComments = node.leadingComments.filter((comment) => {
          const text = comment.value.trim();
          if (text.startsWith('@requirement ')) return false;
          // Remove description comments that follow @requirement pattern
          if (
            comment.type === 'CommentBlock' &&
            !text.startsWith('@') &&
            !text.includes('eslint') &&
            !text.includes('prettier') &&
            !text.includes('TODO') &&
            !text.includes('FIXME') &&
            text.length < 200
          ) {
            const prevComments = node.leadingComments!;
            const idx = prevComments.indexOf(comment);
            if (idx > 0) {
              const prev = prevComments[idx - 1];
              if (prev.value.trim().startsWith('@requirement ')) return false;
            }
          }
          return true;
        });
      }

      // Strip chonky: trailing comments from JSX elements
      if (node.trailingComments) {
        node.trailingComments = node.trailingComments.filter((comment) => {
          return !comment.value.trim().startsWith('chonky:');
        });
      }
    },
  });

  // Step 4: Generate compact output
  const compact = options.compact ?? true;
  const { code: output } = generate(ast, {
    retainLines: false,
    compact: false,
    concise: compact,
    jsescOption: { minimal: true },
  });

  if (output !== code) {
    hadTransforms = true;
  }

  return { code: output, hadTransforms };
}
