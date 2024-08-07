import { IconArrowLeft, IconChevronDown, IconPencil, IconPlayerPauseFilled, IconPointFilled, IconRouteSquare2, IconTrash } from "@tabler/icons-react"
import TI from "@web/components/tabler-icon"
import { Button } from "@web/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import VerticalDivider from "@web/components/vertical-divider"
import { GBRoot } from "@web/lib/graph-builder"
import { NavLink, Outlet } from "react-router-dom"
import ClientNodeDefinitions from "workflow-packages/client-nodes"


export function WorkflowRoot() {
    return (
        <div
            className="w-screen h-screen bg-gray-700 grid grid-flow-row auto-rows-auto"
            style={{
                gridTemplateRows: "auto 1fr",
                gridTemplateColumns: "1fr",
            }}
        >
            <div className="col-span-full text-background p-1 flex items-stretch gap-2">
                <Button variant="ghost" size="compact" className="gap-2 h-auto">
                    <TI><IconArrowLeft /></TI>
                    Back to Workflows
                </Button>
                <VerticalDivider />
                <DropdownMenu>
                    <DropdownMenuTrigger className="group text-sm px-2 py-1 flex-center gap-2 hover:bg-background/10 rounded-sm transition-colors">
                        <TI><IconRouteSquare2 /></TI>
                        <p>
                            Send emails when new customer support requests are created
                        </p>
                        <TI className="text-muted-foreground group-hover:text-background transition-colors"><IconChevronDown /></TI>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" className="*:flex *:items-center *:gap-2 w-[200px]">
                        <DropdownMenuItem>
                            <TI><IconPencil /></TI>
                            Rename Workflow
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                            <TI><IconTrash /></TI>
                            Delete Workflow
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="compact" className="gap-1 self-center">
                            <TI className="text-green-600 text-lg"><IconPointFilled /></TI>
                            Live
                            <TI className="ml-1"><IconChevronDown /></TI>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" className="*:flex *:items-center *:gap-4 w-[300px]">
                        <DropdownMenuItem>
                            <TI><IconPlayerPauseFilled /></TI>
                            <div>
                                <p>Pause Workflow</p>
                                <p className="text-xs text-muted-foreground">
                                    When paused, triggers won't cause the workflow to run.
                                </p>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>



                <div className="mx-4 bg-background/10 rounded-full text-background font-medium text-xs text-center grid grid-flow-col auto-cols-fr place-items-stretch gap-1 p-1 h-auto *:rounded-full *:px-4 *:py-1 [&.active]:*:bg-background [&.active]:*:text-foreground *:transition-colors">
                    <NavLink to="trigger" replace>Trigger</NavLink>
                    <NavLink to="edit" replace>Edit</NavLink>
                    <NavLink to="history" replace>History</NavLink>
                </div>
            </div>

            <Outlet />
        </div>
    )
}


export function WorkflowEdit() {
    return (
        <GBRoot
            className="w-full h-full overflow-clip"
            options={{
                resolveNodeDefinition: (nodeDefId) => ClientNodeDefinitions[nodeDefId],
            }}
        >
        </GBRoot>
    )
}