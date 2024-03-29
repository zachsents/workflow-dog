import { redirect } from "next/navigation"


export async function GET(_: any, { params }: { params: { projectId: string } }) {
    redirect(`/projects/${params.projectId}/workflows`)
}