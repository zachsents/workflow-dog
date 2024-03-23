"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ui/dialog"
import { Button } from "@ui/button"
import { TbUserPlus } from "react-icons/tb"


export default function InviteMember() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <TbUserPlus className="mr-2" />
                    Invite
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite someone to this project</DialogTitle>
                    <DialogDescription>
                        This person will need to have a WorkflowDog account. If they don't have one, tell them to make one first.
                    </DialogDescription>
                </DialogHeader>


            </DialogContent>
        </Dialog>
    )
}