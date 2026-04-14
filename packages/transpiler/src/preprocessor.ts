/**
 * Preprocessor that converts Chonky-specific syntax (machine:assert blocks)
 * into valid TypeScript before Babel processes the file.
 *
 * Input:
 *   machine:assert for "REQ-USER-LOGIN-01" {
 *     scenario("Password too short", () => { ... });
 *   }
 *
 * Output:
 *   __chonky_assert__("REQ-USER-LOGIN-01", [
 *     ["Password too short", () => { ... }],
 *   ]);
 */

export interface PreprocessResult {
  code: string;
  /** Maps generated line numbers to original line numbers */
  lineMapping: Map<number, number>;
  hadTransforms: boolean;
}

const MACHINE_ASSERT_START =
  /^(\s*)machine\s*:\s*assert\s+for\s+"([^"]+)"\s*\{/;

export function preprocess(source: string, _filename?: string): PreprocessResult {
  const lines = source.split('\n');
  const outputLines: string[] = [];
  const lineMapping = new Map<number, number>();
  let hadTransforms = false;
  let i = 0;

  while (i < lines.length) {
    const match = MACHINE_ASSERT_START.exec(lines[i]);

    if (!match) {
      const outIdx = outputLines.length;
      outputLines.push(lines[i]);
      lineMapping.set(outIdx, i);
      i++;
      continue;
    }

    hadTransforms = true;
    const indent = match[1];
    const requirementId = match[2];
    const blockStartLine = i;

    // Collect the entire block by tracking brace depth
    let braceDepth = 0;
    const blockLines: string[] = [];

    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      blockLines.push(line);
      if (braceDepth === 0) {
        i = j + 1;
        break;
      }
    }

    // Extract scenario() calls from the block body (lines between outer braces)
    const scenarios = extractScenarios(blockLines);

    // Emit the transformed code
    const outStart = outputLines.length;
    outputLines.push(
      `${indent}__chonky_assert__("${requirementId}", [`,
    );
    lineMapping.set(outStart, blockStartLine);

    for (const scenario of scenarios) {
      const outIdx = outputLines.length;
      outputLines.push(
        `${indent}  [${scenario.name}, ${scenario.fn}],`,
      );
      lineMapping.set(outIdx, scenario.originalLine);
    }

    const outEnd = outputLines.length;
    outputLines.push(`${indent}]);`);
    lineMapping.set(outEnd, blockStartLine);
  }

  return {
    code: outputLines.join('\n'),
    lineMapping,
    hadTransforms,
  };
}

interface ScenarioEntry {
  name: string;
  fn: string;
  originalLine: number;
}

function extractScenarios(blockLines: string[]): ScenarioEntry[] {
  const scenarios: ScenarioEntry[] = [];
  const body = blockLines.slice(1, -1); // Strip outer { and }
  const bodyOffset = 1; // First body line corresponds to blockLines index 1

  let j = 0;
  while (j < body.length) {
    const scenarioMatch = /^\s*scenario\s*\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/.exec(
      body[j],
    );

    if (!scenarioMatch) {
      j++;
      continue;
    }

    const name = scenarioMatch[1];
    const originalLine = j + bodyOffset;

    // Collect the full scenario(...) call by tracking paren depth
    let parenDepth = 0;
    const scenarioLines: string[] = [];
    for (let k = j; k < body.length; k++) {
      const line = body[k];
      for (const ch of line) {
        if (ch === '(') parenDepth++;
        if (ch === ')') parenDepth--;
      }
      scenarioLines.push(line);
      if (parenDepth === 0) {
        j = k + 1;
        break;
      }
    }

    // Extract the function argument: everything between scenario("name", <fn>);
    const fullText = scenarioLines.join('\n');
    const fnStartIdx = fullText.indexOf(name) + name.length;
    const afterName = fullText.slice(fnStartIdx);
    // Skip comma and whitespace after name
    const commaMatch = /^\s*,\s*/.exec(afterName);
    if (commaMatch) {
      let fnBody = afterName.slice(commaMatch[0].length);
      // Remove trailing ");", accounting for optional semicolon
      fnBody = fnBody.replace(/\)\s*;?\s*$/, '');
      scenarios.push({ name, fn: fnBody.trim(), originalLine });
    }

    continue;
  }

  return scenarios;
}
