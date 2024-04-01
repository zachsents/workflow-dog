"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ui/dialog"
import Loader from "@web/components/loader"
import { Button } from "@web/components/ui/button"
import { useAction } from "@web/lib/client/actions"
import { useCurrentProjectId } from "@web/lib/client/hooks"
import { useRouter } from "next/navigation"
import { deleteProject as deleteProjectAction } from "../actions"


export default function DeleteProject() {

    const projectId = useCurrentProjectId()
    const router = useRouter()

    const [deleteProject, { isPending: isDeleting }] = useAction(
        deleteProjectAction.bind(null, projectId),
        {
            successToast: "Project deleted!",
            invalidateKey: ["projectsForUser"],
        }
    )
    const deleteAndRedirect = async () => {
        await deleteProject()
        router.push("/projects")
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    Delete project
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Are you sure?
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this project? This is irreversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={deleteAndRedirect}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader mr />}
                        I'm sure
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}