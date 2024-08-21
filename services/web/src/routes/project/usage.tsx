import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import { useCurrentProjectId } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import type { ApiRouterOutput } from "api/trpc/router"
import _ from "lodash"
import { Fragment, useMemo } from "react"


export default function ProjectUsage() {

    const projectId = useCurrentProjectId()
    const { data: usage } = trpc.projects.usage.useQuery({
        projectId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

    const gridData = useMemo<Record<string, ApiRouterOutput["projects"]["usage"]["runCounts"][number][]>>(() => {
        if (!usage?.runCounts) return {}
        return _.groupBy(usage.runCounts, "workflow_id")
    }, [usage?.runCounts])

    const maxRunCount = Object.values(gridData).flatMap(r => r.map(d => d.run_count))
        .reduce((acc, cur) => cur > acc ? cur : acc, 0)

    console.log(gridData)

    return (
        <ProjectDashboardLayout currentSegment="Usage">
            <div className="flex flex-col items-stretch gap-8">
                <div className="col-span-full flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Usage</h1>
                </div>

                <div className="grid gap-1" style={{
                    gridTemplateColumns: `auto repeat(${Object.values(gridData)[0]?.length ?? 0}, 1fr)`,
                    gridTemplateRows: "repeat(auto-fill, 1fr)",
                }}>
                    {Object.entries(gridData).map(([workflowId, data]) =>
                        <Fragment key={workflowId}>
                            <p className="place-self-center text-center">{workflowId}</p>
                            {data.map((d, i) =>
                                <div key={i} className="bg-violet-700 h-8 rounded-md" style={{
                                    opacity: d.run_count / maxRunCount,
                                }} />
                            )}
                        </Fragment>
                    )}

                </div>
            </div>
        </ProjectDashboardLayout>
    )
}