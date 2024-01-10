import { Chip, Tab, Tabs, Tooltip } from "@nextui-org/react"
import { useQueryParam } from "@web/modules/router"
import Link from "next/link"
import { useRouter } from "next/router"
import { TbBorderOuter, TbBrandStackshare, TbDatabase, TbPuzzle } from "react-icons/tb"
import Logo from "../Logo"
import Group from "../layout/Group"
import TeamSelector from "./TeamSelector"
import UserMenu from "./UserMenu"
import { useMustBeSignedIn } from "@web/modules/auth"


export default function DashboardLayout({ children, title, rightContent }) {

    const router = useRouter()

    const [selectedTeam] = useQueryParam("team")

    useMustBeSignedIn()

    return (
        <div className="w-screen h-full min-h-screen flex flex-col items-stretch grid-bg">
            <header className="p-10 flex flex-row justify-between gap-20">
                <Group className="gap-10">
                    <Link href="/">
                        <Logo className="max-h-10 hover:scale-110 transition-transform" />
                    </Link>

                    <Tabs
                        selectedKey={router.pathname}
                        size="lg" variant="light"
                    >
                        <Tab
                            key="/workflows"
                            title={<TabLabel
                                icon={<TbBrandStackshare />}
                                description="Workflows are groups of business logic triggered by an event, like receiving an email or editing a Google Doc."
                            >
                                Workflows
                            </TabLabel>}
                            as={Link} href={`/workflows?team=${selectedTeam}`} shallow
                        />
                        <Tab
                            key="/stores"
                            title={<TabLabel
                                comingSoon
                                icon={<TbDatabase />}
                                description="Stores are simple ways to store data between Workflow runs with key-value pairs."
                            >
                                Stores
                            </TabLabel>}
                        />
                        <Tab
                            key="/snippets"
                            title={<TabLabel
                                comingSoon
                                icon={<TbBorderOuter />}
                                description="Snippets are reusable pieces of logic that can be used in multiple Workflows."
                            >
                                Snippets
                            </TabLabel>}
                        />
                        <Tab
                            key="/integrations"
                            title={<TabLabel icon={<TbPuzzle />}>Integrations</TabLabel>}
                            as={Link} href={`/integrations?team=${selectedTeam}`} shallow
                        />
                    </Tabs>
                </Group>

                <Group className="gap-unit-md">
                    <TeamSelector includeSettingsLink />
                    <UserMenu />
                </Group>
            </header>

            <div className="max-w-5xl w-full self-center px-10 pb-20">
                <Group className="justify-between gap-10">
                    <h1 className="text-4xl font-bold mb-10">
                        {title}
                    </h1>

                    {rightContent}
                </Group>

                {children}
            </div>
        </div>
    )
}


function TabLabel({ children, icon, description, comingSoon = false }) {
    return (
        <Tooltip
            content={<div>
                {comingSoon &&
                    <Chip size="sm" className="my-1" color="primary" variant="flat">
                        Coming Soon
                    </Chip>}
                <p>{description}</p>
            </div>}
            placement="bottom"
            delay={comingSoon ? 0 : 1000}
            closeDelay={0}
            offset={12}
            className="max-w-80 text-default-500"
            isDisabled={!description}
        >
            <div className="flex flex-row items-center gap-2">
                {icon}
                <span>{children}</span>

            </div>
        </Tooltip>
    )
}
