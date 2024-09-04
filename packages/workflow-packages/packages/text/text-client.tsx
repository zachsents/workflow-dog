import { IconBraces, IconLetterCaseLower, IconLetterCaseUpper, IconRuler } from "@tabler/icons-react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "workflow-types/react"
import { createPackageHelper } from "../../client-registry"


const helper = createPackageHelper("text")

helper.registerNodeDef("uppercase", {
    name: "Uppercase",
    description: "Converts the input text to uppercase.",
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
    description: "Converts the input text to lowercase.",
    icon: IconLetterCaseLower,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="result" valueType={useValueType("string")}
            displayName="text"
        />
    </StandardNode>,
})

helper.registerNodeDef("titlecase", {
    name: "Title Case",
    description: "Converts the input text to title case.",
    icon: IconLetterCaseUpper,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="result" valueType={useValueType("string")}
            displayName="text"
        />
    </StandardNode>,
})

helper.registerNodeDef("template", {
    name: "Template",
    description: "Uses a template string with substitutions to generate the output text.",
    icon: IconBraces,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="template" valueType={useValueType("string")} />
        <StandardNode.MultiHandle
            type="input"
            name="substitutions" displayName="Substitutions"
            itemDisplayName="Substitution"
            itemValueType={useValueType("string")}
            allowNaming
            defaultAmount={1}
        />
        <StandardNode.Handle
            type="output" name="result" valueType={useValueType("string")}
        />
    </StandardNode>,
})

helper.registerNodeDef("length", {
    name: "Text Length",
    description: "Calculates the length of the input text.",
    icon: IconRuler,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="length" valueType={useValueType("number")}
            displayName="Length"
        />
    </StandardNode>
})