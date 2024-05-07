import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@ui/breadcrumb"
import { Skeleton } from "@ui/skeleton"
import { db } from "@web/lib/server/db"
import Link from "next/link"
import { Suspense } from "react"


export default async function ProjectLayout({
    children,
    params: { projectId }
}: {
    children: any,
    params: { projectId: string }
}) {
    return (<>
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/projects">Projects</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`/projects/${projectId}`}>
                            <Suspense fallback={<Skeleton className="w-20 h-[1em]" />}>
                                <ProjectName projectId={projectId} />
                            </Suspense>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        {children}
    </>)
}


async function ProjectName({ projectId }: { projectId: string }) {

    const queryResult = await db.selectFrom("projects")
        .select("name")
        .where("id", "=", projectId)
        .executeTakeFirst()

    return queryResult?.name
}