import os from "os"
import osName from "os-name"

import { getShell } from "../../../utils/shell"

export function getSystemInfoSection(cwd: string): string {
	let osInfo: string
	try {
		osInfo = osName()
	} catch {
		osInfo = `${os.platform()} ${os.release()}`
	}

	return `====

SYSTEM INFORMATION

OS: ${osInfo}
Shell: ${getShell()}
Home: ${os.homedir().toPosix()}
Workspace: ${cwd.toPosix()}

The workspace is the default directory for tool operations. New terminals open here. Changing directories in a terminal does not change the workspace — you cannot change the workspace.`
}
