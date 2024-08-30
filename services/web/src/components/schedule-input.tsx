import { zodResolver } from "@hookform/resolvers/zod"
import { IconAsteriskSimple, IconChevronDown, IconClock, IconDots, IconExternalLink, IconPointer } from "@tabler/icons-react"
import { numberSuffix, plural } from "@web/lib/grammar"
import { useControlledState } from "@web/lib/hooks"
import { cn } from "@web/lib/utils"
import { parseCronExpression } from "cron-schedule"
import cronstrue from "cronstrue"
import React, { forwardRef, useEffect, useMemo, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { isHotkeyPressed } from "react-hotkeys-hook"
import { z } from "zod"
import TI from "./tabler-icon"
import { Alert, AlertDescription } from "./ui/alert"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "./ui/select"
import { Separator } from "./ui/separator"


export type ScheduleInputMode = "cron" | "picker"

interface ScheduleInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "defaultValue"> {
    label?: string
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
    mode?: ScheduleInputMode
    onModeChange?: (mode: ScheduleInputMode) => void
    defaultMode?: ScheduleInputMode
    timezone?: string
    onTimezoneChange?: (timezone: string) => void
    defaultTimezone?: string
    allowCronInput?: boolean
}

const ScheduleInput = forwardRef<HTMLDivElement, ScheduleInputProps>(({
    label,
    value: passedValue, onValueChange, defaultValue = "0 * * * *",
    mode: passedMode, onModeChange, defaultMode = "picker",
    timezone: passedTimezone, onTimezoneChange,
    defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    allowCronInput,
    ...inputProps
}, ref) => {

    const [mode, setMode] = useControlledState(passedMode, onModeChange, defaultMode)
    const [cron, setCron] = useControlledState(passedValue, onValueChange, defaultValue)

    const [timezone, setTimezone] = useControlledState(passedTimezone, onTimezoneChange, defaultTimezone)
    const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
    const [showTimezoneSelector, setShowTimezoneSelector] = useState(timezone !== userTimezone)
    const timezoneName = useMemo(() => timezone?.replaceAll("_", " "), [timezone])

    const humanReadableExpression = useMemo(() => {
        const INVALID = "Invalid schedule"
        if (!cron) return INVALID
        try {
            return cronstrue.toString(cron)
                .replaceAll(/(?<= )0(\d)/g, "$1")
        } catch (err) {
            return INVALID
        }
    }, [cron])
    const [showLongDescription, setShowLongDescription] = useState(false)

    return (
        <div className="grid gap-4" ref={ref}>
            <div className="flex items-center justify-between gap-12 px-2 -mb-2">
                <span className="font-medium truncate flex-1 w-0" ref={e => {
                    if (!e) return
                    const isEllipsing = e.offsetWidth < e.scrollWidth
                    if (!showLongDescription && isEllipsing)
                        setShowLongDescription(true)
                    else if (showLongDescription && !isEllipsing)
                        setShowLongDescription(false)
                }}>
                    {humanReadableExpression}
                </span>

                {allowCronInput && <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button"
                            variant="ghost" size="icon" className="text-md shrink-0"
                            disabled={inputProps.disabled}
                        >
                            <TI><IconDots /></TI>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[200px] z-[110] shadow-lg *:flex *:items-center *:gap-2"
                        align="end"
                    >
                        {mode === "picker" &&
                            <DropdownMenuItem onClick={() => setMode("cron")}>
                                <TI className="shrink-0"><IconAsteriskSimple /></TI>
                                Use cron syntax
                            </DropdownMenuItem>}
                        {mode === "cron" &&
                            <DropdownMenuItem onClick={() => setMode("picker")}>
                                <TI className="shrink-0"><IconPointer /></TI>
                                Use schedule picker
                            </DropdownMenuItem>}
                    </DropdownMenuContent>
                </DropdownMenu>}
            </div>

            {showLongDescription &&
                <p className="border-l-2 text-sm text-muted-foreground italic px-2 py-1 ml-2">
                    {humanReadableExpression}
                </p>}

            {mode === "cron" && <CronInput value={cron} onValueChange={setCron} />}
            {mode === "picker" && <SchedulePicker value={cron} onValueChange={setCron} />}


            {/* <p className="border-l-2 text-sm text-muted-foreground italic px-2 py-1 ml-2">
                {cron}
            </p> */}

            {showTimezoneSelector
                ? <div>
                    <p className="text-xs text-muted-foreground">
                        Timezone
                    </p>
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pick a timezone">
                                {timezoneName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                            {timezoneOptions.map(tz =>
                                <SelectItem key={tz.value} value={tz.value}>
                                    <p>{tz.value.replaceAll("_", " ")}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {tz.name}
                                    </p>
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                : <div className="flex-center flex-col gap-1">
                    <p className="text-xs text-muted-foreground text-center">
                        Using timezone: {timezoneName}
                    </p>
                    <Button type="button" variant="outline" size="compact" onClick={() => setShowTimezoneSelector(true)}>
                        Specify timezone
                    </Button>
                </div>}

            <div className="flex-center flex-wrap gap-1 px-2">
                <p className="text-xs text-center text-muted-foreground w-full">
                    Common schedules
                </p>
                <Button
                    type="button"
                    variant="outline" size="sm" className="rounded-full"
                    onClick={() => setCron("0 * * * *")}
                >
                    Hourly
                </Button>
                <Button
                    type="button"
                    variant="outline" size="sm" className="rounded-full"
                    onClick={() => setCron("0 0 * * *")}
                >
                    Daily
                </Button>
                <Button
                    type="button"
                    variant="outline" size="sm" className="rounded-full"
                    onClick={() => setCron("0 9 * * *")}
                >
                    Daily @ 9AM
                </Button>
                <Button
                    type="button"
                    variant="outline" size="sm" className="rounded-full"
                    onClick={() => setCron("0 9 * * mon,tue,wed,thu,fri")}
                >
                    9AM on Weekdays
                </Button>
                <Button
                    type="button"
                    variant="outline" size="sm" className="rounded-full"
                    onClick={() => setCron("0 0 1 * *")}
                >
                    Monthly
                </Button>
            </div>
        </div>
    )
})
ScheduleInput.displayName = "ScheduleInput"
export default ScheduleInput


type CronPartMode = "every" | "interval" | "exact"

interface SchedulePickerProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "defaultValue"> {
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
}

const SchedulePicker = forwardRef<HTMLDivElement, SchedulePickerProps>(({
    value: passedValue, onValueChange, defaultValue,
}, ref) => {

    const [value, setValue] = useControlledState(passedValue, onValueChange, defaultValue)

    const parts = useMemo(() => value?.split(/\s+/) ?? [], [value])

    const parseMode = (index: number) => (): CronPartMode => {
        const expr = parts.at(index)
        if (expr?.includes("/")) return "interval"
        if (expr?.includes("*")) return "every"
        return "exact"
    }

    const setCronPart = (index: number) => (newPart: string) => {
        parts.splice(index, 1, newPart.toString())
        setValue(parts.join(" "))
    }

    const setMode = (index: number, exactStart: number) => (mode: CronPartMode) => {
        switch (mode) {
            case "every": return setCronPart(index)("*")
            case "interval": return setCronPart(index)("*/2")
            case "exact": return setCronPart(index)(exactStart.toString())
        }
    }

    const minutesMode = useMemo(parseMode(0), [parts[0]])
    const hoursMode = useMemo(parseMode(1), [parts[1]])
    const daysMode = useMemo(parseMode(2), [parts[2]])
    const monthsMode = useMemo(parseMode(3), [parts[3]])
    const weekdaysMode = useMemo(parseMode(4), [parts[4]])

    const useExactTime = minutesMode === "exact" && hoursMode === "exact"
    const setTime = (minutes: string, hours: string) => setValue([minutes, hours, ...parts.slice(2)].join(" "))

    const setDays = (days: string, weekdays: string) => setValue([parts[0], parts[1], days, parts[3], weekdays].join(" "))

    const month = useMemo(() => monthsMode === "exact" ? getMonth(parts[3]) : undefined, [parts[3], monthsMode])

    return (
        <div className="rounded-md border overflow-clip">
            <ModeSwitcherDropdown
                items={<>
                    {!useExactTime && <>
                        <DropdownMenuItem className="flex items-center gap-2" onClick={() => {
                            const minutes = minutesMode === "exact" ? parts[0] : "0"
                            const hours = hoursMode === "exact" ? parts[1] : "0"
                            setTime(minutes, hours)
                        }}>
                            <TI><IconClock /></TI>
                            At exact time
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>}
                    <ModeSwitcherItems unit="minute" mode={minutesMode} setMode={setMode(0, 0)} />
                    <DropdownMenuSeparator />
                    <ModeSwitcherItems unit="hour" mode={hoursMode} setMode={setMode(1, 0)} />
                </>}
            >
                {useExactTime
                    ? <ExactTimeInput
                        minutesCronPart={parts[0]} hoursCronPart={parts[1]}
                        setTimeCronParts={setTime}
                    />
                    : <div className="grow">
                        <div className="flex items-center gap-2 no-shrink-children min-h-[44px]">
                            {minutesMode === "every" &&
                                <span>Every minute</span>}
                            {minutesMode === "interval" &&
                                <IntervalModeInput unit="minute" cronPart={parts[0]} setCronPart={setCronPart(0)} />}
                            {minutesMode === "exact" &&
                                <ExactModeInput
                                    unit="minute" cronPart={parts[0]} setCronPart={setCronPart(0)}
                                    min={0} max={59}
                                />}
                        </div>
                        <div className="flex items-center gap-2 no-shrink-children min-h-[44px]">
                            {hoursMode === "every" &&
                                <span>Of every hour</span>}
                            {hoursMode === "interval" &&
                                <IntervalModeInput unit="hour" cronPart={parts[1]} setCronPart={setCronPart(1)} />}
                            {hoursMode === "exact" &&
                                <ExactModeInput
                                    unit="hour" cronPart={parts[1]} setCronPart={setCronPart(1)}
                                    min={0} max={23}
                                />}
                        </div>
                    </div>}
            </ModeSwitcherDropdown>

            <ModeSwitcherDropdown
                // items={<ModeSwitcherItems
                //     unit="day" mode={daysMode} setMode={setMode(2, 1)}
                //     exactText={() => "On exact day"}
                // />}
                items={<>
                    <DropdownMenuLabel>Day format</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={daysMode === "every" && weekdaysMode === "every"}
                        onCheckedChange={c => c && setDays("*", "*")}
                    >
                        Every day
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={daysMode === "interval"}
                        onCheckedChange={c => c && setDays("*/2", "*")}
                    >
                        Every&nbsp;<CodeSpan>N</CodeSpan>&nbsp;days
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={daysMode === "exact"}
                        onCheckedChange={c => c && setDays("1", "*")}
                    >
                        On exact day(s) of the month
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={weekdaysMode === "exact"}
                        onCheckedChange={c => c && setDays("*", "mon")}
                    >
                        On exact day(s) of the week
                    </DropdownMenuCheckboxItem>
                </>}
            >
                {weekdaysMode === "exact" && daysMode === "every" &&
                    <ExactDayOfWeekInput
                        cronPart={parts[4]} setCronPart={setCronPart(4)}
                    />}

                {weekdaysMode === "every" && <>
                    {daysMode === "every" &&
                        <span>{useExactTime ? "Every" : "Of every"} day</span>}
                    {daysMode === "interval" &&
                        <IntervalModeInput unit="day" cronPart={parts[2]} setCronPart={setCronPart(2)} />}
                    {daysMode === "exact" &&
                        <ExactDayOfMonthInput
                            cronPart={parts[2]} setCronPart={setCronPart(2)}
                            numberOfDays={month?.days ?? 31}
                        />}
                </>}

                {(weekdaysMode === "interval" || weekdaysMode === "exact" && daysMode !== "every") &&
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-destructive">
                            Unsupported day format
                        </p>
                        <Button
                        type="button"
                            variant="outline" size="sm"
                            onClick={() => setDays("*", "*")}
                            onPointerDown={ev => ev.stopPropagation()}
                        >
                            Reset
                        </Button>
                    </div>}
            </ModeSwitcherDropdown>

            <ModeSwitcherDropdown
                items={<ModeSwitcherItems
                    unit="month" mode={monthsMode} setMode={setMode(3, 1)}
                    exactText={() => "During exact month"}
                />}
            >
                {monthsMode === "every" &&
                    <span>{daysMode === "exact" ? "Every" : "Of every"} month</span>}
                {monthsMode === "interval" &&
                    <IntervalModeInput unit="month" cronPart={parts[3]} setCronPart={setCronPart(3)} />}
                {monthsMode === "exact" &&
                    <ExactMonthInput cronPart={parts[3]} setCronPart={setCronPart(3)} />}
            </ModeSwitcherDropdown>
        </div>
    )
})
SchedulePicker.displayName = "SchedulePicker"


function ModeSwitcherDropdown({
    children, items,
}: {
    children: React.ReactNode
    items?: React.ReactNode
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    className="flex items-center justify-between no-shrink-children gap-3 min-h-[44px] px-4 hover:bg-gray-50 transition-colors text-sm"
                    role="button"
                >
                    {children}
                    <TI className="text-md"><IconChevronDown /></TI>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[200px] z-[110]" align="end">
                {items}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ModeSwitcherItems({
    unit,
    mode, setMode,
    everyText: EveryText = p => `Every ${p.unit}`,
    intervalText: IntervalText = p => <>Every&nbsp;<CodeSpan>N</CodeSpan>&nbsp;{plural(p.unit, 2)}</>,
    exactText: ExactText = p => `At exact ${p.unit}`,
}: {
    unit: string
    mode: CronPartMode
    setMode: (mode: CronPartMode) => void
    everyText?: React.ComponentType<{ unit: string }>
    intervalText?: React.ComponentType<{ unit: string }>
    exactText?: React.ComponentType<{ unit: string }>
}) {
    return <>
        <DropdownMenuLabel className="capitalize">{unit} format</DropdownMenuLabel>
        <DropdownMenuCheckboxItem {...checkboxItemProps("every", mode, setMode)}>
            <EveryText unit={unit} />
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem {...checkboxItemProps("interval", mode, setMode)}>
            <IntervalText unit={unit} />
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem {...checkboxItemProps("exact", mode, setMode)}>
            <ExactText unit={unit} />
        </DropdownMenuCheckboxItem>
    </>
}


function IntervalModeInput({
    unit,
    cronPart, setCronPart,
}: {
    unit: string
    cronPart: string
    setCronPart: (cronPart: string) => void
}) {
    const formValues = useMemo(() => ({
        step: cronPart.split("/").at(-1) ?? "2",
    }), [cronPart])

    const form = useForm({
        resolver: zodResolver(z.object({
            step: z.string().transform(s => +s).pipe(
                z.number().int().finite().min(1).max(1000)
            ),
        })),
        values: formValues,
        mode: "onChange",
    })

    const step = form.watch("step")
    const error = form.formState.errors.step

    useEffect(() => {
        form.handleSubmit(values => {
            setCronPart(`*/${values.step}`)
        })()
    }, [step])

    const { field } = useController({
        control: form.control,
        name: "step",
    })

    return (
        <div>
            <div className="flex items-center gap-2 no-shrink-children">
                Every
                <Input
                    type="number" inputMode="numeric" placeholder="2"
                    min={1} max={1000}
                    {...field}
                    className="basis-0 grow-[1] max-w-[100px]"
                    onPointerDown={ev => ev.stopPropagation()}
                />
                {plural(unit, parseInt(step))}
            </div>
            {error && <p className="text-xs text-destructive">
                {error.message}
            </p>}
        </div>
    )
}


function ExactModeInput({
    unit,
    cronPart, setCronPart,
    min, max,
    preposition = "At",
}: {
    unit: string
    cronPart: string
    setCronPart: (cronPart: string) => void
    min: number
    max: number
    preposition?: string
}) {

    const form = useForm({
        resolver: zodResolver(z.object({
            exact: z.string().transform(s => +s).pipe(
                z.number().int().finite().min(min).max(max)
            ),
        })),
        values: { exact: cronPart.toString() },
        mode: "onChange",
    })

    const exact = form.watch("exact")
    const error = form.formState.errors.exact

    useEffect(() => {
        form.handleSubmit(values => {
            setCronPart(values.exact.toString())
        })()
    }, [exact])

    const { field } = useController({
        control: form.control,
        name: "exact",
    })

    return (
        <div>
            <div className="flex items-center gap-2 no-shrink-children">
                {preposition} the
                <Input
                    type="number" inputMode="numeric" placeholder="0"
                    min={min} max={max}
                    {...field}
                    className="basis-0 grow-[1] max-w-[100px]"
                    onPointerDown={ev => ev.stopPropagation()}
                />
                <span className="align-super text-xs">
                    {numberSuffix(parseInt(exact))}
                </span>
                {unit}
            </div>
            {error && <p className="text-xs text-destructive">
                {error.message}
            </p>}
        </div>
    )
}


const MONTHS: {
    value: string
    name: string
    days: number
}[] = [
        { value: "jan", name: "January", days: 31 },
        { value: "feb", name: "February", days: 28 },
        { value: "mar", name: "March", days: 31 },
        { value: "apr", name: "April", days: 30 },
        { value: "may", name: "May", days: 31 },
        { value: "jun", name: "June", days: 30 },
        { value: "jul", name: "July", days: 31 },
        { value: "aug", name: "August", days: 31 },
        { value: "sep", name: "September", days: 30 },
        { value: "oct", name: "October", days: 31 },
        { value: "nov", name: "November", days: 30 },
        { value: "dec", name: "December", days: 31 },
    ]

function ExactMonthInput({
    cronPart, setCronPart,
}: {
    cronPart: string
    setCronPart: (cronPart: string) => void
}) {
    const formValues = useMemo(() => ({
        exact: getMonth(cronPart)?.value ?? "jan",
    }), [cronPart])

    const form = useForm({
        resolver: zodResolver(z.object({
            exact: z.enum(MONTHS.map(m => m.value) as [string, ...string[]]),
        })),
        values: formValues,
        mode: "onChange",
    })

    const exact = form.watch("exact")
    const error = form.formState.errors.exact

    useEffect(() => {
        form.handleSubmit(values => {
            setCronPart(values.exact)
        })()
    }, [exact])

    const { field } = useController({
        control: form.control,
        name: "exact",
    })

    return (
        <div>
            <div className="flex items-center gap-2 no-shrink-children">
                During
                <Select
                    value={field.value}
                    onValueChange={field.onChange}
                >
                    <SelectTrigger className="flex-1 min-w-[160px] max-w-[200px]">
                        <SelectValue placeholder="Pick a month" />
                    </SelectTrigger>
                    <SelectContent className="z-[110]" onPointerDown={e => e.stopPropagation()}>
                        {MONTHS.map(m =>
                            <SelectItem key={m.value} value={m.value}>{m.name}</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
            {error && <p className="text-xs text-destructive">
                {error.message}
            </p>}
        </div>
    )
}


function ExactTimeInput({
    minutesCronPart, hoursCronPart, setTimeCronParts,
}: {
    minutesCronPart: string
    hoursCronPart: string
    setTimeCronParts: (minutes: string, hours: string) => void
}) {

    const formValues = useMemo(() => ({
        time: `${hoursCronPart.padStart(2, "0")}:${minutesCronPart.padStart(2, "0")}`
    }), [minutesCronPart, hoursCronPart])

    const form = useForm({
        resolver: zodResolver(z.object({
            time: z.string().regex(/\d\d:\d\d/, "Invalid time"),
        })),
        values: formValues,
        mode: "onChange",
    })

    const time = form.watch("time")
    const error = form.formState.errors.time

    useEffect(() => {
        form.handleSubmit(values => {
            const [hours, minutes] = values.time.split(":")
            setTimeCronParts(parseInt(minutes).toString(), parseInt(hours).toString())
        })()
    }, [time])

    const { field } = useController({
        control: form.control,
        name: "time",
    })

    return (
        <div>
            <div className="flex items-center gap-2 no-shrink-children">
                At
                <Input
                    type="time"
                    {...field}
                    className="flex-1 max-w-[120px]"
                    onPointerDown={ev => ev.stopPropagation()}
                />
            </div>
            {error && <p className="text-xs text-destructive">
                {error.message}
            </p>}
        </div>
    )
}


function ExactDayOfMonthInput({
    cronPart, setCronPart,
    numberOfDays,
}: {
    cronPart: string
    setCronPart: (cronPart: string) => void
    numberOfDays: number
}) {

    const formValues = useMemo(() => ({
        days: new Set(cronPart.split(",").flatMap(item => {
            let arr: number[]
            if (item.includes("-")) {
                const [start, end] = item.split("-").map(s => parseInt(s))
                arr = Array(end - start + 1).fill(null).map((_, i) => start + i)
            } else {
                arr = [parseInt(item)]
            }
            return arr.filter(i => !isNaN(i) && i <= numberOfDays)
        })),
    }), [cronPart, numberOfDays])

    const form = useForm({
        resolver: zodResolver(z.object({
            days: z.set(z.number()).nonempty("You must select at least one day"),
        })),
        values: formValues,
        mode: "onChange",
    })

    const { field } = useController({
        control: form.control,
        name: "days",
    })
    const error = form.formState.errors.days

    useEffect(() => {
        form.handleSubmit(values => {
            setCronPart(Array.from(values.days).sort().join(","))
        })()
    }, [field.value])

    const [lastClicked, setLastClicked] = useState<number | null>(null)

    useEffect(() => {
        const arr = Array.from(field.value)
        if (arr.some(i => i > numberOfDays))
            field.onChange(new Set(arr.filter(i => i <= numberOfDays)))
    }, [numberOfDays])

    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 no-shrink-children">
                On the
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        type="button"
                            variant="outline" size="sm"
                            onPointerDown={ev => ev.stopPropagation()}
                            className="min-w-0 flex-1"
                        >
                            <div className={cn(
                                "truncate w-0 flex-1",
                                field.value.size === 0 && "text-muted-foreground",
                            )}>
                                {Array.from(field.value)
                                    .sort()
                                    .map(num => `${num}${numberSuffix(num)}`)
                                    .join(", ") || "None"}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        className="w-[240px] z-[110] mx-4 p-2 grid gap-2"
                        onPointerDown={ev => ev.stopPropagation()}
                    >
                        <div className="grid grid-cols-7 gap-0.5">
                            {Array(numberOfDays).fill(null).map((_, i) =>
                                <button
                                    key={i} type="button"
                                    className={cn(
                                        "rounded-sm aspect-square text-xs transition-colors",
                                        lastClicked === i && "outline outline-2 outline-gray-400",
                                        field.value.has(i + 1)
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-gray-50",
                                    )}
                                    onClick={() => {
                                        const usingRangeKey = isHotkeyPressed("shift") && lastClicked != null
                                        const range = usingRangeKey
                                            ? new Set(
                                                Array(Math.abs(i - lastClicked) + 1).fill(null)
                                                    .map((_, j) => Math.min(i, lastClicked) + j + 1)
                                            )
                                            : new Set([i + 1])
                                        if (range.isSubsetOf(field.value)) {
                                            field.onChange(field.value.difference(range))
                                        } else {
                                            field.onChange(field.value.union(range))
                                        }
                                        if (!usingRangeKey)
                                            setLastClicked(i)
                                    }}
                                >
                                    {i + 1}
                                </button>
                            )}
                        </div>
                        <Separator />
                        <Button type="button" variant="ghost" size="compact" onClick={() => field.onChange(new Set([1]))}>
                            Reset
                        </Button>
                    </PopoverContent>
                </Popover>
                of the month
            </div>
            {error && <p className="text-xs text-destructive">
                {error.message}
            </p>}
        </div>
    )
}


const WEEKDAYS: {
    value: string
    name: string
}[] = [
        { value: "mon", name: "Monday" },
        { value: "tue", name: "Tuesday" },
        { value: "wed", name: "Wednesday" },
        { value: "thu", name: "Thursday" },
        { value: "fri", name: "Friday" },
        { value: "sat", name: "Saturday" },
        { value: "sun", name: "Sunday" },
    ]

function ExactDayOfWeekInput({
    cronPart, setCronPart,
}: {
    cronPart: string
    setCronPart: (cronPart: string) => void
}) {

    const formValues = useMemo(() => ({
        days: new Set(cronPart.split(",").flatMap(item => {
            if (item.includes("-")) {
                const [start, end] = item.split("-").map(s => {
                    const weekday = getWeekday(s)
                    return weekday ? WEEKDAYS.indexOf(weekday) : null
                })
                return (start == null || end == null)
                    ? []
                    : WEEKDAYS.slice(start, end + 1).map(d => d.value)
            } else {
                const weekday = getWeekday(item)
                return weekday ? [weekday.value] : []
            }
        })),
    }), [cronPart])

    const form = useForm({
        resolver: zodResolver(z.object({
            days: z.set(z.enum(WEEKDAYS.map(d => d.value) as [string, ...string[]]))
                .nonempty("You must select at least one day"),
        })),
        values: formValues,
        mode: "onChange",
    })

    const { field } = useController({
        control: form.control,
        name: "days",
    })
    const error = form.formState.errors.days

    useEffect(() => {
        form.handleSubmit(values => {
            setCronPart(Array.from(values.days).join(","))
        })()
    }, [field.value])

    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 no-shrink-children">
                On each
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline" size="sm"
                            onPointerDown={ev => ev.stopPropagation()}
                        >
                            <div className={cn(
                                "truncate",
                                field.value.size === 0 && "text-muted-foreground",
                            )}>
                                {Array.from(field.value)
                                    .sort((a, b) => WEEKDAYS.indexOf(getWeekday(a)!) - WEEKDAYS.indexOf(getWeekday(b)!))
                                    .map(day => day.at(0)!.toUpperCase() + day.slice(1))
                                    .join(", ") || "None"}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        className="max-w-[300px] z-[110] mx-4 p-2 grid gap-2"
                        onPointerDown={ev => ev.stopPropagation()}
                    >
                        <div className="flex items-stretch flex-wrap justify-center gap-1">
                            {WEEKDAYS.map(day =>
                                <button
                                    key={day.value} type="button"
                                    className={cn(
                                        "rounded-md p-2 text-xs transition-colors",
                                        field.value.has(day.value)
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-gray-50",
                                    )}
                                    onClick={() => {
                                        if (field.value.has(day.value)) {
                                            field.onChange(field.value.difference(new Set([day.value])))
                                        } else {
                                            field.onChange(field.value.union(new Set([day.value])))
                                        }
                                    }}
                                >
                                    {day.name}
                                </button>
                            )}
                        </div>
                        <Separator />
                        <Button type="button" variant="ghost" size="compact" onClick={() => field.onChange(new Set(["mon"]))}>
                            Reset
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
            {error && <p className="text-xs text-destructive">
                {error.message}
            </p>}
        </div>
    )
}


const CodeSpan = forwardRef<HTMLSpanElement, React.ComponentProps<"span">>((props, ref) =>
    <span
        {...props}
        className={cn("font-mono text-sm border rounded-sm px-1", props.className)}
        ref={ref}
    />
)
CodeSpan.displayName = "CodeSpan"


function checkboxItemProps<T>(value: T, current: T, setCurrent: (value: T) => void) {
    return {
        checked: value === current,
        onCheckedChange: (checked: boolean) => {
            if (checked) setCurrent(value)
        },
    }
}

function getMonth(monthStr: string) {
    const parsedAsNumber = parseInt(monthStr)
    if (!isNaN(parsedAsNumber))
        return MONTHS.at(parsedAsNumber - 1)
    return MONTHS.find(m => m.value === monthStr)
}

function getWeekday(weekdayStr: string) {
    const parsedAsNumber = parseInt(weekdayStr)
    if (!isNaN(parsedAsNumber))
        return WEEKDAYS.at(parsedAsNumber - 1)
    return WEEKDAYS.find(m => m.value === weekdayStr)
}

function getTimezoneName(tz: string) {
    return Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longGeneric" })
        .formatToParts()
        .find(p => p.type === "timeZoneName")?.value ?? tz
}

function getTimezoneOffset(tz: string) {
    return parseInt(
        Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
            .formatToParts()
            .find(p => p.type === "timeZoneName")?.value
            .replaceAll("GMT", "")
            .replace(/:.+/, "") ?? "0"
    )
}

const timezoneOptions: {
    value: string
    name: string
}[] = Intl.supportedValuesOf("timeZone")
    .map(tz => ({
        name: getTimezoneName(tz),
        value: tz,
        offset: getTimezoneOffset(tz),
    }))
    .sort((a, b) => a.offset - b.offset)



interface CronInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "defaultValue"> {
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
}

const CronInput = forwardRef<HTMLInputElement, CronInputProps>(({ value, onValueChange, defaultValue, ...props }, passedRef) => {

    const form = useForm({
        resolver: zodResolver(z.object({
            cron: z.string().superRefine((value, ctx) => {
                if (value.trim().split(/\s+/).length !== 5)
                    return ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Must contain 5 fields",
                    })

                try {
                    parseCronExpression(value)
                } catch (err: any) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: (err.message ?? err.toString())
                            .replaceAll("NaN", "not a number")
                            .replace(/^Error: ?/i, ""),
                    })
                }
            })
        })),
        values: value ? { cron: value } : undefined,
        defaultValues: defaultValue ? { cron: defaultValue } : undefined,
        mode: "onChange",
    })

    const { field } = useController({
        control: form.control,
        name: "cron",
    })
    const error = form.formState.errors.cron

    useEffect(() => {
        form.handleSubmit(values => {
            onValueChange?.(values.cron)
        })()
    }, [field.value])

    return (
        <div>
            <div className="grid gap-2">
                <Input
                    placeholder="0 * * * *"
                    {...props}
                    {...field}
                    ref={passedRef}
                />
                {error && <p className="text-xs text-destructive">
                    {error.message}
                </p>}
            </div>

            <Alert className="my-4">
                <TI><IconAsteriskSimple /></TI>
                <AlertDescription className="text-xs">
                    <p>Cron syntax is a flexible and descriptive way to describe a schedule for a task.</p>
                    <a
                        href="https://www.ibm.com/docs/en/db2oc?topic=task-unix-cron-format" target="_blank"
                        className="font-medium hover:underline inline-flex items-center gap-1 mt-2"
                    >
                        Learn more about cron syntax
                        <TI><IconExternalLink /></TI>
                    </a>
                </AlertDescription>
            </Alert>
        </div>
    )
})
CronInput.displayName = "CronInput"
