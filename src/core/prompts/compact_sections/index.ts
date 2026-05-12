// Compact prompt sections: terse rewrites of the standard sections that
// preserve every behavioral contract while cutting ~45% of prompt tokens.
// Gated by EXPERIMENT_IDS.COMPACT_PROMPT.
export { getRulesSection } from "./rules"
export { getSystemInfoSection } from "./system-info"
export { getObjectiveSection } from "./objective"
export { getSharedToolUseSection } from "./tool-use"
export { getToolUseGuidelinesSection } from "./tool-use-guidelines"
export { getCapabilitiesSection } from "./capabilities"
export { getModesSection } from "./modes"
export { markdownFormattingSection } from "./markdown-formatting"
export { getSkillsSection } from "./skills"
// Custom-instructions logic (rule loading, file I/O) is reused as-is.
export { addCustomInstructions } from "../sections/custom-instructions"
