import { Button, Card, CardBody, Code, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Skeleton, useDisclosure } from "@nextui-org/react"
import Group from "@web/components/layout/Group"
import { resolveTailwindColor } from "@web/modules/colors"
import { useDatabaseMutation } from "@web/modules/db"
import { INTEGRATION_INFO, useIntegrationAccount } from "@web/modules/integrations"
import { useQueryParam } from "@web/modules/router"
import { useTeamRoles } from "@web/modules/teams"
import { TbDots } from "react-icons/tb"


export default function IntegrationCard({ id }) {

    const [teamId] = useQueryParam("team")
    const { data: account } = useIntegrationAccount(id)
    const { displayId, type } = account || {}

    const info = INTEGRATION_INFO[type]

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const disconnectIntegration = useDatabaseMutation(
        supa => supa
            .from("integration_accounts_teams")
            .delete()
            .eq("integration_account_id", id)
            .eq("team_id", teamId),
        { invalidateKey: ["integrationAccountsForTeam", teamId] }
    )

    const { data: roleData } = useTeamRoles()

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

                        {/* <p className="text-xs text-default-500">
                            {{
                                [INTEGRATION_AUTH_TYPE.OAUTH2]: "OAuth2",
                                [INTEGRATION_AUTH_TYPE.API_KEY]: "API Key",
                                [INTEGRATION_AUTH_TYPE.USER_PASS]: "Username/Password"
                            }[info.authType]}
                        </p> */}
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
                                        onClick={() => disconnectIntegration.mutate()}
                                        isLoading={disconnectIntegration.isPending || disconnectIntegration.isSuccess}
                                        isDisabled={!roleData?.isEditor}
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