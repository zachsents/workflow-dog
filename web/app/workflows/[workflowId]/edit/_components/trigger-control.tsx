"use client"

import { useDebouncedCallback } from "@react-hookz/web"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@ui/dialog"
import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@web/components/ui/command"
import { Dialog } from "@web/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@web/components/ui/popover"
import { Separator } from "@web/components/ui/separator"
import { Skeleton } from "@web/components/ui/skeleton"
import { useAction } from "@web/lib/client/actions"
import { useCurrentWorkflowId, useDialogState } from "@web/lib/client/hooks"
import { plural } from "@web/modules/grammar"
import { useWorkflow } from "@web/modules/workflows"
import Fuse from "fuse.js"
import _ from "lodash"
import { TriggerDefinitions } from "packages/client"
import React, { forwardRef, useEffect, useMemo, useState } from "react"
import { TbChevronDown, TbPlus, TbX } from "react-icons/tb"
import { assignNewTrigger as assignNewTriggerAction, updateTriggerConfig as updateTriggerConfigAction } from "../actions"
import { usePathname, useRouter, useSearchParams } from "next/navigation"


export default function TriggerControl() {

    const workflowId = useCurrentWorkflowId()
    const { data: workflow, isSuccess: hasWorkflowLoaded } = useWorkflow()

    const trigger = workflow?.trigger as any
    const hasTrigger = Boolean(trigger)
    const triggerDefinition = TriggerDefinitions.get(trigger?.type)

    const popover = useDialogState()
    const dialog = useDialogState()

    const [updateConfig, updateMutation] = useAction(
        updateTriggerConfigAction.bind(null, workflowId),
        {
            showLoadingToast: true,
            showErrorToast: true,
            successToast: "Trigger updated!",
            invalidateKey: ["workflow", workflowId],
        }
    )

    useSelectTriggerParam(dialog.open)

    if (!hasWorkflowLoaded) return (
        <Skeleton className="w-64 h-6" />
    )

    return (<>
        {hasTrigger ?
            <Popover {...popover.dialogProps}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline" size="sm"
                        className="flex center gap-2 bg-white/80 backdrop-blur-sm shadow-lg pointer-events-auto"
                    >
                        <p className="text-muted-foreground font-normal mr-1">
                            Trigger:
                        </p>
                        {triggerDefinition?.icon &&
                            <triggerDefinition.icon />}
                        <p>
                            {triggerDefinition?.whenName || triggerDefinition?.name || "Unknown trigger"}
                        </p>
                        <TbChevronDown />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="p-2 w-[24rem] max-h-[40rem] overflow-y-scroll flex-v items-stretch gap-2 shadow-lg"
                >
                    <div className="flex justify-between items-center">
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => {
                                dialog.open()
                                popover.close()
                            }}
                        >
                            Change Trigger
                        </Button>

                        <Button variant="ghost" size="sm" onClick={popover.close}>
                            <TbX />
                        </Button>
                    </div>

                    <Separator />

                    <div className="flex-v items-stretch gap-2 p-2">
                        <p className="font-bold">
                            Configure Trigger
                        </p>
                        {triggerDefinition?.renderConfig ?
                            <triggerDefinition.renderConfig
                                workflowId={workflow?.id!}
                                workflow={workflow as any}
                                updateConfig={updateConfig}
                                isUpdating={updateMutation.isPending}
                                onClose={popover.close}
                            /> :
                            <p className="text-sm text-muted-foreground text-center">
                                No configuration needed.
                            </p>}
                    </div>
                </PopoverContent>
            </Popover> :
            <Button
                variant="default" size="sm"
                onClick={dialog.open}
                className="pointer-events-auto shadow-lg"
            >
                <TbPlus className="mr-2" />
                Add Trigger
            </Button>}

        <TriggerDialog {...dialog.dialogProps} />
    </>)
}


const suggestedTriggerIds = [
    "basic/manual",
    "basic/schedule",
    "basic/request",
].map(id => TriggerDefinitions.resolveId(id))

const [suggestedTriggers, otherTriggers] = _.partition(
    TriggerDefinitions.asArray,
    trigger => suggestedTriggerIds.includes(trigger.id)
)

const totalTriggers = TriggerDefinitions.asArray.length


function TriggerDialog(props: React.ComponentProps<typeof Dialog>) {

    const workflowId = useCurrentWorkflowId()
    const { data: workflow } = useWorkflow()
    const currentTriggerId = (workflow?.trigger as any)?.type

    const [assignNewTrigger, newTriggerMutation] = useAction(
        assignNewTriggerAction.bind(null, workflowId),
        {
            showLoadingToast: true,
            showErrorToast: true,
            successToast: "Trigger updated!",
            invalidateKey: ["workflow", workflowId],
        }
    )
    const setTrigger = (type: string) => assignNewTrigger({ type })
        .then(() => props.onOpenChange!(false))


    const fuseIndex = useMemo(() => new Fuse(TriggerDefinitions.asArray, {
        includeScore: true,
        keys: ["name", "whenName", "description"],
    }), [])

    const [hasQuery, setHasQuery] = useState(false)
    const [searchResults, setSearchResults] = useState<typeof TriggerDefinitions.asArray>([])

    const onSearchChange = useDebouncedCallback((query: string) => {
        setHasQuery(Boolean(query.trim()))
        setSearchResults(
            fuseIndex.search(query, { limit: 8 })
                .map(result => result.item)
        )
    }, [fuseIndex], 200)

    const triggerItemProps = (definition: typeof TriggerDefinitions.asArray[0]): TriggerSearchResultItemProps => ({
        trigger: definition,
        onSelect: () => {
            if (currentTriggerId !== definition.id)
                setTrigger(definition.id)
        },
        disabled: newTriggerMutation.isPending,
        current: currentTriggerId === definition.id,
    })

    return (
        <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        When should this workflow be triggered?
                    </DialogTitle>
                    <DialogDescription>
                        Choose a trigger to start your workflow.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 items-stretch">
                    <div className="flex-1 flex-v items-stretch gap-2">

                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder={`Search ${totalTriggers || 0} ${plural("trigger", totalTriggers)}`}
                                onValueChange={onSearchChange}
                            />
                            <CommandList className="mt-4">
                                <CommandEmpty>
                                    No triggers found.
                                </CommandEmpty>

                                {hasQuery ?
                                    searchResults.map(definition =>
                                        <TriggerSearchResultItem
                                            {...triggerItemProps(definition)}
                                            key={definition.id}
                                        />
                                    ) :
                                    <>
                                        <CommandGroup heading="Commonly Used">
                                            {suggestedTriggers.map(definition =>
                                                <TriggerSearchResultItem
                                                    {...triggerItemProps(definition)}
                                                    key={definition.id}
                                                />
                                            )}
                                        </CommandGroup>

                                        {otherTriggers.map(definition =>
                                            <TriggerSearchResultItem
                                                {...triggerItemProps(definition)}
                                                key={definition.id}
                                            />
                                        )}
                                    </>}
                            </CommandList>
                        </Command>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


interface TriggerSearchResultItemProps extends React.ComponentProps<typeof CommandItem> {
    trigger: typeof TriggerDefinitions.asArray[0]
    current?: boolean
}

const TriggerSearchResultItem = forwardRef<React.ElementRef<typeof CommandItem>, TriggerSearchResultItemProps>(({ trigger, current, ...props }, ref) =>
    <CommandItem
        className="flex justify-between items-center gap-2 px-4"
        {...props}
        value={trigger.id}
        ref={ref}
    >
        <div className="flex items-center gap-4">
            <div
                className="flex center p-2 rounded-sm text-primary-foreground"
                style={{ backgroundColor: trigger.color }}
            >
                <trigger.icon />
            </div>
            <div>
                <p>{trigger.name}</p>
                <p className="text-sm text-muted-foreground">{trigger.whenName}</p>
                <p className="text-xs text-muted-foreground">{trigger.description}</p>
            </div>
        </div>

        {current &&
            <Badge>
                Current
            </Badge>}
    </CommandItem>
)


function useSelectTriggerParam(openDialog: () => void) {
    const router = useRouter()
    const pathname = usePathname()
    const shouldSelectTrigger = useSearchParams().has("select_trigger")
    useEffect(() => {
        if (shouldSelectTrigger) {
            router.replace(pathname)
            openDialog()
        }
    }, [shouldSelectTrigger])
}