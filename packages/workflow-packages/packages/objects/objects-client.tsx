import { IconSelect } from "@tabler/icons-react"
import { createPackageHelper } from "../../client-registry"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "workflow-types/react"


const helper = createPackageHelper("objects")

helper.registerNodeDef("getProperty", {
    name: "Get Property",
    description: "Selects a property from an object.",
    icon: IconSelect,
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="object" valueType={useValueType("object")} />
        <StandardNode.Handle type="input" name="property" valueType={useValueType("string")} />
        <StandardNode.Handle type="output" name="value" />
    </StandardNode>,
})

helper.registerNodeDef("getProperties", {
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

helper.registerNodeDef("setProperty", {
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

