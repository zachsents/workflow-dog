import { Group, NumberInput, Select, Stack, Text } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { syncType } from "@web/modules/util"
import { INTERVAL_UNITS, WEEKDAYS } from "@web/modules/scheduling"


export default function ScheduleBuilder({ children, initial, onSubmit }) {

    const form = useForm({
        initialValues: {
            interval: initial?.interval ?? 1,
            intervalUnit: initial?.intervalUnit ?? "hour",
            atMinute: initial?.atMinute ?? 0,
            atTime: initial?.atTime ?? null,
            onWeekday: initial?.onWeekday ?? 1,
            onDay: initial?.onDay ?? 1,
        },

        validate: {
            interval: (value) => typeof value !== "number",
            intervalUnit: (value) => !INTERVAL_UNITS().find(x => x.value == value),
            atMinute: (value, values) => ["hour"].includes(values.intervalUnit) && typeof value !== "number",
            atTime: (value, values) => ["day", "week", "month"].includes(values.intervalUnit) && typeof value !== "string",
            onWeekday: (value, values) => ["week"].includes(values.intervalUnit) && typeof value !== "number",
            onDay: (value, values) => ["month"].includes(values.intervalUnit) && typeof value !== "number",
        },
    })

    return (
        <form onSubmit={form.onSubmit(({ interval, intervalUnit, atMinute, atTime, onWeekday, onDay }) => {
            onSubmit?.({
                interval: interval,
                intervalUnit: intervalUnit,
                ...(intervalUnit == "minute" && {}),
                ...(intervalUnit == "hour" && { atMinute }),
                ...(intervalUnit == "day" && { atTime }),
                ...(intervalUnit == "week" && { onWeekday, atTime }),
                ...(intervalUnit == "month" && { onDay, atTime }),
            })
        })}>
            <Stack>
                <Group noWrap>
                    <Text>Every</Text>
                    <NumberInput
                        {...form.getInputProps("interval")}
                        value={syncType(form.values.interval, "number", form.values.interval, "")}
                        onChange={newValue => form.setFieldValue("interval", syncType(newValue, "number", newValue, null))}
                        min={1} max={100}
                    />

                    <Select
                        data={INTERVAL_UNITS(form.values.interval != 1)}
                        withinPortal
                        {...form.getInputProps("intervalUnit")}
                    />
                </Group>

                {form.values.intervalUnit == "minute" &&
                    <></>}

                {form.values.intervalUnit == "hour" &&
                    <AtMinutes {...form.getInputProps("atMinute")} />}

                {form.values.intervalUnit == "day" &&
                    <AtTime {...form.getInputProps("atTime")} />}

                {form.values.intervalUnit == "week" &&
                    <Group>
                        <OnWeekday {...form.getInputProps("onWeekday")} />
                        <AtTime {...form.getInputProps("atTime")} />
                    </Group>}

                {form.values.intervalUnit == "month" &&
                    <Group>
                        <OnDay {...form.getInputProps("onDay")} />
                        <AtTime {...form.getInputProps("atTime")} />
                    </Group>}

                {children}
            </Stack>
        </form>
    )
}



function AtMinutes({ value, onChange, ...props }) {

    return (
        <Group noWrap>
            <Text>at</Text>
            <NumberInput
                min={0} max={59}
                value={syncType(value, "number", value, "")}
                onChange={newValue => onChange?.(syncType(newValue, "number", newValue, null))}
                {...props}
            />
            <Text>minutes</Text>
        </Group>
    )
}

function AtTime({ value, onChange, ...props }) {

    return (
        <Group>
            <Text>at</Text>
            <TimeInput
                value={syncType(value, "string", value, "")}
                onChange={event => onChange?.(syncType(event.currentTarget.value, "string", x => x || null, null))}
                {...props}
            />
        </Group>
    )
}

function OnWeekday({ value, onChange, ...props }) {

    return (
        <Group noWrap>
            <Text>on</Text>
            <Select
                data={WEEKDAYS}
                value={syncType(value, "number", x => WEEKDAYS[x].value, null)}
                onChange={newValue => onChange?.(
                    syncType(newValue, "string", x => WEEKDAYS.findIndex(y => y.value == x), null)
                )}
                {...props}
            />
        </Group>
    )
}

function OnDay({ value, onChange, ...props }) {

    return (
        <Group noWrap>
            <Text>on&nbsp;the</Text>
            <NumberInput
                min={1} max={31}
                parser={value => value.replaceAll(/\D/g, "")}
                formatter={value => {
                    if (value == null || value === "") return ""

                    switch (new Intl.PluralRules("en", { type: "ordinal" }).select(value)) {
                        case "one": return `${value}st`
                        case "two": return `${value}nd`
                        case "few": return `${value}rd`
                    }

                    return `${value}th`
                }}
                value={syncType(value, "number", value, "")}
                onChange={newValue => onChange?.(
                    syncType(newValue, "number", newValue, null)
                )}
                {...props}
            />
            <Text>day</Text>
        </Group>
    )
}