import { Chip, Tooltip } from "@nextui-org/react"
import { useDatabaseMutation } from "@web/modules/db"
import { useTeamRoles } from "@web/modules/teams"
import { useWorkflow, useWorkflowIdFromUrl } from "@web/modules/workflows"


export default function WorkflowStatusChip({ workflowId }) {

    workflowId = useWorkflowIdFromUrl(workflowId)

    const { data: workflow } = useWorkflow(workflowId)
    const isEnabled = workflow?.isEnabled

    const toggleEnabled = useDatabaseMutation(
        supa => supa
            .from("workflows")
            .update({ is_enabled: !isEnabled })
            .eq("id", workflowId),
        {
            invalidateKey: ["workflow", workflowId],
            notification: {
                title: null,
                message: `Workflow ${isEnabled ? "disabled" : "enabled"}`,
                classNames: {
                    icon: isEnabled ? "!bg-danger" : "!bg-success",
                }
            },
        }
    )

    const { data: roleData } = useTeamRoles(undefined, workflow?.teamId)

    return (
        <Tooltip
            placement="bottom" content={isEnabled ? "Disable?" : "Enable?"} closeDelay={0}
            isDisabled={!roleData?.isEditor}
        >
            <Chip
                color={toggleEnabled.isPending ? "default" : isEnabled ? "success" : "danger"}
                variant="dot"
                {...roleData?.isEditor && {
                    onClick: () => toggleEnabled.mutate(),
                    as: "button",
                }}
            >
                {isEnabled ? "Enabled" : "Disabled"}
            </Chip>
        </Tooltip>
    )
}
