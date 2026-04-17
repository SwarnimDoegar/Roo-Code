import { McpHub } from "../../../services/mcp/McpHub"

export function getCapabilitiesSection(cwd: string, mcpHub?: McpHub): string {
	return `====

CAPABILITIES

- You got tools: execute CLI commands, list files, view source code definitions, regex search, read/write files, ask follow-up questions. These help accomplish wide range tasks — writing code, editing files, understanding projects, system operations, much more.
- User give task → recursive list of all filepaths in workspace directory ('${cwd}') included in environment_details. This = overview of project file structure. Key insights from directory/file names (how devs organize code) and file extensions (language used). Guide decision on which files explore further. Need explore outside workspace? Use list_files tool. Pass 'true' for recursive = list all files recursively. Otherwise top-level only — better for generic dirs like Desktop.
- execute_command tool = run commands on user computer when help accomplish task. Must provide clear explanation what command do. Prefer complex CLI commands over creating scripts — more flexible, easier run. Interactive and long-running commands allowed — run in VSCode terminal. User may keep commands running in background, you get status updates. Each command = new terminal instance.${
		mcpHub
			? `
- You got MCP servers with additional tools and resources. Each server provide different capabilities for accomplishing tasks more effectively.
`
			: ""
	}`
}
