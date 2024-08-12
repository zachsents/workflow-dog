import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@ui/breadcrumb"
import { useCurrentProject, useCurrentProjectId } from "@web/lib/hooks"
import { Fragment } from "react"
import { Link } from "react-router-dom"


interface ProjectDashboardLayoutProps {
    children: React.ReactNode
    currentSegment: string
    preceedingSegments?: {
        label: string
        href: string
    }[]
}

export function ProjectDashboardLayout({
    children, currentSegment, preceedingSegments = [],
}: ProjectDashboardLayoutProps) {

    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data!

    return (
        <div className="p-8 max-w-6xl w-full mx-auto">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/projects">
                                Projects
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="max-w-[300px] truncate">
                            <Link to={`/projects/${projectId}`}>
                                {project.name}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {preceedingSegments.map(({ label, href }) => (
                        <Fragment key={href}>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to={href}>
                                        {label}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                        </Fragment>
                    ))}
                    <BreadcrumbItem>
                        <BreadcrumbPage>{currentSegment}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {children}
        </div>
    )
}