import { IconBraces, IconCode, IconLetterCaseLower, IconLetterCaseUpper, IconRuler } from "@tabler/icons-react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { createPackage } from "../../registry/registry.client"
import { useValueType } from "../../lib/value-types.client"


const helper = createPackage("text")

helper.node("uppercase", {
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

helper.node("lowercase", {
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

helper.node("titlecase", {
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

helper.node("template", {
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

helper.node("length", {
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

helper.node("escapeHtml", {
    name: "Escape HTML",
    description: "Escapes HTML characters in a string.",
    icon: IconCode,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="text" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="escaped" valueType={useValueType("string")}
        />
    </StandardNode>,
})