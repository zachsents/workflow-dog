import { Button, Card, CardHeader, Select, SelectItem, Tooltip } from "@nextui-org/react"
import { useNodeIntegrationAccount } from "@web/modules/integrations"
import { useDefinition, useNodeProperty, useNodePropertyValue, useUpdateInternalsWhenNecessary } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import classNames from "classnames"
import { resolve as resolveIntegration } from "integrations/web"
import { useMemo } from "react"
import { TbExternalLink, TbPlus } from "react-icons/tb"
import Group from "../../layout/Group"
import ActionNodeHandle from "./ActionNodeHandle"
import ActionNodeHeader from "./ActionNodeHeader"
import { ConfigComponent } from "./ActionNodeModal"
import ActionNodeShell from "./ActionNodeShell"
import NodeModifierWrapper from "./NodeModifierWrapper"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()

    useUpdateInternalsWhenNecessary()

    return (
        <ActionNodeShell>
            <NodeModifierWrapper>
                {definition.renderNode ?
                    <div className="flex flex-row items-stretch">
                        <InputsRenderer />

                        <div className="grow">
                            <definition.renderNode id={id} />
                        </div>

                        <OutputsRenderer />
                    </div> :
                    <Card
                        className={classNames("!transition rounded-xl border border-gray-800 overflow-visible max-w-[28rem]",
                            selected ? "shadow-xl" : "shadow-md",
                        )}
                    >
                        <CardHeader className="p-0 rounded-t-xl overflow-clip">
                            <ActionNodeHeader withSettings />
                        </CardHeader>
                        <Group
                            className="justify-between flex-nowrap py-unit-xs"
                        >
                            <InputsRenderer />

                            <div className="grow px-2">
                                {definition.renderBody &&
                                    <definition.renderBody id={id} />}

                                {Object.entries(definition.inputs).filter(([, inputDef]) => inputDef.renderInBody).map(([inputDefId, inputDef]) =>
                                    <div key={inputDefId}>
                                        <p className="font-bold text-xs">
                                            {inputDef.name}
                                        </p>
                                        <ConfigComponent
                                            input={data.inputs.find(i => i.definition == inputDefId)}
                                            definition={inputDef}
                                        />
                                    </div>
                                )}
                            </div>

                            <OutputsRenderer />
                        </Group>
                    </Card>}
            </NodeModifierWrapper>

            {definition.requiredIntegration &&
                <div className={classNames(
                    "transition-opacity",
                    (data.integrationAccount && !selected) ? "opacity-0 pointer-events-none" : "opacity-100",
                )}>
                    <RequiredIntegration />
                </div>}
        </ActionNodeShell>
    )
}



function RequiredIntegration() {

    const { data: workflow } = useWorkflow()

    const definition = useDefinition()
    const { available, isPending } = useNodeIntegrationAccount()

    const integration = resolveIntegration(definition.requiredIntegration.service)

    const Icon = ({ className }) => <integration.icon className={classNames("text-white p-1 rounded-md aspect-square", className)} style={{
        backgroundColor: integration.color,
    }} />

    const [selectedAccount, setSelectedAccount] = useNodeProperty(undefined, "data.integrationAccount")
    const selectedKeys = useMemo(() => new Set(selectedAccount ? [selectedAccount] : []), [selectedAccount])
    const onSelectionChange = keys => setSelectedAccount(keys.values().next().value)

    const connectUrl = useMemo(() => {
        const url = new URL(`https://integrate-e45frdiv4a-uc.a.run.app/connect/${definition.requiredIntegration.service}`)
        url.searchParams.append("t", workflow?.teamId)

        if (definition.requiredIntegration.scopes)
            url.searchParams.append("scopes", definition.requiredIntegration.scopes.join(","))

        return url.toString()
    }, [definition.requiredIntegration.service, workflow?.teamId, definition.requiredIntegration.scopes])

    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-unit-xs max-w-full w-[16rem]">
            {available?.length === 0 ?
                <Button
                    as="a" href={connectUrl} fullWidth color="primary"
                    target="_blank"
                    className="rounded-full text-[0.625rem] min-h-0 h-auto py-1"
                    endContent={<TbExternalLink />}
                >
                    Connect {integration.name}
                </Button> :
                <Group className="gap-1">
                    <Select
                        size="sm" variant="bordered"
                        aria-label="Select an account to use for this action"
                        selectedKeys={selectedKeys}
                        onSelectionChange={onSelectionChange}
                        isLoading={isPending}
                        items={available ?? []}
                        placeholder={`Select a ${integration.name} account`}
                        spinnerProps={{ size: "sm", color: "primary" }}
                        classNames={{
                            trigger: classNames(
                                "rounded-full bg-white min-h-0 h-auto px-1 py-0.5 border shadow-sm",
                                selectedAccount ? "!border-default-300" : "!border-danger-500",
                            ),
                            value: classNames(
                                "text-[0.5rem]",
                                selectedAccount ? "text-default-900" : "text-danger-500",
                            ),
                            popoverContent: "min-w-[20rem]"
                        }}
                        renderValue={items => items.map(item =>
                            <Group className="gap-unit-xs" key={`selected` + item.key}>
                                <div className="shrink-0">
                                    <Icon className="text-lg" />
                                </div>
                                <span>{item.data.displayName}</span>
                            </Group>
                        )}
                    >
                        {item => {
                            const hasRequiredScopes = definition.requiredIntegration.scopes?.every(scope => item.scopes?.includes(scope)) ?? true
                            return <SelectItem
                                startContent={<Icon className="text-2xl" />}
                                {...!hasRequiredScopes && {
                                    endContent: <TbExternalLink className="text-danger-500" />,
                                    as: "a",
                                    href: connectUrl,
                                    target: "_blank",
                                }}
                                aria-label={item.displayName}
                                key={item.id}
                            >
                                <p>
                                    {item.displayName}
                                </p>
                                {!hasRequiredScopes &&
                                    <p className="text-default-500">
                                        Needs additional permissions
                                    </p>}
                            </SelectItem>
                        }}
                    </Select>

                    <Tooltip content="Add Account">
                        <Button
                            isIconOnly color="primary" variant="flat"
                            className="rounded-full min-h-0 h-auto min-w-0 w-auto p-1"
                            as="a" href={connectUrl} target="_blank"
                        >
                            <TbPlus />
                        </Button>
                    </Tooltip>
                </Group>}
        </div>
    )
}


function InputsRenderer() {

    const definition = useDefinition()
    const data = useNodePropertyValue(undefined, "data")

    const inputGroups = useMemo(
        () => Object.entries(definition?.inputs ?? {})
            .map(([inputDefId, inputDef]) => [
                inputDef.group ? inputDef.name : undefined,
                data.inputs.filter(input => input.definition == inputDefId && !input.hidden && input.mode === "handle"),
            ])
            .filter(([, inputs]) => inputs.length > 0),
        [data.inputs]
    )

    return (
        <Group className="flex-col justify-center !items-start gap-2">
            {inputGroups.map(([groupName, inputs], i) =>
                <div className="px-2" key={groupName || i}>
                    {groupName &&
                        <p className="text-[0.625rem] text-default-500">
                            {groupName}
                        </p>}

                    <div className="flex flex-col items-start gap-1 -ml-4">
                        {inputs.map(input =>
                            <ActionNodeHandle {...input} type="target" key={input.id} />
                        )}
                    </div>
                </div>
            )}
        </Group>
    )
}


function OutputsRenderer() {

    const definition = useDefinition()
    const data = useNodePropertyValue(undefined, "data")

    const outputGroups = useMemo(
        () => Object.entries(definition?.outputs ?? {})
            .map(([outputDefId, outputDef]) => [
                outputDef.group ? outputDef.name : undefined,
                data.outputs.filter(output => output.definition == outputDefId && !output.hidden),
            ])
            .filter(([, outputs]) => outputs.length > 0),
        [data.outputs]
    )

    return (
        <Group className="flex-col justify-center !items-end gap-2">
            {outputGroups.map(([groupName, outputs], i) =>
                <div className="px-2" key={groupName || i}>
                    {groupName &&
                        <p className="text-[0.625rem] text-default-500">
                            {groupName}
                        </p>}

                    <div className="flex flex-col items-start gap-1 -mr-4">
                        {outputs.map(output =>
                            <ActionNodeHandle {...output} type="source" key={output.id} />
                        )}
                    </div>
                </div>
            )}
        </Group>
    )
}