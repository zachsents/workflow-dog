import { ClientNodeInterfaceExport } from "@pkg/types/client"
import { TbActivity, TbAlertCircle, TbArrowsSplit2, TbCheck, TbClock } from "react-icons/tb"
import { IdNamespace, createSubspaceId } from "shared/utils"
import { z } from "zod"

export type ControlModifierDefinition = {
    id: string
    icon: JSX.ElementType
    handleType: "input" | "output"
    interfaceDefinition: ClientNodeInterfaceExport
}

const controlModifiers: ControlModifierDefinition[] = [
    {
        id: createSubspaceId(IdNamespace.ControlInputHandle, "wait-for"),
        icon: TbActivity,
        handleType: "input",
        interfaceDefinition: {
            name: "Wait For",
            description: "Wait for a value to be available",
            groupType: "normal",
            schema: z.any(),
        },
    },
    {
        id: createSubspaceId(IdNamespace.ControlInputHandle, "delay"),
        icon: TbClock,
        handleType: "input",
        interfaceDefinition: {
            name: "Delay (ms)",
            description: "Delay for a specified amount of time",
            groupType: "normal",
            schema: z.number(),
        },
    },
    {
        id: createSubspaceId(IdNamespace.ControlInputHandle, "conditional"),
        icon: TbArrowsSplit2,
        handleType: "input",
        interfaceDefinition: {
            name: "Condition",
            description: "A condition to be met",
            groupType: "normal",
            schema: z.boolean(),
        },
    },
    {
        id: createSubspaceId(IdNamespace.ControlOutputHandle, "finished"),
        icon: TbCheck,
        handleType: "output",
        interfaceDefinition: {
            name: "Finished",
            description: "Indicates that the node has finished",
            groupType: "normal",
            schema: z.boolean(),
        },
    },
    {
        id: createSubspaceId(IdNamespace.ControlOutputHandle, "error"),
        icon: TbAlertCircle,
        handleType: "output",
        interfaceDefinition: {
            name: "Error",
            description: "An error message",
            groupType: "normal",
            schema: z.string(),
        },
    },
]


export const list = controlModifiers

export const object = Object.fromEntries(
    list.map(mod => [mod.id, mod])
)
