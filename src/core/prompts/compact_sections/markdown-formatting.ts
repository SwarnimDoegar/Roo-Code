export function markdownFormattingSection(): string {
	return `====

MARKDOWN RULES

Render any \`language construct\` or filename reference as a clickable link: [\`name\`](relative/path.ext:line). Line is required for code symbols, optional for filenames. Applies to all markdown including attempt_completion.`
}
