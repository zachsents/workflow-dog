import { zodResolver } from "@hookform/resolvers/zod"
import { IconCheck } from "@tabler/icons-react"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import SearchInput from "@web/components/search-input"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@web/components/ui/radio-group"
import { useCurrentProjectId, useSearch } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import { WORKFLOW_NAME_SCHEMA } from "core/schemas"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ClientEventTypes } from "workflow-packages/client"
import type { ClientEventType } from "workflow-packages/lib/types"
import { z } from "zod"


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
    "eventType:primitives/callable",
    "eventType:primitives/schedule",
    "eventType:primitives/webhook",
]

export default function ProjectCreateWorkflow() {

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
            navigate(
                ClientEventTypes[form.getValues().triggerEventTypeId]?.requiresConfiguration
                    ? `/workflows/${workflowId}?trigger`
                    : `/workflows/${workflowId}`
            )
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