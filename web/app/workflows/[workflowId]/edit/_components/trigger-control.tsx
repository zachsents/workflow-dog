"use client"

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
import { useCurrentWorkflowId, useDialogState, useSearch, useSearchParamEffect } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { plural } from "@web/modules/grammar"
import { useWorkflow } from "@web/modules/workflows"
import _ from "lodash"
import { TriggerDefinitions } from "packages/client"
import React, { forwardRef } from "react"
import { TbChevronDown, TbPlus, TbX } from "react-icons/tb"
import { toast } from "sonner"


export default function TriggerControl() {

    const workflowId = useCurrentWorkflowId()
    const { data: workflow } = useWorkflow()

    const trigger = workflow?.triggers[0]
    const hasTrigger = Boolean(trigger)
    const triggerDefinition = TriggerDefinitions.get(trigger?.def_id)

    const popover = useDialogState()
    const dialog = useDialogState()

    useSearchParamEffect("select_trigger", dialog.open, {
        clearAfterEffect: true,
    })

    const utils = trpc.useUtils()

    const {
        mutateAsync: _updateTrigger,
        isPending,
    } = trpc.workflows.triggers.update.useMutation({
        onSettled: () => {
            utils.workflows.byId.invalidate({ id: workflowId })
        },
    })

    return (<>
        {hasTrigger ?
            <Popover {...popover.dialogProps}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost" size="sm"
                        className="flex center gap-2 border border-muted-foreground"
                    >
                        <p className="font-normal mr-1">
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
                    align="center" side="bottom" sideOffset={10}
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

                    <div className="flex-v items-stretch gap-4 p-2">
                        <p className="text-sm text-muted-foreground">
                            {triggerDefinition?.description}
                        </p>

                        <p className="font-bold">
                            Configure Trigger
                        </p>

                        {triggerDefinition?.renderConfig ?
                            <triggerDefinition.renderConfig
                                workflowId={workflowId}
                                workflow={workflow!}
                                updateConfig={(data) => {
                                    const promise = _updateTrigger({
                                        triggerId: trigger?.id!,
                                        ...data,
                                    })
                                    toast.promise(promise, {
                                        loading: "Updating trigger. This may take a few seconds...",
                                        success: "Trigger updated!",
                                        error: (err) => err.data?.message || "Failed to update trigger.",
                                    })
                                    popover.close()
                                    return promise
                                }}
                                isUpdating={isPending}
                                onClose={popover.close}
                            /> :
                            <p className="text-sm text-muted-foreground text-center">
                                No configuration needed.
                            </p>}
                    </div>
                </PopoverContent>
            </Popover> :
            <Button
                size="sm"
                onClick={dialog.open}
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
].map(id => TriggerDefinitions.resolveId(id)).filter(Boolean) as string[]

const [suggestedTriggers, otherTriggers] = _.partition(
    TriggerDefinitions.asArray,
    trigger => suggestedTriggerIds.includes(trigger.id)
)

const totalTriggers = TriggerDefinitions.asArray.length


function TriggerDialog(props: React.ComponentProps<typeof Dialog>) {

    const workflowId = useCurrentWorkflowId()
    const { data: workflow } = useWorkflow()
    const currentTriggerDefId = workflow?.triggers[0]?.def_id

    const utils = trpc.useUtils()

    const {
        mutateAsync: assignTrigger,
        isPending,
    } = trpc.workflows.triggers.assignNew.useMutation({
        onSettled: () => {
            utils.workflows.byId.invalidate({ id: workflowId })
        },
        onSuccess: () => {
            props.onOpenChange?.(false)
        },
    })

    const search = useSearch(TriggerDefinitions.asArray, {
        keys: ["name", "whenName", "description"],
    })

    const triggerItemProps = (definition: typeof TriggerDefinitions.asArray[0]): TriggerSearchResultItemProps => ({
        trigger: definition,
        onSelect: () => {
            if (currentTriggerDefId !== definition.id)
                assignTrigger({
                    workflowId,
                    definitionId: definition.id,
                })
        },
        disabled: isPending,
        current: currentTriggerDefId === definition.id,
    })

    return (
        <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        When should this workflow be triggered?
                    </DialogTitle>
                    <DialogDescription>
                        Choose a trigger to start your workflow. You can always change this later.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 items-stretch">
                    <div className="flex-1 flex-v items-stretch gap-2">

                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder={`Search ${totalTriggers || 0} ${plural("trigger", totalTriggers)}`}
                                value={search.query}
                                onValueChange={search.setQuery}
                            />
                            <CommandList className="mt-4">
                                <CommandEmpty>
                                    No triggers found.
                                </CommandEmpty>

                                {!!search.query ?
                                    search.filtered.map(definition =>
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
