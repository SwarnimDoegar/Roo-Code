import type { McpHub } from "../../../services/mcp/McpHub"

export function getCapabilitiesSection(cwd: string, mcpHub?: McpHub): string {
	return `====

CAPABILITIES

Available actions: run CLI commands, list files, view source definitions, regex search, read/write files, ask follow-ups.

On task start, environment_details includes a recursive file list of the workspace ('${cwd}'). Use it to orient before exploring. Use list_files for paths outside the workspace; pass recursive=true only when nested structure matters.

execute_command runs in the user's VS Code terminal. Each call opens a new terminal instance. Long-running and interactive commands are allowed. Always state what the command does.${
		mcpHub ? `\n\nMCP servers may expose additional tools/resources for this task.` : ""
	}`
}
