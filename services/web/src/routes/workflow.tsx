import { IconArrowLeft, IconChevronDown, IconClock, IconDots, IconEyeOff, IconPencil, IconPlayerPauseFilled, IconPlayerPlay, IconPlayerPlayFilled, IconPointFilled, IconRefresh, IconRouteSquare2, IconTestPipe, IconTrash, IconX } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import ConfirmDialog from "@web/components/confirm-dialog"
import RenameWorkflowDialog from "@web/components/rename-workflow-dialog"
import RunHistoryTable from "@web/components/run-history-table"
import SimpleTooltip from "@web/components/simple-tooltip"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { ScrollArea } from "@web/components/ui/scroll-area"
import { GBRoot, MainToolbar } from "@web/lib/graph-builder/core"
import { useCurrentWorkflow, useCurrentWorkflowId, useDialogState, usePreventUnloadWhileSaving, useSelectedRunId } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
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

    const [selectedRunId, setSelectedRunId] = useSelectedRunId()
    const { data: selectedRun } = trpc.workflows.runs.byId.useQuery({
        workflowRunId: selectedRunId!,
        withOutputs: true,
    }, {
        enabled: !!selectedRunId,
    })

    const { data: selectedSnapshot } = trpc.workflows.snapshots.byId.useQuery({
        workflowId,
        snapshotId: selectedRun?.snapshot_id!,
    }, {
        enabled: !!selectedRun?.snapshot_id,
    })

    const nodeDefinitions = useMemo(() => {
        return Object.fromEntries(
            Object.entries(ClientNodeDefinitions).filter(([, def]) =>
                def.whitelistedTriggers?.includes(workflow?.trigger_event_type_id ?? "") ?? true
            )
        )
    }, [ClientNodeDefinitions, workflow?.trigger_event_type_id])

    return <>
        <Helmet>
            <title>{workflow?.name ?? "Workflow"} - WorkflowDog</title>
        </Helmet>
        {!!workflow &&
            <div
                className="w-screen h-screen bg-gray-700 grid grid-flow-row auto-rows-auto"
                style={{
                    gridTemplateRows: "auto auto 1fr",
                    gridTemplateColumns: "1fr auto",
                }}
            >
                <div className="col-span-full bg-white p-1 border-b flex items-stretch justify-center gap-2 min-h-8">
                    <div className="flex-1 flex items-stretch justify-start gap-2">
                        <Button variant="ghost" size="auto" asChild className="gap-2 text-muted-foreground text-xs">
                            <Link to={`/projects/${workflow.project_id}/workflows`}>
                                <TI><IconArrowLeft /></TI>
                                Back to Workflows
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-stretch justify-center gap-2 text-xs">
                        <TI className="text-muted-foreground self-center"><IconRouteSquare2 /></TI>

                        <Button
                            variant="ghost" size="auto" className="group cursor-text -mx-2"
                            onClick={renameDialog.open}
                        >
                            {workflow.name}
                        </Button>

                        <p className="self-center text-muted-foreground select-none w-[100px]">
                            {!selectedRunId && <>&#8212;&nbsp;</>}
                            {selectedRunId
                                ? ""
                                : saveGraphMutation.isPending
                                    ? "Saving..."
                                    : saveGraphMutation.isSuccess
                                        ? "Saved!"
                                        : saveGraphMutation.isError
                                            ? "Failed to save"
                                            : "Waiting to save"}
                        </p>
                    </div>
                    <div className="flex-1 flex items-stretch justify-end gap-2">
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
                            <DropdownMenuContent side="bottom" className="*:flex *:items-center *:gap-4 w-[300px] z-[45]">
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="auto" className="aspect-square text-xs">
                                    <TI><IconDots /></TI>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="bottom" align="end" alignOffset={4}
                                className="*:flex *:items-center *:gap-2 w-[200px] z-[45]"
                            >
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
                    </div>
                </div>

                <div className="col-span-full bg-white border-b flex items-stretch justify-between gap-2 min-h-8">
                    <div className="flex items-stretch justify-start gap-2 p-1 border-r">
                        <TriggerPanel />
                    </div>
                    <div className="flex items-stretch justify-end gap-2 p-1 border-l">
                        <Button
                            variant="ghost" size="auto"
                            className="gap-2 text-xs no-shrink-children"
                            disabled
                        >
                            <TI className="text-md"><IconTestPipe /></TI>
                            Test Run
                            <Badge variant="secondary" >
                                Coming Soon
                            </Badge>
                        </Button>
                        <RunHistoryPanel />
                    </div>
                </div>

                <div className="relative w-full h-full overflow-clip bg-gray-50">
                    {!selectedRunId && <GBRoot
                        className="w-full h-full"
                        options={{
                            nodeDefinitions,
                            initialGraph: workflow.graph,
                            onGraphChange: graph => {
                                console.debug("Saving graph...")
                                saveGraph(graph)
                            },
                        }}
                        key="current"
                    >
                        <div className="absolute hack-center-x z-20 bottom-4 px-4 max-w-full">
                            <MainToolbar />
                        </div>
                    </GBRoot>}

                    {!!selectedRunId && !!selectedSnapshot?.graph && <GBRoot
                        className="w-full h-full"
                        options={{
                            nodeDefinitions: ClientNodeDefinitions,
                            initialGraph: selectedSnapshot!.graph,
                            readonly: true,
                            runOutputs: selectedRun!.node_outputs,
                            runErrors: selectedRun!.node_errors as Record<string, string>,
                        }}
                        key={selectedRunId}
                    >
                        <div className="absolute z-20 right-2 top-2 max-w-full pointer-events-none">
                            <Button
                                variant="default" size="compact" className="gap-2 pointer-events-auto"
                                onClick={() => setSelectedRunId(null)}
                            >
                                <TI><IconEyeOff /></TI>
                                <span>Hide Run #{selectedRun?.row_number}</span>
                            </Button>
                        </div>
                    </GBRoot>}
                </div>

                <RenameWorkflowDialog workflow={workflow} {...renameDialog.dialogProps} />
                <ConfirmDialog
                    {...deleteDialog.dialogProps}
                    description="This will permanently delete your workflow and all associated runs, triggers, and other data. This action cannot be undone."
                    confirmText="Delete Workflow" confirmingText="Deleting" destructive
                    onConfirm={async () => void await deleteWorkflow.mutateAsync({ workflowId: workflow.id })}
                    isPending={deleteWorkflow.isPending || deleteWorkflow.isSuccess}
                />
            </div >}

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
        <SimpleTooltip tooltip="Configure Trigger" contentProps={{ side: "bottom" }}>
            <Button
                variant="ghost" size="auto"
                className="gap-2 text-xs no-shrink-children"
                onClick={() => setOpen(true)}
            >
                <TI className="text-md"><IconPlayerPlay /></TI>
                {ClientEventTypes[workflow.trigger_event_type_id]?.whenName ?? "Unknown trigger"}
            </Button>
        </SimpleTooltip>

        <div
            className={cn(
                "absolute z-[101] top-0 left-0 w-full h-full bg-black/10 transition-opacity",
                !isOpen && "opacity-0 pointer-events-none",
            )}
            onPointerDown={() => setOpen(false)}
        />

        <div className={cn(
            "absolute top-0 left-0 z-[102] h-full bg-white w-[400px] border-r shadow-xl transition flex-col items-stretch",
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


function RunHistoryPanel() {

    // const workflowId = useCurrentWorkflowId()
    const workflow = useCurrentWorkflow().data!

    const [params, setParams] = useSearchParams()
    const isOpen = params.get("history") != null
    const setOpen = (open: boolean) => {
        if (open) params.set("history", "")
        else params.delete("history")
        setParams(params.toString())
    }

    const [selectedRunId, setSelectedRunId] = useSelectedRunId()

    const utils = trpc.useUtils()
    const refreshMutation = useMutation({
        mutationFn: () => Promise.all([
            utils.workflows.runs.list.invalidate(),
            utils.workflows.byId.invalidate({ workflowId: workflow.id }),
        ]),
    })

    useEffect(() => {
        if (isOpen)
            refreshMutation.mutate()
    }, [isOpen])

    return <>
        <Button
            variant="ghost" size="auto"
            className="gap-2 text-xs no-shrink-children"
            onClick={() => setOpen(true)}
        >
            <TI className="text-md"><IconClock /></TI>
            Run History
        </Button>

        {createPortal(<>
            <div
                className={cn(
                    "fixed z-[101] top-0 left-0 w-full h-full bg-black/10 transition-opacity",
                    !isOpen && "opacity-0 pointer-events-none",
                )}
                onPointerDown={() => setOpen(false)}
            />

            <div className={cn(
                "fixed top-0 right-0 z-[102] h-full bg-white w-[500px] border-l shadow-xl transition flex-col items-stretch",
                !isOpen && "opacity-0 translate-x-2 pointer-events-none",
            )}>
                <div className="flex items-center justify-between gap-4 no-shrink-children p-4 border-b">
                    <div className="flex items-center gap-4 no-shrink-children">
                        <h2 className="text-xl font-medium">Run History</h2>
                        <SimpleTooltip tooltip="Refresh" contentProps={{ side: "right" }}>
                            <Button
                                variant="ghost" size="icon"
                                className="text-lg text-muted-foreground"
                                onClick={() => void refreshMutation.mutate()}
                                disabled={refreshMutation.isPending}
                            >
                                <TI className={cn(refreshMutation.isPending && "animate-spin")}>
                                    <IconRefresh />
                                </TI>
                            </Button>
                        </SimpleTooltip>

                        {!!selectedRunId &&
                            <Button size="compact" className="gap-2" onClick={() => setSelectedRunId(null)}>
                                <TI><IconX /></TI>
                                Deselect Run
                            </Button>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-md" onClick={() => setOpen(false)}>
                        <TI><IconX /></TI>
                    </Button>
                </div>

                <ScrollArea className="flex-1 min-h-0 w-full relative">
                    <div className="p-4">
                        <RunHistoryTable />
                    </div>
                </ScrollArea>
            </div>
        </>, document.body)}
    </>
}