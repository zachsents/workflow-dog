import { Button, Divider, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spinner, useDisclosure } from "@nextui-org/react"
import { useDatabaseMutation } from "@web/modules/db"
import { plural } from "@web/modules/grammar"
import { useSearch } from "@web/modules/search"
import { useWorkflow, useWorkflowIdFromUrl } from "@web/modules/workflows"
import { TbChevronDown, TbPlus, TbStatusChange, TbX } from "react-icons/tb"
import { resolve as resolveTrigger, resolveId as resolveTriggerId, list as triggers } from "triggers/web"
import Group from "../layout/Group"
import TriggerText from "./TriggerText"


export default function TriggerControl() {

    const { data: workflow } = useWorkflow()

    const removeTrigger = useDatabaseMutation(
        supa => supa.from("workflows").update({ trigger: null }).eq("id", workflow?.id),
        {
            enabled: !!workflow,
            invalidateKey: ["workflow", workflow?.id],
        }
    )

    const modalDisclosure = useDisclosure()

    return <>
        <Group className="gap-unit-xs">
            {workflow?.trigger ?
                <ConfigureTrigger
                    openModal={modalDisclosure.onOpen}
                    removeTriggerMutation={removeTrigger}
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


function ConfigureTrigger({ openModal, removeTriggerMutation }) {

    const { data: workflow } = useWorkflow()

    const popoverDisclosure = useDisclosure()

    return (
        <Popover
            placement="bottom-start"
            isOpen={popoverDisclosure.isOpen}
            onOpenChange={popoverDisclosure.onOpenChange}
        >
            <PopoverTrigger className="pointer-events-auto">
                <Button size="sm" variant="ghost" endContent={<TbChevronDown />}>
                    <Group className="gap-unit-sm">
                        <p className="text-default-600">Trigger:</p>
                        <TriggerText
                            trigger={workflow?.trigger}
                        />
                    </Group>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[20rem] p-unit-md flex flex-col items-stretch gap-unit-xs pointer-events-auto">
                <div className="grid grid-cols-2 gap-unit-xs">
                    <Button
                        size="sm" variant="light" color="primary" fullWidth
                        startContent={<TbStatusChange />}
                        onPress={() => {
                            openModal()
                            popoverDisclosure.onClose()
                        }}
                    >
                        Change Trigger
                    </Button>

                    <Button
                        size="sm" variant="light" color="danger" fullWidth
                        startContent={<TbX />}
                        onPress={() => removeTriggerMutation.mutateAsync().then(popoverDisclosure.onClose)}
                        isLoading={removeTriggerMutation.isPending}
                    >
                        Remove Trigger
                    </Button>
                </div>

                <Divider />

                <p className="font-bold text-large">
                    Configure Trigger
                </p>
            </PopoverContent>
        </Popover>
    )
}


function SetTriggerModal({ onClose, ...props }) {

    const workflowId = useWorkflowIdFromUrl()

    const setTrigger = useDatabaseMutation(
        (supa, triggerId) => supa.from("workflows").update({ trigger: { type: triggerId } })
            .eq("id", workflowId),
        {
            enabled: !!workflowId,
            invalidateKey: ["workflow", workflowId],
            onSuccess: onClose,
        }
    )

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
                                        onAction={triggerId => setTrigger.mutate(triggerId)}
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
                                    onClick={() => setTrigger.mutate(resolveTriggerId("basic", "manual"))}
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
                        {setTrigger.isPending && <Spinner size="sm" />}
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
