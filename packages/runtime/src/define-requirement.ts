/**
 * Identity function at runtime. The real work happens at compile time
 * via @chonkylang/transpiler which strips this wrapper and emits manifest JSON.
 */
export function defineRequirement<T>(definition: T): T {
  return definition;
}
