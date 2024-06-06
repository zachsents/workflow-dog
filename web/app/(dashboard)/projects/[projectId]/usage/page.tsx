import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { Progress } from "@web/components/ui/progress"
import { Separator } from "@web/components/ui/separator"
import { getPlanData } from "@web/lib/client/plans"
import { userHasProjectPermission } from "@web/lib/server/auth-checks"
import { db } from "@web/lib/server/db"
import { countProjectMembers, countWorkflowRunsInBillingPeriod, getProjectBilling } from "@web/lib/server/internal"
import { getVerifiedSession } from "@web/lib/server/supabase"
import { cn } from "@web/lib/utils"
import Link from "next/link"
import { Fragment } from "react"
import { TbConfetti, TbMail } from "react-icons/tb"


export default async function UsagePage({
    params: { projectId },
}: {
    params: { projectId: string }
}) {
    const {
        billing,
        memberCount,
        workflowRunsCount,
        canWriteProject,
    } = await loadPageData(projectId)

    const workflowRunsPercent = Math.min(
        Math.floor(workflowRunsCount / billing.limits.workflowRuns * 100),
        100,
    )
    const memberPercent = Math.min(
        Math.floor(memberCount / billing.limits.teamMembers * 100),
        100,
    )

    const planData = getPlanData(billing.plan)
    const upsellPlanData = planData.upsell
        ? getPlanData(planData.upsell)
        : null
    const fmt = new Intl.NumberFormat()

    return (<>
        <h1 className="text-2xl font-bold">
            Usage
        </h1>

        <div className="grid grid-cols-2 gap-6">
            <div className={canWriteProject ? "row-span-2" : "col-span-full"}>
                <Card className="p-6 flex-v items-stretch gap-4 shadow-lg h-full">
                    <p className="font-bold text-lg">
                        Summary
                    </p>

                    <Separator />

                    <div className="flex-v items-stretch gap-2">
                        <p className="font-bold">
                            Workflow Runs
                        </p>

                        <Progress value={workflowRunsPercent} className="h-3" />
                        <div className="flex between text-muted-foreground px-2">
                            <p className="flex items-center gap-2">
                                <span className="font-bold">
                                    {fmt.format(workflowRunsCount)}
                                </span>
                                <span>/</span>
                                <span>
                                    {fmt.format(billing.limits.workflowRuns)} runs this month
                                </span>
                            </p>
                            <p>
                                {workflowRunsPercent}%
                            </p>
                        </div>

                        <p className="px-2 text-muted-foreground text-sm">
                            Resets on {billing.period.end.toLocaleDateString(undefined, {
                                dateStyle: "medium",
                            })}
                        </p>
                    </div>

                    <Separator />

                    <div className="flex-v items-stretch gap-2">
                        <p className="font-bold">
                            Team Members
                        </p>

                        <Progress value={memberPercent} className="h-3" />
                        <p className="flex items-center gap-2 px-2 text-muted-foreground">
                            <span className="font-bold">
                                {fmt.format(memberCount)}
                            </span>
                            <span>/</span>
                            <span>
                                {fmt.format(billing.limits.teamMembers)} team members
                            </span>
                        </p>
                    </div>

                    <Separator />
                </Card>
            </div>

            {canWriteProject && <>
                <Card className="p-6 flex-v items-stretch gap-4 shadow-lg">
                    <div className="flex between gap-4">
                        <p className=" font-bold text-lg">
                            Current Plan
                        </p>

                        <div
                            className={cn(
                                "flex center gap-2 text-xl rounded-xl px-6 py-1",
                                planData.badgeClassName,
                            )}
                        >
                            <planData.icon />
                            <p className="uppercase font-bold">
                                {planData.name}
                            </p>
                        </div>
                    </div>

                    <div className="text-muted-foreground">
                        <p>
                            Included in this plan:
                        </p>
                        <ul className="list-disc ml-6">
                            {planData.included.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {planData.showBillingButton &&
                        <Button variant="secondary" asChild>
                            <Link href={`/projects/${projectId}/usage/portal`}>
                                Manage Billing
                            </Link>
                        </Button>}
                </Card>

                <Card className="p-6 flex-v items-stretch gap-4 shadow-lg">
                    <p className="font-bold text-xl">
                        Need some more juice?
                    </p>

                    {upsellPlanData
                        ? <>
                            <div className="text-muted-foreground">
                                <p>
                                    You could enjoy:
                                </p>
                                <ul className="list-disc ml-6">
                                    {upsellPlanData.included.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                size="lg" asChild
                                className="outline outline-amber-400"
                            >
                                <Link
                                    href={`projects/${projectId}/billing/upgrade`}
                                    className="text-md flex center gap-2"
                                >
                                    <TbConfetti />
                                    Upgrade to {upsellPlanData.name}
                                </Link>
                            </Button>
                        </>
                        : <>
                            <p className="text-muted-foreground">
                                You're already on the highest plan we offer!
                            </p>
                            <Button size="lg" asChild className="outline outline-amber-400">
                                <a
                                    href="mailto:info@workflow.dog?subject=We need a custom plan&body=Tell us about your use-cases."
                                    className="flex center gap-2"
                                >
                                    <TbMail />
                                    Reach out for a custom plan
                                </a>
                            </Button>
                        </>}
                </Card>
            </>}

            <div className="col-span-full">
                <UsageByWorkflow
                    projectId={projectId}
                    billingPeriod={billing.period}
                />
            </div>
        </div>
    </>)
}


async function UsageByWorkflow({
    projectId,
    billingPeriod,
}: {
    projectId: string
    billingPeriod: { start: Date, end: Date }
}) {

    const rows = await db.selectFrom("workflow_runs")
        .leftJoin("workflows", "workflow_runs.workflow_id", "workflows.id")
        .select(["workflows.id", "workflows.name"])
        .select(({ fn }) => [fn.countAll<number>().as("count")])
        .where("workflows.project_id", "=", projectId)
        .where("created_at", ">", billingPeriod.start)
        .where("created_at", "<=", billingPeriod.end)
        .groupBy("workflows.id")
        .execute()

    const maxCount = Math.max(
        rows.reduce((max, row) => Math.max(max, row.count), 0),
        10,
    )

    const fmt = new Intl.NumberFormat()

    return (
        <Card className="p-6 flex-v items-stretch gap-8 shadow-lg h-full">
            <p className="font-bold text-lg">
                Usage by Workflow
            </p>

            {rows.length > 0
                ? <div className="grid grid-cols-[220px_auto] gap-x-8 items-center">
                    {rows.map((row, i) =>
                        <Fragment key={row.id}>
                            <div className="border-r py-1">
                                <p className="line-clamp-2">
                                    {row.name || "Deleted"}
                                </p>
                                <p className="text-muted-foreground text-sm text-nowrap">
                                    {fmt.format(row.count)} runs
                                </p>
                            </div>
                            <div
                                className="h-6 bg-violet-600 rounded-sm"
                                style={{
                                    width: `${Math.max(Math.floor(row.count / maxCount * 100), 1)}%`,
                                    opacity: Math.max(0.25, 1 - i * 0.15),
                                }}
                            />
                        </Fragment>
                    )}
                </div>
                : <p className="text-sm text-muted-foreground text-center pb-4">
                    No runs yet since {billingPeriod.start.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                    })}
                </p>}
        </Card>
    )
}


async function loadPageData(projectId: string) {
    const billingReq = getProjectBilling(projectId)
    const memberCountReq = countProjectMembers(projectId)
    const workflowRunsCountReq = billingReq
        .then(b => countWorkflowRunsInBillingPeriod(projectId, b.period.start))
        .then(num => num ?? 0)
    const canWriteProjectReq = getVerifiedSession()
        .then(s => s
            ? userHasProjectPermission(s.user_id, "write").byProjectId(projectId)
            : false)

    await Promise.all([
        billingReq,
        memberCountReq,
        workflowRunsCountReq,
        canWriteProjectReq,
    ])

    return {
        billing: await billingReq,
        memberCount: await memberCountReq,
        workflowRunsCount: await workflowRunsCountReq,
        canWriteProject: await canWriteProjectReq,
    }
}