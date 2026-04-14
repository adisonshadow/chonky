export type TriggerType =
  | 'UI_EVENT'
  | 'ROUTE_CHANGE'
  | 'API_RESPONSE'
  | 'TIMER'
  | 'STATE_CHANGE'
  | 'LIFECYCLE'
  | 'CUSTOM';

export interface Trigger {
  type: TriggerType;
  target: string;
  event: string;
  guard?: string;
}

export interface Condition {
  expression: string;
  type: 'STATE_CHECK' | 'AUTH_CHECK' | 'DATA_VALID' | 'CUSTOM';
}

export interface SideEffect {
  type:
    | 'API_CALL'
    | 'STATE_MUTATION'
    | 'NAVIGATION'
    | 'STORAGE'
    | 'NOTIFICATION'
    | 'CUSTOM';
  target: string;
  description?: string;
}

export interface RequirementDefinition {
  id: string;
  name?: string;
  description?: string;
  triggers: Trigger[];
  preconditions?: Condition[];
  postconditions?: Condition[];
  sideEffects?: SideEffect[];
  priority?: number;
  dependsOn?: string[];
  metadata?: Record<string, unknown>;
}

export interface RequirementManifestMeta {
  version: string;
  generatedAt: string;
}

export interface RequirementManifest extends RequirementDefinition {
  sourceFile: string;
  _chonky: RequirementManifestMeta;
}

export interface RequirementIndexEntry {
  id: string;
  sourceFile: string;
  manifestPath: string;
}

export interface RequirementIndex {
  requirements: RequirementIndexEntry[];
  _chonky: RequirementManifestMeta;
}

// --- Ambiguity Resolution Protocol ---

export interface ExcludedItem {
  type: 'component' | 'api' | 'import' | 'pattern';
  target: string;
  reason: string;
}

export interface NegateDetection {
  type: 'code_pattern' | 'api_call' | 'state_mutation' | 'dom_operation';
  pattern: string;
  scope?: string;
}

export interface NegateConstraint {
  id: string;
  behavior: string;
  detection: NegateDetection;
}

export interface PreferredItem {
  replaces: string;
  suggestion: string;
  description?: string;
}

export interface PolicyRule {
  id: string;
  requirementId?: string;
  description: string;
  excluded: ExcludedItem[];
  negate?: NegateConstraint[];
  preferred?: PreferredItem[];
  severity?: 'warning' | 'error';
}

export interface PolicyManifest {
  version: string;
  projectId?: string;
  rules: PolicyRule[];
}

// --- Ambiguity Report ---

export interface AmbiguityViolation {
  ruleId: string;
  constraintId?: string;
  type: 'excluded' | 'negate';
  target?: string;
  behavior?: string;
  matchedText?: string;
  file: string;
  line: number;
  column: number;
  severity: 'warning' | 'error';
}

export interface AmbiguityReport {
  timestamp: string;
  totalViolations: number;
  violations: AmbiguityViolation[];
}

// --- Chonky Config ---

export interface VerificationConfig {
  strictBinding?: boolean;
}

export interface AmbiguityConfig {
  policyManifest?: string;
  strictMode?: boolean;
  generateReport?: boolean;
  reportPath?: string;
  ignorePatterns?: string[];
}

export interface SilentModeConfig {
  imageFormatConversion?: boolean;
  sizeReductionThreshold?: number;
  unusedAssetRemoval?: boolean;
  compositeLayerPromotion?: boolean;
  codeSplitSuggestion?: boolean;
  all?: boolean;
}

export interface InteractionConfig {
  timeoutSeconds?: number;
  timeoutAction?: 'apply' | 'skip' | 'abort';
  offerPersistence?: boolean;
  persistTo?: 'config' | 'session';
}

export interface OptimizerConfig {
  silentMode?: SilentModeConfig;
  interaction?: InteractionConfig;
}

export interface ChonkyConfig {
  verification?: VerificationConfig;
  ambiguity?: AmbiguityConfig;
  optimizer?: OptimizerConfig;
}
