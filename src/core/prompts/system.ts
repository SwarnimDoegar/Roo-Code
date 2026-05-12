import * as vscode from "vscode"

import { type ModeConfig, type PromptComponent, type CustomModePrompts, type TodoItem } from "@roo-code/types"

import { Mode, modes, defaultModeSlug, getModeBySlug, getGroupName, getModeSelection } from "../../shared/modes"
import { DiffStrategy } from "../../shared/tools"
import { formatLanguage } from "../../shared/language"
import { isEmpty } from "../../utils/object"
import { EXPERIMENT_IDS, experiments as experimentsUtil } from "../../shared/experiments"

import { McpHub } from "../../services/mcp/McpHub"
import { CodeIndexManager } from "../../services/code-index/manager"
import { SkillsManager } from "../../services/skills/SkillsManager"

import type { SystemPromptSettings } from "./types"

// Standard sections
import {
	getRulesSection,
	getSystemInfoSection,
	getObjectiveSection,
	getSharedToolUseSection,
	getToolUseGuidelinesSection,
	getCapabilitiesSection,
	getModesSection,
	addCustomInstructions,
	markdownFormattingSection,
	getSkillsSection,
} from "./sections"

// Caveman sections (same signatures, caveman lingo)
import {
	getRulesSection as getCavemanRulesSection,
	getSystemInfoSection as getCavemanSystemInfoSection,
	getObjectiveSection as getCavemanObjectiveSection,
	getSharedToolUseSection as getCavemanSharedToolUseSection,
	getToolUseGuidelinesSection as getCavemanToolUseGuidelinesSection,
	getCapabilitiesSection as getCavemanCapabilitiesSection,
	getModesSection as getCavemanModesSection,
	addCustomInstructions as cavemanAddCustomInstructions,
	markdownFormattingSection as cavemanMarkdownFormattingSection,
	getSkillsSection as getCavemanSkillsSection,
	getCavemanModeSection,
} from "./caveman_sections"

// Compact sections (same signatures, terse English; ~45% token reduction)
import {
	getRulesSection as getCompactRulesSection,
	getSystemInfoSection as getCompactSystemInfoSection,
	getObjectiveSection as getCompactObjectiveSection,
	getSharedToolUseSection as getCompactSharedToolUseSection,
	getToolUseGuidelinesSection as getCompactToolUseGuidelinesSection,
	getCapabilitiesSection as getCompactCapabilitiesSection,
	getModesSection as getCompactModesSection,
	addCustomInstructions as compactAddCustomInstructions,
	markdownFormattingSection as compactMarkdownFormattingSection,
	getSkillsSection as getCompactSkillsSection,
} from "./compact_sections"

// Helper function to get prompt component, filtering out empty objects
export function getPromptComponent(
	customModePrompts: CustomModePrompts | undefined,
	mode: string,
): PromptComponent | undefined {
	const component = customModePrompts?.[mode]
	// Return undefined if component is empty
	if (isEmpty(component)) {
		return undefined
	}
	return component
}

async function generatePrompt(
	context: vscode.ExtensionContext,
	cwd: string,
	supportsComputerUse: boolean,
	mode: Mode,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	promptComponent?: PromptComponent,
	customModeConfigs?: ModeConfig[],
	globalCustomInstructions?: string,
	experiments?: Record<string, boolean>,
	language?: string,
	rooIgnoreInstructions?: string,
	settings?: SystemPromptSettings,
	todoList?: TodoItem[],
	modelId?: string,
	skillsManager?: SkillsManager,
): Promise<string> {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}

	// Check if caveman mode experiment is enabled
	const isCavemanMode = experiments
		? experimentsUtil.isEnabled(experiments as any, EXPERIMENT_IDS.CAVEMAN_MODE)
		: false

	// Check if compact prompt experiment is enabled (mutually exclusive — caveman wins).
	const isCompactPrompt =
		!isCavemanMode && experiments
			? experimentsUtil.isEnabled(experiments as any, EXPERIMENT_IDS.COMPACT_PROMPT)
			: false

	// Select section functions based on caveman mode, then compact, then standard.
	const _getRulesSection = isCavemanMode
		? getCavemanRulesSection
		: isCompactPrompt
			? getCompactRulesSection
			: getRulesSection
	const _getSystemInfoSection = isCavemanMode
		? getCavemanSystemInfoSection
		: isCompactPrompt
			? getCompactSystemInfoSection
			: getSystemInfoSection
	const _getObjectiveSection = isCavemanMode
		? getCavemanObjectiveSection
		: isCompactPrompt
			? getCompactObjectiveSection
			: getObjectiveSection
	const _getSharedToolUseSection = isCavemanMode
		? getCavemanSharedToolUseSection
		: isCompactPrompt
			? getCompactSharedToolUseSection
			: getSharedToolUseSection
	const _getToolUseGuidelinesSection = isCavemanMode
		? getCavemanToolUseGuidelinesSection
		: isCompactPrompt
			? getCompactToolUseGuidelinesSection
			: getToolUseGuidelinesSection
	const _getCapabilitiesSection = isCavemanMode
		? getCavemanCapabilitiesSection
		: isCompactPrompt
			? getCompactCapabilitiesSection
			: getCapabilitiesSection
	const _getModesSection = isCavemanMode
		? getCavemanModesSection
		: isCompactPrompt
			? getCompactModesSection
			: getModesSection
	const _addCustomInstructions = isCavemanMode
		? cavemanAddCustomInstructions
		: isCompactPrompt
			? compactAddCustomInstructions
			: addCustomInstructions
	const _markdownFormattingSection = isCavemanMode
		? cavemanMarkdownFormattingSection
		: isCompactPrompt
			? compactMarkdownFormattingSection
			: markdownFormattingSection
	const _getSkillsSection = isCavemanMode
		? getCavemanSkillsSection
		: isCompactPrompt
			? getCompactSkillsSection
			: getSkillsSection

	// Get the full mode config to ensure we have the role definition (used for groups, etc.)
	const modeConfig = getModeBySlug(mode, customModeConfigs) || modes.find((m) => m.slug === mode) || modes[0]
	const { roleDefinition, baseInstructions } = getModeSelection(mode, promptComponent, customModeConfigs)

	// Check if MCP functionality should be included
	const hasMcpGroup = modeConfig.groups.some((groupEntry) => getGroupName(groupEntry) === "mcp")
	const hasMcpServers = mcpHub && mcpHub.getServers().length > 0
	const shouldIncludeMcp = hasMcpGroup && hasMcpServers

	const codeIndexManager = CodeIndexManager.getInstance(context, cwd)

	// Tool calling is native-only.
	const effectiveProtocol = "native"

	const [modesSection, skillsSection] = await Promise.all([
		_getModesSection(context),
		_getSkillsSection(skillsManager, mode as string),
	])

	// Tools catalog is not included in the system prompt.
	const toolsCatalog = ""

	// Add caveman mode section if enabled
	const cavemanSection = isCavemanMode ? `\n${getCavemanModeSection()}\n` : ""

	const basePrompt = `${roleDefinition}
${cavemanSection}
${_markdownFormattingSection()}

${_getSharedToolUseSection()}${toolsCatalog}

	${_getToolUseGuidelinesSection()}

${_getCapabilitiesSection(cwd, shouldIncludeMcp ? mcpHub : undefined)}

${modesSection}
${skillsSection ? `\n${skillsSection}` : ""}
${_getRulesSection(cwd, settings)}

${_getSystemInfoSection(cwd)}

${_getObjectiveSection()}

${await _addCustomInstructions(baseInstructions, globalCustomInstructions || "", cwd, mode, {
	language: language ?? formatLanguage(vscode.env.language),
	rooIgnoreInstructions,
	settings,
})}`

	return basePrompt
}

export const SYSTEM_PROMPT = async (
	context: vscode.ExtensionContext,
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	mode: Mode = defaultModeSlug,
	customModePrompts?: CustomModePrompts,
	customModes?: ModeConfig[],
	globalCustomInstructions?: string,
	experiments?: Record<string, boolean>,
	language?: string,
	rooIgnoreInstructions?: string,
	settings?: SystemPromptSettings,
	todoList?: TodoItem[],
	modelId?: string,
	skillsManager?: SkillsManager,
): Promise<string> => {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}

	// Check if it's a custom mode
	const promptComponent = getPromptComponent(customModePrompts, mode)

	// Get full mode config from custom modes or fall back to built-in modes
	const currentMode = getModeBySlug(mode, customModes) || modes.find((m) => m.slug === mode) || modes[0]

	return generatePrompt(
		context,
		cwd,
		supportsComputerUse,
		currentMode.slug,
		mcpHub,
		diffStrategy,
		promptComponent,
		customModes,
		globalCustomInstructions,
		experiments,
		language,
		rooIgnoreInstructions,
		settings,
		todoList,
		modelId,
		skillsManager,
	)
}
