// npx vitest core/prompts/__tests__/compact-prompt.spec.ts

vi.mock("os", () => ({
	default: {
		homedir: () => "/home/user",
		platform: () => "linux",
		arch: () => "x64",
		type: () => "Linux",
		release: () => "5.4.0",
		hostname: () => "test-host",
		tmpdir: () => "/tmp",
		endianness: () => "LE",
		loadavg: () => [0, 0, 0],
		totalmem: () => 8589934592,
		freemem: () => 4294967296,
		cpus: () => [],
		networkInterfaces: () => ({}),
		userInfo: () => ({ username: "test", uid: 1000, gid: 1000, shell: "/bin/bash", homedir: "/home/user" }),
	},
	homedir: () => "/home/user",
	platform: () => "linux",
	arch: () => "x64",
	type: () => "Linux",
	release: () => "5.4.0",
	hostname: () => "test-host",
	tmpdir: () => "/tmp",
	endianness: () => "LE",
	loadavg: () => [0, 0, 0],
	totalmem: () => 8589934592,
	freemem: () => 4294967296,
	cpus: () => [],
	networkInterfaces: () => ({}),
	userInfo: () => ({ username: "test", uid: 1000, gid: 1000, shell: "/bin/bash", homedir: "/home/user" }),
}))

vi.mock("default-shell", () => ({ default: "/bin/zsh" }))
vi.mock("os-name", () => ({ default: () => "Linux" }))
vi.mock("fs/promises")

vi.mock("vscode", () => ({
	env: { language: "en" },
	workspace: {
		workspaceFolders: [{ uri: { fsPath: "/test/path" } }],
		getWorkspaceFolder: vi.fn().mockReturnValue({ uri: { fsPath: "/test/path" } }),
	},
	window: { activeTextEditor: undefined },
	EventEmitter: vi.fn().mockImplementation(() => ({
		event: vi.fn(),
		fire: vi.fn(),
		dispose: vi.fn(),
	})),
}))

vi.mock("../../../utils/shell", () => ({
	getShell: () => "/bin/zsh",
}))

vi.mock("../sections/modes", () => ({
	getModesSection: vi.fn().mockImplementation(async () => `====\n\nMODES\n\n- Test modes section`),
}))

vi.mock("../compact_sections/modes", () => ({
	getModesSection: vi.fn().mockImplementation(async () => `====\n\nMODES\n\n- Test modes section`),
}))

vi.mock("../caveman_sections/modes", () => ({
	getModesSection: vi.fn().mockImplementation(async () => `====\n\nMODES\n\n- Test modes section`),
}))

vi.mock("../sections/custom-instructions", () => ({
	addCustomInstructions: vi.fn().mockResolvedValue(""),
	loadRuleFiles: vi.fn().mockResolvedValue(""),
}))

import * as vscode from "vscode"

import { EXPERIMENT_IDS } from "../../../shared/experiments"
import { SYSTEM_PROMPT } from "../system"
import { defaultModeSlug } from "../../../shared/modes"
import "../../../utils/path"

describe("Compact prompt experiment", () => {
	const mockContext = {
		extensionPath: "/mock/extension/path",
		globalStoragePath: "/mock/storage/path",
		storagePath: "/mock/storage/path",
		secrets: { get: vi.fn(), store: vi.fn(), delete: vi.fn() },
		subscriptions: [],
		extension: { packageJSON: { version: "1.0.0" } },
		globalState: { get: vi.fn(), update: vi.fn(), keys: vi.fn().mockReturnValue([]) },
		workspaceState: { get: vi.fn(), update: vi.fn(), keys: vi.fn().mockReturnValue([]) },
	} as unknown as vscode.ExtensionContext

	beforeEach(() => {
		vi.clearAllMocks()
	})

	const buildPrompt = (experiments: Record<string, boolean>) =>
		SYSTEM_PROMPT(
			mockContext,
			"/test/path",
			false,
			undefined,
			undefined,
			defaultModeSlug,
			undefined,
			undefined,
			undefined,
			experiments,
			undefined,
			undefined,
		)

	it("compact prompt is meaningfully shorter than standard prompt", async () => {
		const standard = await buildPrompt({})
		const compact = await buildPrompt({ [EXPERIMENT_IDS.COMPACT_PROMPT]: true })

		expect(compact.length).toBeLessThan(standard.length)
		const reductionRatio = 1 - compact.length / standard.length
		// Target: ~45% reduction. Assert at least 35% to leave headroom for harmless wording tweaks.
		expect(reductionRatio).toBeGreaterThanOrEqual(0.35)
	})

	it("compact prompt preserves the critical behavioral hooks", async () => {
		const compact = await buildPrompt({ [EXPERIMENT_IDS.COMPACT_PROMPT]: true })

		// Tool name references that downstream code/tests rely on
		expect(compact).toContain("attempt_completion")
		expect(compact).toContain("ask_followup_question")
		expect(compact).toContain("execute_command")
		expect(compact).toContain("environment_details")
		// Section headers
		expect(compact).toContain("RULES")
		expect(compact).toContain("OBJECTIVE")
		expect(compact).toContain("CAPABILITIES")
		expect(compact).toContain("SYSTEM INFORMATION")
		expect(compact).toContain("TOOL USE")
		expect(compact).toContain("MARKDOWN RULES")
		// Workspace path
		expect(compact).toContain("/test/path")
	})

	it("caveman mode wins when both flags are enabled", async () => {
		const both = await buildPrompt({
			[EXPERIMENT_IDS.CAVEMAN_MODE]: true,
			[EXPERIMENT_IDS.COMPACT_PROMPT]: true,
		})
		const cavemanOnly = await buildPrompt({ [EXPERIMENT_IDS.CAVEMAN_MODE]: true })
		expect(both).toEqual(cavemanOnly)
	})
})
