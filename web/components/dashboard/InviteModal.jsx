import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import Group from "@web/components/layout/Group"
import { supabase } from "@web/modules/supabase"
import { useInviteToTeam } from "@web/modules/teams"
import { useDebouncedState } from "@web/modules/util"
import { TbCheck, TbX } from "react-icons/tb"



export default function InviteModal(props) {

    const [inviteeEmail, debouncedEmail, setInviteeEmail, isChanging] = useDebouncedState("", {
        debounce: 500,
    })

    const isValid = inviteeEmail && inviteeEmail.includes("@") && inviteeEmail.includes(".")

    const { data: doesUserExist, isPending } = useQuery({
        queryFn: async () => {
            if (!debouncedEmail)
                return false

            const { data } = await supabase.rpc("does_user_exist", { _email: debouncedEmail })
            return data
        },
        queryKey: ["userExists", debouncedEmail],
    })

    const isLoading = isPending || isChanging

    const inviteMutation = useInviteToTeam(undefined, inviteeEmail, isValid)

    return (
        <Modal {...props} onClose={() => setInviteeEmail("", true)}>
            <ModalContent>
                {onClose => <>
                    <ModalHeader>
                        Invite member to team
                    </ModalHeader>
                    <ModalBody
                        className="flex flex-col gap-unit-sm"
                        as="form" id="team-invite-form" onSubmit={ev => {
                            ev.preventDefault()
                            inviteMutation.mutateAsync().then(onClose)
                        }}
                    >
                        <Input
                            name="inviteeEmail"
                            label="Email" type="email"
                            value={inviteeEmail}
                            onValueChange={value => setInviteeEmail(value)}
                            autoFocus
                        />
                        {isValid &&
                            <Group className="gap-unit-sm text-small text-default-500">
                                {isLoading ?
                                    <Spinner size="sm" /> :
                                    doesUserExist ?
                                        <TbCheck className="text-success text-xl" /> :
                                        <TbX className="text-danger text-xl" />}
                                <p>
                                    {isLoading ?
                                        "Looking up user..." :
                                        doesUserExist ?
                                            "User will be invited to your team." :
                                            "User doesn't have an account. Ask them to sign up first."}
                                </p>
                            </Group>}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            isDisabled={isLoading || !isValid || !doesUserExist}
                            isLoading={inviteMutation.isPending}
                            type="submit" form="team-invite-form"
                        >
                            Invite
                        </Button>
                    </ModalFooter>
                </>}
            </ModalContent>
        </Modal>
    )
}