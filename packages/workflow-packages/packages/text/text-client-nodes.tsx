import { IconLetterCaseLower, IconLetterCaseUpper } from "@tabler/icons-react"
import { StandardNode } from "web/src/components/action-node"
import { useValueType } from "workflow-types/react"
import { clientNodeHelper, prefixDefinitionIds } from "../../helpers/react"


const createDef = clientNodeHelper({})

export default prefixDefinitionIds("text", {
    uppercase: createDef({
        name: "Uppercase",
        icon: IconLetterCaseUpper,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
            <StandardNode.Handle
                type="output" name="result" valueType={useValueType("string")}
                displayName="TEXT"
            />
        </StandardNode>,
    }),
    lowercase: createDef({
        name: "Lowercase",
        icon: IconLetterCaseLower,
        component: () => <StandardNode>
            <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
            <StandardNode.Handle
                type="output" name="result" valueType={useValueType("string")}
                displayName="text"
            />
        </StandardNode>,
    }),
})