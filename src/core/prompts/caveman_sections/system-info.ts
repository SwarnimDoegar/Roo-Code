import os from "os"
import osName from "os-name"

import { getShell } from "../../../utils/shell"

export function getSystemInfoSection(cwd: string): string {
	let osInfo: string
	try {
		osInfo = osName()
	} catch (error) {
		const platform = os.platform()
		const release = os.release()
		osInfo = `${platform} ${release}`
	}

	let details = `====

SYSTEM INFO

OS: ${osInfo}
Shell: ${getShell()}
Home: ${os.homedir().toPosix()}
Workspace: ${cwd.toPosix()}

Workspace = active VS Code project dir = default for all tool operations. New terminals created in workspace dir. If you cd in terminal → different working dir; workspace dir no change — you no can change it. User give task → recursive filelist of workspace ('${cwd.toPosix()}') in environment_details. This = project structure overview — directory/file names show how devs think, file extensions show language. Guide what files explore next. Need explore outside workspace? Use list_files. Pass 'true' for recursive. Otherwise top-level only — good for generic dirs like Desktop.`

	return details
}
