import { Chip, Kbd, Tooltip } from "@nextui-org/react"
import { useDatabaseMutation } from "@web/modules/db"
import { useTeamRoles } from "@web/modules/teams"
import { useHotkey } from "@web/modules/util"
import { useWorkflow, useWorkflowIdFromUrl } from "@web/modules/workflows"
import Group from "./layout/Group"


export default function WorkflowStatusChip({ workflowId, withKeyboardShortcut = false }) {

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

    useHotkey("mod+e", () => {
        if (!withKeyboardShortcut || !roleData?.isEditor)
            return

        toggleEnabled.mutate()
    }, {
        preventDefault: true,
    })

    return (
        <Tooltip
            placement="bottom" closeDelay={0}
            isDisabled={!roleData?.isEditor}
            content={<Group className="gap-unit-sm">
                <span>{isEnabled ? "Disable?" : "Enable?"}</span>
                {withKeyboardShortcut &&
                    <Kbd keys={["command"]}>E</Kbd>}
            </Group>}
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
