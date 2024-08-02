import { IconHash, IconTextSize } from "@tabler/icons-react"
import { StandardNode } from "web/src/components/action-node"
import { useValueType } from "workflow-types/react"
import { clientNodeHelper, prefixDefinitionIds } from "../../helpers/react"


const createDef = clientNodeHelper({})

export default prefixDefinitionIds("primitives", {
    text: createDef({
        name: "Text",
        icon: IconTextSize,
        component: () => <StandardNode>
            <StandardNode.Handle type="output" name="text" valueType={useValueType("string")} displayName=" " />
        </StandardNode>,
    }),
    number: createDef({
        name: "Number",
        icon: IconHash,
        component: () => <StandardNode>
            <StandardNode.Handle type="output" name="number" valueType={useValueType("number")} displayName=" " />
        </StandardNode>,
    }),
})