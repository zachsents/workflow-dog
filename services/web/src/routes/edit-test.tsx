import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { GBRoot, useGraphBuilder } from "@web/lib/graph-builder"
import ClientNodeDefinitions from "workflow-packages/client-nodes"

export default function EditTest() {
    return (
        <div className="w-screen h-screen p-4">
            <GBRoot
                className="w-full h-full outline outline-black outline-4 rounded-lg"
                options={{
                    resolveNodeDefinition: (nodeDefId) => ClientNodeDefinitions[nodeDefId],
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    Add Node
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[80vh] overflow-scroll">
                {Object.entries(ClientNodeDefinitions).map(([defId, def]) =>
                    <DropdownMenuItem
                        key={defId}
                        onSelect={() => gbx.addNode({ definitionId: defId })}
                        className="flex items-center gap-2"
                    >
                        <TI><def.icon /></TI>
                        {def.name}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
