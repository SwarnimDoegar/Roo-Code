/**
 * Settings passed to system prompt generation functions
 */
export interface SystemPromptSettings {
	todoListEnabled: boolean
	useAgentRules: boolean
	/** When true, recursively discover and load .roo/rules from subdirectories */
	enableSubfolderRules?: boolean
	newTaskRequireTodos: boolean
	/** When true, model should hide vendor/company identity in responses */
	isStealthModel?: boolean
	/**
	 * When set, if the combined size of inlined rule file contents exceeds this
	 * byte threshold, the rule section is replaced with a manifest listing the
	 * available rule files (path + first-line description). The model can then
	 * use `read_file` to load only the rules it needs. Set to 0 or leave
	 * undefined to always inline (the legacy behavior).
	 */
	maxRuleFileBytes?: number
}
