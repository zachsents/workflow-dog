import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/card"
import { RouterOutput } from "@web/lib/types/trpc"
import Link from "next/link"
import { TbArrowRight } from "react-icons/tb"


export default function ProjectCard({
    project
}: {
    project: RouterOutput["projects"]["list"]["0"]
}) {

    const userInitials = project.members.map(u => u.email?.[0].toUpperCase() ?? "?")

    const creationDate = new Date(project.created_at!).toLocaleDateString(undefined, {
        dateStyle: "medium"
    })

    return (
        <Link href={`/projects/${project.id}`}>
            <Card className="group hover:shadow-md transition">
                <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                        Created on {creationDate}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserDots initials={userInitials} max={8} />
                    <p className="text-muted-foreground text-sm mt-1">
                        {project.members.length} members
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <div className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center">
                        <span>Open Project</span>
                        <TbArrowRight />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}


function UserDots({ initials, max }: { initials: string[], max: number }) {

    return (
        <div className="flex items-center">
            {initials.slice(0, max).map((letter, i) =>
                <div
                    key={i}
                    className="flex center aspect-square h-[1.75em] bg-primary text-xs text-primary-foreground outline outline-white outline-2 rounded-full -ml-1 first:ml-0"
                >
                    {letter}
                </div>
            )}

            {initials.length > max &&
                <p className="text-muted-foreground text-xs ml-2">
                    +{initials.length - max}
                </p>}
        </div>
    )
}