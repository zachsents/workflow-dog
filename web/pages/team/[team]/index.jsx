import { Divider } from "@nextui-org/react"
import DashboardLayout from "@web/components/dashboard/DashboardLayout"
import Group from "@web/components/layout/Group"
import { TbPuzzle, TbSettings, TbUsersGroup } from "react-icons/tb"


export default function TeamPage() {


    return (
        <DashboardLayout
            title="Team"
        >
            <div className="flex flex-col gap-unit-xl">
                <section id="general" className="flex flex-col gap-unit-xl">
                    <SectionHeader icon={TbSettings}>
                        General
                    </SectionHeader>


                </section>

                <Divider />

                <section>
                    <SectionHeader icon={TbUsersGroup}>
                        Members
                    </SectionHeader>
                </section>
                <Divider />
                <section>
                    <SectionHeader icon={TbPuzzle}>
                        Connected Integrations
                    </SectionHeader>
                </section>
            </div>
        </DashboardLayout>
    )
}


function SectionHeader({ icon: Icon, children }) {

    return (
        <Group className="gap-unit-md">
            {Icon && <Icon className="text-xl" />}
            <h2 className="text-xl font-medium">
                {children}
            </h2>
        </Group>
    )
}