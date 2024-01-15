import { ActionIcon, Button, Checkbox, Divider, Group, NumberInput, Popover, Stack, Text, TextInput, Textarea } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { motion } from "framer-motion"
import { TbArrowRight, TbChevronDown, TbRun, TbX } from "react-icons/tb"
import { DATA_TYPE } from "shared"
import { openChangeTriggerModal } from "./ChangeTriggerModal"
import ScrollBox from "./ScrollBox"
import WorkflowRunSelector from "./WorkflowRunSelector"


export default function TriggerBar() {

    const { data: workflow } = useWorkflow()

    const hasTrigger = !!workflow?.trigger

    // const form = useForm({
    //     initialValues: {},
    // })

    // const [runManuallyPopoverOpened, runManuallyPopoverHandlers] = useDisclosure(false)

    // const [runManually, runManuallyQuery] = useAPI(API_ROUTE.RUN_WORKFLOW_MANUALLY, {
    //     workflowId: workflow?.id,
    //     triggerData: form.values,
    // }, {
    //     onSuccess: () => {
    //         runManuallyPopoverHandlers.close()
    //     },
    // })

    return (
        <Group position="apart" className="px-sm py-2 border-solid border-0 border-b-1 border-gray-300">
            <Group>
                <Text className="font-semibold">
                    Trigger
                </Text>
                <Divider orientation="vertical" />
                {hasTrigger ?
                    <>
                        <Group spacing="xs">
                            <workflow.trigger.info.icon style={{
                                color: theme.fn.themeColor(workflow.trigger.info.color, 6)
                            }} />
                            <Text>
                                {workflow.trigger.info.whenName}
                            </Text>
                        </Group>
                        <Button variant="subtle" radius="xl" size="xs" color="gray" compact>
                            Configure Trigger
                        </Button>
                        <Divider orientation="vertical" />
                        <Button
                            variant="subtle" radius="xl" size="xs" color="gray" compact
                            onClick={openChangeTriggerModal}
                        >
                            Change Trigger
                        </Button>
                    </> :
                    <>
                        <Text size="sm" color="dimmed">
                            No trigger set
                        </Text>
                        <Button
                            variant="filled" radius="xl" size="xs" compact
                            component={motion.div} animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: 100 }}
                            onClick={openChangeTriggerModal}
                        >
                            Add Trigger
                        </Button>
                    </>}
            </Group>

            {hasTrigger &&
                <Popover
                    shadow="md" position="bottom-end" width="28rem" withArrow
                    classNames={{
                        arrow: "bg-dark",
                    }}
                    opened={runManuallyPopoverOpened} onOpen={runManuallyPopoverHandlers.open} onClose={runManuallyPopoverHandlers.close}
                    closeOnClickOutside={false} closeOnEscape
                >
                    <Popover.Target>
                        <Button compact leftIcon={<TbRun />} onClick={runManuallyPopoverHandlers.toggle}>
                            Run Now
                        </Button>
                    </Popover.Target>
                    <Popover.Dropdown p="0">
                        <form onSubmit={form.onSubmit(() => runManually())}>
                            <Stack className="gap-xs p-xs bg-dark rounded-t-sm">
                                <Group position="apart">
                                    <Text className="uppercase text-gray-300 font-bold text-xs">
                                        Run Workflow Manually
                                    </Text>

                                    <ActionIcon size="sm" className="-m-1" onClick={runManuallyPopoverHandlers.close}>
                                        <TbX />
                                    </ActionIcon>
                                </Group>
                                <Group position="apart">
                                    <WorkflowRunSelector
                                        closeOnSelect withPopover
                                        onChange={selectRun}
                                    >
                                        <Button
                                            className="font-normal"
                                            size="xs" variant="outline" color="gray.0" rightIcon={<TbChevronDown />}
                                        >
                                            Load inputs from a past run
                                        </Button>
                                    </WorkflowRunSelector>
                                    <Button
                                        size="sm" compact rightIcon={<TbArrowRight />} type="submit"
                                        loading={runManuallyQuery.isLoading}
                                    >
                                        Run Now
                                    </Button>
                                </Group>
                            </Stack>

                            <Divider />

                            <ScrollBox insideFlex mah="28rem" classNames={{
                                viewport: "p-sm"
                            }}>
                                <Stack spacing="xs">

                                    {Object.entries(workflow.trigger.info.outputs ?? {}).map(([outputId, output]) =>
                                        <ManualTriggerInput
                                            triggerOutput={output}
                                            {...form.getInputProps(outputId)}
                                            key={outputId}
                                        />
                                    )}
                                </Stack>
                            </ScrollBox>
                        </form>
                    </Popover.Dropdown>
                </Popover>}
        </Group>
    )
}


function ManualTriggerInput({ triggerOutput: { label, type }, ...props }) {

    props.value ??= ""

    switch (type.type) {
        case DATA_TYPE.STRING:
            return type.options.long ?
                <Textarea label={label} placeholder={label} autosize minRows={2} maxRows={6} {...props} /> :
                <TextInput label={label} placeholder={label} {...props} />
        case DATA_TYPE.NUMBER:
            return <NumberInput label={label} placeholder={label} {...props} />
        case DATA_TYPE.BOOLEAN:
            return <Checkbox label={label} placeholder={label} {...props} />
        case DATA_TYPE.DATE:
            return <DateTimePicker
                label={label} placeholder={label} popoverProps={{ withinPortal: true }}
                {...props}
            />
        default:
            return <TextInput label={label} {...props} />
    }
}