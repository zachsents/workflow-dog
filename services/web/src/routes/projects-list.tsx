import { IconArrowRight, IconPencilHeart, IconPlus } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog"
import DashboardHeader from "@web/components/dashboard-header"
import SearchInput from "@web/components/search-input"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import { useMustBeLoggedIn } from "@web/lib/auth"
import { useSearch } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import type { ApiRouterOutput } from "api/trpc/router"
import { Link, useMatch, useNavigate } from "react-router-dom"
import { toast } from "sonner"


export default function ProjectsList() {

    useMustBeLoggedIn()

    const { data: projects, isLoading } = trpc.projects.list.useQuery()

    const search = useSearch(projects ?? [], {
        keys: ["name"],
        threshold: 0.4,
    })

    return (<>
        <div className="bg-gray-50 min-h-screen flex-v items-center">
            <DashboardHeader withBrandTitle />
            <div className="w-full max-w-5xl mt-2 mb-10 p-12 flex-v items-stretch gap-4">
                <div className="flex justify-between gap-10">
                    <h1 className="text-2xl font-bold">
                        Select a project
                    </h1>
                    <Button asChild className="gap-2">
                        <Link to="/projects/create" replace preventScrollReset>
                            <TI><IconPlus /></TI>
                            Create a project
                        </Link>
                    </Button>
                </div>

                {isLoading
                    ? <SpinningLoader className="mx-auto my-10" />
                    : projects
                        ? <>
                            <SearchInput
                                value={search.query}
                                onValueChange={search.setQuery}
                                quantity={projects?.length}
                                noun="project"
                                withHotkey
                                className="shadow-none"
                            />
                            {search.filtered.length > 0
                                ? <div className="grid grid-cols-3 gap-4">
                                    {search.filtered.map(project =>
                                        <ProjectCard {...project} key={project.id} />
                                    )}
                                </div>
                                : <p className="text-center py-8 text-sm text-muted-foreground">
                                    No projects found
                                </p>}
                        </>
                        : <p className="text-center py-8 text-sm text-muted-foreground">
                            Failed to load projects
                        </p>}
            </div>
        </div>
        <CreateProjectDialog />
    </>)
}


function ProjectCard({ id, name, created_at, members }: ApiRouterOutput["projects"]["list"][number]) {

    const creationDate = new Date(created_at!).toLocaleDateString(undefined, {
        dateStyle: "medium"
    })

    const userInitials = members.map(u => u.name?.[0].toUpperCase() ?? "?")

    return (
        <Link to={`/projects/${id}`}>
            <Card className="group h-full shadow-none hover:shadow-md hover:scale-[1.02] transition">
                <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>
                        Created on {creationDate}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center">
                        {userInitials.slice(0, ProjectCard.MAX_SHOW_USERS).map((letter, i) =>
                            <div
                                key={i}
                                className="grid place-items-center aspect-square h-[1.75em] bg-primary text-xs text-primary-foreground outline outline-white outline-2 rounded-full -ml-1 first:ml-0"
                            >
                                {letter}
                            </div>
                        )}

                        {userInitials.length > ProjectCard.MAX_SHOW_USERS &&
                            <p className="text-muted-foreground text-xs ml-2">
                                +{userInitials.length - ProjectCard.MAX_SHOW_USERS}
                            </p>}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                        {members.length} members
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <div className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center">
                        <span>Open Project</span>
                        <TI>
                            <IconArrowRight />
                        </TI>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}

ProjectCard.MAX_SHOW_USERS = 8


function CreateProjectDialog() {

    const isDialogOpen = !!useMatch("/projects/create")

    const navigate = useNavigate()
    const onOpenChange = (open: boolean) => {
        navigate(open ? "/projects/create" : "/projects", {
            replace: true,
            preventScrollReset: true,
        })
    }

    const utils = trpc.useUtils()

    const {
        mutate: createProject,
        isPending, isSuccess,
    } = trpc.projects.create.useMutation({
        onSuccess: ({ id }) => {
            toast.success("Project created!")
            navigate(`/projects/${id}`)
            utils.projects.list.invalidate()
        },
        onError: (err) => {
            console.debug(err)
            toast.error(err.data?.message)
        },
    })

    const showLoading = isPending || isSuccess

    function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault()
        const projectName = new FormData(ev.currentTarget).get("projectName")?.toString()
        if (projectName)
            createProject({ name: projectName })
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form
                    onSubmit={handleSubmit}
                    className="flex-v items-stretch gap-6"
                >
                    <DialogHeader>
                        <DialogTitle>Create a new project</DialogTitle>
                    </DialogHeader>

                    <div className="flex-v items-stretch gap-2">
                        <Label
                            className="font-semibold"
                            htmlFor="projectName"
                        >
                            Project Name
                        </Label>
                        <Input
                            id="projectName"
                            name="projectName"
                            placeholder="Give your project a name"
                            disabled={showLoading}
                            required
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit" disabled={showLoading}
                            className="gap-2"
                        >
                            {showLoading ? <>
                                <SpinningLoader />
                                Creating
                            </> : <>
                                <TI><IconPencilHeart /></TI>
                                Create Project
                            </>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}