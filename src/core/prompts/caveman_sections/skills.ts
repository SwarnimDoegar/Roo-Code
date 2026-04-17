import type { SkillsManager } from "../../../services/skills/SkillsManager"

type SkillsManagerLike = Pick<SkillsManager, "getSkillsForMode">

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

export async function getSkillsSection(
	skillsManager: SkillsManagerLike | undefined,
	currentMode: string | undefined,
): Promise<string> {
	if (!skillsManager || !currentMode) return ""

	const skills = skillsManager.getSkillsForMode(currentMode)
	if (skills.length === 0) return ""

	const skillsXml = skills
		.map((skill) => {
			const name = escapeXml(skill.name)
			const description = escapeXml(skill.description)
			const locationLine = `\n    <location>${escapeXml(skill.path)}</location>`
			return `  <skill>\n    <name>${name}</name>\n    <description>${description}</description>${locationLine}\n  </skill>`
		})
		.join("\n")

	return `====

AVAILABLE SKILLS

<available_skills>
${skillsXml}
</available_skills>

<mandatory_skill_check>
REQUIRED — DO BEFORE ANY RESPONSE

Must check skill applicability before ANY user-facing response.

Step 1: Skill Evaluation
- Check user request against ALL skill <description> entries in <available_skills>.
- Determine if skill clearly applies.

Step 2: Branch

<if_skill_applies>
- Pick EXACTLY ONE skill. Most specific win.
- Use skill tool to load by name.
- Load skill instructions fully into context BEFORE continuing.
- Follow skill instructions precisely.
- No respond outside skill-defined flow.
</if_skill_applies>

<if_no_skill_applies>
- Normal response. No load any SKILL.md.
</if_no_skill_applies>

CONSTRAINTS:
- No load every skill up front.
- Load only AFTER skill selected.
- No reload skill already in conversation.
- No skip this check.
- Skip = error.
</mandatory_skill_check>

<linked_file_handling>
- Skill loaded → only skill instructions present.
- Linked files NOT auto-loaded.
- Must explicitly decide to read linked file based on task relevance.
- No assume linked file contents unless explicitly read.
- Read minimum necessary linked file.
- No read multiple unless required.
- Linked files = progressive disclosure, not mandatory context.
</linked_file_handling>

<context_notes>
- Skill list already filtered for current mode: "${currentMode}".
- Mode-specific skills from skills-${currentMode}/ with project-level overrides beat global skills.
</context_notes>

<internal_verification>
Internal control only. No include in user-facing output.

After evaluation, internally confirm:
<skill_check_completed>true|false</skill_check_completed>
</internal_verification>
`
}
