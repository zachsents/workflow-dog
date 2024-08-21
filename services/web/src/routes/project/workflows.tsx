import { useLocalStorageValue } from "@react-hookz/web"
import { IconArrowRight, IconDots, IconPencil, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlus, IconPointFilled, IconTrash } from "@tabler/icons-react"
import ConfirmDialog from "@web/components/confirm-dialog"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import RenameWorkflowDialog from "@web/components/rename-workflow-dialog"
import SearchInput from "@web/components/search-input"
import SimpleTooltip from "@web/components/simple-tooltip"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@web/components/ui/tabs"
import dayjs from "@web/lib/dayjs"
import { useCurrentProjectId, useDialogState, useSearch } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import type { ApiRouterOutput } from "api/trpc/router"
import _ from "lodash"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ClientEventTypes } from "workflow-packages/client"
import GetStartedWithWorkflows from "./components/get-started-with-workflows"


export default function ProjectWorkflows() {

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
