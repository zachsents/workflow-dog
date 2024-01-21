import { Type } from "shared/types"
import { PREFIX } from "shared/prefixes"
import { TbActivity, TbArrowsSplit2 } from "react-icons/tb"


const modifiers = [
    {
        id: "condition",
        name: "Run Conditionally",
        icon: TbArrowsSplit2,
        inputs: {
            condition: {
                name: "Condition",
                type: Type.Boolean(),
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
                type: Type.Any(),
            }
        },
        outputs: {
            done: {
                name: "Done",
                type: Type.Any(),
            }
        }
    }
]

export const list = modifiers.map(modifier => ({
    ...modifier,
    id: `${PREFIX.MODIFIER_TYPE}:${modifier.id}`,
}))

export const object = Object.fromEntries(list.map(modifier => [modifier.id, modifier]))