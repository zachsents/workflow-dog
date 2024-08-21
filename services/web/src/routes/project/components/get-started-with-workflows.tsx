import { IconExternalLink, IconRouteSquare2 } from "@tabler/icons-react"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { useCurrentProjectId } from "@web/lib/hooks"
import { cn } from "@web/lib/utils"
import React, { forwardRef } from "react"
import { Link } from "react-router-dom"


const GetStartedWithWorkflows = forwardRef<
    HTMLDivElement,
    Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
        hasNoWorkflows?: boolean
    }
>(({ hasNoWorkflows, ...props }, ref) => {
    const projectId = useCurrentProjectId()
    return (
        <div
            {...props}
            ref={ref}
            className={cn("bg-gradient-to-tr from-violet-600 to-pink-700 p-8 rounded-xl text-white flex flex-col gap-2", props.className)}
        >
            <h2 className="text-2xl font-bold">
                {hasNoWorkflows ? "Get started with Workflows" : "Create a Workflow"}
            </h2>
            <p>
                Workflows are the core of your project. They are a series of actions composing advanced logic that run in response to a trigger. They are powerful tools that can automate a wide range of tasks.
            </p>
            <div className="flex justify-between items-center gap-4 mt-4">
                <Button asChild variant="secondary" className="flex-center gap-2">
                    <Link to={`/projects/${projectId}/workflows/create`}>
                        <TI><IconRouteSquare2 /></TI>
                        Create a Workflow
                    </Link>
                </Button>
                <Button asChild variant="link" className="flex-center gap-2 text-white opacity-75 hover:opacity-100">
                    <a href="https://learn.workflow.dog/workflows" target="_blank">
                        Learn more about Workflows
                        <TI><IconExternalLink /></TI>
                    </a>
                </Button>
            </div>
        </div>
    )
})

export default GetStartedWithWorkflows