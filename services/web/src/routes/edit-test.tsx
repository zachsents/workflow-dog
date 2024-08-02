import { IconStar } from "@tabler/icons-react"
import { StandardNode } from "@web/components/action-node"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { GBRoot, useGraphBuilder, type NodeDefinition } from "@web/lib/graph-builder"
import { useValueType } from "workflow-types/react"


export default function EditTest() {
    return (
        <div className="w-screen h-screen p-4">
            <GBRoot
                className="w-full h-full outline outline-black outline-4 rounded-lg"
                options={{
                    resolveNodeDefinition: () => exampleNodeDef,
                }}
            >
                <div className="absolute z-50 top-0 left-0 w-full p-2 border-b bg-gray-100/50">
                    <AddButton />
                </div>
            </GBRoot>
        </div>
    )
}

function AddButton() {

    const gbx = useGraphBuilder()

    return (
        <Button onClick={() => gbx.addNode({
            definitionId: "example-node",
        })}>
            Add Node
        </Button>
    )
}



const exampleNodeDef: NodeDefinition = {
    name: "Example Node",
    icon: () => <TI><IconStar /></TI>,
    component: () => {
        return (
            <StandardNode>
                <StandardNode.Handle type="input" name="hello" displayName="Hello" />
                <StandardNode.MultiHandle
                    type="input" name="parts" displayName="Parts" min={2} max={5}
                    itemDisplayName="Part"
                    itemValueType={useValueType("string")}
                    allowNaming
                />
                <StandardNode.MultiHandle
                    type="output" name="outputs" displayName="Outputs" min={1}
                    allowNaming
                    itemDisplayName="Output"
                    itemValueType={useValueType("string")}
                />

                <StandardNode.Handle type="output" name="result" />
            </StandardNode>
        )
    }
}