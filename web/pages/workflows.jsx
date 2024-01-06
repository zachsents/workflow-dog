import { Button, Card, CardBody, Chip, Input, Skeleton, Tooltip } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import HighlightText from "@web/components/HighlightText"
import CreateWorkflowButton from "@web/components/dashboard/CreateWorkflowButton"
import DashboardLayout from "@web/components/dashboard/DashboardLayout"
import Group from "@web/components/layout/Group"
import { resolveTailwindColor } from "@web/modules/colors"
import { plural } from "@web/modules/grammar"
import { useSearch } from "@web/modules/search"
import { supabase } from "@web/modules/supabase"
import { TRIGGER_INFO } from "@web/modules/triggers"
import { useWorkflow, useWorkflowsForTeam } from "@web/modules/workflows"
import TimeAgo from "javascript-time-ago"
import Link from "next/link"
import { TbPencil } from "react-icons/tb"


export default function WorkflowsPage() {

    const workflowsQuery = useWorkflowsForTeam(undefined, ["id", "name"])

    const [filteredWorkflows, query, setQuery, filteredWorkflowNames] = useSearch(workflowsQuery?.data ?? [], {
        selector: workflow => workflow.name,
        highlight: true,
    })

    return (
        <DashboardLayout
            title="Workflows"
            rightContent={<CreateWorkflowButton />}
        >
            <div className="flex flex-col gap-unit-xl">
                <Input
                    type="text"
                    label={`Search ${workflowsQuery.data?.length || 0} ${plural("workflow", workflowsQuery.data?.length || 0)}`}
                    value={query} onValueChange={setQuery}
                />
                {workflowsQuery.isLoading ?
                    <WorkflowsSkeleton /> :
                    <div className="flex flex-col gap-unit-xl">
                        {filteredWorkflows?.length > 0 ?
                            filteredWorkflows.map((workflow, i) =>
                                <WorkflowCard
                                    id={workflow.id}
                                    highlightParts={filteredWorkflowNames[i]}
                                    key={workflow.id}
                                />
                            ) :
                            <p className="text-default-500 text-center">
                                No workflows found
                            </p>}
                    </div>}
            </div>
        </DashboardLayout>
    )
}

function WorkflowCard({ id, highlightParts }) {

    const workflowQuery = useWorkflow(id)
    const { name, trigger, lastEditedAt, isEnabled } = workflowQuery.data || {}

    const triggerInfo = TRIGGER_INFO[trigger?.type]

    const toggleEnabled = useMutation({
        mutationFn: async () => {
            await supabase
                .from("workflows")
                .update({ is_enabled: !isEnabled })
                .eq("id", id)
                .throwOnError()
            await workflowQuery.refetch()
        },
    })

    return (
        <div className="flex flex-col gap-unit-sm">
            <Card>
                <CardBody className="px-8 flex flex-row justify-between gap-10 items-center">
                    <div>
                        {triggerInfo ?
                            <Group className="gap-unit-xs text-small">
                                <triggerInfo.icon style={{
                                    color: resolveTailwindColor(triggerInfo.color, triggerInfo.shade)
                                }} />
                                <p className="text-default-500">
                                    {triggerInfo.whenName || triggerInfo.name}
                                </p>
                            </Group> :
                            <p className="text-small text-default-500">
                                No trigger set
                            </p>}
                        <HighlightText
                            className="font-medium" highlightClassName="bg-yellow-200"
                            highlightParts={highlightParts}
                        >
                            {name}
                        </HighlightText>
                        <div className="mt-4">
                            <p className="text-xs text-default-500">
                                {lastEditedAt ?
                                    `Last edited ${new TimeAgo("en-US").format(lastEditedAt.toDate())}` :
                                    "Never edited"}
                            </p>
                        </div>
                    </div>

                    <Button
                        color="primary" startContent={<TbPencil />} variant="ghost"
                        as={Link} href={`/workflow/${id}`}
                    >
                        Open
                    </Button>
                </CardBody>
            </Card>

            <Group className="gap-unit-sm">
                <Tooltip placement="bottom" content={isEnabled ? "Disable?" : "Enable?"} closeDelay={0}>
                    <Chip
                        color={toggleEnabled.isPending ? "default" : isEnabled ? "success" : "danger"}
                        variant="dot"
                        as="button"
                        onClick={() => toggleEnabled.mutate()}
                    >
                        {isEnabled ? "Enabled" : "Disabled"}
                    </Chip>
                </Tooltip>
                <Chip color="warning">2 config problems</Chip>
                <Chip color="danger">4 run errors</Chip>
            </Group>
        </div>
    )
}


function WorkflowsSkeleton() {
    return (
        <div className="flex flex-col gap-unit-md">
            <Skeleton className="w-full h-20 rounded-xl" />
            <Skeleton className="w-full h-20 rounded-xl" />
            <Skeleton className="w-full h-20 rounded-xl" />
        </div>
    )
}