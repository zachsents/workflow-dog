import { Card } from "@web/components/ui/card"
import { TbPuzzle, TbSettings, TbUsers } from "react-icons/tb"
import GeneralSettingsForm from "./components/general-form"
import { supabaseServer } from "@web/lib/server/supabase"
import { IconType } from "react-icons"


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

            {/* <Button>
                <TbPlus className="mr-2" />
                Create Workflow
            </Button> */}
        </div>

        <SettingsSection title="General" icon={TbSettings}>
            <GeneralSettingsForm
                projectId={projectId}
                defaultValues={{
                    projectName: query.data?.name || "",
                }}
            />
        </SettingsSection>

        <SettingsSection title="Team" icon={TbUsers}>
            Team
        </SettingsSection>

        <SettingsSection title="Integrations" icon={TbPuzzle}>
            Integrations
        </SettingsSection>
    </>)
}


interface SettingsSectionProps {
    title: string
    children: any
    icon: IconType
}

function SettingsSection({ children, title, icon: Icon }: SettingsSectionProps) {
    return (
        <Card className="flex-v items-stretch gap-4 p-6 mb-6 shadow-md has-[:focus]:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 text-xl font-bold">
                <Icon className="text-muted-foreground" />
                <h2>{title}</h2>
            </div>

            {children}
        </Card>
    )
}