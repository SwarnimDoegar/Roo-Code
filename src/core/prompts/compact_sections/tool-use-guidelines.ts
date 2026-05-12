export function getToolUseGuidelinesSection(): string {
	return `# Tool Use Guidelines

1. Identify what you already know vs. what you need.
2. Pick the most specific tool for the step (e.g. list_files over \`ls\`).
3. Chain tools across messages; each step is informed by the previous result. Do not assume outcomes — wait for confirmation before the next step.
4. You may call multiple independent tools in one response.`
}
