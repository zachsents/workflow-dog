import { IconArrowsJoin2, IconArrowsSplit2, IconSquare } from "@tabler/icons-react"
import { StandardNode } from "web/src/components/action-node"
import { useValueType } from "workflow-types/react"
import { clientNodeHelper, prefixDefinitionIds } from "../../helpers/react"


const createDef = clientNodeHelper({})

export default prefixDefinitionIds("control", {
    ternary: createDef({
        name: "Choose Value",
        icon: IconArrowsJoin2,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
            <StandardNode.Handle type="input" name="truthy" displayName="If True" />
            <StandardNode.Handle type="input" name="falsy" displayName="If False" />
            <StandardNode.Handle type="output" name="result" />
        </StandardNode>,
    }),
    router: createDef({
        name: "Route Value",
        icon: IconArrowsSplit2,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="condition" valueType={useValueType("boolean")} />
            <StandardNode.Handle type="input" name="value" displayName="Value" />
            <StandardNode.Handle type="output" name="truthy" displayName="If True" />
            <StandardNode.Handle type="output" name="falsy" displayName="If False" />
        </StandardNode>,
    }),
    passthrough: createDef({
        name: "Passthrough",
        icon: IconSquare,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="value" />
            <StandardNode.Handle type="output" name="value" />
        </StandardNode>,
    }),
    isNull: createDef({
        name: "Is Null",
        icon: IconSquare,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="value" />
            <StandardNode.Handle type="output" name="isNull" valueType={useValueType("boolean")} />
        </StandardNode>,
    }),
})