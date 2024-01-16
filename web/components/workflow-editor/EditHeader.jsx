import { AvatarGroup, Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Input, Kbd, Spinner } from "@nextui-org/react"
import { useIntervalEffect } from "@react-hookz/web"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "@web/modules/auth"
import { useDatabaseMutation } from "@web/modules/db"
import { supabase } from "@web/modules/supabase"
import { deepCamelCase, useSyncToState } from "@web/modules/util"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { useWorkflow } from "@web/modules/workflows"
import Link from "next/link"
import { useRef, useState } from "react"
import { TbArrowLeft, TbCheck, TbExternalLink, TbGridPattern, TbHeart, TbMap, TbMenu2, TbPencil } from "react-icons/tb"
import WorkflowStatusChip from "../WorkflowStatusChip"
import Group from "../layout/Group"
import UserAvatar from "../UserAvatar"
import { useEffect } from "react"


export default function EditHeader() {

    const { data: workflow } = useWorkflow()

    const [tempName, setTempName] = useState(workflow?.name ?? "")
    useSyncToState(workflow?.name, setTempName)

    const nameInputRef = useRef()
    const [nameInputWidth, setNameInputWidth] = useState(0)

    const updateName = useDatabaseMutation(
        (supa) => supa.from("workflows").update({ name: tempName }).eq("id", workflow?.id),
        {
            enabled: !!workflow,
            invalidateKey: ["workflow", workflow?.id],
        }
    )

    return (
        <Group className="bg-gray-800 dark justify-between flex-nowrap px-unit-sm py-unit-xs">
            <Group className="flex-1">
                <HeaderMenu />
            </Group>

            <div className="flex justify-center relative" style={{ width: nameInputWidth + 65 }}>
                <Input
                    value={tempName} onValueChange={setTempName}
                    size="sm" classNames={{
                        inputWrapper: "bg-transparent min-h-0 h-8 group-hover:!bg-white/10 group-data-[focus=true]:!bg-white/75",
                        input: "group-data-[focus=true]:!text-default-100",
                    }}
                    endContent={updateName.isPending ?
                        <Spinner size="sm" /> : <>
                            <TbPencil className="hidden text-default-900 group-hover:block group-data-[focus=true]:hidden" />
                            <Kbd keys={["enter"]} className="hidden group-data-[focus=true]:block light" />
                        </>}
                    onFocus={ev => ev.currentTarget.select()}
                    onKeyDown={async ev => {
                        if (ev.key === "Enter") {
                            ev.preventDefault()
                            await updateName.mutateAsync()
                            nameInputRef.current?.blur()
                        }
                    }}
                    ref={nameInputRef}
                />
                <p
                    className="absolute pointer-events-none opacity-0 text-sm"
                    ref={el => el && setNameInputWidth(el.offsetWidth)}
                >
                    {tempName}
                </p>
            </div>

            <div className="flex-1 flex justify-end">
                <Group className="gap-unit-xl">
                    <WorkflowStatusChip />

                    <UsersOnline />

                    <Button
                        as="a" href="https://google.com" target="_blank"
                        size="sm"
                        className="group hover:scale-105 transition-transform text-black"
                        startContent={<TbHeart className="group-hover:scale-150 group-hover:fill-red-500 transition" />}
                        endContent={<TbExternalLink />}
                    >
                        Leave Feedback
                    </Button>
                </Group>
            </div>
        </Group>
    )
}


function HeaderMenu() {

    const { data: workflow } = useWorkflow()

    const [settings, setSetting] = useEditorSettings()


    return (
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                <Button variant="light" isIconOnly>
                    <TbMenu2 />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                onAction={settingKey => {
                    if (!(settingKey in settings))
                        return

                    setSetting(settingKey, !settings[settingKey])
                }}
            >
                <DropdownItem
                    startContent={<TbArrowLeft />}
                    key="back-to-workflows"
                    as={Link} href={`/workflows?team=${workflow?.teamId}`}
                >
                    Back to Workflows
                </DropdownItem>
                <DropdownSection title="Editor Settings">
                    <DropdownItem
                        startContent={<TbGridPattern />}
                        endContent={settings.showGrid ? <TbCheck /> : null}
                        key="showGrid"
                    >
                        Show Grid
                    </DropdownItem>
                    <DropdownItem
                        startContent={<TbMap />}
                        endContent={settings.showMinimap ? <TbCheck /> : null}
                        key="showMinimap"
                    >
                        Show Minimap
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    )
}


function UsersOnline() {

    const { data: user } = useUser()
    const { data: workflow } = useWorkflow()

    const updateLastOnline = useDatabaseMutation(
        supa => supa.from("users_workflows_last_online")
            .upsert({
                user_id: user?.id,
                workflow_id: workflow?.id,
                last_online: new Date().toISOString(),
            })
            .eq("user_id", user?.id)
            .eq("workflow_id", workflow?.id),
        {
            enabled: !!workflow && !!user,
            invalidateKey: ["users-workflows-last-online", workflow?.id],
        }
    )

    const { data: onlineUsers } = useQuery({
        queryFn: async () => {
            const { data } = await supabase.from("users_workflows_last_online")
                .select("users (id, name, email, photo_url)")
                .eq("workflow_id", workflow?.id)
                .gt("last_online", new Date(Date.now() - 60 * 1000).toISOString())

            return deepCamelCase(data.map(item => item.users))
        },
        queryKey: ["users-workflows-last-online", workflow?.id],
        enabled: !!workflow,
    })

    useEffect(() => {
        updateLastOnline.mutate()
    }, [])

    useIntervalEffect(() => {
        updateLastOnline.mutate()
    }, 60 * 1000)

    return (
        <AvatarGroup>
            {onlineUsers?.map(user =>
                <UserAvatar
                    name={user.name}
                    email={user.email}
                    photoUrl={user.photoUrl}
                    key={user.id}
                />
            )}
        </AvatarGroup>
    )
}