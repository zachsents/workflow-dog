import { useNodeInputs, useNodeOutputs } from "@web/modules/workflow-editor/graph/interfaces"
import { useDefinition, useDisabled, useModifier, useNodeHasValidationErrors, useUpdateInternals } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import { forwardRef, useEffect, useMemo } from "react"
import { TbCheck, TbDots, TbPlayerPlay, TbX } from "react-icons/tb"
import { useStore } from "reactflow"
import ActionNodeHandle from "./ActionNodeHandle"
// import CheckableMenuItem from "./CheckableMenuItem"
import NodeModifierWrapper from "./NodeModifierWrapper"
// import ConfigureNodeModal from "./config-modal/ConfigureNodeModal"
import { Button, Card, CardHeader, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Tooltip } from "@nextui-org/react"
import { plural } from "@web/modules/grammar"
import { list as modifiersList } from "@web/modules/workflow-editor/modifiers"
import Group from "../layout/Group"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()
    const displayName = data.name || definition?.name

    // const [, setConfiguringNodeId] = useEditorStoreProperty("nodeBeingConfigured")
    // const openNodeConfiguration = () => setConfiguringNodeId(id)

    const hasValidationErrors = useNodeHasValidationErrors(id)

    const shownInputs = useMemo(() => data.inputs?.filter(
        input => input.mode == "handle" &&
            !input.hidden
    ), [data.inputs])

    const shownOutputs = useMemo(() => data.outputs?.filter(
        output => !output.hidden
    ), [data.outputs])

    const [modifier, setModifier, clearModifier] = useModifier(id)

    const [_disabled, upstreamDisabled, setDisabled, disabledMessage] = useDisabled(id)
    const disabled = upstreamDisabled || _disabled

    const selectedRun = useStore(s => s.selectedRun)
    const runErrors = selectedRun?.errors?.filter(error => error.node == id)
    const hasRunErrors = runErrors?.length > 0

    return (
        <div className="relative">
            {definition ?
                <Tooltip
                    content={disabledMessage} isDisabled={!disabledMessage} placement="bottom"
                    className="max-w-[16-rem]" closeDelay={0}
                >
                    <div
                        className={classNames("rounded-xl transition-transform", {
                            "outline outline-2 outline-primary-300 outline-offset-2 scale-105": selected,
                            "hover:outline hover:outline-2 hover:outline-primary-200 hover:outline-offset-2": !selected,
                            "opacity-40": disabled,
                        })}
                    >
                        <NodeModifierWrapper>
                            <Card className={classNames("!transition rounded-xl border border-gray-800 overflow-visible min-w-[12rem] max-w-[20rem]",
                                selected ? "shadow-xl" : "shadow-md",
                            )}>
                                <CardHeader className="p-0 rounded-t-xl" style={{
                                    backgroundColor: definition.color,
                                }}>
                                    <Group className="w-full justify-between gap-unit-lg text-white p-1">
                                        <Tooltip
                                            content={definition?.name}
                                            isDisabled={displayName == definition?.name}
                                            closeDelay={0}
                                        >
                                            <Group className="gap-unit-xs">
                                                {definition.icon &&
                                                    <definition.icon />}
                                                <p className="text-sm font-semibold">
                                                    {displayName}
                                                </p>
                                            </Group>
                                        </Tooltip>
                                        <Group className="gap-1 flex-nowrap">
                                            <Dropdown placement="right-start">
                                                <DropdownTrigger>
                                                    <ToolbarIcon icon={TbDots} />
                                                </DropdownTrigger>
                                                <DropdownMenu disabledKeys={["run-node"]}>
                                                    <DropdownItem
                                                        startContent={<TbPlayerPlay />}
                                                        endContent={<Chip size="sm" variant="flat" color="primary">Coming Soon</Chip>}
                                                        key="run-node"
                                                    >
                                                        Run this node
                                                    </DropdownItem>
                                                    {disabled ?
                                                        <DropdownItem
                                                            startContent={<TbCheck />}
                                                            onPress={() => setDisabled(false)}
                                                            key="enable-node"
                                                        >
                                                            Enable
                                                        </DropdownItem> :
                                                        <DropdownItem
                                                            startContent={<TbX />}
                                                            onPress={() => setDisabled(true)}
                                                            key="disable-node"
                                                        >
                                                            Disable
                                                        </DropdownItem>}
                                                    <DropdownSection title="Control Modifiers" items={modifiersList}>
                                                        {modType => {
                                                            const isActive = modifier?.type == modType.id
                                                            return <DropdownItem
                                                                startContent={<modType.icon />}
                                                                endContent={isActive && <TbCheck />}
                                                                onPress={() => isActive ? clearModifier() : setModifier(modType.id)}
                                                                key={modType.id}
                                                            >
                                                                {modType.name}
                                                            </DropdownItem>
                                                        }}
                                                    </DropdownSection>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </Group>
                                    </Group>
                                </CardHeader>
                                <Group
                                    className="justify-between items-stretch flex-nowrap py-unit-xs -mx-2"
                                >
                                    <Group className="basis-0 min-w-0 flex-col justify-center !items-start gap-2">
                                        {/* <p className="px-unit-md text-default-500 text-xs">
                                            Inputs
                                        </p> */}
                                        {shownInputs?.map(input =>
                                            <ActionNodeHandle {...input} type="target" key={input.id} />
                                        )}
                                    </Group>

                                    {definition.renderBody &&
                                        <div className="flex-1 max-w-[80%] overflow-hidden">
                                            {<definition.renderBody id={id} />}
                                        </div>}

                                    <Group className="basis-0 min-w-0 flex-col justify-center !items-end gap-2">
                                        {/* <p className="px-unit-md text-default-500 text-xs text-end">
                                            Outputs
                                        </p> */}
                                        {shownOutputs?.map(output =>
                                            <ActionNodeHandle {...output} type="source" key={output.id} />
                                        )}
                                    </Group>
                                </Group>
                            </Card>
                        </NodeModifierWrapper>
                        {/* <ConfigureNodeModal /> */}

                        {hasRunErrors &&
                            <Tooltip placement="bottom" color="danger" closeDelay={0} content={
                                <div className="flex flex-col gap-1 items-stretch">
                                    {runErrors.map((error, i) =>
                                        <p className="text-white font-bold" key={i}>
                                            {error.message}
                                        </p>
                                    )}
                                </div>
                            }>
                                <div className="absolute left-1/2 top-full -translate-x-1/2 mt-xs ">
                                    <Button
                                        className="border-solid border-1 border-red"
                                        color="red" size="sm" compact variant="light"
                                    >
                                        {runErrors.length} {plural("error", runErrors.length)}
                                    </Button>
                                </div>
                            </Tooltip>}
                    </div >
                </Tooltip> :
                <Fallback />}

            <UpdateInternals />
        </div>
    )
}


function Fallback() {
    return (
        <p className="w-40 shadow-sm bg-gray-100 rounded p-xs" ta="center">
            This node is having problems.
        </p>
    )
}


function UpdateInternals() {

    const updateInternals = useUpdateInternals()

    const inputs = useNodeInputs()
    const outputs = useNodeOutputs()
    const [modifier] = useModifier()

    const checksum = useMemo(
        () => `${inputs?.map(input => `${input.hidden}${input.mode}`).join()}` +
            `${outputs?.map(output => `${output.hidden}`).join()}` +
            modifier?.id,
        [inputs, outputs, modifier]
    )

    useEffect(() => {
        updateInternals()
    }, [checksum])
}


const ToolbarIcon = forwardRef(({ icon: Icon, className, ...props }, ref) =>
    <Button
        size="sm" variant="light" isIconOnly
        className={classNames("nodrag text-white", className)}
        {...props}
        ref={ref}
    >
        <Icon />
    </Button>
)
ToolbarIcon.displayName = "ToolbarIcon"