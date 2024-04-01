import { NodeDefinitions } from "packages/execution.js"
import type { Node, Workflow, WorkflowRun, WorkflowRunState } from "shared/types.js"
import { fetchIntegrationToken } from "./db.js"


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

        const token = node.data.serviceAccount ?
            await fetchIntegrationToken(node.data.serviceAccount) :
            undefined

        const callAction = async () => {
            if (!definition)
                throw new Error(`Node definition not found: ${node.data.definition}`)

            return definition?.action(inputValues, {
                node,
                triggerData,
                runState,
                token,
            })
        }

        const normalizedOutputs = {}

        const actionOutputs = await callAction()
            .then((outputs: any) => {
                if (node.data.controlModifiers?.finished) {
                    normalizedOutputs["control-output:finished"] = true
                }
                return outputs
            })
            .catch((err: Error) => {
                runState.errors![node.id] = err.message

                console.debug(`Error in node ${node.id}:`, err.message)

                if (node.data.controlModifiers?.error) {
                    normalizedOutputs["control-output:error"] = err.message
                }
            })

        Object.entries(actionOutputs || {}).forEach(([outputDefId, outputValue]) => {
            const outputDefinition = definition?.outputs[outputDefId]

            // regular output: any
            if (!outputDefinition?.group) {
                const outputId = node.data.outputs.find(output => output.definition === outputDefId)!.id
                normalizedOutputs[outputId] = outputValue
                return
            }

            // named group output: { [name: string]: any }
            if (outputDefinition.named) {
                Object.entries(outputValue || {}).forEach(([name, value]) => {
                    const outputId = node.data.outputs.find(output => output.definition === outputDefId && output.name === name)!.id
                    normalizedOutputs[outputId] = value
                })
                return
            }

            // unnamed group output: any[]
            node.data.outputs
                .filter(output => output.definition === outputDefId)
                .forEach((output, i) => normalizedOutputs[output.id] = outputValue?.[i])
        })

        await Promise.all(Object.entries(normalizedOutputs).map(async ([outputId, outputValue]) => {
            runState.outputs![node.id][outputId] = outputValue

            await Promise.all(edges.filter(edge => edge.source === node.id && edge.sourceHandle === outputId)
                .map(edge => checkIfNodeCanRun(edge.target).catch(err => {
                    runState.errors![edge.target] = err.message
                })))
        }))
    }

    const checkIfNodeCanRun = async (nodeId: string) => {
        const node = nodes.find(node => node.id === nodeId)!

        if (node.data.disabled)
            return

        const getAttachedEdge = (handle: string) => edges.find(edge => edge.target === nodeId && edge.targetHandle === handle)

        const getEdgeOutputValue = (attachedEdge: { source: string, sourceHandle: string }) => runState.outputs![attachedEdge.source]?.[attachedEdge.sourceHandle]

        const allInputsAvailable = [
            ...node.data.inputs,
            ...node.data.controlModifiers?.conditional ? [{ id: "control-input:conditional" }] : [],
            ...node.data.controlModifiers?.waitFor ? [{ id: "control-input:waitFor" }] : [],
            ...node.data.controlModifiers?.delay ? [{ id: "control-input:delay" }] : []
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
            const attachedEdge = getAttachedEdge("control-input:conditional")
            if (attachedEdge && !getEdgeOutputValue(attachedEdge))
                return
        }

        const inputValues = node.data.inputs.reduce((acc, input) => {
            const attachedEdge = getAttachedEdge(input.id)
            if (!attachedEdge)
                return acc

            const definition = NodeDefinitions.get(node.data.definition)?.inputs[input.definition]
            if (!definition)
                throw new Error(`Input definition not found: ${input.definition}`)

            const value = getEdgeOutputValue(attachedEdge)

            if (!definition.group) {
                acc[input.definition] = value
                return acc
            }

            if (definition.named) {
                acc[input.definition] ??= {}
                acc[input.definition][input.name] = value
                return acc
            }

            acc[input.definition] ??= []
            acc[input.definition].push(value)
            return acc
        }, {})

        // check for delay control modifier
        if (node.data.controlModifiers?.delay) {
            const attachedEdge = getAttachedEdge("control-input:delay")

            if (attachedEdge) {
                const delayValue = parseFloat(getEdgeOutputValue(attachedEdge))

                if (delayValue < 0 || delayValue > 5000)
                    throw new Error("Delay must be between 0 and 5000")

                await new Promise(resolve => setTimeout(resolve, delayValue))
            }
        }

        await runNode(node, inputValues)
    }

    await Promise.all(startingNodes.map(node => runNode(node, {})))

    return runState
}