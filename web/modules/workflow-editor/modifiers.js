import { TbActivity, TbAlertCircle, TbArrowsSplit2, TbCheck, TbClock } from "react-icons/tb"


const controlModifiers = {
    waitFor: {
        name: "Wait For",
        type: null,
        icon: TbActivity,
        handleType: "input",
    },
    delay: {
        name: "Delay",
        type: "data-type:basic.number",
        icon: TbClock,
        handleType: "input",
    },
    conditional: {
        name: "Condition",
        type: "data-type:basic.boolean",
        icon: TbArrowsSplit2,
        handleType: "input",
    },
    finished: {
        name: "Finished",
        type: "data-type:basic.boolean",
        icon: TbCheck,
        handleType: "output",
    },
    error: {
        name: "Error",
        type: "data-type:basic.string",
        icon: TbAlertCircle,
        handleType: "output",
    },
}


export const list = Object.entries(controlModifiers).map(([id, input]) => ({
    ...input,
    id,
}))

export const object = Object.fromEntries(list.map(mod => [mod.id, mod]))
