import BooleanType from "@pkg/data/type-meta/boolean.shared"
import StringType from "@pkg/data/type-meta/string.shared"
import type { Insertable, Selectable } from "kysely"
import { NodeDefinitions } from "packages/execution"
import type { WorkflowGraphs, WorkflowRunNodeOutputs, WorkflowRuns, Workflows } from "shared/db"
import { TypeMetaWrapper } from "shared/type-meta-wrapper"
import type { Edge, Node } from "shared/types"
import { IdNamespace, createSubspaceId } from "shared/utils"
import { trpcClient } from "./trpc-client"


const ControlModifierId = {
    Conditional: createSubspaceId(IdNamespace.ControlInputHandle, "conditional"),
    WaitFor: createSubspaceId(IdNamespace.ControlInputHandle, "wait-for"),
    Delay: createSubspaceId(IdNamespace.ControlInputHandle, "delay"),
    Finished: createSubspaceId(IdNamespace.ControlOutputHandle, "finished"),
    Error: createSubspaceId(IdNamespace.ControlOutputHandle, "error"),
}


interface RunWorkflowOptions {
    run: Pick<Selectable<WorkflowRuns>, "id" | "trigger_payload">
    workflow: Selectable<Workflows>
    graph: Selectable<WorkflowGraphs>
}

export async function runWorkflow({ workflow, run, graph }: RunWorkflowOptions) {

    const triggerData = run.trigger_payload ?? null
    const nodes = graph.nodes as Node[]
    const edges = graph.edges as Edge[]

    const startingNodes = nodes.filter(node =>
        edges.every(edge => edge.target !== node.id)
    )

    const nodeOutputs: Insertable<WorkflowRunNodeOutputs>[] = []
    const nodeErrors: Record<string, string> = {}

    async function runNode(node: Node, inputValues: Record<string, any>) {

        console.debug("Running node", node.id, `(${node.data.definition})`)

        const definition = NodeDefinitions.get(node.data.definition)
        if (!definition)
            throw new Error(`Node definition not found: ${node.data.definition}`)

        if (definition.requiredService && !node.data.serviceAccount)
            throw new Error(`Must link a service account`)

        function addOutput(output: Omit<Insertable<WorkflowRunNodeOutputs>, "id" | "created_at" | "node_id" | "workflow_run_id">) {
            nodeOutputs.push({
                node_id: node.id,
                workflow_run_id: run.id,
                ...output,
            })
        }

        Promise.resolve(
            definition.action(inputValues, {
                node,
                triggerData,
                ...node.data.serviceAccount && {
                    token: await trpcClient.serviceAccounts.getToken.query({
                        accountId: node.data.serviceAccount!,
                        requestingWorkflowId: workflow.id,
                    })
                },
                projectId: workflow.project_id!,
                workflowId: workflow.id,
            })
        ).then(outputs => {
            if (node.data.controlModifiers?.finished)
                addOutput({
                    handle_id: ControlModifierId.Finished,
                    type_meta_id: BooleanType.id,
                    value: true,
                })

            Object.entries(outputs || {}).forEach(([outputDefId, rawValue]) => {
                const outputDef = definition.outputs?.[outputDefId]

                if (!outputDef) {
                    console.warn(`Node (${node.id}) returned output that doesn't have a matching definition (Output key: ${outputDefId})`)
                    return
                }

                node.data.outputs.filter(o => o.definition === outputDefId)
                    .forEach((output, i) => {
                        const pickedRawValue = outputDef.groupType === "list"
                            ? rawValue?.[i]
                            : outputDef.groupType === "record"
                                ? rawValue?.[output.name || ""]
                                : rawValue

                        addOutput({
                            handle_id: output.id,
                            ...TypeMetaWrapper.from(pickedRawValue).toRow()
                        })
                    })
            })
        }).catch(err => {
            nodeErrors[node.id] = err.message

            if (node.data.controlModifiers?.error)
                addOutput({
                    handle_id: ControlModifierId.Error,
                    type_meta_id: StringType.id,
                    value: err.message,
                })

            if (node.data.controlModifiers?.finished)
                addOutput({
                    handle_id: ControlModifierId.Finished,
                    type_meta_id: BooleanType.id,
                    value: false,
                })
        })

        await Promise.all(
            nodeOutputs
                .filter(o => o.node_id === node.id)
                .map(o => Promise.all(
                    // using a set to avoid duplicate runs
                    Array.from(new Set(
                        edges
                            .filter(edge =>
                                edge.source === node.id
                                && edge.sourceHandle === o.id
                            )
                            .map(edge => edge.target)
                    )).map(nodeId => checkIfNodeCanRun(nodeId).catch(err => {
                        console.error(err)
                        nodeErrors[nodeId] = err.message
                    }))
                ))
        )
    }

    async function checkIfNodeCanRun(nodeId: string) {
        const node = nodes.find(n => n.id === nodeId)!

        if (node.data.disabled)
            return

        const getAttachedEdge = (handle: string) => edges.find(
            edge => edge.target === nodeId
                && edge.targetHandle === handle
        )

        const getEdgeOutputValue = (attachedEdge: {
            source: string
            sourceHandle: string
        }) => nodeOutputs.find(
            o => o.node_id === attachedEdge.source
                && o.handle_id === attachedEdge.sourceHandle
        )?.value

        const inputsToCheck: {
            id: string
            [key: string]: any
        }[] = [...node.data.inputs]

        if (node.data.controlModifiers?.conditional)
            inputsToCheck.push({ id: ControlModifierId.Conditional })

        if (node.data.controlModifiers?.waitFor)
            inputsToCheck.push({ id: ControlModifierId.WaitFor })

        if (node.data.controlModifiers?.delay)
            inputsToCheck.push({ id: ControlModifierId.Delay })

        const allInputsAvailable = inputsToCheck.every(i => {
            const attachedEdge = getAttachedEdge(i.id)
            return attachedEdge
                ? getEdgeOutputValue(attachedEdge) !== undefined
                : true
        })

        if (!allInputsAvailable)
            return

        // check conditional control modifier
        if (node.data.controlModifiers?.conditional) {
            const attachedEdge = getAttachedEdge(ControlModifierId.Conditional)
            if (attachedEdge && !getEdgeOutputValue(attachedEdge))
                return
        }

        const nodeDefinition = NodeDefinitions.get(node.data.definition)
        if (!nodeDefinition)
            throw new Error(`Node definition not found: ${node.data.definition}`)

        const inputEntries = Object.entries(nodeDefinition.inputs ?? {})
            .map(([inputDefId, inputDef]) => {
                const inputs = node.data.inputs
                    .filter(i => i.definition === inputDefId)

                const currentInputValues = inputs.map(input => {
                    const attachedEdge = getAttachedEdge(input.id)
                    return attachedEdge
                        ? getEdgeOutputValue(attachedEdge)
                        : undefined
                })

                const convertedInputs = inputDef.groupType === "list"
                    ? currentInputValues
                    : inputDef.groupType === "record"
                        ? inputs.reduce((acc, input, i) => {
                            const val = currentInputValues[i]
                            if (val !== undefined && typeof input.name === "string")
                                acc[input.name] = val
                            return acc
                        }, {})
                        : currentInputValues[0]

                return [inputDefId, convertedInputs]
            })

        const inputValues = Object.fromEntries(inputEntries)

        // check for delay control modifier
        if (node.data.controlModifiers?.delay) {
            const attachedEdge = getAttachedEdge(ControlModifierId.Delay)

            if (attachedEdge) {
                const delayValue = parseFloat(
                    getEdgeOutputValue(attachedEdge)?.toString() ?? ""
                )

                if (delayValue < 0 || delayValue > 5000)
                    throw new Error("Delay must be between 0 and 5000")

                if (isNaN(delayValue))
                    throw new Error("Delay value must be a valid number")

                await new Promise(resolve => setTimeout(resolve, delayValue))
            }
        }

        await runNode(node, inputValues)
    }

    await Promise.all(startingNodes.map(node => checkIfNodeCanRun(node.id)))

    return { nodeOutputs, nodeErrors }
}