import { Autocomplete, AutocompleteItem, Button, Card, Input, Kbd, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react"
import { useHotkey } from "@web/modules/util"
import { useCreateActionNode } from "@web/modules/workflow-editor/graph/nodes"
import { list as nodesList, object as nodeDefs } from "nodes/web"
import { useRef } from "react"
import { TbMapSearch, TbSearch } from "react-icons/tb"


export default function EditorToolbar() {

    const modal = useDisclosure()
    const modalSearchRef = useRef()
    const toolbarSearchRef = useRef()

    useHotkey("/", () => toolbarSearchRef.current?.focus(), {
        preventDefault: true,
        callbackDependencies: [toolbarSearchRef],
        preventInInputs: true,
    })

    const createNode = useCreateActionNode()
    const addNode = defId => {
        createNode({
            definition: defId,
        })
        toolbarSearchRef.current?.blur()
        if (modal.isOpen)
            modal.onClose()
    }

    return (<>
        <Card className="p-unit-xs transition-opacity flex flex-row items-stretch flex-nowrap gap-unit-xs pointer-events-auto">
            {fixedNodes.map(nodeDefId => {
                const definition = nodeDefs[nodeDefId]
                return <Tooltip
                    closeDelay={0}
                    content={`Add "${definition.name}"`}
                    key={nodeDefId}
                >
                    <Button
                        isIconOnly variant="bordered"
                        className="h-auto p-0 shrink-0 min-w-0 max-w-none w-12"
                        onPress={() => addNode(nodeDefId)}
                    >
                        <definition.icon />
                    </Button>
                </Tooltip>
            })}

            <Autocomplete
                size="sm"
                placeholder="Search for tasks"
                startContent={<TbSearch />}
                defaultItems={nodesList}
                isClearable
                endContent={<Kbd className="group-data-[focus=true]:opacity-0 transition-opacity">/</Kbd>}
                onKeyDown={ev => {
                    if (ev.key === "/") {
                        ev.preventDefault()
                        modal.onOpen()
                    }
                }}
                scrollShadowProps={{
                    isEnabled: false
                }}
                selectedKey={null}
                onSelectionChange={addNode}
                className="group"
                classNames={{
                    listboxWrapper: "max-h-[calc(100vh-30rem)] min-h-[10rem]"
                }}
                ref={toolbarSearchRef}
            >
                {nodeDef =>
                    <AutocompleteItem
                        startContent={<nodeDef.icon
                            className="shrink-0 text-lg stroke-[1.5px]"
                            style={{ stroke: nodeDef.color }}
                        />}
                        title={nodeDef.name} description={nodeDef.description}
                        classNames={{
                            description: "line-clamp-3 text-ellipsis",
                        }}
                        key={nodeDef.id}
                    />}
            </Autocomplete>

            <Button
                color="primary" size="sm"
                onPress={modal.onOpen}
                className="h-auto shrink-0"
                startContent={<TbMapSearch />}
            >
                Explore Tasks
            </Button>
        </Card >

        <Modal isOpen={modal.isOpen} onOpenChange={modal.onOpenChange}>
            <ModalContent>
                {onClose => <>
                    <ModalHeader>
                        <p>All Tasks</p>
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            size="sm" placeholder="Search for tasks (actions, nodes, etc.)"
                            ref={modalSearchRef}
                        />
                    </ModalBody>
                </>}
            </ModalContent>
        </Modal>
    </>)
}


const fixedNodes = [
    "node-type:basic.text",
    "node-type:basic.number",
    "node-type:text.template",
]