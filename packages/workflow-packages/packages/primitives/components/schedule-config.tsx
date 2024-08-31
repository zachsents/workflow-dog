import { zodResolver } from "@hookform/resolvers/zod"
import { IconPlus, IconX } from "@tabler/icons-react"
import { useMemo } from "react"
import { useController, useFieldArray, useForm, type Control, type UseFieldArrayReturn } from "react-hook-form"
import ScheduleInput, { type ScheduleInputMode } from "web/src/components/schedule-input"
import TI from "web/src/components/tabler-icon"
import { Button } from "web/src/components/ui/button"
import { cn } from "web/src/lib/utils"
import { z } from "zod"
import TriggerConfigForm from "../../../components/trigger-config-form"
import type { ClientEventTypeSourceComponentProps } from "../../../types/client"


export default function ScheduleConfig({ workflowId, eventSources }: ClientEventTypeSourceComponentProps) {

    const formValues = useMemo<ScheduleFormSchema>(() => ({
        schedules: eventSources.map(evSrc => ({
            mode: (evSrc.state as any)?.mode ?? "picker",
            cron: (evSrc.state as any)?.cron ?? "0 0 * * *",
            timezone: (evSrc.state as any)?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        }))
    }), [eventSources])

    const form = useForm({
        resolver: zodResolver(z.object({
            schedules: z.object({
                mode: z.enum(["picker", "cron"]),
                cron: z.string(),
                timezone: z.string(),
            }).array().superRefine((value, ctx) => {
                const unique = new Set<string>()
                value.forEach((sch, i) => {
                    const str = sch.cron + sch.timezone
                    if (unique.has(str))
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Duplicate schedule",
                            path: [i],
                        })
                    else
                        unique.add(str)
                })
            }),
        })),
        values: formValues,
        mode: "onChange",
        reValidateMode: "onChange",
    })

    const fieldArr = useFieldArray({
        control: form.control,
        name: "schedules",
    })

    return (
        <TriggerConfigForm form={form} workflowId={workflowId}>
            {fieldArr.fields.map((item, i) =>
                <ControlledScheduleInput
                    key={item.id}
                    index={i}
                    control={form.control}
                    fieldArray={fieldArr}
                />
            )}

            {fieldArr.fields.length === 0 &&
                <p className="text-xs text-muted-foreground text-center">
                    No schedules
                </p>}

            <Button type="button"
                size="sm" className="gap-2"
                onClick={() => fieldArr.append({
                    mode: "picker",
                    cron: "0 9 * * *",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })}
            >
                <TI><IconPlus /></TI>
                Add Schedule
            </Button>
        </TriggerConfigForm>
    )
}


type ScheduleFormSchema = {
    schedules: {
        mode: ScheduleInputMode
        cron: string
        timezone: string
    }[]
}


function ControlledScheduleInput({ control, index, fieldArray }: {
    control: Control<ScheduleFormSchema>
    index: number
    fieldArray: UseFieldArrayReturn<ScheduleFormSchema>
}) {

    const { field: modeField, formState } = useController({
        control,
        name: `schedules.${index}.mode` as const,
    })

    const { field: cronField } = useController({
        control,
        name: `schedules.${index}.cron` as const,
    })

    const { field: timezoneField } = useController({
        control,
        name: `schedules.${index}.timezone` as const,
    })

    const error = formState.errors?.schedules?.[index]?.root?.message

    return (
        <div className="grid gap-2">
            <div className={cn(
                "border shadow-md rounded-md p-2 pb-4",
                error && "border-destructive"
            )}>
                {error && <p className="text-sm text-destructive mb-4 text-center bg-destructive/10 py-1 rounded-md">
                    {error}
                </p>}
                <ScheduleInput
                    label={`Schedule ${index + 1}`}
                    // mode={modeField.value}
                    mode="picker"
                    onModeChange={modeField.onChange}
                    value={cronField.value}
                    onValueChange={cronField.onChange}
                    timezone={timezoneField.value}
                    onTimezoneChange={timezoneField.onChange}
                />
            </div>
            <div className="grid grid-flow-col auto-cols-fr">
                <Button
                    variant="ghost" size="sm"
                    className="gap-2 font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => fieldArray.remove(index)}
                >
                    <TI><IconX /></TI>
                    Delete Schedule
                </Button>
            </div>
        </div>
    )
}