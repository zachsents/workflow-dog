import { ActionIcon, Anchor, Avatar, Group, Menu, Text } from "@mantine/core"
import Brand from "@web/components/Brand"
import { useUser } from "@zachsents/fire-query"
import classNames from "classnames"
import Link from "next/link"
import { TbX } from "react-icons/tb"


export default function Header({ fixed = true, className }) {

    const { data: user, signOut } = useUser()

    return (
        <header className={classNames(
            "bg-white",
            fixed ? "fixed top-0 left-0 w-screen z-50" : "w-full",
            className
        )}>
            <Group className="max-w-7xl mx-auto w-full justify-between gap-xl p-md">
                <Group className="gap-10">
                    <Brand src="/assets/logo.png" includeText />
                </Group>

                <Group>
                    {user ? <>
                        <Anchor component={Link} href="/sites">My Sites</Anchor>

                        <Menu shadow="xl" withArrow position="bottom-end" classNames={{
                            itemLabel: "text-center"
                        }}>
                            <Menu.Target>
                                <Avatar
                                    src={user?.photoURL}
                                    radius="xl"
                                    className="cursor-pointer ml-md"
                                />
                            </Menu.Target>

                            <Menu.Dropdown className="min-w-[10rem]">
                                <Menu.Item onClick={() => signOut()}>
                                    Sign Out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </> : <>
                        <Anchor component={Link} href="/login">Log In</Anchor>
                        <Anchor component={Link} href="/login">Sign Up</Anchor>
                    </>}
                </Group>
            </Group>
        </header>
    )
}
