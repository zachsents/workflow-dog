"use client"

import { Button } from "@ui/button"
import Loader from "@web/components/loader"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@web/components/ui/dialog"
import { Input } from "@web/components/ui/input"
import { useCurrentProjectId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { useRouter } from "next/navigation"
import { TbPlus } from "react-icons/tb"
import { toast } from "sonner"


export default function CreateWorkflow() {

    const projectId = useCurrentProjectId()
    const router = useRouter()

    const {
        mutate: createWorkflow,
        isPending,
        isSuccess,
    } = trpc.workflows.create.useMutation({
        onSuccess: ({ id }) => {
            toast.success("Workflow created!")
            router.push(`/workflows/${id}/edit`)
        },
        onError: (err) => {
            console.debug(err)
            toast.error(err.data?.message)
        },
    })

    const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault()
        const workflowName = new FormData(ev.currentTarget).get("workflowName")?.toString()
        if (workflowName)
            createWorkflow({
                name: workflowName,
                projectId,
            })
    }

    const showLoading = isPending || isSuccess

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <TbPlus className="mr-2" />
                    Create Workflow
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create a new workflow
                    </DialogTitle>
                    <DialogDescription>
                        Give your workflow a name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Input
                        name="workflowName"
                        placeholder="Route customer support requests based on topic"
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
                                    Creating workflow...
                                </>
                                : "Create Workflow"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}