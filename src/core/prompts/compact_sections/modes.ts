import type * as vscode from "vscode"

import type { ModeConfig } from "@roo-code/types"

import { getAllModesWithPrompts } from "../../../shared/modes"
import { ensureSettingsDirectoryExists } from "../../../utils/globalContext"

export async function getModesSection(context: vscode.ExtensionContext): Promise<string> {
	await ensureSettingsDirectoryExists(context)
	const allModes = await getAllModesWithPrompts(context)

	const lines = allModes.map((mode: ModeConfig) => {
		// Compact: keep slug + first-sentence summary only (use whenToUse if present, else roleDefinition).
		const raw = mode.whenToUse?.trim() || mode.roleDefinition
		const summary = raw
			.split(/(?<=[.?!])\s/)[0]
			.replace(/\n/g, " ")
			.trim()
		return `  * "${mode.name}" (${mode.slug}) — ${summary}`
	})

	return `====

MODES

Available modes:
${lines.join("\n")}`
}
