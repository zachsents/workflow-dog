import { TbActivity, TbAlertCircle, TbArrowsSplit2, TbCheck, TbClock } from "react-icons/tb"
import { ControlModifier } from "./types"

type ControlModifierDefinition = {
    id: ControlModifier
    name: string
    type: string
    icon: JSX.ElementType
    handleType: "input" | "output"
}

const controlModifiers: Record<ControlModifier, Omit<ControlModifierDefinition, "id">> = {
    waitFor: {
        name: "Wait For",
        type: "https://data-types.workflow.dog/basic/any",
        icon: TbActivity,
        handleType: "input",
    },
    delay: {
        name: "Delay (ms)",
        type: "https://data-types.workflow.dog/basic/number",
        icon: TbClock,
        handleType: "input",
    },
    conditional: {
        name: "Condition",
        type: "https://data-types.workflow.dog/basic/boolean",
        icon: TbArrowsSplit2,
        handleType: "input",
    },
    finished: {
        name: "Finished",
        type: "https://data-types.workflow.dog/basic/boolean",
        icon: TbCheck,
        handleType: "output",
    },
    error: {
        name: "Error",
        type: "https://data-types.workflow.dog/basic/string",
        icon: TbAlertCircle,
        handleType: "output",
    },
}


export const list = Object.entries(controlModifiers)
    .map(([id, input]) => ({
        ...input,
        id,
    }))

export const object = Object.fromEntries(
    list.map(mod => [mod.id, mod])
)
