import { zodResolver } from "@hookform/resolvers/zod"
import { IconBook, IconChartLine, IconDots, IconExternalLink, IconMoneybag, IconPencil, IconPuzzle, IconReport, IconRouteSquare2, IconScript, IconTrash, IconUsers } from "@tabler/icons-react"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@ui/chart"
import AccountMenu from "@web/components/account-menu"
import { BrandLink, FeedbackButton } from "@web/components/dashboard-header"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import ProjectSelector from "@web/components/project-selector"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@web/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { plural } from "@web/lib/grammar"
import { useCurrentProject, useCurrentProjectId, useDialogState } from "@web/lib/hooks"
import { getPlanData } from "@web/lib/plans"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import React, { forwardRef, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"


// #region Layout
function Layout() {
    const projectId = useCurrentProjectId()

    useEffect(() => {
        localStorage.setItem("currentProjectId", projectId)
    }, [projectId])

    const { isLoading, isSuccess } = useCurrentProject()

    return (
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
                        <NavButton to="" icon={IconReport}>
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

            <div className="flex items-stretch justify-between p-2 border-b">
                <ProjectSelector />

                <div className="flex items-center justify-end gap-6">
                    <FeedbackButton />
                    <AccountMenu />
                </div>
            </div>

            {isLoading
                ? <div className="flex-center text-xl gap-2">
                    <SpinningLoader />
                </div>
                : isSuccess
                    ? <div>
                        <Outlet />
                    </div>
                    : <div className="flex-center text-center text-muted-foreground">
                        <p>There was a problem loading your project.</p>
                    </div>}
        </div>
    )
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
    projectName: z.string().min(1).max(120),
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
                    {/* <DialogDescription>
                        This will permanently delete your project and all associated workflows, integrations, and other data. This action cannot be undone.
                    </DialogDescription> */}
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="grid gap-4"
                        onSubmit={form.handleSubmit(values => renameProject.mutateAsync({
                            projectId,
                            name: values.projectName.trim(),
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
// #endregion Index


const Project = { Layout, Index }
export default Project