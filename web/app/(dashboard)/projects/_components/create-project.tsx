"use client"

import { Button } from "@ui/button"
import Loader from "@web/components/loader"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@web/components/ui/dialog"
import { Input } from "@web/components/ui/input"
import { trpc } from "@web/lib/client/trpc"
import { useRouter } from "next/navigation"
import { TbPlus } from "react-icons/tb"
import { toast } from "sonner"


export default function CreateProject() {

    const router = useRouter()
    const utils = trpc.useUtils()

    const { mutate: createProject, isPending, isSuccess } = trpc.projects.create.useMutation({
        onSuccess: ({ id }) => {
            toast.success("Project created!")
            router.push(`/projects/${id}`)
            utils.projects.list.invalidate()
        },
        onError: (err) => {
            console.debug(err)
            toast.error(err.data?.message)
        },
    })

    const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault()
        const projectName = new FormData(ev.currentTarget).get("projectName")?.toString()
        if (projectName)
            createProject({ name: projectName })
    }

    const showLoading = isPending || isSuccess

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

                <form onSubmit={handleSubmit}>
                    <Input
                        name="projectName"
                        placeholder="Project Name"
                        disabled={showLoading}
                        required
                    />

                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={showLoading}
                        >
                            {showLoading
                                ? <>
                                    <Loader mr />
                                    Creating project...
                                </>
                                : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}