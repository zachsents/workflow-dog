import { Button, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spinner, useDisclosure } from "@nextui-org/react"
import { useApiMutation } from "@web/modules/api"
import { plural } from "@web/modules/grammar"
import { useSearch } from "@web/modules/search"
import { useWorkflow, useWorkflowIdFromUrl } from "@web/modules/workflows"
import { TbChevronDown, TbPlus, TbStatusChange } from "react-icons/tb"
import { resolve as resolveTrigger, resolveId as resolveTriggerId, object as triggerMap, list as triggers } from "triggers/web"
import Group from "../layout/Group"
import TriggerText from "./TriggerText"


export default function TriggerControl() {

    const { data: workflow } = useWorkflow()
    const modalDisclosure = useDisclosure()

    return <>
        <Group className="gap-unit-xs">
            {workflow?.trigger ?
                <ConfigureTrigger
                    openModal={modalDisclosure.onOpen}
                /> :
                <Button
                    startContent={<TbPlus />} variant="ghost" color="primary" size="sm"
                    onPress={modalDisclosure.onOpen}
                    className="pointer-events-auto"
                >
                    Add Trigger
                </Button>}
        </Group>
        <SetTriggerModal
            isOpen={modalDisclosure.isOpen} onOpenChange={modalDisclosure.onOpenChange}
            onClose={modalDisclosure.onClose}
        />
    </>
}


function ConfigureTrigger({ openModal }) {

    const { data: workflow } = useWorkflow()
    const triggerDef = triggerMap[workflow?.trigger?.type]

    const popoverDisclosure = useDisclosure()

    return (<>
        <Popover
            placement="bottom-start"
            isOpen={popoverDisclosure.isOpen}
            onOpenChange={popoverDisclosure.onOpenChange}
        >
            <PopoverTrigger className="pointer-events-auto">
                <Button
                    size="sm" variant="ghost" endContent={<TbChevronDown />}
                    className="bg-white/70 backdrop-blur-sm"
                >
                    <Group className="gap-unit-sm">
                        <p className="text-default-600">Trigger:</p>
                        <TriggerText
                            trigger={workflow?.trigger}
                        />
                    </Group>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[24rem] p-unit-md flex flex-col items-stretch gap-unit-xs pointer-events-auto">
                <p className="font-bold text-large">
                    Configure Trigger
                </p>

                {triggerDef?.renderConfig ?
                    <triggerDef.renderConfig workflowId={workflow?.id} workflow={workflow} onClose={popoverDisclosure.onClose} /> :
                    <p className="text-sm text-default-500 text-center">
                        No configuration needed.
                    </p>}
            </PopoverContent>
        </Popover>
        <Button
            size="sm" variant="ghost"
            startContent={<TbStatusChange />}
            className="pointer-events-auto bg-white/70 backdrop-blur-sm"
            onPress={() => {
                openModal()
                popoverDisclosure.onClose()
            }}
        >
            Change Trigger
        </Button>
    </>)
}


function SetTriggerModal({ onClose, ...props }) {

    const workflowId = useWorkflowIdFromUrl()

    const setTriggerMutation = useApiMutation(`workflows/${workflowId}/trigger`, {
        method: "PUT",
        invalidateQueries: ["workflow", workflowId],
        mutationOptions: {
            onSuccess: onClose,
        },
    })
    const setTrigger = type => setTriggerMutation.mutate({ type })

    const [filteredTriggers, query, setQuery] = useSearch(triggers, {
        selector: trigger => trigger.name,
    })

    return (
        <Modal
            size="3xl"
            className="pointer-events-auto"
            {...props}
        >
            <ModalContent>
                {onClose => <>
                    <ModalHeader>
                        When should this workflow be triggered?
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex gap-unit-xl items-stretch">
                            <div className="flex-1 flex flex-col items-stretch gap-unit-sm">
                                <Input
                                    value={query} onValueChange={setQuery}
                                    type="text" size="sm"
                                    label={`Search ${triggers.length || 0} ${plural("trigger", triggers.length)}`}
                                />
                                <ScrollShadow className="h-[20rem]">
                                    <Listbox
                                        items={filteredTriggers || []}
                                        onAction={setTrigger}
                                    >
                                        {trigger =>
                                            <ListboxItem key={trigger.id}>
                                                <TriggerCard trigger={trigger} />
                                            </ListboxItem>
                                        }
                                    </Listbox>
                                </ScrollShadow>
                            </div>

                            <div className="w-[16rem] flex flex-col items-stretch gap-unit-xs">
                                <p className="text-small text-default-500">Commonly Used</p>
                                <TriggerCard
                                    withWrapper
                                    trigger={resolveTrigger("basic", "manual")}
                                    onClick={() => setTrigger(resolveTriggerId("basic", "manual"))}
                                />
                                <TriggerCard
                                    withWrapper
                                    trigger={resolveTrigger("basic", "schedule")}
                                    onClick={() => setTrigger(resolveTriggerId("basic", "schedule"))}
                                />
                                {/* <TriggerCard
                                    withWrapper
                                    trigger={triggerMap[TRIGGER_TYPE.ASYNC_URL]}
                                    onClick={() => setTrigger.mutate(TRIGGER_TYPE.ASYNC_URL)}
                                />
                                <TriggerCard
                                    withWrapper
                                    trigger={triggerMap[TRIGGER_TYPE.GMAIL_EMAIL_RECEIVED]}
                                    onClick={() => setTrigger.mutate(TRIGGER_TYPE.GMAIL_EMAIL_RECEIVED)}
                                /> */}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {setTriggerMutation.isPending &&
                            <Spinner size="sm" />}

                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </>}
            </ModalContent>
        </Modal>
    )
}


function TriggerCard({ trigger, withWrapper = false, ...props }) {

    const inner =
        <Group className="flex-nowrap gap-unit-md text-left text-sm">
            <div className="text-white rounded-md p-unit-xs" style={{
                backgroundColor: trigger.color,
            }}>
                <trigger.icon />
            </div>
            <div>
                <p>
                    {trigger.name}
                </p>
                <p className="text-default-500 text-xs">
                    {trigger.whenName}
                </p>
            </div>
        </Group>

    return withWrapper ?
        <button className="hover:bg-default-200 rounded-md p-unit-xs" {...props}>
            {inner}
        </button> :
        inner
}

