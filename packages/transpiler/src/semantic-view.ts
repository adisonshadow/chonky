import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RequirementManifest } from './types';

export interface SemanticViewOptions {
  projectRoot?: string;
  includeManifestComments?: boolean;
  stripChonkyIds?: boolean;
}

export interface SemanticViewResult {
  code: string;
  requirementIds: string[];
}

/**
 * Transform machine-optimized Chonky code into a human-readable semantic view.
 *
 * Transformations applied:
 * - __chonky_assert__(id, scenarios) -> machine:assert for "id" { scenario(...) }
 * - defineRequirement({...}) gets inline comments from manifest
 * - data-chonky-id JSX attributes become trailing comments or are removed
 * - Code is pretty-printed with standard formatting
 */
export function toSemanticView(
  code: string,
  filename: string,
  options: SemanticViewOptions = {},
): SemanticViewResult {
  const projectRoot = options.projectRoot ?? process.cwd();
  const includeManifestComments = options.includeManifestComments ?? true;
  const stripChonkyIds = options.stripChonkyIds ?? true;

  const manifests = loadManifests(projectRoot);
  const requirementIds: string[] = [];

  const isTSX = filename.endsWith('.tsx') || filename.endsWith('.jsx');
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', ...(isTSX ? ['jsx' as const] : [])],
  });

  const assertReplacements: Array<{
    requirementId: string;
    scenarios: Array<{ name: string; fn: string }>;
    indent: string;
  }> = [];

  traverse(ast, {
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;

      // __chonky_assert__(id, scenarios) -> collect for post-processing
      if (t.isIdentifier(callee, { name: '__chonky_assert__' })) {
        const args = nodePath.node.arguments;
        if (args.length >= 2 && t.isStringLiteral(args[0]) && t.isArrayExpression(args[1])) {
          const requirementId = args[0].value;
          requirementIds.push(requirementId);
          const scenarios: Array<{ name: string; fn: string }> = [];

          for (const element of args[1].elements) {
            if (!t.isArrayExpression(element) || element.elements.length < 2) continue;
            const nameNode = element.elements[0];
            const fnNode = element.elements[1];
            if (!t.isStringLiteral(nameNode) || !fnNode) continue;
            scenarios.push({
              name: nameNode.value,
              fn: generate(fnNode).code,
            });
          }

          const col = nodePath.node.loc?.start.column ?? 0;
          const indent = ' '.repeat(col);
          assertReplacements.push({
            requirementId,
            scenarios,
            indent,
          });
        }
        return;
      }

      // defineRequirement({...}) -> add semantic comments
      if (
        t.isIdentifier(callee, { name: 'defineRequirement' }) &&
        includeManifestComments
      ) {
        const args = nodePath.node.arguments;
        if (args.length > 0 && t.isObjectExpression(args[0])) {
          const idProp = args[0].properties.find(
            (p): p is t.ObjectProperty =>
              t.isObjectProperty(p) &&
              t.isIdentifier(p.key, { name: 'id' }) &&
              t.isStringLiteral(p.value),
          );
          if (idProp && t.isStringLiteral(idProp.value)) {
            const reqId = idProp.value.value;
            requirementIds.push(reqId);
            const manifest = manifests.get(reqId);
            if (manifest?.name) {
              t.addComment(nodePath.node, 'leading', ` @requirement ${reqId}: ${manifest.name} `);
              if (manifest.description) {
                t.addComment(nodePath.node, 'leading', ` ${manifest.description} `);
              }
            }
          }
        }
      }
    },

    JSXOpeningElement(nodePath) {
      if (!stripChonkyIds) return;

      const attrs = nodePath.node.attributes;
      const chonkyIdIdx = attrs.findIndex(
        (attr) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name, { name: 'data-chonky-id' }),
      );

      if (chonkyIdIdx !== -1) {
        const attr = attrs[chonkyIdIdx] as t.JSXAttribute;
        const idValue = t.isStringLiteral(attr.value) ? attr.value.value : '';

        attrs.splice(chonkyIdIdx, 1);

        const nameNode = nodePath.node.name;
        const componentName = t.isJSXIdentifier(nameNode) ? nameNode.name : '?';
        t.addComment(
          nodePath.node,
          'trailing',
          ` chonky:${componentName}#${idValue} `,
        );
      }
    },
  });

  // Generate code first (before textual replacements)
  let { code: output } = generate(ast, {
    retainLines: false,
    compact: false,
    jsescOption: { minimal: true },
  });

  // Replace __chonky_assert__ calls with machine:assert blocks in the output text
  for (const repl of assertReplacements) {
    const searchPattern = buildAssertSearchPattern(repl.requirementId);
    const replacement = buildMachineAssertBlock(
      repl.requirementId,
      repl.scenarios,
      repl.indent,
    );
    output = output.replace(searchPattern, replacement);
  }

  return { code: output, requirementIds };
}

function loadManifests(projectRoot: string): Map<string, RequirementManifest> {
  const map = new Map<string, RequirementManifest>();
  const reqDir = path.join(projectRoot, '.chonky', 'requirements');
  if (!fs.existsSync(reqDir)) return map;

  try {
    const files = fs.readdirSync(reqDir).filter((f) => f.endsWith('.json') && f !== 'index.json');
    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(reqDir, file), 'utf-8'));
      if (content.id) {
        map.set(content.id, content as RequirementManifest);
      }
    }
  } catch { /* ignore read errors */ }

  return map;
}

function buildAssertSearchPattern(requirementId: string): RegExp {
  const escaped = requirementId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `__chonky_assert__\\("${escaped}",\\s*\\[[\\s\\S]*?\\]\\);?`,
  );
}

function buildMachineAssertBlock(
  requirementId: string,
  scenarios: Array<{ name: string; fn: string }>,
  indent: string,
): string {
  const lines: string[] = [];
  lines.push(`${indent}machine:assert for "${requirementId}" {`);
  for (const s of scenarios) {
    lines.push(`${indent}  scenario("${s.name}", ${s.fn});`);
  }
  lines.push(`${indent}}`);
  return lines.join('\n');
}
