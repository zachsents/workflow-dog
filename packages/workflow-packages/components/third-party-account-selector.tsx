import { IconCheck, IconChevronDown, IconPlus, IconRefresh } from "@tabler/icons-react"
import type { ApiRouterInput } from "api/trpc/router"
import { useEffect } from "react"
import { toast } from "sonner"
import SimpleTooltip from "web/src/components/simple-tooltip"
import TI from "web/src/components/tabler-icon"
import { Button } from "web/src/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "web/src/components/ui/dropdown-menu"
import { useCurrentWorkflow } from "web/src/lib/hooks"
import { trpc } from "web/src/lib/trpc"
import { ClientThirdPartyProviders } from "../client"
import { cn } from "web/src/lib/utils"
import { useMutation } from "@tanstack/react-query"


export default function ThirdPartyAccountSelector({
    providerId,
    value,
    onChange,
    requestScopes = [],
    requiredScopes = [],
}: {
    providerId: string
    value: string | null
    onChange: (value: string | null) => void
    requestScopes?: string[]
    /**
     * The outer array is ANDed, the inner array is ORed.
     */
    requiredScopes?: (string | string[])[]
}) {
    const provider = ClientThirdPartyProviders[providerId]
    const isOAuth2 = provider.authType === "oauth2"

    const projectId = useCurrentWorkflow().data!.project_id

    const utils = trpc.useUtils()
    const trpcArgs: ApiRouterInput["thirdParty"]["list"] = {
        projectId,
        providerId,
    }
    const { data: accounts, isLoading } = trpc.thirdParty.list.useQuery(trpcArgs)
    const refreshMutation = useMutation({
        mutationFn: () => utils.thirdParty.list.invalidate(trpcArgs),
    })
    const selectedAccount = accounts?.find(a => a.id === value)

    useEffect(() => {
        if (value && accounts && !accounts.some(a => a.id === value))
            return void onChange(null)
        if (selectedAccount && !hasScopes(selectedAccount.scopes, requiredScopes))
            return void onChange(null)
    }, [accounts, value])

    const genAuthLinkMutation = trpc.thirdParty.getOAuth2AuthorizationUrl.useMutation()
    const openAuthLink = (params?: Partial<ApiRouterInput["thirdParty"]["getOAuth2AuthorizationUrl"]>) => {
        const linkPromise = genAuthLinkMutation.mutateAsync({
            providerId,
            projectId,
            scopes: requestScopes,
            ...params,
        }).then(r => window.open(r.url, "_blank"))

        toast.promise(linkPromise, {
            loading: "Taking you to " + provider.name + "...",
        })
    }

    return (
        <div className="flex-center gap-2 no-shrink-children">
            <TI style={{
                color: provider.color,
            }}><provider.icon /></TI>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="gap-2  no-shrink-children w-[280px]" variant="outline"
                        disabled={isLoading}
                    >
                        <p className="min-w-0 flex-1 truncate">
                            {value
                                ? (selectedAccount?.display_name ?? "...")
                                : <span className="text-muted-foreground">
                                    Select {provider.name} account
                                </span>}
                        </p>
                        <TI><IconChevronDown /></TI>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        className="font-bold flex items-center gap-2"
                        style={{ color: provider.color }}
                        onSelect={isOAuth2 ? () => openAuthLink() : undefined}
                    >
                        <TI><IconPlus /></TI>
                        Connect new {provider.name} Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {accounts?.map(account => {
                        const hasAllScopes = hasScopes(account.scopes, requiredScopes)
                        return (
                            <DropdownMenuItem
                                key={account.id}
                                className="block"
                                onSelect={hasAllScopes
                                    ? () => onChange(account.id)
                                    : isOAuth2
                                        ? () => openAuthLink({
                                            additionalParams: account.email ? {
                                                login_hint: account.email,
                                            } : undefined,
                                        })
                                        : undefined
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <TI className={cn(
                                        value === account.id ? "opacity-100" : "opacity-0",
                                    )}><IconCheck /></TI>
                                    {account.display_name}
                                </div>

                                {!hasAllScopes
                                    ? isOAuth2
                                        ? <p className="text-xs text-muted-foreground">
                                            Click to approve extra permissions
                                        </p>
                                        : <p>
                                            Doesn't have required permissions
                                        </p>
                                    : null}
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
            <SimpleTooltip tooltip="Refresh list">
                <Button
                    className="shrink-0" variant="ghost" size="icon"
                    onClick={() => refreshMutation.mutate()}
                >
                    <TI className={cn(
                        "text-muted-foreground",
                        refreshMutation.isPending && "animate-spin",
                    )}><IconRefresh /></TI>
                </Button>
            </SimpleTooltip>
        </div >
    )
}


function hasScopes(scopes: string[], required: (string | string[])[]) {
    return required.every(required => Array.isArray(required)
        ? required.some(r => scopes.includes(r))
        : scopes.includes(required)
    )
}