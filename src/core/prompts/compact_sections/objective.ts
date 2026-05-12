export function getObjectiveSection(): string {
	return `====

OBJECTIVE

Work iteratively. Plan, then execute one step at a time.

1. Break the task into ordered, achievable goals.
2. Use one tool per step (or batch independent tools in one response).
3. Before each tool call: confirm every required parameter is present or inferable from context. If a required parameter is missing, ask via ask_followup_question — do not invent values. Do not ask about optional parameters.
4. When done, call attempt_completion with the final result. Do not end with a question or offer for more help.`
}
