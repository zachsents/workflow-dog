import { Card } from "@ui/card"
import { Button } from "@web/components/ui/button"
import { Separator } from "@web/components/ui/separator"
import { countProjectMembers, getProjectBilling } from "@web/lib/server/internal"
import Link from "next/link"
import { IconType } from "react-icons"
import { TbPuzzle, TbSettings, TbStar, TbUsers } from "react-icons/tb"
import DeleteProject from "./_components/delete-project"
import GeneralSettingsForm from "./_components/general-form"
import InviteMember from "./_components/invite-member"
import MembersTable from "./_components/members-table"


export default async function SettingsPage({ params: { projectId } }) {

    const billingInfo = await getProjectBilling(projectId)
    const memberCount = await countProjectMembers(projectId)
    const hasReachedMemberLimit = memberCount >= billingInfo.limits.teamMembers

    return (<>
        <div className="flex justify-between gap-10">
            <h1 className="text-2xl font-bold">
                Settings
            </h1>
        </div>

        <SettingsSection title="General" icon={TbSettings}>
            <GeneralSettingsForm projectId={projectId} />

            <Separator />

            <div className="flex-v items-start gap-4">
                <p className="font-bold">
                    Danger Zone
                </p>
                <DeleteProject projectId={projectId} />
            </div>
        </SettingsSection>

        <SettingsSection
            title="Team" icon={TbUsers}
            rightSection={hasReachedMemberLimit
                ? <Button asChild>
                    <Link
                        href={`/projects/${projectId}/billing/upgrade`}
                        className="flex center gap-2"
                    >
                        <TbStar />
                        Upgrade to invite more members
                    </Link>
                </Button>
                : <InviteMember projectId={projectId} />}
        >
            <MembersTable projectId={projectId} />
        </SettingsSection>

        <SettingsSection title="Integrations" icon={TbPuzzle}>
            Integrations
        </SettingsSection>
    </>)
}


interface SettingsSectionProps {
    title: string
    children: any
    rightSection?: any
    icon: IconType
}

function SettingsSection({ children, title, icon: Icon, rightSection }: SettingsSectionProps) {
    return (
        <Card
            id={title.toLowerCase().replaceAll(" ", "-")}
            className="flex-v items-stretch gap-4 p-6 mb-6 shadow-md has-[:focus]:shadow-lg transition-shadow"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <Icon className="text-muted-foreground" />
                    <h2>{title}</h2>
                </div>
                {rightSection}
            </div>
            {children}
        </Card>
    )
}