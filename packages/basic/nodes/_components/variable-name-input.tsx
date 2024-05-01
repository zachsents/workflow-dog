import { Input } from "@web/components/ui/input"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"


export default function VariableNameInput() {

    const [key, setKey] = useNodeProperty(undefined, "data.state.key", {
        defaultValue: "",
        debounce: 200,
    })

    return (
        <div className="mt-1 self-stretch">
            <p className="text-xs font-medium text-left">Variable Name</p>
            <Input
                defaultValue={key}
                onChange={ev => setKey(ev.currentTarget.value)}
                className="nodrag nopan shadow-none"
                placeholder="Variable name"
                onCopy={ev => void ev.stopPropagation()}
                onPaste={ev => void ev.stopPropagation()}
            />
        </div>
    )
}