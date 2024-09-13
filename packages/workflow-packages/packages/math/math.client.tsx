import { IconBorderSides, IconDice, IconDivide, IconEqual, IconFeather, IconMath, IconMath1Divide2, IconMathMax, IconMathMin, IconMathPi, IconMinus, IconPlus, IconSquareRoot, IconSquareRounded, IconStairsDown, IconStairsUp, IconSuperscript, IconVariableMinus, IconWaveSine, IconWood, IconX, type Icon, type IconProps } from "@tabler/icons-react"
import { forwardRef } from "react"
import { RadioToggle, RadioToggleOption } from "web/src/components/radio-toggle"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { createPackage } from "../../registry/registry.client"
import { useValueType } from "../../lib/value-types.client"


const helper = createPackage("math", {
    defaults: {
        node: {
            icon: IconMath,
        },
    }
})

helper.node("add", {
    name: "Add",
    description: "Adds two or more numbers together.",
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

helper.node("subtract", {
    name: "Subtract",
    description: "Subtracts two or more numbers from each other.",
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

helper.node("multiply", {
    name: "Multiply",
    description: "Multiplies two or more numbers together.",
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

helper.node("divide", {
    name: "Divide",
    description: "Divides one number by another, using decimal division.",
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

helper.node("divideInt", {
    name: "Divide (Integer)",
    description: "Divides one number by another, using integer division with a remainder.",
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
        <StandardNode.Handle
            type="output"
            name="remainder"
            valueType={useValueType("number")}
        />
    </StandardNode>,
})

helper.node("inverse", {
    name: "Inverse",
    description: "Inverts a number, i.e. `1 / x`.",
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

helper.node("negate", {
    name: "Negate",
    description: "Negates a number, i.e. `-x`.",
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

helper.node("max", {
    name: "Max",
    description: "Returns the largest number from a list of numbers.",
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

helper.node("min", {
    name: "Min",
    description: "Returns the smallest number from a list of numbers.",
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

helper.node("power", {
    name: "Power",
    description: "Raises a number to a power.",
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

helper.node("sqrt", {
    name: "Square Root",
    description: "Calculates the square root of a number.",
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

helper.node("log", {
    name: "Logarithm",
    description: "Calculates the logarithm of a number.",
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

helper.node("absolute", {
    name: "Absolute Value",
    description: "Calculates the absolute value of a number.",
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

helper.node("clamp", {
    name: "Clamp",
    description: "Clamps a number between a minimum and maximum value.",
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

helper.node("floor", {
    name: "Floor",
    description: "Rounds a number down to the nearest integer.",
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

helper.node("ceil", {
    name: "Ceil",
    description: "Rounds a number up to the nearest integer.",
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

helper.node("round", {
    name: "Round",
    description: "Rounds a number to the nearest integer.",
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

helper.node("random", {
    name: "Random Number",
    description: "Generates a random number between a minimum and maximum value.",
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


// #region Trigonometry

helper.node("sin", {
    name: "Sine",
    description: "Calculates the sine of an angle.",
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

helper.node("cos", {
    name: "Cosine",
    description: "Calculates the cosine of an angle.",
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

helper.node("tan", {
    name: "Tangent",
    description: "Calculates the tangent of an angle.",
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

helper.node("pi", {
    name: "Pi",
    description: "The constant pi.",
    icon: IconMathPi,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="output"
            name="pi"
            valueType={useValueType("number")}
        />
    </StandardNode>,
})

helper.node("e", {
    name: "E",
    description: "The constant e.",
    icon: IconFeather,
    component: () => <StandardNode>
        <StandardNode.Handle
            type="output"
            name="e"
            valueType={useValueType("number")}
        />
    </StandardNode>,
})


// #region Utilities

const stdVariadicInput = (name: string, itemDisplayName: string = "Number") =>
    <StandardNode.MultiHandle
        type="input"
        name={name} displayName={`${itemDisplayName}s`}
        min={2}
        itemDisplayName={itemDisplayName}
        itemValueType={useValueType("number")}
    />


const angleUnitConfig = () =>
    <StandardNode.Config
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