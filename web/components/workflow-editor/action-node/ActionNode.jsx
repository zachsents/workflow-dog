import { useDefinition, useUpdateInternalsWhenNecessary } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import { useMemo } from "react"
import ActionNodeHandle from "./ActionNodeHandle"
import NodeModifierWrapper from "./NodeModifierWrapper"
import { Card, CardHeader } from "@nextui-org/react"
import Group from "../../layout/Group"
import ActionNodeHeader from "./ActionNodeHeader"
import { ConfigComponent } from "./ActionNodeModal"
import ActionNodeShell from "./ActionNodeShell"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()

    // const hasValidationErrors = useNodeHasValidationErrors(id)

    const inputGroups = useMemo(
        () => Object.entries(definition?.inputs ?? {})
            .map(([inputDefId, inputDef]) => [
                inputDef.group ? inputDef.name : undefined,
                data.inputs.filter(input => input.definition == inputDefId && !input.hidden && input.mode === "handle"),
            ])
            .filter(([, inputs]) => inputs.length > 0),
        [data.inputs]
    )

    const outputGroups = useMemo(
        () => Object.entries(definition?.outputs ?? {})
            .map(([outputDefId, outputDef]) => [
                outputDef.group ? outputDef.name : undefined,
                data.outputs.filter(output => output.definition == outputDefId && !output.hidden),
            ])
            .filter(([, outputs]) => outputs.length > 0),
        [data.outputs]
    )

    useUpdateInternalsWhenNecessary()

    return (
        <ActionNodeShell>
            <NodeModifierWrapper>
                <Card
                    className={classNames("!transition rounded-xl border border-gray-800 overflow-visible min-w-[12rem] max-w-[28rem]",
                        selected ? "shadow-xl" : "shadow-md",
                    )}
                >
                    <CardHeader className="p-0 rounded-t-xl bg-[var(--dark-color)]">
                        <ActionNodeHeader withSettings />
                    </CardHeader>
                    <Group
                        className="justify-between flex-nowrap py-unit-xs"
                    >
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

                        <div className="grow px-4">
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
                    </Group>
                </Card>
            </NodeModifierWrapper>
        </ActionNodeShell>
    )
}

