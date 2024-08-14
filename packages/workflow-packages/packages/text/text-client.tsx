import { IconLetterCaseLower, IconLetterCaseUpper } from "@tabler/icons-react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "workflow-types/react"
import { createPackageHelper } from "../../client-registry"


const helper = createPackageHelper("text")

helper.registerNodeDef("uppercase", {
    name: "Uppercase",
    icon: IconLetterCaseUpper,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="result" valueType={useValueType("string")}
            displayName="TEXT"
        />
    </StandardNode>,
})

helper.registerNodeDef("lowercase", {
    name: "Lowercase",
    icon: IconLetterCaseLower,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="result" valueType={useValueType("string")}
            displayName="text"
        />
    </StandardNode>,
})
