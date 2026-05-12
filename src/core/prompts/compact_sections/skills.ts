import type { SkillsManager } from "../../../services/skills/SkillsManager"

type SkillsManagerLike = Pick<SkillsManager, "getSkillsForMode">

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

/**
 * Compact skills section. Drops the verbose <mandatory_skill_check>,
 * <linked_file_handling>, <context_notes>, and <internal_verification> XML
 * blocks in favor of a 4-line directive that preserves the same behavior.
 */
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
			const location = escapeXml(skill.path)
			return `  <skill><name>${name}</name><description>${description}</description><location>${location}</location></skill>`
		})
		.join("\n")

	return `====

AVAILABLE SKILLS

<available_skills>
${skillsXml}
</available_skills>

Skill rules:
- Before responding, check if exactly one skill clearly applies. If yes, load it via the skill tool and follow it. If no, respond normally.
- Never load multiple skills upfront. Never reload a skill already loaded in this conversation.
- Files linked from a skill are not auto-loaded — read them only if the task requires.`
}
