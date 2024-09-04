import { IconBorderSides, IconDice, IconDivide, IconEqual, IconMath1Divide2, IconMathMax, IconMathMin, IconMinus, IconPlus, IconSquareRoot, IconSquareRounded, IconStairsDown, IconStairsUp, IconSuperscript, IconVariableMinus, IconWaveSine, IconWood, IconX, type Icon, type IconProps } from "@tabler/icons-react"
import { forwardRef } from "react"
import { RadioToggle, RadioToggleOption } from "web/src/components/radio-toggle"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "workflow-types/react"
import { createPackageHelper } from "../../client-registry"


const helper = createPackageHelper("math")

helper.registerNodeDef("add", {
    name: "Add",
    icon: IconPlus,
    component: () => <StandardNode>
        {stdVariadicInput("addends")}
        <StandardNode.Handle
            type="output"
            name="sum"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("subtract", {
    name: "Subtract",
    icon: IconMinus,
    component: () => <StandardNode>
        {stdVariadicInput("minuends")}
        <StandardNode.Handle
            type="output"
            name="difference"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("multiply", {
    name: "Multiply",
    icon: IconX,
    component: () => <StandardNode>
        {stdVariadicInput("factors")}
        <StandardNode.Handle
            type="output"
            name="product"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("divide", {
    name: "Divide",
    icon: IconDivide,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="dividend"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="input"
            name="divisor"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="quotient"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("inverse", {
    name: "Inverse",
    icon: IconMath1Divide2,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="inverse"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("negate", {
    name: "Negate",
    icon: IconVariableMinus,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="negation"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("max", {
    name: "Max",
    icon: IconMathMax,
    component: () => <StandardNode>
        {stdVariadicInput("numbers")}
        <StandardNode.Handle
            type="output"
            name="max"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("min", {
    name: "Min",
    icon: IconMathMin,
    component: () => <StandardNode>
        {stdVariadicInput("numbers")}
        <StandardNode.Handle
            type="output"
            name="min"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("power", {
    name: "Power",
    icon: IconSuperscript,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="base"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="input"
            name="exponent"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="result"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("sqrt", {
    name: "Square Root",
    icon: IconSquareRoot,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="sqrt"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("log", {
    name: "Logarithm",
    icon: IconWood,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="input"
            name="base"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="log"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("absolute", {
    name: "Absolute Value",
    icon: forwardRef<Icon, IconProps>((props, ref) =>
        <IconEqual {...props} rotate={90} ref={ref} />
    ),
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="absolute"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("clamp", {
    name: "Clamp",
    icon: IconBorderSides,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="input"
            name="min"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="input"
            name="max"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="clamped"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("floor", {
    name: "Floor",
    icon: IconStairsDown,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="floored"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("ceil", {
    name: "Ceil",
    icon: IconStairsUp,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="ceiled"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("round", {
    name: "Round",
    icon: IconSquareRounded,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="number"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="rounded"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("random", {
    name: "Random Number",
    icon: IconDice,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="min"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="input"
            name="max"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="random"
            valueType={useValueType("number")}
        />
    </StandardNode>
})

helper.registerNodeDef("sin", {
    name: "Sine",
    icon: IconWaveSine,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="angle"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="result"
            valueType={useValueType("number")}
        />
        {angleUnitConfig()}
    </StandardNode>
})

helper.registerNodeDef("cos", {
    name: "Cosine",
    icon: IconWaveSine,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="angle"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="result"
            valueType={useValueType("number")}
        />
        {angleUnitConfig()}
    </StandardNode>
})

helper.registerNodeDef("tan", {
    name: "Tangent",
    icon: IconWaveSine,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="input"
            name="angle"
            valueType={useValueType("number")}
        />
        <StandardNode.Handle
            type="output"
            name="result"
            valueType={useValueType("number")}
        />
        {angleUnitConfig()}
    </StandardNode>
})


const stdVariadicInput = (name: string, itemDisplayName: string = "Number") =>
    <StandardNode.MultiHandle
        type="input"
        name={name} displayName={`${itemDisplayName}s`}
        min={2}
        itemDisplayName={itemDisplayName}
        itemValueType={useValueType("number")}
    />


type AngleUnit = "radians" | "degrees"

const angleUnitConfig = () =>
    <StandardNode.Config<AngleUnit>
        id="angleUnit" label="Angle Unit" defaultValue="radians"
    >
        {({ value, onChange }) =>
            <RadioToggle
                value={value!} onValueChange={onChange}
            >
                <RadioToggleOption value="radians">
                    Radians
                </RadioToggleOption>
                <RadioToggleOption value="degrees">
                    Degrees
                </RadioToggleOption>
            </RadioToggle>}
    </StandardNode.Config>