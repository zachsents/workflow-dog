import { Edge, Node } from "reactflow"


export type WorkflowGraph = {
    nodes: Node[]
    edges: Edge[]
}

export interface ActionNodeInterface {
    id: string
    definition: string
    name?: string
}

export interface ActionNodeInput extends ActionNodeInterface { }
export interface ActionNodeOutput extends ActionNodeInterface { }

export type ActionNodeData = {
    inputs?: ActionNodeInput[]
    outputs?: ActionNodeOutput[]
    controlModifiers?: {
        [key in ControlModifier]: boolean
    }
}

export type ActionNode = Node<ActionNodeData, "action">


export interface DataEdgeData {
    forced?: boolean
}

export type DataEdge = Edge<DataEdgeData>

export type ControlModifier = "waitFor" | "delay" | "conditional" | "finished" | "error"