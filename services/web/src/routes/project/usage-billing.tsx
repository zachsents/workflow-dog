import { IconMail } from "@tabler/icons-react"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import SimpleTooltip from "@web/components/simple-tooltip"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { Progress } from "@web/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@web/components/ui/table"
import { useCurrentProjectId } from "@web/lib/hooks"
import { getClientPlanData } from "@web/lib/plans"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"


export default function ProjectUsageBilling() {

    const projectId = useCurrentProjectId()
    const { data: usage } = trpc.projects.usage.useQuery({ projectId })
    const planInfo = usage ? getClientPlanData(usage.plan) : undefined

    const runCount = usage?.runCount ?? 0
    const runLimit = planInfo?.workflowRunLimit ?? 1
    const workflowRunsProgress = Math.min(1, Math.max(0, runCount / runLimit))

    const memberCount = usage?.memberCount ?? 0
    const memberLimit = planInfo?.teamMemberLimit ?? 1
    const teamMembersProgress = Math.min(1, Math.max(0, memberCount / memberLimit))

    const maxRunCount = usage?.runCountByWorkflow.reduce((acc, cur) => cur.run_count > acc ? cur.run_count : acc, 0) ?? 1

    const upsellPlanInfo = planInfo?.upsellsTo ? getClientPlanData(planInfo.upsellsTo) : undefined

    const manageBillingMutation = trpc.projects.billing.getPortalLink.useMutation({
        onSuccess: ({ url }) => {
            window.location.assign(url)
        },
    })
    const upgradeBillingMutation = trpc.projects.billing.getPortalLink.useMutation({
        onSuccess: ({ url }) => {
            window.location.assign(url)
        },
    })

    return (
        <ProjectDashboardLayout currentSegment="Usage & Billing">
            <div className="grid grid-cols-2 gap-8">
                <div className="col-span-full flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Usage & Billing</h1>
                </div>

                <div className="col-span-full grid grid-cols-2 *:border *:px-6 *:py-4 last:*:border-l-0 first:*:rounded-l-xl last:*:rounded-r-xl">
                    <div className="flex-col items-stretch gap-2">
                        <h2 className="text-lg font-bold">
                            Workflow Runs
                            <span className="text-muted-foreground font-normal">&nbsp;this month</span>
                        </h2>
                        <Progress value={Math.round(100 * workflowRunsProgress)} className="h-8" />
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p><b>{numberFormatter.format(runCount)}</b> / {numberFormatter.format(runLimit)}</p>
                            <p>{percentFormatter.format(workflowRunsProgress)}</p>
                        </div>
                    </div>
                    <div className="flex-col items-stretch gap-2">
                        <h2 className="text-lg font-bold">Project Members</h2>
                        <Progress value={Math.round(100 * teamMembersProgress)} className="h-8" />
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p><b>{numberFormatter.format(memberCount)}</b> / {numberFormatter.format(memberLimit)}</p>
                            <p>{percentFormatter.format(teamMembersProgress)}</p>
                        </div>
                    </div>
                </div>

                <div className="border rounded-xl p-8 flex-col justify-between items-stretch gap-4">
                    <div className="gap-4 flex-col items-start">
                        <h3 className="text-lg font-medium">
                            Current Plan
                        </h3>
                        {planInfo && <>
                            <div className={cn("flex-center gap-2 text-xl font-bold rounded-full px-6 py-2", planInfo.badgeClassName)}>
                                <TI><planInfo.icon /></TI>
                                {planInfo.name}
                            </div>
                            <ul className="*:list-disc text-muted-foreground pl-4">
                                {planInfo.features.map(feature =>
                                    <li key={feature}>
                                        {feature}
                                    </li>
                                )}
                            </ul>
                        </>}
                    </div>
                    <Button
                        variant="secondary" className="gap-2"
                        onClick={() => manageBillingMutation.mutate({ projectId })}
                        disabled={manageBillingMutation.isPending
                            || manageBillingMutation.isSuccess
                            || upgradeBillingMutation.isPending}
                    >
                        {(manageBillingMutation.isPending || manageBillingMutation.isSuccess) ? <>
                            <SpinningLoader />
                            One sec...
                        </> : "Manage Billing"}
                    </Button>
                </div>

                {upsellPlanInfo &&
                    <div className="relative rounded-xl p-8 flex-col justify-between items-stretch gap-4 bg-gradient-to-tr from-pink-600 to-yellow-500 text-white">
                        <div className="gap-4 flex-col items-start">
                            <h3 className="text-xl font-bold">
                                Upgrade to {upsellPlanInfo.name}
                            </h3>
                            <ul className="*:list-disc pl-4">
                                {upsellPlanInfo.features.map(feature =>
                                    <li key={feature}>
                                        {feature}
                                    </li>
                                )}
                            </ul>
                        </div>
                        <TI className="absolute top-0 right-0 text-[16rem] stroke-[0.5px] opacity-30"><upsellPlanInfo.icon /></TI>

                        {upsellPlanInfo.emailSubject
                            ? <Button variant="secondary" className="gap-2 relative" asChild>
                                <a href={`mailto:info@workflow.dog?subject=${upsellPlanInfo.emailSubject}`}>
                                    Send us an email
                                    <TI><IconMail /></TI>
                                </a>
                            </Button>
                            : <Button
                                variant="secondary" className="gap-2"
                                onClick={() => upgradeBillingMutation.mutate({ projectId, mode: "upgrade" })}
                                disabled={upgradeBillingMutation.isPending
                                    || upgradeBillingMutation.isSuccess
                                    || manageBillingMutation.isPending}
                            >
                                {(upgradeBillingMutation.isPending || upgradeBillingMutation.isSuccess) ? <>
                                    <SpinningLoader />
                                    One sec...
                                </> : "Upgrade Now"}
                            </Button>
                        }
                    </div>}

                <div className="col-span-full border rounded-xl p-8 grid gap-4">
                    <h3 className="col-span-full text-lg font-medium">
                        Breakdown by Workflow
                    </h3>
                    <Table>
                        <TableHeader>
                            <TableRow className="*:whitespace-nowrap">
                                <TableHead>Workflow</TableHead>
                                <TableHead className="text-center">Runs</TableHead>
                                <TableHead className="text-center">% of Total Runs</TableHead>
                                <TableHead className="text-center">% of Limit</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usage?.runCountByWorkflow
                                .sort((a, b) => a.id == null ? 1 : b.id == null ? -1 : b.run_count - a.run_count)
                                .map(wf => (
                                    <TableRow key={wf.id}>
                                        <TableCell className="min-w-[240px]">
                                            {wf.name ?? <span className="text-muted-foreground">Deleted</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {numberFormatter.format(wf.run_count)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {percentFormatter.format(wf.run_count / runCount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {percentFormatter.format(wf.run_count / runLimit)}
                                        </TableCell>
                                        <TableCell className="w-full">
                                            <SimpleTooltip
                                                tooltip={`${numberFormatter.format(wf.run_count)} runs`}
                                                contentProps={{ align: "start" }}
                                            >
                                                <div
                                                    className="bg-primary min-w-5 h-4 rounded-full"
                                                    style={{
                                                        width: `${100 * wf.run_count / maxRunCount}%`,
                                                    }}
                                                />
                                            </SimpleTooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </ProjectDashboardLayout>
    )
}

const numberFormatter = new Intl.NumberFormat(undefined, {
    style: "decimal",
})

const percentFormatter = new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumSignificantDigits: 2,
    maximumSignificantDigits: 2,
})