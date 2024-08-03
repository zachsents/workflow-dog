import { GBRoot } from "@web/lib/graph-builder"
import ClientNodeDefinitions from "workflow-packages/client-nodes"

export default function EditTest() {
    return (
        <div
            className="w-screen h-screen grid bg-gray-700"
            style={{
                gridTemplateRows: "auto 1fr auto",
                gridTemplateColumns: "auto 1fr auto",
            }}
        >
            <div className="col-span-full">Header</div>
            <div className="text-center text-white font-medium px-0.5 text-xs" style={{ writingMode: "sideways-lr" }}>
                Workflow Inputs
            </div>
            <GBRoot
                className="w-full h-full border border-gray-900 rounded-lg overflow-clip"
                options={{
                    resolveNodeDefinition: (nodeDefId) => ClientNodeDefinitions[nodeDefId],
                }}
            >
            </GBRoot>
            <div className="text-center" style={{ writingMode: "sideways-rl" }}>Right</div>
            <div className="col-span-full">Footer</div>
        </div>
    )
}

