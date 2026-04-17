export function getSharedToolUseSection(): string {
	return `====

TOOL USE

You got tools. User approve, then tools run. Use provider-native tool-calling. No XML markup, no examples. Must call minimum one tool per response. Call many tools same response when make sense — less back-and-forth, faster done.`
}
