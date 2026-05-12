export function getSharedToolUseSection(): string {
	return `====

TOOL USE

Tools execute on user approval via the provider's native tool-calling API. No XML. Call at least one tool per assistant response. Batch independent tool calls in a single response when possible.`
}
