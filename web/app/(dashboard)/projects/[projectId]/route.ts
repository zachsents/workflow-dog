import { redirect } from "next/navigation"


export async function GET(_, { params }: { params: { projectId: string } }) {
    redirect(`/projects/${params.projectId}/workflows`)
}