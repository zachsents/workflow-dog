import { redirect } from "next/navigation"


export async function GET(_: any, { params }: { params: { projectId: string } }) {
    redirect(`/workflows/${params.projectId}/edit`)
}