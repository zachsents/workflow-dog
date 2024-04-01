"use client"

import { Button } from "@ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@web/components/ui/dialog"
import { Input } from "@web/components/ui/input"
import { useAction } from "@web/lib/client/actions"
import { TbPlus } from "react-icons/tb"
import { createProject as createProjectAction } from "../../actions"
import Loader from "@web/components/loader"
import { useRouter } from "next/navigation"


export default function CreateProject() {

    const [createProject, { isPending }] = useAction(createProjectAction, {
        successToast: "Project created!",
        showErrorToast: true,
        invalidateKey: ["projectsForUser"],
    })
    const router = useRouter()

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <TbPlus className="mr-2" />
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create a new project
                    </DialogTitle>
                    <DialogDescription>
                        Give your project a name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={ev => {
                    ev.preventDefault()
                    const projectName = new FormData(ev.currentTarget).get("projectName")
                    createProject(projectName)
                        .then(({ id }) => router.push(`/projects/${id}`))
                }}>
                    <Input
                        name="projectName"
                        placeholder="Project Name"
                        required
                    />

                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending && <Loader mr />}
                            Create Project
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}