import { Button } from "@ui/button"
import { Card } from "@ui/card"
import { supabaseServer } from "@web/lib/server/supabase"
import { IconType } from "react-icons"
import { TbPuzzle, TbSettings, TbUserPlus, TbUsers } from "react-icons/tb"
import GeneralSettingsForm from "./components/general-form"
import MembersTable from "./components/members-table"
import InviteMember from "./components/invite-member"


export default async function SettingsPage({ params: { projectId } }) {

    const supabase = supabaseServer()
    const query = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", projectId)
        .single()
        .throwOnError()

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
                    projectName: query.data?.name || "",
                }}
            />
        </SettingsSection>

        <SettingsSection
            title="Team" icon={TbUsers}
            rightSection={<InviteMember />}
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
        <Card className="flex-v items-stretch gap-4 p-6 mb-6 shadow-md has-[:focus]:shadow-lg transition-shadow">
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