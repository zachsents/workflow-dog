import "server-only"
import projects from "./procedures/projects"
import serviceAccounts from "./procedures/service-accounts"
import workflows from "./procedures/workflows"
import { t } from "./setup"

export const appRouter = t.router({
    projects,
    workflows,
    serviceAccounts,
})