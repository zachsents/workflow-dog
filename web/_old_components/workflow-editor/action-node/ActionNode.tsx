import { Button, Card, CardHeader, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tooltip, useDisclosure } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@web/modules/form"
import { useNodeIntegrationAccount } from "@web/modules/integrations"
import { useNotifications } from "@web/modules/notifications"
import { supabase } from "@web/modules/supabase"
import { useDefinition, useNodeProperty, useNodePropertyValue, useUpdateInternalsWhenNecessary } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import classNames from "classnames"
import { resolve as resolveIntegration } from "integrations/web"
import { useMemo } from "react"
import { TbExternalLink, TbPlus } from "react-icons/tb"
import Group from "../../layout/Group"
import ActionNodeHandle from "./ActionNodeHandle"
import ActionNodeHeader from "./ActionNodeHeader"
import { ConfigComponent } from "./ActionNodeModal"
import ActionNodeShell from "./ActionNodeShell"
import NodeModifierWrapper from "./NodeModifierWrapper"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()

    useUpdateInternalsWhenNecessary()

    if (!definition)
        return <div className="p-4 rounded-lg bg-white shadow-md">Uh-oh</div>

    return (
        <ActionNodeShell>
            <NodeModifierWrapper>
                {definition.renderNode ?
                    <div className="flex flex-row items-stretch">
                        <InputsRenderer />

                        <div className="grow">
                            <definition.renderNode id={id} />
                        </div>

                        <OutputsRenderer />
                    </div> :
                    <Card
                        className={classNames("!transition rounded-md overflow-visible max-w-[28rem] p-1 border border-gray-700",
                            selected ? "shadow-xl" : "shadow-md",
                        )}
                    >
                        <CardHeader className="p-0 rounded-md overflow-clip border border-gray-700">
                            <ActionNodeHeader withSettings />
                        </CardHeader>
                        <div className="flex justify-between items-center flex-nowrap py-unit-xs">
                            <InputsRenderer />

                            <div className="grow px-2">
                                {definition.renderBody &&
                                    <definition.renderBody id={id} />}
                            </div>

                            <OutputsRenderer />
                        </div>
                    </Card>}
            </NodeModifierWrapper>

            {definition.requiredIntegration &&
                <div className={classNames(
                    "transition-opacity",
                    (data.integrationAccount && !selected) ? "opacity-0 pointer-events-none" : "opacity-100",
                )}>
                    <RequiredIntegration />
                </div>}
        </ActionNodeShell>
    )
}


function RequiredIntegration() {

    const { data: workflow } = useWorkflow()

    const definition = useDefinition()
    const { available, isPending } = useNodeIntegrationAccount()

    const integration = resolveIntegration(definition.requiredIntegration.service)
    const isOAuth2 = integration.authType === "oauth2"
    const isAPIKey = integration.authType === "apikey"

    const Icon = ({ className }) => <integration.icon className={classNames("h-auto aspect-square", className)} />

    const [selectedAccount, setSelectedAccount] = useNodeProperty(undefined, "data.integrationAccount")
    const selectedKeys = useMemo(() => new Set(selectedAccount ? [selectedAccount] : []), [selectedAccount])
    const onSelectionChange = keys => setSelectedAccount(keys.values().next().value)

    const connectUrl = useMemo(() => {
        if (!isOAuth2)
            return

        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/oauth2/connect/${definition.requiredIntegration.service}`)
        url.searchParams.append("t", workflow?.teamId)

        if (definition.requiredIntegration.scopes) {
            const requestScopes = definition.requiredIntegration.scopes
                .map(scope => Array.isArray(scope) ? scope[0] : scope)
                .join(",")
            url.searchParams.append("scopes", requestScopes)
        }

        return url.toString()
    }, [definition.requiredIntegration.service, workflow?.teamId, definition.requiredIntegration.scopes])

    const apiKeyModal = useDisclosure()

    return (<>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-unit-xs max-w-full w-[16rem]">
            {available?.length === 0 ?
                <Button
                    {...isOAuth2 && {
                        as: "a", href: connectUrl, target: "_blank",
                        endContent: <TbExternalLink />,
                    }}
                    {...isAPIKey && {
                        onPress: () => apiKeyModal.onOpen(),
                    }}
                    fullWidth color="primary"
                    className="rounded-full text-[0.625rem] min-h-0 h-auto py-1"
                >
                    Connect {integration.name}
                </Button> :
                <Group className="gap-1">
                    <Select
                        size="sm" variant="bordered"
                        aria-label="Select an account to use for this action"
                        selectedKeys={selectedKeys}
                        onSelectionChange={onSelectionChange}
                        isLoading={isPending}
                        items={available ?? []}
                        placeholder={`Select a ${integration.name} account`}
                        spinnerProps={{ size: "sm", color: "primary" }}
                        classNames={{
                            trigger: classNames(
                                "rounded-full bg-white min-h-0 h-auto px-1 py-0.5 border shadow-sm",
                                selectedAccount ? "!border-default-300" : "!border-danger-500",
                            ),
                            value: classNames(
                                "text-[0.5rem]",
                                selectedAccount ? "text-default-900" : "text-danger-500",
                            ),
                            popoverContent: "min-w-[20rem]"
                        }}
                        renderValue={items => items.map(item =>
                            <Group className="gap-unit-xs" key={`selected` + item.key}>
                                <div className="shrink-0">
                                    <Icon className="w-3" />
                                </div>
                                <span>{item.data.displayName}</span>
                            </Group>
                        )}
                    >
                        {item => {
                            const hasRequiredScopes = definition.requiredIntegration.scopes?.every(
                                scope => Array.isArray(scope) ?
                                    scope.some(s => item.scopes?.includes(s)) :
                                    item.scopes?.includes(scope)
                            ) ?? true

                            return <SelectItem
                                startContent={<Icon className="w-6" />}
                                {...!hasRequiredScopes && {
                                    endContent: <TbExternalLink className="text-danger-500" />,
                                    as: "a",
                                    href: connectUrl,
                                    target: "_blank",
                                }}
                                aria-label={item.displayName}
                                key={item.id}
                            >
                                <p>
                                    {item.displayName}
                                </p>
                                {!hasRequiredScopes &&
                                    <p className="text-default-500">
                                        Needs additional permissions
                                    </p>}
                            </SelectItem>
                        }}
                    </Select>

                    <Tooltip content="Add Account">
                        <Button
                            isIconOnly color="primary" variant="flat"
                            className="rounded-full min-h-0 h-auto min-w-0 w-auto p-1 shrink-0"
                            {...isOAuth2 && {
                                as: "a", href: connectUrl, target: "_blank",
                            }}
                            {...isAPIKey && {
                                onPress: () => apiKeyModal.onOpen(),
                            }}
                        >
                            <TbPlus />
                        </Button>
                    </Tooltip>
                </Group>}
        </div>

        {isAPIKey &&
            <APIKeyModal
                {...apiKeyModal}
            />}
    </>)
}


function InputsRenderer() {

    const definition = useDefinition()
    const data = useNodePropertyValue(undefined, "data")

    const inputGroups = useMemo(
        () => Object.entries(definition?.inputs ?? {})
            .map(([inputDefId, inputDef]) => [
                inputDef.group ? inputDef.name : undefined,
                data.inputs.filter(input => input.definition == inputDefId && !input.hidden && input.mode === "handle"),
            ])
            .filter(([, inputs]) => inputs.length > 0),
        [data.inputs]
    )

    return (
        <Group className="flex-col justify-center !items-start gap-2">
            {inputGroups.map(([groupName, inputs], i) =>
                <div className="px-2" key={groupName || i}>
                    {groupName &&
                        <p className="text-[0.625rem] text-default-500">
                            {groupName}
                        </p>}

                    <div className="flex flex-col items-start gap-1 -ml-5">
                        {inputs.map(input =>
                            <ActionNodeHandle {...input} type="target" key={input.id} />
                        )}
                    </div>
                </div>
            )}
        </Group>
    )
}


function OutputsRenderer() {

    const definition = useDefinition()
    const data = useNodePropertyValue(undefined, "data")

    const outputGroups = useMemo(
        () => Object.entries(definition?.outputs ?? {})
            .map(([outputDefId, outputDef]) => [
                outputDef.group ? outputDef.name : undefined,
                data.outputs.filter(output => output.definition == outputDefId && !output.hidden),
            ])
            .filter(([, outputs]) => outputs.length > 0),
        [data.outputs]
    )

    return (
        <Group className="flex-col justify-center !items-end gap-2">
            {outputGroups.map(([groupName, outputs], i) =>
                <div className="px-2" key={groupName || i}>
                    {groupName &&
                        <p className="text-[0.625rem] text-default-500">
                            {groupName}
                        </p>}

                    <div className="flex flex-col items-end gap-1 -mr-5">
                        {outputs.map(output =>
                            <ActionNodeHandle {...output} type="source" key={output.id} />
                        )}
                    </div>
                </div>
            )}
        </Group>
    )
}


function APIKeyModal({ isOpen, onClose }) {

    const queryClient = useQueryClient()
    const { notify } = useNotifications()

    const definition = useDefinition()
    const integration = resolveIntegration(definition.requiredIntegration.service)
    const serviceName = definition.requiredIntegration.service

    const { data: workflow } = useWorkflow()

    const form = useForm({
        initial: {
            apikey: "",
        },
    })

    const addApiKey = useMutation({
        mutationFn: async values => fetch(`${process.env.NEXT_PUBLIC_API_URL}/apikeys/connect/${serviceName}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${await supabase.auth.getSession().then(session => session.data.session.access_token)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apiKey: values.apikey,
                teamId: workflow?.teamId,
            }),
        }).then(res => {
            if (!res.ok) throw new Error("Failed to connect account")
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["integrationAccountsForWorkflow", workflow.id, serviceName],
            })
            onClose()
            notify({
                title: null,
                message: "Account connected!",
            })
        },
        onError: () => {
            notify({
                title: null,
                message: "Failed to connect account",
                classNames: { icon: "!bg-danger" },
            })
        },
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>
                    Connect {integration.name}
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={form.submit(addApiKey.mutate)} className="flex flex-col gap-unit-sm">
                        <Input
                            label="API Key"
                            {...form.inputProps("apikey", { required: true })}
                            autoFocus
                        />

                        {integration.generateApiKeyUrl &&
                            <p className="text-sm text-default-500">
                                You can create an API key <Link href={integration.generateApiKeyUrl} target="_blank" className="text-sm">here</Link>.
                            </p>}

                        <Button type="submit" color="primary" isLoading={addApiKey.isPending}>
                            Connect
                        </Button>
                    </form>
                </ModalBody>
                <ModalFooter>

                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}