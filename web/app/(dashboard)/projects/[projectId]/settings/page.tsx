import { Card } from "@ui/card"
import { supabaseServer } from "@web/lib/server/supabase"
import { IconType } from "react-icons"
import { TbPuzzle, TbSettings, TbUsers } from "react-icons/tb"
import GeneralSettingsForm from "./_components/general-form"
import InviteMember from "./_components/invite-member"
import MembersTable from "./_components/members-table"
import DeleteProject from "./_components/delete-project"
import { Separator } from "@web/components/ui/separator"
import { PlanLimits } from "@web/modules/plan-limits"
import { getProjectBilling } from "@web/lib/server/projects"


export default async function SettingsPage({ params: { projectId } }) {

    const supabase = supabaseServer()
    const [teamQuery, teamMemberCount] = await Promise.all([
        supabase
            .from("teams")
            .select("id, name")
            .eq("id", projectId)
            .single()
            .throwOnError(),
        supabase
            .from("users_teams")
            .select("*", { count: "exact", head: true })
            .eq("team_id", projectId)
            .throwOnError()
            .then(q => q.count || 0),
    ])

    const billing = await getProjectBilling(projectId)
    const reachedTeamMembersLimit = teamMemberCount >= PlanLimits[billing.plan].teamMembers

    return (<>
        <div className="flex justify-between gap-10">
            <h1 className="text-2xl font-bold">
                Settings
            </h1>
        </div>

        <SettingsSection title="General" icon={TbSettings}>
            <GeneralSettingsForm
                projectId={projectId}
                defaultValues={{
                    projectName: teamQuery.data?.name || "",
                }}
            />

            <Separator />

            <div className="flex-v items-start gap-4">
                <p className="font-bold">
                    Danger Zone
                </p>
                <DeleteProject />
            </div>
        </SettingsSection>

        <SettingsSection
            title="Team" icon={TbUsers}
            rightSection={<InviteMember reachedLimit={reachedTeamMembersLimit} />}
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