import { Button, Card, CardBody, Code, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Skeleton, useDisclosure } from "@nextui-org/react"
import AddIntegrationButton from "@web/components/dashboard/AddIntegrationButton"
import DashboardLayout from "@web/components/dashboard/DashboardLayout"
import Group from "@web/components/layout/Group"
import { resolveTailwindColor } from "@web/modules/colors"
import { fire } from "@web/modules/firebase"
import { plural } from "@web/modules/grammar"
import { INTEGRATION_INFO } from "@web/modules/integrations"
import { useQueryParam } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import { useCollectionQuery, useDocument } from "@zachsents/fire-query"
import { arrayRemove, doc, where } from "firebase/firestore"
import { TbDots } from "react-icons/tb"
import { INTEGRATION_ACCOUNTS_COLLECTION, TEAMS_COLLECTION } from "shared/firebase"


export default function IntegrationsPage() {

    const [teamId] = useQueryParam("team")

    const integrationsQuery = useCollectionQuery([INTEGRATION_ACCOUNTS_COLLECTION], [
        teamId && where("teams", "array-contains", doc(fire.db, TEAMS_COLLECTION, teamId)),
    ])

    const [filteredAccounts, query, setQuery] = useSearch(integrationsQuery?.data ?? [], {
        selector: account => `${account.displayId} ${INTEGRATION_INFO[account.type].name}`,
        highlight: false,
    })

    return (
        <DashboardLayout
            title="Integrations"
            rightContent={<AddIntegrationButton />}
        >
            <div className="flex flex-col gap-unit-xl">
                <Input
                    type="text"
                    label={`Search ${integrationsQuery.data?.length || 0} ${plural("integration account", integrationsQuery.data?.length || 0)}`}
                    value={query} onValueChange={setQuery}
                />
                {integrationsQuery.isLoading ?
                    <IntegrationsSkeleton /> :
                    filteredAccounts?.length > 0 ?
                        <div className="grid grid-cols-2 gap-unit-xl">
                            {filteredAccounts.map(account =>
                                <IntegrationCard
                                    id={account.id}
                                    key={account.id}
                                />
                            )}
                        </div> :
                        <p className="text-default-500 text-center">
                            No workflows found
                        </p>}
            </div>
        </DashboardLayout>
    )
}


function IntegrationCard({ id }) {

    const [teamId] = useQueryParam("team")
    const { data: account, update } = useDocument([INTEGRATION_ACCOUNTS_COLLECTION, id])
    const { displayId, type } = account || {}

    const info = INTEGRATION_INFO[type]

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const disconnectIntegration = () => update.mutate({
        teams: arrayRemove(doc(fire.db, TEAMS_COLLECTION, teamId))
    })

    return info ? <>
        <Card>
            <CardBody className="px-8 flex flex-row justify-between gap-10 items-center">
                <Group className="gap-unit-md text-small">
                    <info.icon className="text-2xl" style={{
                        color: resolveTailwindColor(info.color, info.shade)
                    }} />
                    <div>
                        <p className="text-default-500">
                            {info.name}
                        </p>
                        <p className="font-medium">
                            {displayId}
                        </p>
                    </div>
                </Group>

                <Button
                    variant="light" isIconOnly
                    onClick={onOpen}
                >
                    <TbDots />
                </Button>
            </CardBody>
        </Card>

        <Modal
            isOpen={isOpen} onOpenChange={onOpenChange}
            size="2xl"
        >
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>
                            <Group className="gap-unit-md text-medium">
                                <info.icon className="text-2xl" style={{
                                    color: resolveTailwindColor(info.color, info.shade)
                                }} />
                                <div>
                                    <p className="text-default-500 font-normal">
                                        {info.name}
                                    </p>
                                    <p className="font-medium">
                                        {displayId}
                                    </p>
                                </div>
                            </Group>
                        </ModalHeader>
                        <ModalBody className="flex flex-col gap-unit-md">
                            <div>
                                <p className="font-bold text-small mb-2">
                                    Actions
                                </p>
                                <Group>
                                    <Button
                                        variant="bordered" color="danger" size="sm"
                                        onClick={disconnectIntegration}
                                    >
                                        Disconnect Account
                                    </Button>
                                </Group>
                            </div>
                            <Divider />
                            <ScrollShadow className="w-full h-[10rem]">
                                <p className="font-bold text-small mb-2">
                                    Approved Permissions:
                                </p>
                                <div className="grid grid-cols-2 gap-unit-xs">
                                    {["read", "write"].map(scope =>
                                        <Code key={scope}>
                                            {scope}
                                        </Code>
                                    )}
                                </div>
                            </ScrollShadow>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </> :
        <Skeleton className="h-20 rounded-xl" />
}


function IntegrationsSkeleton() {
    return (
        <div className="flex flex-col gap-unit-md">
            <Skeleton className="w-full h-20 rounded-xl" />
            <Skeleton className="w-full h-20 rounded-xl" />
            <Skeleton className="w-full h-20 rounded-xl" />
        </div>
    )
}
