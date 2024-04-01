import { redirect } from "next/navigation"


export async function GET(_: any, { params }: { params: { workflowId: string } }) {
    redirect(`/workflows/${params.workflowId}/edit`)
}