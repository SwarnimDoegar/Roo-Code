// Custom instructions are logic-heavy (file I/O, rule loading) — reuse original implementation.
// The prompts within are user-provided custom instructions, not system prompts to caveman-ify.
export { addCustomInstructions, loadRuleFiles } from "../sections/custom-instructions"
