import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"
import { TbPlayerPlay } from "react-icons/tb"


export default function Runner() {


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
            <PopoverContent className="pointer-events-auto">
                <div className="bg-red-500">dkwjd</div>
            </PopoverContent>
        </Popover>
    )
}
