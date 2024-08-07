import { IconDots, IconExternalLink, IconPencil, IconRouteSquare2, IconTrash, IconUsers } from "@tabler/icons-react"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@ui/chart"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import TI from "@web/components/tabler-icon"
import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { plural } from "@web/lib/grammar"
import { useCurrentProjectId } from "@web/lib/hooks"
import { getPlanData } from "@web/lib/plans"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import { Link } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"


export default function ProjectOverview() {

    const projectId = useCurrentProjectId()
    const project = trpc.projects.byId.useQuery({ id: projectId }).data!
    const planData = getPlanData(project.billing_plan)
    const { data: overview } = trpc.projects.overview.useQuery({ id: projectId })

    const hasNoWorkflows = overview?.workflowCount === 0

    return (
        <ProjectDashboardLayout currentSegment="Overview">
            <div className="grid grid-cols-6 gap-8">
                <div className="col-span-full flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-medium">
                                {project.name}
                            </h1>
                            <Badge className={cn("pointer-events-none shadow-none", planData.badgeClassName)}>
                                {planData.name}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-muted-foreground hover:*:underline">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="workflows">
                                            {overview?.workflowCount ?? "..."} {plural("workflow", overview?.workflowCount ?? 0)}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Go to Workflows</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="team">
                                            {overview?.memberCount ?? "..."} {plural("member", overview?.memberCount ?? 0)}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Manage Team</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-2xl"><TI><IconDots /></TI></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end" className="*:flex *:items-center *:gap-2 w-[240px]">
                            <DropdownMenuItem>
                                <TI><IconPencil /></TI>
                                Rename Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                                <TI><IconTrash /></TI>
                                Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="col-span-full bg-gradient-to-tr from-violet-600 to-pink-700 p-8 rounded-xl text-white flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">
                        {hasNoWorkflows ? "Get started with Workflows" : "Create a Workflow"}
                    </h2>
                    <p>
                        Workflows are the core of your project. They are a series of actions composing advanced logic that run in response to a trigger. They are powerful tools that can automate a wide range of tasks.
                    </p>
                    <div className="flex justify-between items-center gap-4 mt-4">
                        <Button asChild variant="secondary" className="flex-center gap-2">
                            <Link to="workflows/create">
                                <TI><IconRouteSquare2 /></TI>
                                Create a Workflow
                            </Link>
                        </Button>
                        <Button asChild variant="link" className="flex-center gap-2 text-white opacity-75 hover:opacity-100">
                            <a href="https://learn.workflow.dog/workflows" target="_blank">
                                Learn more about Workflows
                                <TI><IconExternalLink /></TI>
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="col-span-3 bg-gray-100 border rounded-xl p-8 flex flex-col gap-2">
                    <h3 className="font-medium text-xl">
                        Recent activity
                    </h3>
                    <p className="text-muted-foreground">
                        Any workflow run that had at least one error is considered an error.
                    </p>
                    <RecentActivityChart />
                    <Button asChild variant="outline" className="self-start flex-center gap-2 mt-4">
                        <Link to="workflows">
                            <TI><IconRouteSquare2 /></TI>
                            View Workflows
                        </Link>
                    </Button>
                </div>

                <div className="col-span-3 bg-gray-100 border rounded-xl p-8 flex flex-col gap-2">
                    <h3 className="font-medium text-xl">
                        Invite people to your project
                    </h3>
                    <p className="text-muted-foreground">
                        Add team members to your project to collaborate on workflows and automate tasks together.
                    </p>
                    <Button asChild variant="outline" className="self-start flex-center gap-2 mt-4">
                        <Link to="team">
                            <TI><IconUsers /></TI>
                            Manage Team
                        </Link>
                    </Button>
                </div>
            </div>

        </ProjectDashboardLayout>
    )
}



const chartData = [
    { date: "2024-07-20", success: 173, error: 10 },
    { date: "2024-07-21", success: 186, error: 80 },
    { date: "2024-07-22", success: 305, error: 200 },
    { date: "2024-07-23", success: 237, error: 120 },
    { date: "2024-07-24", success: 73, error: 190 },
    { date: "2024-07-25", success: 209, error: 130 },
    { date: "2024-07-26", success: 214, error: 140 },
]

const chartConfig = {
    success: {
        label: "Successful",
        color: "var(--color-green-600)",
    },
    error: {
        label: "Had >1 error",
        color: "var(--color-red-500)",
    },
} satisfies ChartConfig

function RecentActivityChart() {
    return (
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={true}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                    dataKey="success"
                    stackId="a"
                    fill="var(--color-success)"
                // radius={[0, 0, 4, 4]}
                />
                <Bar
                    dataKey="error"
                    stackId="a"
                    fill="var(--color-error)"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
}