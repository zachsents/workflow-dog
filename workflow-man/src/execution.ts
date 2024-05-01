import { NodeDefinitions } from "packages/execution"
import type { Node, Workflow, WorkflowRun, WorkflowRunState } from "shared/types"
import { fetchIntegrationToken } from "./db"


enum ControlModifierId {
    Conditional = "control-input:conditional",
    WaitFor = "control-input:waitFor",
    Delay = "control-input:delay",
    Finished = "control-output:finished",
    Error = "control-output:error",
}


export async function runWorkflow(run: WorkflowRun, workflow: Workflow) {

    const triggerData = run.trigger_data || {}

    const { nodes, edges } = workflow.graph

    const runState: WorkflowRunState = { errors: {}, outputs: {} }

    const startingNodes = nodes.filter(node =>
        edges.every(edge => edge.target !== node.id)
    )

    const runNode = async (node: Node, inputValues: Record<string, any>) => {

        console.debug("Running node", node.id, `(${node.data.definition})`)

        const definition = NodeDefinitions.get(node.data.definition)
        runState.outputs![node.id] ??= {}

        const callAction = async () => {
            if (!definition)
                throw new Error(`Node definition not found: ${node.data.definition}`)

            if (definition.requiredService && !node.data.serviceAccount)
                throw new Error(`Must link a service account`)

            return definition?.action(inputValues, {
                node,
                triggerData,
                runState,
                token: node.data.serviceAccount
                    ? await fetchIntegrationToken(node.data.serviceAccount)
                    : {},
                projectId: workflow.team_id,
                workflowId: run.workflow_id,
            })
        }

        const normalizedOutputs = {}

        const actionOutputs = await callAction()
            .then((outputs: any) => {
                if (node.data.controlModifiers?.finished) {
                    normalizedOutputs[ControlModifierId.Finished] = true
                }
                return outputs
            })
            .catch((err: Error) => {
                runState.errors![node.id] = err.message

                console.debug(`Error in node ${node.id}:`, err.message)

                if (node.data.controlModifiers?.error) {
                    normalizedOutputs[ControlModifierId.Error] = err.message
                }
            })

        Object.entries(actionOutputs || {}).forEach(([outputDefinitionId, rawOutputValue]) => {
            const outputDefinition = definition?.outputs[outputDefinitionId]

            if (!outputDefinition) {
                console.warn(`Node (${node.id}) returned output that doesn't have a matching definition (Output key: ${outputDefinitionId})`)
                return
            }

            node.data.outputs
                .filter(output => output.definition === outputDefinitionId)
                .forEach((output, i) => {
                    normalizedOutputs[output.id] = outputDefinition.group
                        ? outputDefinition.named
                            // named group: use name as object key
                            ? rawOutputValue?.[output.name || ""]
                            // unnamed group: use index as array key
                            : rawOutputValue?.[i]
                        // single output: use raw value
                        : rawOutputValue
                })
        })

        await Promise.all(
            Object.entries(normalizedOutputs).map(async ([outputId, outputValue]) => {
                runState.outputs![node.id][outputId] = outputValue

                const outgoingEdges = edges.filter(edge =>
                    edge.source === node.id
                    && edge.sourceHandle === outputId
                )

                // using a set to avoid duplicate runs
                const targetedNodeIds = Array.from(new Set(
                    outgoingEdges.map(edge => edge.target)
                ))

                const targetExecutions = targetedNodeIds.map(
                    nodeId => checkIfNodeCanRun(nodeId).catch(err => {
                        console.error(err)
                        runState.errors![nodeId] = err.message
                    })
                )

                await Promise.all(targetExecutions)
            })
        )
    }

    const checkIfNodeCanRun = async (nodeId: string) => {
        const node = nodes.find(node => node.id === nodeId)!

        if (node.data.disabled)
            return

        const getAttachedEdge = (handle: string) => edges.find(edge => edge.target === nodeId && edge.targetHandle === handle)

        const getEdgeOutputValue = (attachedEdge: { source: string, sourceHandle: string }) => runState.outputs![attachedEdge.source]?.[attachedEdge.sourceHandle]

        const allInputsAvailable = [
            ...node.data.inputs,
            ...node.data.controlModifiers?.conditional ? [{ id: ControlModifierId.Conditional }] : [],
            ...node.data.controlModifiers?.waitFor ? [{ id: ControlModifierId.WaitFor }] : [],
            ...node.data.controlModifiers?.delay ? [{ id: ControlModifierId.Delay }] : []
        ].every(input => {
            const attachedEdge = getAttachedEdge(input.id)

            if (!attachedEdge)
                return true

            return getEdgeOutputValue(attachedEdge) !== undefined
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

        const inputValues = Object.fromEntries(
            Object.entries(nodeDefinition.inputs).map(([inputDefinitionId, inputDefinition]) => {
                const inputs = node.data.inputs
                    .filter(input => input.definition === inputDefinitionId)

                const currentInputValues = inputs.map(input => {
                    const attachedEdge = getAttachedEdge(input.id)
                    return attachedEdge
                        ? getEdgeOutputValue(attachedEdge)
                        : undefined
                })

                const convertedInputs = inputDefinition.group
                    ? inputDefinition.named
                        ? inputs.reduce((acc, input, i) => {
                            const val = currentInputValues[i]
                            if (val !== undefined && typeof input.name === "string")
                                acc[input.name] = val
                            return acc
                        }, {})
                        : currentInputValues
                    : currentInputValues[0]

                return [inputDefinitionId, convertedInputs]
            })
        )

        // check for delay control modifier
        if (node.data.controlModifiers?.delay) {
            const attachedEdge = getAttachedEdge(ControlModifierId.Delay)

            if (attachedEdge) {
                const delayValue = parseFloat(getEdgeOutputValue(attachedEdge))

                if (delayValue < 0 || delayValue > 5000)
                    throw new Error("Delay must be between 0 and 5000")

                await new Promise(resolve => setTimeout(resolve, delayValue))
            }
        }

        await runNode(node, inputValues)
    }

    await Promise.all(startingNodes.map(node => checkIfNodeCanRun(node.id)))

    return runState
}