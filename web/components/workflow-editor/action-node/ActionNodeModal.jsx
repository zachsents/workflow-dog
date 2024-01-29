import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tab, Tabs, Textarea } from "@nextui-org/react"
import { useDebouncedCallback, useDebouncedEffect } from "@react-hookz/web"
import Group from "@web/components/layout/Group"
import { singular } from "@web/modules/grammar"
import { useSetInputValue } from "@web/modules/workflow-editor/graph/interfaces"
import { useDefinition, useNodeColors } from "@web/modules/workflow-editor/graph/nodes"
import { uniqueId } from "@web/modules/workflow-editor/util"
import { object as typeMap } from "data-types/common"
import { produce } from "immer"
import _ from "lodash"
import { Fragment, useEffect, useMemo } from "react"
import { TbArrowLeftSquare, TbCursorText, TbPencil, TbPencilOff, TbPlus, TbX } from "react-icons/tb"
import { useNodeId, useReactFlow, useStore, useStoreApi } from "reactflow"
import { PREFIX } from "shared/prefixes"
import ActionNodeHeader from "./ActionNodeHeader"


export default function ActionNodeModal() {

    const id = useNodeId()
    const definition = useDefinition()

    const storeApi = useStoreApi()

    const isOpen = useStore(s => s.nodeBeingConfigured === id)
    const onClose = () => storeApi.setState({ nodeBeingConfigured: null })

    const nodeColors = useNodeColors(undefined, "css")

    return (
        <Modal
            size="2xl" backdrop="blur" placement="top"
            isOpen={isOpen} onClose={onClose}
            style={nodeColors}
            className="overflow-visible"
        >
            <ModalContent>
                {() => <>
                    <ModalHeader className="bg-[var(--dark-color)] rounded-t-xl">
                        <ActionNodeHeader />
                    </ModalHeader>
                    <ModalBody>
                        {definition.description &&
                            <p className="">
                                {definition.description}
                            </p>}

                        <Tabs
                            aria-label="Input/Output Configuration"
                            fullWidth variant="underlined"
                        >
                            <Tab key="inputs" title="Inputs">
                                <div className="flex flex-col gap-unit-lg my-unit-lg">
                                    {Object.entries(definition.inputs ?? {}).map(([inputDefId, inputDef], i) =>
                                        <Fragment key={inputDefId}>
                                            {i !== 0 &&
                                                <Divider />}
                                            <HandleDefinitionConfig
                                                definitionId={inputDefId} definition={inputDef}
                                                type="input"
                                            />
                                        </Fragment>
                                    )}
                                </div>
                            </Tab>
                            <Tab key="outputs" title="Outputs">
                                <div className="flex flex-col gap-unit-lg my-unit-lg">
                                    {Object.entries(definition.outputs ?? {}).map(([outputDefId, outputDef], i) =>
                                        <Fragment key={outputDefId}>
                                            {i !== 0 &&
                                                <Divider />}
                                            <HandleDefinitionConfig
                                                definitionId={outputDefId} definition={outputDef}
                                                type="output"
                                            />
                                        </Fragment>
                                    )}
                                </div>
                            </Tab>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter>

                    </ModalFooter>
                </>}
            </ModalContent>
        </Modal>
    )
}


/**
 * @param {object} props
 * @param {"input" | "output"} props.type
 */
function HandleDefinitionConfig({ definition, definitionId, type }) {

    const isInput = type === "input"
    const collection = isInput ? "inputs" : "outputs"

    const rf = useReactFlow()
    const nodeId = useNodeId()
    const nodeDefinition = useDefinition()
    const handles = useStore(s => s.nodeInternals.get(nodeId).data[collection].filter(handle => handle.definition === definitionId), _.isEqual)

    const isBeingDerived = useIsBeingDerived(nodeId, definition)

    const addHandle = () => {
        rf.setNodes(produce(draft => {
            draft.find(node => node.id === nodeId).data[collection].push({
                id: uniqueId(isInput ? PREFIX.INPUT : PREFIX.OUTPUT),
                definition: definitionId,
                ...isInput && { mode: definition.defaultMode || "handle" },
                ...definition.named && { name: "" },
            })
        }))
    }

    return (
        <div className="flex flex-col items-stretch gap-unit-sm" >
            <div>
                <p className="font-medium">{definition.name}</p>
                {definition.description &&
                    <p className="text-default-500 text-sm mt-1">
                        {definition.description}
                    </p>}
            </div>

            <div className="flex flex-col items-stretch gap-unit-md">
                {handles.length > 0 ?
                    handles.map((input, i) =>
                        <Fragment key={input.id}>
                            {i !== 0 &&
                                <Divider className="w-3/4 self-center" />}
                            {isInput ?
                                <InputConfig input={input} definition={definition} key={input.id} /> :
                                <OutputConfig output={input} definition={definition} key={input.id} />}
                        </Fragment>
                    ) :
                    <p className="text-default-500 text-sm text-center">
                        No {definition.name}.
                    </p>}

                {isBeingDerived ?
                    <p className="text-default-500 text-sm text-center">
                        {definition.name} {definition.group ? "are" : "is"} generated from {nodeDefinition.inputs[definition.derivedFrom].name}.
                    </p> :
                    definition.group ?
                        <Button
                            variant="light" color="primary"
                            startContent={<TbPlus />}
                            onPress={addHandle}
                        >
                            Add {singular(definition.name)}
                        </Button> :
                        null}
            </div>
        </div>
    )
}


function InputConfig({ input, definition }) {

    const rf = useReactFlow()
    const nodeId = useNodeId()
    const nodeDefinition = useDefinition()

    useDebouncedEffect(() => {
        if (!definition.deriveInputs || input.mode !== "config")
            return

        Promise.resolve(definition.deriveInputs(input.value)).then(derivedInputs => {
            rf.setNodes(produce(draft => {
                const node = draft.find(node => node.id === nodeId)

                Object.entries(derivedInputs).forEach(([inputDefId, derived]) => {
                    const newInputs = derived.inputs.map(newInput => _.merge(
                        {
                            id: uniqueId(PREFIX.INPUT),
                            definition: inputDefId,
                            mode: nodeDefinition.inputs[inputDefId].defaultMode || "handle",
                        },
                        node.data.inputs.find(input => input.definition === inputDefId && input[derived.keyBy] === newInput[derived.keyBy]),
                        newInput,
                    ))

                    node.data.inputs = [
                        ...node.data.inputs.filter(input => input.definition !== inputDefId),
                        ...newInputs,
                    ]
                })
            }))
        })
    }, [input.value, input.mode], 200)

    const setMode = (mode) => rf.setNodes(produce(draft => {
        draft.find(node => node.id === nodeId)
            .data.inputs.find(i => i.id === input.id).mode = mode
    }))

    const removeInput = () => rf.setNodes(produce(draft => {
        const node = draft.find(node => node.id === nodeId)
        node.data.inputs = node.data.inputs.filter(i => i.id !== input.id)
    }))

    const isBeingDerived = useIsBeingDerived(nodeId, definition)

    const handleDisplayName = (definition.named ? input.name : definition.name).trim() || "\xa0"

    const setInputName = useDebouncedCallback(newName => {
        rf.setNodes(produce(draft => {
            draft.find(node => node.id === nodeId)
                .data.inputs.find(i => i.id === input.id).name = newName
        }))
    }, [input.id, rf], 200)

    return (
        <div className="flex flex-col items-stretch gap-2">
            {definition.named &&
                <Input
                    defaultValue={input.name}
                    onValueChange={setInputName}
                    size="sm"
                    label="Input Name" labelPlacement="outside-left"
                    endContent={isBeingDerived ?
                        <Group className="group-hover:opacity-100 opacity-0 transition-opacity text-default-500 flex-nowrap shrink-0 gap-unit-xs">
                            <p className="text-xs">
                                Auto-generated
                            </p>
                            <TbPencilOff />
                        </Group> :
                        <TbPencil className="group-hover:opacity-100 opacity-0 transition-opacity text-default-500" />}
                    classNames={{
                        input: "text-sm font-medium",
                        mainWrapper: "grow",
                    }}
                    isReadOnly={isBeingDerived}
                />}

            {input.mode === "config" &&
                <ConfigComponent
                    input={input} definition={definition}
                />}

            {input.mode === "handle" &&
                <Group className="gap-unit-md relative -left-12">
                    <div className="border border-gray-300 bg-gray-50 rounded-full px-unit-md py-1 text-sm font-medium">
                        {handleDisplayName}
                    </div>
                    <p className="text-default-500 text-xs">
                        Input value will come from connected node.
                    </p>
                </Group>}

            <Group className="gap-unit-md justify-between">
                {input.mode === "config" && definition.allowedModes?.includes("handle") &&
                    <Button
                        variant="light" color="primary" size="sm"
                        startContent={<TbArrowLeftSquare />}
                        className="self-start"
                        onPress={() => setMode("handle")}
                    >
                        Use as node input
                    </Button>}

                {input.mode === "handle" && definition.allowedModes?.includes("config") &&
                    <Button
                        variant="light" color="primary" size="sm"
                        startContent={<TbCursorText />}
                        className="self-start"
                        onPress={() => setMode("config")}
                    >
                        Configure Manually
                    </Button>}

                {definition.group && !isBeingDerived &&
                    <Button
                        color="danger" variant="light" size="sm"
                        startContent={<TbX />}
                        onPress={removeInput}
                    >
                        Delete Input
                    </Button>}
            </Group>
        </div>
    )

}


function OutputConfig({ output, definition }) {

    const rf = useReactFlow()
    const nodeId = useNodeId()

    const removeOutput = () => rf.setNodes(produce(draft => {
        const node = draft.find(node => node.id === nodeId)
        node.data.outputs = node.data.outputs.filter(o => o.id !== output.id)
    }))

    const isBeingDerived = useIsBeingDerived(nodeId, definition)

    const handleDisplayName = (definition.named ? output.name : definition.name).trim() || "\xa0"

    const setOutputName = useDebouncedCallback(newName => {
        rf.setNodes(produce(draft => {
            draft.find(node => node.id === nodeId)
                .data.outputs.find(o => o.id === output.id).name = newName
        }))
    }, [output.id, rf], 200)

    return (
        <div className="flex flex-col items-stretch gap-2">
            {definition.named &&
                <Input
                    defaultValue={output.name}
                    onValueChange={setOutputName}
                    size="sm"
                    label="Output Name" labelPlacement="outside-left"
                    endContent={isBeingDerived ?
                        <Group className="group-hover:opacity-100 opacity-0 transition-opacity text-default-500 flex-nowrap shrink-0 gap-unit-xs">
                            <p className="text-xs">
                                Auto-generated
                            </p>
                            <TbPencilOff />
                        </Group> :
                        <TbPencil className="group-hover:opacity-100 opacity-0 transition-opacity text-default-500" />}
                    classNames={{
                        input: "text-sm font-medium",
                        mainWrapper: "grow",
                    }}
                    isReadOnly={isBeingDerived}
                />}

            <Group className="gap-unit-md flex-row-reverse relative -right-12">
                <div className="border border-gray-300 bg-gray-50 rounded-full px-unit-md py-1 text-sm font-medium">
                    {handleDisplayName}
                </div>
                <p className="text-default-500 text-xs">
                    Output value will be sent to connected node.
                </p>
            </Group>

            <Group className="gap-unit-md justify-between">
                {definition.group && !isBeingDerived &&
                    <Button
                        color="danger" variant="light" size="sm"
                        startContent={<TbX />}
                        onPress={removeOutput}
                    >
                        Delete Output
                    </Button>}
            </Group>
        </div>
    )

}


export function ConfigComponent(_props) {

    const type = _props.definition.type
    const props = {
        ..._props,
        label: _props.definition.named ? "Input Value" : undefined,
    }

    if (type.baseType === "string" && type.enumValues)
        return <SelectConfig {...props} />

    if (type.baseType === "string" && !type.enumValues)
        return <StringConfig {...props} />
}


function StringConfig({ input, definition, label, ...props }) {

    const { long } = definition.stringSettings || {}

    const setValue = useSetInputValue(undefined, input.id, 200)

    return long ?
        <Textarea
            defaultValue={input.value || ""}
            onValueChange={setValue}
            size="sm"
            minRows={2}
            maxRows={12}
            label={label} labelPlacement="outside-left"
            placeholder="Type something..."
            classNames={{
                mainWrapper: "grow",
            }}
            {...props}
        /> :
        <Input
            defaultValue={input.value || ""}
            onValueChange={setValue}
            size="sm"
            label={label} labelPlacement="outside-left"
            placeholder="Type something..."
            classNames={{
                mainWrapper: "grow",
            }}
            {...props}
        />
}


function SelectConfig({ input, definition, label, ...props }) {

    const { multiple, useEnumValues } = definition.enumSettings || {}

    const setValue = useSetInputValue(undefined, input.id)

    const selectedKeys = useMemo(() => new Set(multiple ? input.value : (input.value ? [input.value] : [])), [multiple, input.value])
    const onSelectionChange = set => {
        const arr = Array.from(set)
        setValue(multiple ? arr : (arr[0] ?? null))
    }

    const selectItems = useEnumValues?.()
    const isLoadingSelectItems = useEnumValues && !selectItems

    useEffect(() => {
        onSelectionChange(new Set(
            [...selectedKeys].filter(key => selectItems?.find(item => item.id === key))
        ))
    }, [selectItems])

    return (
        <Select
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            selectionMode={multiple ? "multiple" : "single"}
            size="sm"
            label={label} labelPlacement="outside-left"
            placeholder="Pick one..."
            classNames={{
                // mainWrapper: "grow",
                mainWrapper: "min-w-[12rem]"
            }}
            items={selectItems ?? []}
            isLoading={isLoadingSelectItems}
            {...props}
        >
            {item =>
                <SelectItem key={item.id} value={item.id} textValue={item.label}>
                    <div className="gap-unit-sm">
                        <p>{item.label}</p>
                        {item.type &&
                            <p className="text-default-500 text-xs">{typeMap[item.type]}</p>}
                    </div>
                </SelectItem>}
        </Select>
    )
}


function useIsBeingDerived(nodeId, definition) {
    return useStore(s => {
        if (!definition.derivedFrom)
            return false

        return s.nodeInternals.get(nodeId).data.inputs.find(i => i.definition === definition.derivedFrom)?.mode === "config"
    })
}
