import { zodResolver } from "@hookform/resolvers/zod"
import { useLocalStorageValue } from "@react-hookz/web"
import { IconArrowRight, IconBook, IconBrandXFilled, IconChartLine, IconCheck, IconCopy, IconDots, IconExternalLink, IconListDetails, IconMail, IconMoneybag, IconPencil, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlus, IconPointFilled, IconPuzzle, IconReport, IconRouteSquare2, IconScript, IconTrash, IconUsers } from "@tabler/icons-react"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@ui/chart"
import AccountMenu from "@web/components/account-menu"
import ConfirmDialog from "@web/components/confirm-dialog"
import { BrandLink, FeedbackButton } from "@web/components/dashboard-header"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import ProjectSelector from "@web/components/project-selector"
import RenameWorkflowDialog from "@web/components/rename-workflow-dialog"
import SearchInput from "@web/components/search-input"
import SimpleTooltip from "@web/components/simple-tooltip"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@web/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@web/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@web/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import dayjs from "@web/lib/dayjs"
import { plural } from "@web/lib/grammar"
import { useCurrentProject, useCurrentProjectId, useDialogState, useSearch } from "@web/lib/hooks"
import { getPlanData } from "@web/lib/plans"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import type { ApiRouterOutput } from "api/trpc/router"
import { PROJECT_NAME_SCHEMA, WORKFLOW_NAME_SCHEMA } from "core/schemas"
import _ from "lodash"
import React, { forwardRef, useEffect, useMemo, useState } from "react"
import { Helmet } from "react-helmet"
import { useForm } from "react-hook-form"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { ClientEventTypes } from "workflow-packages/client"
import type { ClientEventType } from "workflow-packages/types/client"
import { z } from "zod"
// import { ClientEventTypes } from "workflow-packages/client"


// #region Layout
function Layout() {
    const projectId = useCurrentProjectId()

    useEffect(() => {
        localStorage.setItem("currentProjectId", projectId)
    }, [projectId])

    const { data: project, isLoading, isSuccess } = useCurrentProject()

    return <>
        <Helmet>
            <title>{project?.name ?? "Project"} - WorkflowDog</title>
        </Helmet>
        <div className="grid h-screen place-items-stretch" style={{
            gridTemplateRows: "auto 1fr",
            gridTemplateColumns: "auto 1fr",
        }}>
            <div className="row-span-full border-r grid grid-flow-row auto-rows-auto gap-10" style={{
                gridTemplateRows: "auto 1fr",
            }}>
                <div className="flex-center p-4">
                    <BrandLink withTitle href="/projects" className="text-lg" />
                </div>

                <nav className="flex flex-col items-stretch w-[240px]">
                    <NavGroup>
                        <NavButton to="" end icon={IconReport}>
                            Project Overview
                        </NavButton>
                    </NavGroup>
                    <NavGroup title="Build">
                        <NavButton to="workflows" icon={IconRouteSquare2}>
                            Workflows
                        </NavButton>
                        <NavButton to="integrations" icon={IconPuzzle}>
                            Integrations
                        </NavButton>
                    </NavGroup>
                    <NavGroup title="Learn">
                        <NavButton to="https://learn.workflow.dog" icon={IconBook} external>
                            Getting Started
                        </NavButton>
                        <NavButton to="https://learn.workflow.dog" icon={IconScript} external>
                            Docs
                        </NavButton>
                    </NavGroup>
                    <NavGroup title="Settings">
                        <NavButton to="team" icon={IconUsers}>
                            Team
                        </NavButton>
                        <NavButton to="usage" icon={IconChartLine}>
                            Usage
                        </NavButton>
                        <NavButton to="billing" icon={IconMoneybag}>
                            Billing
                        </NavButton>
                    </NavGroup>
                </nav>

                <p className="text-muted-foreground text-xs text-center p-2 mb-4">
                    🔥 Made by{" "}
                    <a href="https://x.com/ZachSents" target="_blank" className="inline-flex items-center gap-1 hover:underline">
                        Zach Sents
                        <TI><IconExternalLink /></TI>
                    </a>
                </p>
            </div>

            <div className="flex items-stretch justify-between gap-4 p-2 border-b">
                <div className="flex items-stretch gap-2 *:shrink-0">
                    <SimpleTooltip tooltip="All Projects">
                        <Button variant="ghost" size="icon" asChild className="h-auto text-lg text-muted-foreground">
                            <Link to="/projects">
                                <TI><IconListDetails /></TI>
                            </Link>
                        </Button>
                    </SimpleTooltip>
                    <ProjectSelector />
                </div>

                <div className="flex items-center justify-end gap-6 pr-6">
                    <FeedbackButton />
                    <AccountMenu />
                </div>
            </div>

            {isLoading
                ? <SpinningLoader className="text-xl" />
                : isSuccess
                    ? <div className="overflow-y-scroll">
                        <Outlet />
                    </div>
                    : <div className="flex-center text-center text-muted-foreground">
                        <p>There was a problem loading your project.</p>
                    </div>}
        </div>
    </>
}


function NavGroup({ children, title, withBorder = false }: { children: any, title?: string, withBorder?: boolean }) {
    return (
        <div>
            {title &&
                <p className="text-left uppercase font-bold text-xs bg-gray-200 text-muted-foreground px-2 py-1">
                    {title}
                </p>}
            <div className={cn("flex flex-col items-stretch gap-1 p-2", withBorder && "border-b")}>
                {children}
            </div>
        </div>
    )
}


interface NavButtonProps {
    icon: React.ComponentType
    children: any
    external?: boolean
}

const NavButton = forwardRef<HTMLAnchorElement, NavButtonProps & React.ComponentProps<typeof NavLink>>(({
    icon: Icon,
    external,
    children,
    ...props
}, ref) =>
    <Button
        variant="ghost" size="default" asChild
        className="justify-start text-md items-center gap-2 h-auto py-1.5 [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:font-bold transition-colors"
    >
        <NavLink {...props} target={props.target ?? (external ? "_blank" : undefined)} ref={ref}>
            <TI className="text-[1.15em] shrink-0"><Icon /></TI>
            <div className="grow text-wrap">
                {children}
            </div>
            {external && <TI className="shrink-0 text-muted-foreground"><IconExternalLink /></TI>}
        </NavLink>
    </Button>
)
// #endregion Layout


// #region Index
function Index({ deleting }: { deleting?: boolean }) {

    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data!
    const planData = getPlanData(project.billing_plan)
    const { data: overview } = trpc.projects.overview.useQuery({ projectId })

    const hasNoWorkflows = overview?.workflowCount === 0

    const renameDialog = useDialogState()

    const recentRunsData = useMemo<RecentRunsDataPoint[]>(() => {
        if (!overview?.recentRunResults)
            return []
        return Object.entries(
            _.groupBy(overview.recentRunResults, r => r.started_at.toLocaleDateString())
        ).map(([date, runs]) => ({
            date: new Date(date),
            success: runs.filter(r => r.error_count === 0).length,
            error: runs.filter(r => r.error_count > 0).length,
        })).sort((a, b) => a.date.getTime() - b.date.getTime())
    }, [overview?.recentRunResults])
    // WILO: redoing so i can make sure there's a bin for each day,
    // even if there's no data for that day.

    return (
        <ProjectDashboardLayout currentSegment="Overview">
            <div className="grid grid-cols-6 gap-8 pb-24">
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
                            <DropdownMenuItem onSelect={renameDialog.open}>
                                <TI><IconPencil /></TI>
                                Rename Project
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-red-600">
                                <Link to="delete" replace preventScrollReset>
                                    <TI><IconTrash /></TI>
                                    Delete Project
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <GetStartedWithWorkflows
                    hasNoWorkflows={hasNoWorkflows}
                    className="col-span-full"
                />

                <div className="col-span-3 bg-gray-100 border rounded-xl p-8 flex flex-col gap-2">
                    <h3 className="font-medium text-xl">
                        Recent activity
                    </h3>
                    <p className="text-muted-foreground">
                        Any workflow run that had at least one error is considered an error.
                    </p>
                    <RecentActivityChart data={recentRunsData} />
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

                <div className="col-span-full border rounded-xl p-8 flex items-center gap-8">
                    <img src="/logo.svg" className="row-span-full h-20 px-4" />

                    <div className="flex-1 min-w-0 grid gap-2">
                        <h4 className="text-lg font-medium">Thanks for checking out WorkflowDog!</h4>
                        <p>
                            It's my goal to create a seriously smooth automation experience, but sometimes things break. If you have issues, please let me know.
                        </p>
                        <div className="grid grid-flow-col auto-cols-fr gap-4 mt-4">
                            <SimpleTooltip tooltip="Copy Email Address" contentProps={{ side: "right" }}>
                                <Button
                                    variant="secondary" className="gap-2 text-primary"
                                    onClick={() => {
                                        navigator.clipboard.writeText("info@workflow.dog")
                                        toast.success("Copied to clipboard!")
                                    }}
                                >
                                    <TI><IconMail /></TI>
                                    info@workflow.dog
                                    <TI className="text-muted-foreground ml-4"><IconCopy /></TI>
                                </Button>
                            </SimpleTooltip>
                            <Button variant="secondary" className="gap-2" asChild>
                                <a href="https://x.com/ZachSents" target="_blank">
                                    <TI><IconBrandXFilled /></TI>
                                    @ZachSents
                                    <TI className="text-muted-foreground ml-4"><IconExternalLink /></TI>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteProjectDialog open={deleting} />
            <RenameProjectDialog {...renameDialog.dialogProps} />
        </ProjectDashboardLayout>
    )
}


function DeleteProjectDialog(props: React.ComponentProps<typeof Dialog>) {

    const utils = trpc.useUtils()
    const navigate = useNavigate()
    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data!

    const cancelDelete = () => {
        navigate(`/projects/${projectId}`, {
            replace: true,
            preventScrollReset: true,
        })
    }

    const [inputValue, setInputValue] = useState("")
    const isCorrect = inputValue.toLowerCase().trim() === project.name.toLowerCase().trim()

    const deleteProject = trpc.projects.delete.useMutation({
        onSuccess: () => {
            toast.success("Project deleted!")
            navigate("/projects", { replace: true })
            utils.projects.list.invalidate()
        },
    })

    return (
        <Dialog
            {...props}
            onOpenChange={isOpen => {
                if (!isOpen) cancelDelete()
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete your project and all associated workflows, integrations, and other data. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-2" onSubmit={ev => {
                    ev.preventDefault()
                    if (isCorrect)
                        deleteProject.mutate({ projectId })
                }}>
                    <Label htmlFor="delete-project" className="flex items-center gap-2">
                        <span>Type</span>
                        <span className="font-mono bg-gray-100 border rounded-sm px-2 py-1">
                            {project.name}
                        </span>
                        <span>to confirm</span>
                    </Label>
                    <Input
                        id="delete-project"
                        value={inputValue} onChange={e => setInputValue(e.target.value)}
                        placeholder={project.name}
                    />
                    <DialogFooter className="mt-2">
                        <Button variant="ghost" onClick={cancelDelete} type="button">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="gap-2"
                            disabled={!isCorrect || deleteProject.isPending}
                            type="submit"
                        >
                            {deleteProject.isPending
                                ? <>
                                    <SpinningLoader />
                                    Deleting...
                                </>
                                : "Delete Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const renameProjectSchema = z.object({
    projectName: PROJECT_NAME_SCHEMA,
})

function RenameProjectDialog(props: React.ComponentProps<typeof Dialog>) {

    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data
    const utils = trpc.useUtils()

    const form = useForm<z.infer<typeof renameProjectSchema>>({
        resolver: zodResolver(renameProjectSchema),
        values: {
            projectName: project?.name ?? "",
        },
    })

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) form.reset()
        props.onOpenChange?.(isOpen)
    }

    const renameProject = trpc.projects.rename.useMutation({
        onSuccess: () => {
            toast.success("Project renamed!")
            utils.projects.list.invalidate()
            utils.projects.byId.invalidate({ projectId })
            onOpenChange(false)
            form.reset()
        },
    })

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Rename Project
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="grid gap-4"
                        onSubmit={form.handleSubmit(values => renameProject.mutateAsync({
                            projectId,
                            name: values.projectName,
                        }))}
                    >
                        <FormField
                            name="projectName"
                            control={form.control}
                            render={({ field }) =>
                                <FormItem>
                                    <FormDescription>
                                        Write a new name for your project.
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder={project?.name}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }
                        />

                        <DialogFooter className="mt-2">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="gap-2"
                                disabled={renameProject.isPending}
                                type="submit"
                            >
                                {renameProject.isPending
                                    ? <>
                                        <SpinningLoader />
                                        Renaming...
                                    </>
                                    : "Rename Project"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


type RecentRunsDataPoint = {
    date: Date
    success: number
    error: number
}

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

function RecentActivityChart({ data }: {
    data: RecentRunsDataPoint[]
}) {
    return (
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
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
                // radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="error"
                    stackId="a"
                    fill="var(--color-error)"
                // radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
}
// #endregion Index


// #region Workflows
function Workflows() {

    const projectId = useCurrentProjectId()
    const { data: workflows, isPending } = trpc.workflows.list.useQuery({ projectId })

    const search = useSearch(workflows ?? [], {
        keys: ["name"],
        threshold: 0.4,
    })

    const groupSearchSetting = useLocalStorageValue("workflowSearchGroupingSetting", {
        defaultValue: "byTrigger",
        initializeWithValue: true,
    })

    const resultsByTrigger = useMemo(
        () => groupSearchSetting.value === "byTrigger"
            ? _.groupBy(_.sortBy(search.filtered, ["trigger_event_type_id", "name"]), "trigger_event_type_id")
            : {},
        [search.filtered, groupSearchSetting.value]
    )

    return (
        <ProjectDashboardLayout currentSegment="Workflows">
            <div className="flex flex-col items-stretch gap-8">
                <div className="col-span-full flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Workflows</h1>
                    {(workflows && workflows.length > 0) ?
                        <Button asChild className="gap-2">
                            <Link to="create">
                                <TI><IconPlus /></TI>
                                Create a workflow
                            </Link>
                        </Button> : null}
                </div>

                {isPending
                    ? <SpinningLoader className="mx-auto my-10" />
                    : workflows
                        ? <>
                            {workflows.length === 0 &&
                                <GetStartedWithWorkflows hasNoWorkflows />}

                            {(workflows.length > 0 || true) &&
                                <div className="grid gap-2" style={{
                                    gridTemplateColumns: "1fr auto",
                                }}>
                                    <SearchInput
                                        value={search.query}
                                        onValueChange={search.setQuery}
                                        quantity={workflows.length}
                                        noun="workflow"
                                        withHotkey
                                        className="shadow-none"
                                    />
                                    <Tabs
                                        value={groupSearchSetting.value}
                                        onValueChange={groupSearchSetting.set}
                                    >
                                        <TabsList className="grid grid-flow-col auto-cols-fr">
                                            <TabsTrigger value="byTrigger">
                                                By Trigger
                                            </TabsTrigger>
                                            <TabsTrigger value="all">
                                                All
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>}

                            {search.filtered.length > 0
                                ? groupSearchSetting.value === "byTrigger"
                                    ? <div className="grid gap-8">
                                        {Object.entries(resultsByTrigger)
                                            .map(([triggerId, workflows]) =>
                                                <div key={triggerId} className="grid gap-4">
                                                    <h2 className="text-xl font-bold flex items-center gap-4">
                                                        <span>{ClientEventTypes[triggerId]?.name ?? "Unknown trigger"}</span>
                                                        <span className="text-muted-foreground text-sm font-normal">
                                                            {ClientEventTypes[triggerId]?.whenName ?? null}
                                                        </span>
                                                    </h2>
                                                    <div className="grid">
                                                        {workflows.map(workflow =>
                                                            <WorkflowResultCard
                                                                key={workflow.id}
                                                                workflow={workflow}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                    : <div className="grid">
                                        {search.filtered.map(workflow =>
                                            <WorkflowResultCard
                                                key={workflow.id}
                                                workflow={workflow}
                                                withTrigger
                                            />
                                        )}
                                    </div>
                                : <p className="text-center text-sm text-muted-foreground">
                                    No workflows found
                                </p>}
                        </>
                        : <p className="text-center py-8 text-sm text-muted-foreground">
                            There was a problem loading your workflows.
                        </p>}
            </div>
        </ProjectDashboardLayout>
    )
}
// #endregion Workflows

interface WorkflowResultCardProps {
    workflow: ApiRouterOutput["workflows"]["list"][number]
    withTrigger?: boolean
}

function WorkflowResultCard({ workflow, withTrigger }: WorkflowResultCardProps) {

    const workflowId = workflow.id
    const utils = trpc.useUtils()

    const setEnabledMutation = trpc.workflows.setEnabled.useMutation()

    const setEnabled = (isEnabled?: boolean) => {
        const promise = setEnabledMutation.mutateAsync({
            workflowId,
            isEnabled,
        }).then(() => Promise.all([
            utils.workflows.list.invalidate(),
            utils.workflows.byId.invalidate({ workflowId }),
        ]))

        toast.promise(promise, {
            loading: isEnabled ? "Enabling..." : "Pausing...",
            success: isEnabled ? "Workflow enabled!" : "Workflow paused!",
            error: "Something went wrong.",
        })
    }

    const renameDialog = useDialogState()
    const deleteDialog = useDialogState()

    const deleteWorkflow = trpc.workflows.delete.useMutation({
        onSuccess: () => {
            toast.success("Workflow deleted!")
            utils.workflows.list.invalidate()
        },
    })

    return (<>
        <Link
            to={`/workflows/${workflow.id}`}
            className="group p-3 grid items-center gap-2 shadow-none border-t border-x last:border-b first:rounded-t-lg last:rounded-b-lg"
            style={{
                gridTemplateColumns: "auto 1fr 180px auto auto",
            }}
        >
            <SimpleTooltip
                tooltip={workflow.is_enabled
                    ? "Live - Ready to run"
                    : "Paused"}
                triggerProps={{
                    asChild: false,
                    className: cn("w-[2em] flex-center py-2", setEnabledMutation.isPending && "pointer-events-none opacity-50"),
                }}
            >
                {workflow.is_enabled
                    ? <TI className="text-green-600"><IconPointFilled /></TI>
                    : <TI className="text-gray-600"><IconPlayerPauseFilled /></TI>}
            </SimpleTooltip>

            <div>
                <p className="font-medium">
                    {workflow.name}
                </p>
                {withTrigger &&
                    <p className="text-muted-foreground text-sm">
                        {ClientEventTypes[workflow.trigger_event_type_id]?.whenName ?? "Unknown trigger"}
                    </p>}
            </div>

            <p className="text-muted-foreground text-sm px-2">
                {workflow.last_edited_at && workflow.last_edited_at.getTime() > 0
                    ? `Last ran ${dayjs(workflow.last_edited_at).fromNow()}`
                    : "Never ran"}
            </p>

            <Button
                size="compact" variant="secondary"
                className="gap-1 group-hover:text-primary"
            >
                Open Workflow
                <TI><IconArrowRight /></TI>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost" size="icon"
                        className="text-md"
                        onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                    >
                        <TI><IconDots /></TI>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="bottom" align="end"
                    className="*:flex *:items-center *:gap-2 w-[240px]"
                    onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    {!setEnabledMutation.isPending && (workflow.is_enabled
                        ? <DropdownMenuItem onSelect={() => setEnabled(false)}>
                            <TI><IconPlayerPauseFilled /></TI>
                            Pause Workflow
                        </DropdownMenuItem>
                        : <DropdownMenuItem
                            className="text-green-600"
                            onSelect={() => setEnabled(true)}
                        >
                            <TI><IconPlayerPlayFilled /></TI>
                            Enable Workflow
                        </DropdownMenuItem>)}
                    <DropdownMenuSeparator className="first:hidden" />
                    <DropdownMenuItem onSelect={renameDialog.open}>
                        <TI><IconPencil /></TI>
                        Rename Workflow
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onSelect={deleteDialog.open}>
                        <TI><IconTrash /></TI>
                        Delete Workflow
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Link>
        <RenameWorkflowDialog workflow={workflow} {...renameDialog.dialogProps} />
        <ConfirmDialog
            {...deleteDialog.dialogProps}
            description="This will permanently delete your workflow and all associated runs, triggers, and other data. This action cannot be undone."
            confirmText="Delete Workflow" confirmingText="Deleting" destructive
            onConfirm={async () => void await deleteWorkflow.mutateAsync({ workflowId: workflow.id })}
            isPending={deleteWorkflow.isPending || deleteWorkflow.isSuccess}
        />
    </>)
}



// #region CreateWorkflow
const createWorkflowSchema = z.object({
    workflowName: WORKFLOW_NAME_SCHEMA,
    triggerEventTypeId: z.string().min(1, "You must select a trigger."),
})

const eventTypeSearchList = Object.values(ClientEventTypes)
    .map(evt => ({
        ...evt,
        package: evt.id.split("/")[0],
    }))

const mostPopularTriggers = [
    "primitives/callable",
    "primitives/schedule",
    "primitives/webhook",
]

function CreateWorkflow() {

    const projectId = useCurrentProjectId()
    const utils = trpc.useUtils()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof createWorkflowSchema>>({
        resolver: zodResolver(createWorkflowSchema),
        defaultValues: {
            workflowName: "",
            triggerEventTypeId: "",
        },
    })

    const createWorkflow = trpc.workflows.create.useMutation({
        onSuccess: ({ id: workflowId }) => {
            toast.success("Workflow created!")
            navigate(`/workflows/${workflowId}`)
            utils.workflows.list.invalidate()
        },
    })

    async function handleSubmit({ workflowName, ...values }: z.infer<typeof createWorkflowSchema>) {
        await createWorkflow.mutateAsync({
            projectId,
            name: workflowName,
            ...values,
        })
    }

    const triggerSearch = useSearch(eventTypeSearchList, {
        keys: [{ name: "name", weight: 2 }, "whenName", "keywords", "package"],
        threshold: 0.4,
    })

    const triggerValue = form.watch("triggerEventTypeId")
    const selectedTrigger = !!triggerValue && ClientEventTypes[triggerValue]

    return (
        <ProjectDashboardLayout
            currentSegment="Create a Workflow"
            preceedingSegments={[{ label: "Workflows", href: `/projects/${projectId}/workflows` }]}
        >
            <div className="flex flex-col items-stretch gap-8">
                <div className="col-span-full flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Create a Workflow</h1>
                </div>

                <Form {...form}>
                    <form
                        className="grid gap-12 max-w-lg self-center w-full"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="workflowName"
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel className="text-md">Workflow Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Extract shipping information from new emails"
                                            {...field}
                                            autoFocus
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }
                        />

                        <FormField
                            control={form.control}
                            name="triggerEventTypeId"
                            render={({ field }) =>
                                <FormItem className="space-y-0 grid gap-6">
                                    <div className="grid gap-2">
                                        <FormLabel className="text-md">Trigger</FormLabel>
                                        <FormMessage />
                                    </div>

                                    <div className={cn(
                                        "relative h-[8rem] flex-center gap-4 px-8 rounded-xl",
                                        triggerValue
                                            ? "outline outline-primary"
                                            : "outline-dashed outline-gray-500 outline-1",
                                    )}>
                                        {selectedTrigger
                                            ? <>
                                                <div
                                                    className="shrink-0 flex-center text-white text-2xl p-2 rounded-lg"
                                                    style={{ backgroundColor: selectedTrigger.color }}
                                                >
                                                    <TI><selectedTrigger.icon /></TI>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium mb-1">
                                                        {selectedTrigger.whenName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedTrigger.description}
                                                    </p>
                                                </div>

                                                <div className="p-1 bg-primary text-white rounded-full flex-center absolute hack-center-y left-0 translate-x-[calc(-50%-2px)]">
                                                    <TI><IconCheck /></TI>
                                                </div>
                                            </>
                                            : <p className="text-sm text-muted-foreground text-center py-4">
                                                Select a trigger
                                            </p>}
                                    </div>

                                    <SearchInput
                                        value={triggerSearch.query}
                                        onValueChange={triggerSearch.setQuery}
                                        quantity={eventTypeSearchList.length}
                                        noun="trigger"
                                        className="shadow-none"
                                    />

                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="space-y-0 grid gap-4"
                                        >
                                            {triggerSearch.query
                                                ? triggerSearch.filtered.filter(t => t.id !== triggerValue).map(trigger =>
                                                    <TriggerResultCard key={trigger.id} trigger={trigger} />
                                                )
                                                : <div className="grid gap-2">
                                                    <p className="text-sm font-bold">
                                                        Commonly used triggers
                                                    </p>
                                                    <div className="grid gap-4">
                                                        {mostPopularTriggers.filter(t => t !== triggerValue).map(triggerId =>
                                                            <TriggerResultCard
                                                                key={triggerId}
                                                                trigger={ClientEventTypes[triggerId]}
                                                            />
                                                        )}
                                                    </div>
                                                </div>}
                                        </RadioGroup>
                                    </FormControl>

                                    {triggerSearch.filtered.length === 0 && !!triggerSearch.query &&
                                        <p className="text-center text-sm text-muted-foreground py-4">
                                            No triggers found
                                        </p>}
                                </FormItem>
                            }
                        />

                        <div className="grid gap-4 " style={{
                            gridTemplateColumns: "auto 1fr",
                        }}>
                            <Button
                                variant="ghost" type="button"
                                className="self-end gap-2"
                                onClick={() => window.history.back()}
                                disabled={createWorkflow.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="self-end gap-2"
                                disabled={createWorkflow.isPending}
                            >
                                {createWorkflow.isPending ? <>
                                    <SpinningLoader />
                                    Creating Workflow
                                </> : <>
                                    <TI><IconCheck /></TI>
                                    Create Workflow
                                </>}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ProjectDashboardLayout>
    )
}

function TriggerResultCard({ trigger, isSelected }: { trigger: ClientEventType, isSelected?: boolean }) {
    return (
        <FormItem className="space-y-0" key={trigger.id}>
            <FormControl className="hidden">
                <RadioGroupItem value={trigger.id} />
            </FormControl>
            <FormLabel className={cn(
                "relative flex items-center gap-4 border px-8 py-4 rounded-xl cursor-pointer outline outline-transparent transition-all",
                isSelected ? "outline-primary" : "hover:bg-gray-50",
            )}>
                <div
                    className="flex-center text-white text-2xl p-2 rounded-lg"
                    style={{ backgroundColor: trigger.color }}
                >
                    <TI><trigger.icon /></TI>
                </div>
                <div>
                    <p className="font-medium mb-1">
                        {trigger.whenName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {trigger.description}
                    </p>
                </div>

                <div className={cn(
                    "p-1 bg-primary text-white rounded-full flex-center absolute hack-center-y left-0 translate-x-[calc(-50%-2px)] opacity-0 transition-opacity",
                    isSelected && "opacity-100",
                )}>
                    <TI><IconCheck /></TI>
                </div>
            </FormLabel>
        </FormItem>
    )
}
// #endregion CreateWorkflow


const GetStartedWithWorkflows = forwardRef<
    HTMLDivElement,
    Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
        hasNoWorkflows?: boolean
    }
>(({ hasNoWorkflows, ...props }, ref) => {
    const projectId = useCurrentProjectId()
    return (
        <div
            {...props}
            ref={ref}
            className={cn("bg-gradient-to-tr from-violet-600 to-pink-700 p-8 rounded-xl text-white flex flex-col gap-2", props.className)}
        >
            <h2 className="text-2xl font-bold">
                {hasNoWorkflows ? "Get started with Workflows" : "Create a Workflow"}
            </h2>
            <p>
                Workflows are the core of your project. They are a series of actions composing advanced logic that run in response to a trigger. They are powerful tools that can automate a wide range of tasks.
            </p>
            <div className="flex justify-between items-center gap-4 mt-4">
                <Button asChild variant="secondary" className="flex-center gap-2">
                    <Link to={`/projects/${projectId}/workflows/create`}>
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
    )
})

const Project = { Layout, Index, Workflows, CreateWorkflow }
export default Project