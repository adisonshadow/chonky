// Transpiler — types & configuration
export {
  preprocess,
  chonkyBabelPlugin,
  loadChonkyConfig,
  loadPolicyManifest,
  isValidRequirementId,
  generateChonkyId,
  ensureDir,
  resolveOutputDir,
} from '@chonky/transpiler';

export type {
  PreprocessResult,
  ChonkyConfig,
  VerificationConfig,
  AmbiguityConfig,
  OptimizerConfig,
  SilentModeConfig,
  InteractionConfig,
  RequirementDefinition,
  RequirementManifest,
  RequirementManifestMeta,
  RequirementIndex,
  RequirementIndexEntry,
  Trigger,
  TriggerType,
  Condition,
  SideEffect,
  PolicyManifest,
  PolicyRule,
  ExcludedItem,
  NegateConstraint,
  NegateDetection,
  PreferredItem,
  AmbiguityViolation,
  AmbiguityReport,
} from '@chonky/transpiler';

// Runtime — browser APIs
export {
  defineRequirement,
  verify,
  ChonkyRenderer,
  _ChonkyWrapper,
} from '@chonky/runtime';

export type {
  ChonkyWrapperProps,
  ComponentEntry,
  ComponentInstance,
  RenderEvent,
  ComponentTreeNode,
  ChonkyRenderMeta,
} from '@chonky/runtime';
