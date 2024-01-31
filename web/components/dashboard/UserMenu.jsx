import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Skeleton } from "@nextui-org/react"
import { useUser } from "@web/modules/auth"
import { supabase } from "@web/modules/supabase"
import { TbLogout } from "react-icons/tb"
import UserAvatar from "../UserAvatar"


export default function UserMenu() {

    const { data: user } = useUser()

    return user ?
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <UserAvatar
                    name={user?.userMetadata.name}
                    email={user?.email}
                    photoUrl={user?.userMetadata.avatarUrl}
                    as="button"
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="User actions">
                <DropdownSection title="Account">
                    <DropdownItem
                        startContent={<TbLogout />}
                        key="sign-out"
                        onClick={() => supabase.auth.signOut()}
                    >
                        Sign Out
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown> :
        <Skeleton className="w-10 aspect-square rounded-full" />
}