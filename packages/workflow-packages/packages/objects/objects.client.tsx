import { IconSelect } from "@tabler/icons-react"
import { createPackage } from "../../registry/registry.client"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "../../lib/value-types.client"


const helper = createPackage("objects")

helper.node("getProperty", {
    name: "Get Property",
    description: "Selects a property from an object.",
    icon: IconSelect,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="object" valueType={useValueType("object")} />
        <StandardNode.Handle type="input" name="property" valueType={useValueType("string")} />
        <StandardNode.Handle type="output" name="value" />
    </StandardNode>,
})

helper.node("getProperties", {
    name: "Get Properties",
    description: "Selects multiple properties from an object.",
    icon: IconSelect,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="object" valueType={useValueType("object")} />
        <StandardNode.MultiHandle
            type="output" name="properties"
            displayName="Properties"
            itemDisplayName="Property"
            allowNaming allowSingleMode={false}
            defaultAmount={1}
        />
    </StandardNode>,
})

helper.node("setProperty", {
    name: "Set Property",
    description: "Sets a property on an object.",
    icon: IconSelect,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="object" valueType={useValueType("object")} />
        <StandardNode.Handle type="input" name="property" valueType={useValueType("string")} />
        <StandardNode.Handle type="input" name="value" />
        <StandardNode.Handle type="output" name="newObject" valueType={useValueType("object")} />
    </StandardNode>,
})

helper.node("setProperties", {
    name: "Set Properties",
    description: "Sets multiple properties on an object.",
    icon: IconSelect,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="object" valueType={useValueType("object")} />
        <StandardNode.MultiHandle
            type="input" name="properties"
            displayName="Properties"
            itemDisplayName="Property"
            allowNaming allowSingleMode={false}
            defaultAmount={1}
        />
        <StandardNode.Handle type="output" name="newObject" valueType={useValueType("object")} />
    </StandardNode>,
})