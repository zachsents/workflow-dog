import { IconEqual, IconEqualNot, IconExclamationMark, IconLogicBuffer } from "@tabler/icons-react"
import { createPackage } from "../../registry/registry.client"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"

const helper = createPackage("logic", {
    defaults: {
        node: {
            icon: IconLogicBuffer,
        },
    }
})

helper.node("equal", {
    name: "Equals",
    description: "Checks if two values are equal.",
    icon: IconEqual,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="a" />
        <StandardNode.Handle type="input" name="b" />
        <StandardNode.Handle type="output" name="result" />
    </StandardNode>,
})

helper.node("notEqual", {
    name: "Not Equals",
    description: "Checks if two values are not equal.",
    icon: IconEqualNot,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="a" />
        <StandardNode.Handle type="input" name="b" />
        <StandardNode.Handle type="output" name="result" />
    </StandardNode>,
})

helper.node("not", {
    name: "Not",
    description: "Inverts a boolean value.",
    icon: IconExclamationMark,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="value" />
        <StandardNode.Handle type="output" name="result" />
    </StandardNode>,
})

