"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import { Button } from "@web/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select"
import { useDialogState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useAvailableIntegrationAccounts } from "@web/modules/integrations"
import { useIsNodeSelected, useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import { ServiceDefinitions } from "packages/client"
import { TbDots, TbExternalLink, TbPlugConnected, TbRefresh, TbSettings } from "react-icons/tb"
import APIKeyDialog from "./api-key-dialog"



export default function ServiceAccountSelector() {

    const queryClient = useQueryClient()
    const { data: workflow } = useWorkflow()

    const [requirement, accounts, { isLoading }] = useAvailableIntegrationAccounts()
    const service = ServiceDefinitions.get(requirement?.id!)

    const isSelected = useIsNodeSelected()
    const [selectedAccount, setSelectedAccount] = useNodeProperty(undefined, "data.serviceAccount")

    const iconComponent = service?.icon &&
        <service.icon className="text-lg w-[1em] h-[1em] shrink-0" />

    const keyDialog = useDialogState()

    let connectionComponent: JSX.Element | null = null
    let onConnect: (() => void) | null = null
    switch (service?.authAcquisition.method) {
        case "key":
            connectionComponent =
                <APIKeyDialog
                    serviceId={requirement?.id!}
                    {...keyDialog}
                />
            onConnect = keyDialog.open
            break
        case "oauth2":
            onConnect = () => {
                if (!workflow?.team_id)
                    return

                const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/oauth2/connect/${ServiceDefinitions.safeName(service.id)}`)

                url.searchParams.append("t", workflow.team_id)

                if (requirement?.scopes) {
                    const requestScopes = requirement.scopes
                        .map(scope => Array.isArray(scope) ? scope[0] : scope)
                        .join(",")
                    url.searchParams.append("scopes", requestScopes)
                }

                window.open(url.toString())
            }
            break
    }

    return (
        <div
            className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-4 max-w-full min-w-[20rem] pointer-events-none flex center",
                (!isSelected || isLoading) && "hidden",
            )}
        >
            {accounts.length === 0 ?
                <Button
                    variant="outline"
                    className="pointer-events-auto flex center gap-2 shadow-sm"
                    onClick={() => void onConnect?.()}
                >
                    {iconComponent}
                    Connect {service?.name}
                </Button> :
                <div className="flex center gap-2">
                    {iconComponent}

                    <Select
                        defaultValue={selectedAccount}
                        onValueChange={setSelectedAccount}
                    >
                        <SelectTrigger className="pointer-events-auto">
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
                                Connect new {service?.name} account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2"
                                onSelect={() => void queryClient.invalidateQueries({
                                    queryKey: ["integrationAccountsForWorkflow", workflow?.id, service?.id]
                                })}
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>}

            {connectionComponent}
        </div>
    )
}

