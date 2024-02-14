import { Button, Divider, Input, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Textarea } from "@nextui-org/react"
import { useForm } from "@web/modules/form"
import { useWorkflow } from "@web/modules/workflows"
import { TbClearAll, TbClearFormatting, TbPlayerPlay } from "react-icons/tb"
import { object as triggerMap } from "triggers/web"


export default function Runner() {

    const { data: workflow } = useWorkflow()
    const triggerDef = triggerMap[workflow?.trigger?.type]

    const form = useForm({
        initial: Object.fromEntries(
            Object.entries(triggerDef.inputs).map(([inputId, inputDef]) =>
                [inputId, inputDef.type === "data-type:basic.date" ? new Date().toISOString() : ""]
            )
        ),
    })

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button
                    size="sm" color="primary"
                    startContent={<TbPlayerPlay />}
                    className="pointer-events-auto"
                >
                    Run Now
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="pointer-events-auto p-unit-md flex flex-col gap-unit-md items-stretch"
            >
                <div className="flex items-center justify-between gap-unit-xs">
                    <p className="font-bold">
                        Run workflow manually
                    </p>
                    <Button
                        startContent={<TbClearFormatting />}
                        size="sm"
                        onPress={() => form.reset()}
                    >
                        Clear Inputs
                    </Button>
                </div>

                <Divider />

                <form className="flex flex-col items-stretch gap-unit-xs">
                    <ScrollShadow
                        size={4}
                        className="max-h-[calc(100vh-16rem)] -m-unit-xs p-unit-xs"
                    >
                        <div className="flex flex-col items-stretch gap-unit-xs w-96">
                            {Object.entries(triggerDef.inputs).map(([inputId, inputDef]) =>
                                <TriggerInput
                                    key={inputId}
                                    inputProps={form.inputProps(inputId)}
                                    {...inputDef}
                                />
                            )}
                        </div>
                    </ScrollShadow>

                    <Button
                        color="primary" size="sm"
                        startContent={<TbPlayerPlay />}
                        className="mt-unit-md"
                    >
                        Run
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    )
}


function TriggerInput({ name, type, stringSettings, inputProps }) {
    switch (type) {
        case "data-type:basic.string":
            return stringSettings?.long ?
                <Textarea
                    size="sm" labelPlacement="outside"
                    placeholder="Type something..."
                    label={name}
                    minRows={2} maxRows={10}
                    {...inputProps}
                /> :
                <Input
                    size="sm" labelPlacement="outside"
                    placeholder="Type something..."
                    label={name}
                    {...inputProps}
                />
        case "data-type:basic.number":
            return <Input
                size="sm" type="number" labelPlacement="outside"
                placeholder="0"
                label={name}
                {...inputProps}
            />
        case "data-type:basic.date":
            return <Input
                size="sm" type="datetime-local" labelPlacement="outside"
                placeholder="Select a date"
                label={name}
                {...inputProps}
            />
    }

    return <Input
        size="sm" labelPlacement="outside"
        placeholder=" "
        label={name}
    />
}