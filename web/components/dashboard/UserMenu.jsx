import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Skeleton } from "@nextui-org/react"
import { signOut } from "@web/modules/firebase"
import { useUser } from "@zachsents/fire-query"
import { TbLogout } from "react-icons/tb"


export default function UserMenu() {

    const { data: user } = useUser()

    const initial = (user?.displayName || user?.emai)?.[0] ?? "?"

    return user ?
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Avatar
                    src={user?.photoURL}
                    name={initial}
                    as="button"
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="User actions">
                <DropdownSection title="Account">
                    <DropdownItem
                        startContent={<TbLogout />}
                        key="new"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown> :
        <Skeleton className="w-10 aspect-square rounded-full" />
}