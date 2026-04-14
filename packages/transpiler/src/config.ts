import * as path from 'node:path';
import * as fs from 'node:fs';
import type { ChonkyConfig, PolicyManifest } from './types';

const DEFAULT_CONFIG: Required<ChonkyConfig> = {
  verification: { strictBinding: false },
  ambiguity: {
    policyManifest: './pm-requirement.json',
    strictMode: false,
    generateReport: true,
    reportPath: '.chonky/ambiguity-report.json',
    ignorePatterns: ['**/*.test.ts', '**/*.spec.ts', '__tests__/**'],
  },
  optimizer: {
    silentMode: {
      imageFormatConversion: true,
      sizeReductionThreshold: 0.3,
      unusedAssetRemoval: false,
      compositeLayerPromotion: true,
      codeSplitSuggestion: false,
      all: false,
    },
    interaction: {
      timeoutSeconds: 30,
      timeoutAction: 'skip',
      offerPersistence: true,
      persistTo: 'config',
    },
  },
};

export function loadChonkyConfig(projectRoot?: string): ChonkyConfig {
  const root = projectRoot ?? process.cwd();
  const configPath = path.resolve(root, 'chonky.config.js');

  let userConfig: Partial<ChonkyConfig> = {};

  if (fs.existsSync(configPath)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const loaded = require(configPath);
      userConfig = loaded.default ?? loaded;
    } catch {
      // Silently fall back to defaults if config cannot be loaded
    }
  }

  return deepMerge(DEFAULT_CONFIG, userConfig) as ChonkyConfig;
}

export function loadPolicyManifest(
  manifestPath: string,
  projectRoot?: string,
): PolicyManifest | null {
  const root = projectRoot ?? process.cwd();
  const fullPath = path.resolve(root, manifestPath);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as PolicyManifest;
  } catch {
    return null;
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}
