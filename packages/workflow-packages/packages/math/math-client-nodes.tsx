import { IconBorderSides, IconDivide, IconEqual, IconLetterESmall, IconMath1Divide2, IconMathMax, IconMathMin, IconMinus, IconNumber10Small, IconPlus, IconSquareRoot, IconSquareRounded, IconStairsDown, IconStairsUp, IconSuperscript, IconVariableMinus, IconWaveSine, IconWood, IconX } from "@tabler/icons-react"
import { StandardNode } from "web/src/components/action-node"
import { useValueType } from "workflow-types/react"
import { clientNodeHelper, prefixDefinitionIds } from "../../helpers/react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "web/src/components/ui/select"


const createDef = clientNodeHelper({ color: "gray" })

export default prefixDefinitionIds("math", {
    add: createDef({
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
    }),
    subtract: createDef({
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
    }),
    multiply: createDef({
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
    }),
    divide: createDef({
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
            <StandardNode.Handle
                type="output"
                name="remainder"
                valueType={useValueType("number")}
            />
        </StandardNode>
    }),
    inverse: createDef({
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
    }),
    negate: createDef({
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
    }),
    max: createDef({
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
    }),
    min: createDef({
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
    }),
    power: createDef({
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
    }),
    sqrt: createDef({
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
    }),
    log: createDef({
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
    }),
    logBase10: createDef({
        name: "Logarithm (Base 10)",
        icon: IconNumber10Small,
        component: () => <StandardNode>
            <StandardNode.Handle
                type="input"
                name="number"
                valueType={useValueType("number")}
            />
            <StandardNode.Handle
                type="output"
                name="log"
                valueType={useValueType("number")}
            />
        </StandardNode>
    }),
    naturalLog: createDef({
        name: "Natural Logarithm",
        icon: IconLetterESmall,
        component: () => <StandardNode>
            <StandardNode.Handle
                type="input"
                name="number"
                valueType={useValueType("number")}
            />
            <StandardNode.Handle
                type="output"
                name="log"
                valueType={useValueType("number")}
            />
        </StandardNode>
    }),
    absolute: createDef({
        name: "Absolute Value",
        icon: (props) => <IconEqual {...props} rotate={90} />,
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
    }),
    clamp: createDef({
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
    }),
    floor: createDef({
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
    }),
    ceil: createDef({
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
    }),
    round: createDef({
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
    }),
    sin: createDef({
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
    }),
    cos: createDef({
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
    }),
    tan: createDef({
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
    }),

})


const stdVariadicInput = (name: string, itemDisplayName: string = "Number") =>
    <StandardNode.MultiHandle
        type="input"
        name={name} displayName={`${itemDisplayName}s`}
        min={2}
        itemDisplayName={itemDisplayName}
        itemValueType={useValueType("number")}
    />

const angleUnitConfig = () =>
    <StandardNode.Config label="Angle Unit">
        <Select defaultValue="radians">
            <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Angle Unit" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="radians">Radians</SelectItem>
                <SelectItem value="degrees">Degrees</SelectItem>
            </SelectContent>
        </Select>
    </StandardNode.Config>