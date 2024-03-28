"use client"

import { Button } from "@ui/button"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList
} from "@ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@ui/tooltip"
import { DataTypeDefinitions } from "packages/web"
import { TbChevronDown } from "react-icons/tb"


export default function PropertySelector({ dataTypeId }: { dataTypeId: string }) {

    const dataType = DataTypeDefinitions.get(dataTypeId)

    const properties = Object.keys((dataType?.schema as any).shape ?? {})

    return (
        <Popover>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                size="sm" variant="outline"
                                className="rounded-full shrink-0 w-auto h-auto p-0 aspect-square"
                            >
                                <TbChevronDown />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="text-xs">
                            Select property
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent align="start" className="w-[240px] p-1">
                <Command>
                    <CommandInput placeholder="Search properties..." />
                    <CommandList>
                        <CommandEmpty>No properties found.</CommandEmpty>
                        {properties.map(property => (
                            <CommandItem
                                key={property}
                                value={property}
                            // onSelect={currentValue => addNode(currentValue)}
                            >
                                {property}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}