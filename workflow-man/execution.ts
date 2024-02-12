import { object as nodeDefinitions } from "nodes/server.js"


type Node = {
    id: string
    data: {
        definition: string
        state: Record<string, any>
        inputs: {
            id: string
            definition: string
            name?: string
        }[]
        outputs: {
            id: string
            definition: string
            name?: string
        }[]
    }
}

type RunState = {
    outputs?: {
        [nodeId: string]: {
            [outputId: string]: any
        }
    },
    errors?: {
        [nodeId: string]: string
    }
}

type Workflow = {
    id: string
    graph: {
        nodes: Node[]
        edges: {
            id: string
            source: string
            sourceHandle: string
            target: string
            targetHandle: string
        }[]
    }
}

type WorkflowRun = {
    id: string
    status: "pending" | "running" | "completed" | "failed" | "scheduled" | "canceled"
    state: RunState
    trigger_data: Record<string, any>
}


export async function runWorkflow(run: WorkflowRun, workflow: Workflow) {

    const triggerData = run.trigger_data

    const { nodes, edges } = workflow.graph

    const runState: RunState = { errors: {}, outputs: {} }

    const startingNodes = nodes.filter(node =>
        edges.every(edge => edge.target !== node.id)
    )

    const runNode = async (node: Node, inputValues: Record<string, any>) => {
        const definition = nodeDefinitions[node.data.definition]
        let outputs
        try {
            outputs = await definition.action(inputValues, { node, triggerData, runState })
        }
        catch (err) {
            runState.errors[node.id] = err.message
            return
        }

        runState.outputs[node.id] ??= {}

        const normalizedOutputs = Object.fromEntries(
            Object.entries(outputs).flatMap(([outputDefId, outputValue]) => {
                const outputDefinition = definition.outputs[outputDefId]

                if (!outputDefinition.group) {
                    const outputId = node.data.outputs.find(output => output.definition === outputDefId)!.id
                    return [[outputId, outputValue]]
                }

                if (outputDefinition.named) {
                    return Object.entries(outputValue).map(([name, value]) => {
                        const outputId = node.data.outputs.find(output => output.definition === outputDefId && output.name === name)!.id
                        return [outputId, value]
                    })
                }

                return node.data.outputs.filter(output => output.definition === outputDefId).map((output, i) => [output.id, outputValue[i]])
            })
        )

        await Promise.all(Object.entries(normalizedOutputs).map(async ([outputId, outputValue]) => {
            runState.outputs[node.id][outputId] = outputValue

            await Promise.all(edges.filter(edge => edge.source === node.id && edge.sourceHandle === outputId)
                .map(edge => checkIfNodeCanRun(edge.target)))
        }))
    }

    const checkIfNodeCanRun = async (nodeId: string) => {
        const node = nodes.find(node => node.id === nodeId)!

        const allInputsAvailable = node.data.inputs.every(input => {
            const attachedEdge = edges.find(edge => edge.target === nodeId && edge.targetHandle === input.id)
            if (!attachedEdge) return true

            return runState.outputs[attachedEdge.source]?.[attachedEdge.sourceHandle] !== undefined
        })

        if (allInputsAvailable) {
            const inputValues = node.data.inputs.reduce((acc, input) => {
                const attachedEdge = edges.find(edge => edge.target === nodeId && edge.targetHandle === input.id)
                if (!attachedEdge) return acc

                const definition = nodeDefinitions[node.data.definition].inputs[input.definition]
                const value = runState.outputs[attachedEdge.source]?.[attachedEdge.sourceHandle]

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

            await runNode(node, inputValues)
        }
    }

    await Promise.all(startingNodes.map(node => runNode(node, {})))

    return runState
}