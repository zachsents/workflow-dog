import { Button, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"
import { useWorkflowRuns } from "@web/modules/workflows"
import { TbClockPlay } from "react-icons/tb"


export default function RunViewer() {

    const { data: runs } = useWorkflowRuns()

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button
                    size="sm" variant="bordered"
                    startContent={<TbClockPlay />}
                    className="pointer-events-auto"
                >
                    View Runs
                </Button>
            </PopoverTrigger>
            <PopoverContent className="pointer-events-auto">
                <Listbox items={runs}>
                    {run => (
                        <ListboxItem className="flex items-center gap-unit-xs" key={run.id}>
                            <div>
                                <span className="text-default-500 font-normal">#</span>
                                <span className="font-bold">{run.count}</span>
                            </div>
                            <span>{run.status}</span>
                        </ListboxItem>
                    )}
                </Listbox>
            </PopoverContent>
        </Popover>
    )
}