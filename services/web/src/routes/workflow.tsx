import { IconArrowLeft, IconChevronDown, IconLayoutSidebarLeftExpandFilled, IconPencil, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPointFilled, IconRouteSquare2, IconRun, IconTrash, IconX } from "@tabler/icons-react"
import ConfirmDialog from "@web/components/confirm-dialog"
import RenameWorkflowDialog from "@web/components/rename-workflow-dialog"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { ScrollArea } from "@web/components/ui/scroll-area"
import VerticalDivider from "@web/components/vertical-divider"
import { GBRoot } from "@web/lib/graph-builder/core"
import { useCurrentWorkflow, useCurrentWorkflowId, useDialogState, usePreventUnloadWhileSaving } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Helmet } from "react-helmet"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { ClientEventTypes, ClientNodeDefinitions } from "workflow-packages/client"


function WorkflowIndex() {

    const utils = trpc.useUtils()
    const navigate = useNavigate()

    const workflowId = useCurrentWorkflowId()
    const workflow = useCurrentWorkflow().data

    const renameDialog = useDialogState()
    const deleteDialog = useDialogState()

    const deleteWorkflow = trpc.workflows.delete.useMutation({
        onSuccess: () => {
            toast.success("Workflow deleted!")
            utils.workflows.list.invalidate()
            navigate(workflow ? `/projects/${workflow.project_id}/workflows` : "/app")
        },
    })

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

    const saveGraphMutation = trpc.workflows.saveGraph.useMutation({
        onSuccess: (newData) => {
            utils.workflows.byId.setData({ workflowId }, old => ({
                ...old!,
                ...newData,
            }))
            utils.workflows.list.invalidate()
        },
    })
    const saveGraph = (graph: string) => {
        saveGraphMutation.mutate({
            workflowId, graph,
            clientTimestamp: new Date(),
        })
    }

    usePreventUnloadWhileSaving(saveGraphMutation.isPending)

    return <>
        <Helmet>
            <title>{workflow?.name ?? "Workflow"} - WorkflowDog</title>
        </Helmet>
        {!!workflow &&
            <div
                className="w-screen h-screen bg-gray-700 grid grid-flow-row auto-rows-auto"
                style={{
                    gridTemplateRows: "auto 1fr",
                    gridTemplateColumns: "1fr",
                }}
            >
                <div className="col-span-full text-background p-1 flex items-stretch gap-2">
                    <Button variant="ghost" size="compact" asChild className="gap-2 h-auto">
                        <Link to={`/projects/${workflow.project_id}/workflows`}>
                            <TI><IconArrowLeft /></TI>
                            Back to Workflows
                        </Link>
                    </Button>
                    <VerticalDivider />
                    <DropdownMenu>
                        <DropdownMenuTrigger className="group text-sm px-2 py-1 flex-center gap-2 hover:bg-background/10 rounded-sm transition-colors">
                            <TI><IconRouteSquare2 /></TI>
                            <p>
                                {workflow.name}
                            </p>
                            <TI className="text-muted-foreground group-hover:text-background transition-colors"><IconChevronDown /></TI>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" className="*:flex *:items-center *:gap-2 w-[200px] z-[200]">
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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary" size="compact"
                                disabled={setEnabledMutation.isPending}
                                className="gap-1 self-center"
                            >
                                {workflow.is_enabled ? <>
                                    <TI className="text-green-600 text-lg"><IconPointFilled /></TI>
                                    Live
                                </> : <>
                                    <TI className="text-gray-600 text-lg"><IconPlayerPauseFilled /></TI>
                                    Paused
                                </>}
                                <TI className="ml-1"><IconChevronDown /></TI>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" className="*:flex *:items-center *:gap-4 w-[300px] z-[200]">
                            {workflow.is_enabled
                                ? <DropdownMenuItem onSelect={() => setEnabled(false)}>
                                    <TI><IconPlayerPauseFilled /></TI>
                                    <div>
                                        <p>Pause Workflow</p>
                                        <p className="text-xs text-muted-foreground">
                                            When paused, triggers won't cause the workflow to run.
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                                : <DropdownMenuItem onSelect={() => setEnabled(true)}>
                                    <TI className="text-green-600"><IconPlayerPlayFilled /></TI>
                                    <div>
                                        <p>Enable Workflow</p>
                                        <p className="text-xs text-muted-foreground">
                                            When enabled, triggers will cause the workflow to run.
                                        </p>
                                    </div>
                                </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* <div className="mx-4 bg-background/10 rounded-full text-background font-medium text-xs text-center grid grid-flow-col auto-cols-fr place-items-stretch gap-1 p-1 h-auto *:rounded-full *:px-4 *:py-1 [&.active]:*:bg-background [&.active]:*:text-foreground *:transition-colors">
                        <NavLink to="trigger" replace>Trigger</NavLink>
                        <NavLink to="edit" replace>Edit</NavLink>
                        <NavLink to="history" replace>History</NavLink>
                    </div> */}

                    <p className="self-center mx-4 text-xs text-center text-muted-foreground select-none">
                        {saveGraphMutation.isPending
                            ? "Saving..."
                            : saveGraphMutation.isSuccess
                                ? "Saved!"
                                : saveGraphMutation.isError
                                    ? "Failed to save"
                                    : "Waiting to save"}
                    </p>
                </div>

                <GBRoot
                    className="w-full h-full overflow-clip"
                    options={{
                        nodeDefinitions: ClientNodeDefinitions,
                        initialGraph: workflow.graph,
                        onGraphChange: graph => {
                            console.debug("Saving graph...")
                            saveGraph(graph)
                        },
                    }}
                >
                    <TriggerPanel />
                </GBRoot>

                <RenameWorkflowDialog workflow={workflow} {...renameDialog.dialogProps} />
                <ConfirmDialog
                    {...deleteDialog.dialogProps}
                    description="This will permanently delete your workflow and all associated runs, triggers, and other data. This action cannot be undone."
                    confirmText="Delete Workflow" confirmingText="Deleting" destructive
                    onConfirm={async () => void await deleteWorkflow.mutateAsync({ workflowId: workflow.id })}
                    isPending={deleteWorkflow.isPending || deleteWorkflow.isSuccess}
                />
            </div>}

        <AnimatePresence>
            {!workflow &&
                <motion.div
                    className="bg-gray-50 grid place-items-center w-screen h-screen fixed top-0 left-0 z-[1000]"
                    exit={{ opacity: 0 }}
                >
                    <SpinningLoader />
                </motion.div>}
        </AnimatePresence>
    </>
}

const Workflow = { Index: WorkflowIndex }
export default Workflow


function TriggerPanel() {

    const workflowId = useCurrentWorkflowId()
    const workflow = useCurrentWorkflow().data!

    const [params, setParams] = useSearchParams()
    const isOpen = params.get("trigger") != null
    const setOpen = (open: boolean) => {
        if (open) params.set("trigger", "")
        else params.delete("trigger")
        setParams(params.toString())
    }

    const eventType = ClientEventTypes[workflow.trigger_event_type_id]
    if (!eventType) throw new Error(`Unknown event type: ${workflow.trigger_event_type_id}`)

    return <>
        <Button
            variant="outline"
            className={cn(
                "absolute top-2 left-2 z-[100] gap-4 text-sm shadow-md bg-white/90 transition-opacity",
                isOpen && "opacity-0 pointer-events-none",
            )}
            onClick={() => setOpen(true)}
        >
            <div className="flex-center gap-1 text-xs text-muted-foreground">
                <TI><IconRun /></TI>
                Trigger
            </div>
            <VerticalDivider className="self-stretch" />
            <span>
                {ClientEventTypes[workflow.trigger_event_type_id]?.whenName ?? "Unknown trigger"}
            </span>
            <TI className="text-muted-foreground"><IconLayoutSidebarLeftExpandFilled /></TI>
        </Button>

        <div
            className={cn(
                "absolute z-[100] top-0 left-0 w-full h-full bg-black/10 transition-opacity",
                !isOpen && "opacity-0 pointer-events-none",
            )}
            onPointerDown={() => setOpen(false)}
        />

        <div className={cn(
            "absolute top-0 left-0 z-[100] h-full bg-white w-[400px] border-r shadow-xl transition flex-col items-stretch",
            !isOpen && "opacity-0 -translate-x-2 pointer-events-none",
        )}>
            <div className="flex items-center justify-between gap-4 no-shrink-children p-4 border-b">
                <h2 className="text-xl font-medium">Configure Trigger</h2>
                <Button variant="ghost" size="icon" className="text-md" onClick={() => setOpen(false)}>
                    <TI><IconX /></TI>
                </Button>
            </div>

            <div className="grid gap-x-4 gap-y-3 items-center p-4 border-b" style={{
                gridTemplateColumns: "auto 1fr",
            }}>
                <div
                    className="text-white p-2 text-lg rounded-sm"
                    style={{ backgroundColor: eventType.color }}
                >
                    <TI><eventType.icon /></TI>
                </div>
                <div>
                    <p className="font-medium">{eventType.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {eventType.whenName}
                    </p>
                </div>
                <p className="text-xs text-muted-foreground col-span-full">
                    {eventType.description}
                </p>
            </div>

            <ScrollArea className="flex-1 min-h-0 w-full relative">
                <div className="p-4">
                    {eventType.sourceComponent &&
                        <eventType.sourceComponent
                            workflowId={workflowId}
                            eventSources={workflow.eventSources}
                        />}
                </div>
            </ScrollArea>
        </div>
    </>
}