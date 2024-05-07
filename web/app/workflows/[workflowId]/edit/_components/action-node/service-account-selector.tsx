"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import GoogleConsentWarning from "@web/components/google-consent-warning"
import { Button } from "@web/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { useDialogState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useAvailableIntegrationAccounts } from "@web/modules/integrations"
import { useDefinition, useIsNodeSelected, useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import { ServiceDefinitions } from "packages/client"
import { TbDots, TbExternalLink, TbPlugConnected, TbRefresh, TbSettings, TbX } from "react-icons/tb"
import APIKeyDialog from "./api-key-dialog"



export function NodeServiceAccountSelector() {

    const isNodeSelected = useIsNodeSelected()
    const nodeDefinition = useDefinition()
    const requirement = nodeDefinition!.requiredService!

    const [accounts] = useAvailableIntegrationAccounts(requirement.id, requirement.scopes)

    const [selectedAccount, setSelectedAccount] = useNodeProperty<string | null>(
        undefined,
        "data.serviceAccount",
        {
            defaultValue: accounts.length === 1
                ? accounts[0].id
                : undefined
        }
    )

    return (
        <ServiceAccountSelector
            serviceDefinitionId={requirement.id}
            requiredScopes={requirement.scopes}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-4 max-w-full min-w-[20rem] pointer-events-none",
                (!isNodeSelected && !!selectedAccount) && "hidden",
            )}
        />
    )
}


export interface ServiceAccountSelectorProps extends React.ComponentProps<typeof Select> {
    serviceDefinitionId: string
    requiredScopes?: (string | string[])[]
    selectedAccount: string | null
    setSelectedAccount: (account: string | null) => void
    className?: string
}

export function ServiceAccountSelector({
    serviceDefinitionId,
    requiredScopes,
    selectedAccount,
    setSelectedAccount,
    className,
    ...props
}: ServiceAccountSelectorProps) {

    const queryClient = useQueryClient()
    const { data: workflow } = useWorkflow()

    const serviceDefinition = ServiceDefinitions.get(serviceDefinitionId)
    const [accounts, { isLoading }] = useAvailableIntegrationAccounts(serviceDefinitionId, requiredScopes)

    const iconComponent = serviceDefinition?.icon &&
        <serviceDefinition.icon className="text-lg w-[1em] h-[1em] shrink-0" />

    const keyDialog = useDialogState()

    let connectionComponent: JSX.Element | null = null
    let onConnect: (() => void) | null = null
    switch (serviceDefinition?.authAcquisition.method) {
        case "key":
            connectionComponent =
                <APIKeyDialog
                    serviceId={serviceDefinition.id}
                    {...keyDialog}
                />
            onConnect = keyDialog.open
            break
        case "oauth2":
            onConnect = () => {
                if (!workflow?.team_id)
                    return

                const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/oauth2/connect/${ServiceDefinitions.safeName(serviceDefinition.id)}`)

                url.searchParams.append("t", workflow.team_id)

                if (requiredScopes) {
                    const requestScopes = requiredScopes
                        .map(scope => Array.isArray(scope) ? scope[0] : scope)
                        .join(",")
                    url.searchParams.append("scopes", requestScopes)
                }

                window.open(url.toString())
            }
            break
    }

    const refreshAccounts = () => void queryClient.invalidateQueries({
        queryKey: ["integrationAccountsForWorkflow", workflow?.id, serviceDefinition?.id]
    })

    return (
        <div className={cn(
            "flex center gap-2",
            isLoading && "opacity-50",
            className,
        )}>
            {accounts.length === 0 ?
                <>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip
                            open={serviceDefinitionId === "https://services.workflow.dog/google/google-oauth" ? undefined : false}
                        >
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="pointer-events-auto flex center gap-2 shadow-sm"
                                    onClick={() => void onConnect?.()}
                                >
                                    {iconComponent}
                                    Connect {serviceDefinition?.name}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <div className="max-w-64">
                                    <GoogleConsentWarning withWrapper={false} />
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline" size="icon" onClick={refreshAccounts}
                                    className="pointer-events-auto"
                                >
                                    <TbRefresh />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    Refresh
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </> :
                <>
                    {iconComponent}

                    <Select
                        value={selectedAccount || ""}
                        onValueChange={setSelectedAccount}
                        {...props}
                    >
                        <SelectTrigger className="pointer-events-auto bg-white">
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(account =>
                                <SelectItem
                                    key={account.id} value={account.id}
                                >
                                    {account.display_name}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon" variant="outline"
                                className="pointer-events-auto shrink-0"
                            >
                                <TbDots />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                className="flex items-center gap-2"
                                onSelect={() => void onConnect?.()}
                            >
                                <TbPlugConnected />
                                Connect new {serviceDefinition?.name} account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2"
                                onSelect={refreshAccounts}
                            >
                                <TbRefresh />
                                Refresh accounts
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a
                                    href={`/projects/${workflow?.team_id}/settings#integrations`}
                                    target="_blank"
                                    className="flex between gap-2"
                                >
                                    <div className="flex between gap-2">
                                        <TbSettings />
                                        Manage Integrations
                                    </div>
                                    <TbExternalLink />
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2"
                                onSelect={() => void setSelectedAccount(null)}
                            >
                                <TbX />
                                Clear selection
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>}

            {connectionComponent}
        </div>
    )
}

