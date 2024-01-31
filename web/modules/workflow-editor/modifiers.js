import { TbActivity, TbArrowsSplit2 } from "react-icons/tb"
import { PREFIX } from "shared/prefixes"


const modifiers = [
    {
        id: "condition",
        name: "Run Conditionally",
        icon: TbArrowsSplit2,
        inputs: {
            condition: {
                name: "Condition",
                type: "data-type:basic.boolean",
            }
        }
    },
    {
        id: "await",
        name: "Wait for Value",
        icon: TbActivity,
        inputs: {
            promise: {
                name: "Value",
                type: null,
            }
        },
        outputs: {
            done: {
                name: "Done",
                type: null,
            }
        }
    }
]

export const list = modifiers.map(modifier => ({
    ...modifier,
    id: `${PREFIX.MODIFIER_TYPE}:${modifier.id}`,
}))

export const object = Object.fromEntries(list.map(modifier => [modifier.id, modifier]))