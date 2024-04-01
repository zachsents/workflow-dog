import { redirect } from "next/navigation"
import { NextRequest } from "next/server"


export async function GET(req: NextRequest) {
    const projectId = req.nextUrl.searchParams.get("project")
        || req.nextUrl.searchParams.get("team")
        || req.nextUrl.searchParams.get("projectId")
        || req.nextUrl.searchParams.get("teamId")

    redirect(projectId
        ? `/projects/${projectId}/workflows`
        : "/projects"
    )
}