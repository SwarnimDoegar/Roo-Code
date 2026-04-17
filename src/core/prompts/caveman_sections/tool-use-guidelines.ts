export function getToolUseGuidelinesSection(): string {
	return `# Tool Use Guidelines

1. Check what info you got, what info you need.
2. Pick best tool for job. Think which tool gather info fastest. list_files beat \`ls\` in terminal. Think about each tool, pick one that fit current step best.
3. Multiple actions needed? Use multiple tools same message when make sense, or iterate across messages. Each tool use informed by previous results. Never assume outcome. Each step informed by last step result.

User response after tool execution = feedback. React accordingly. Make informed decisions. Iterative process = success.`
}
