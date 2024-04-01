"use client"

import { Button } from "@ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@web/components/ui/dialog"
import { Input } from "@web/components/ui/input"
import { useAction } from "@web/lib/client/actions"
import { TbPlus } from "react-icons/tb"
import { createWorkflow as createWorkflowAction } from "../../../../actions"
import Loader from "@web/components/loader"
import { useRouter } from "next/navigation"
import { useCurrentProjectId } from "@web/lib/client/hooks"


export default function CreateWorkflow() {

    const projectId = useCurrentProjectId()

    const [createWorkflow, { isPending }] = useAction(
        createWorkflowAction.bind(null, projectId),
        {
            successToast: "Workflow created!",
            showErrorToast: true,
        }
    )
    const router = useRouter()

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

                <form onSubmit={ev => {
                    ev.preventDefault()
                    const workflowName = new FormData(ev.currentTarget).get("workflowName")
                    createWorkflow(workflowName)
                        .then(({ id }) => router.push(`/workflows/${id}/edit?select_trigger`))
                }}>
                    <Input
                        name="workflowName"
                        placeholder="Workflow Name"
                        required
                    />

                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending && <Loader mr />}
                            Create Workflow
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}