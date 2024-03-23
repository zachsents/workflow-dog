import { Skeleton } from "@ui/skeleton"
import { supabaseServer } from "@web/lib/server/supabase"
import { Suspense } from "react"
import MembersTableClient from "./client"


export default function MembersTable({ projectId }: { projectId: string }) {
    return (
        <Suspense fallback={<Skeleton withLoader className="w-full h-40" />}>
            <MembersTableLoader projectId={projectId} />
        </Suspense>
    )
}


async function MembersTableLoader({ projectId }: { projectId: string }) {

    const supabase = supabaseServer()

    const [query, { data: { user } }] = await Promise.all([
        supabase.rpc("get_team_members", {
            team_id_arg: projectId,
        }),
        supabase.auth.getUser()
    ])

    const members = query.data?.map(item => ({
        id: item.member_id,
        email: item.member_email,
        isEditor: item.member_roles.includes("editor"),
        isViewer: item.member_roles.includes("viewer"),
        isYou: item.member_email.toLowerCase() === user?.email?.toLowerCase(),
    })) || []

    return (
        <MembersTableClient members={members} />
    )
}