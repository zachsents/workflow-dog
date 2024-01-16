import { Button, Card, CardBody, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Skeleton } from "@nextui-org/react"
import HighlightText from "@web/components/HighlightText"
import WorkflowStatusChip from "@web/components/WorkflowStatusChip"
import CreateWorkflowButton from "@web/components/dashboard/CreateWorkflowButton"
import DashboardLayout from "@web/components/dashboard/DashboardLayout"
import Group from "@web/components/layout/Group"
import TriggerText from "@web/components/workflow-editor/TriggerText"
import { useDatabaseMutation } from "@web/modules/db"
import { plural } from "@web/modules/grammar"
import { useModals } from "@web/modules/modals"
import { useQueryParam } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import { useTeamRoles } from "@web/modules/teams"
import { useWorkflow, useWorkflowsForTeam } from "@web/modules/workflows"
import TimeAgo from "javascript-time-ago"
import Link from "next/link"
import { TbDots, TbPencil, TbTrash } from "react-icons/tb"


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
                    type="text" size="sm"
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

    const modals = useModals()
    const [teamId] = useQueryParam("team")

    const workflowQuery = useWorkflow(id)
    const { name, trigger, lastEditedAt } = workflowQuery.data || {}

    const deleteWorkflow = useDatabaseMutation(
        supa => supa
            .from("workflows")
            .delete()
            .eq("id", id),
        {
            invalidateKey: ["workflowsForTeam", teamId],
            notification: {
                title: null,
                message: "Workflow deleted",
                classNames: {
                    icon: "!bg-danger",
                }
            }
        }
    )

    const confirmDelete = () => modals.confirm({
        header: "Delete workflow?",
        body: <p className="text-default-500">
            Are you sure you want to delete the workflow "{name}"? This is irreversible.
        </p>,
        onConfirm: () => deleteWorkflow.mutateAsync(),
        confirmButtonContent: "Delete",
        confirmButtonProps: {
            color: "danger",
        }
    })

    const { data: roleData } = useTeamRoles()

    return (
        <div className="flex flex-col gap-unit-sm">
            <Card>
                <CardBody className="px-8 flex flex-row justify-between gap-10 items-center">
                    <div>
                        <TriggerText
                            trigger={trigger}
                            classNames={{
                                text: "text-default-500",
                                fallback: "text-small text-default-500",
                                wrapper: "text-small",
                            }}
                        />
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

            <Group className="gap-unit-sm justify-between">
                <Group className="gap-unit-sm">
                    <WorkflowStatusChip workflowId={id} />
                    <Chip color="warning">2 config problems</Chip>
                    <Chip color="danger">4 run errors</Chip>
                </Group>

                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Button
                            isIconOnly size="sm" variant="light"
                        >
                            <TbDots />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Workflow actions"
                        disabledKeys={[
                            ...(roleData?.isEditor ? [] : ["delete"])
                        ]}
                    >
                        <DropdownItem
                            startContent={<TbTrash />} color="danger"
                            key="delete"
                            onClick={confirmDelete}
                            isLoading={deleteWorkflow.isPending || deleteWorkflow.isSuccess}
                        >
                            Delete
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
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