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
import { trpc } from "@web/lib/client/trpc"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


interface DeleteProjectProps {
    projectId: string
}

export default function DeleteProject({ projectId }: DeleteProjectProps) {

    const router = useRouter()
    const utils = trpc.useUtils()

    const { mutate: deleteProject, isPending, isSuccess } = trpc.projects.delete.useMutation({
        onSuccess: () => {
            toast.success("Project deleted!")
            router.push("/projects")
            utils.projects.list.invalidate()
        },
        onError: (err) => {
            console.debug(err)
            toast.error(err.data?.message)
        },
    })

    const isDeleting = isPending || isSuccess

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
                        onClick={() => deleteProject({ id: projectId })}
                        disabled={isDeleting}
                    >
                        {isDeleting
                            ? <>
                                <Loader mr />
                                Deleting...
                            </>
                            : "I'm sure"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}