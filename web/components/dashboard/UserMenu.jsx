import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Skeleton } from "@nextui-org/react"
import { useUser } from "@web/modules/auth"
import { supabase } from "@web/modules/supabase"
import { TbLogout } from "react-icons/tb"


export default function UserMenu() {

    const { data: user } = useUser()

    const initial = (user?.userMetadata?.name || user?.email)?.[0] ?? "?"

    return user ?
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Avatar
                    src={user?.userMetadata.avatarUrl}
                    name={initial}
                    as="button"
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="User actions">
                <DropdownSection title="Account">
                    <DropdownItem
                        startContent={<TbLogout />}
                        key="new"
                        onClick={() => supabase.auth.signOut()}
                    >
                        Sign Out
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown> :
        <Skeleton className="w-10 aspect-square rounded-full" />
}