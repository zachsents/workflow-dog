import { forwardRef } from "react"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import SpinningLoader from "./spinning-loader"


interface ConfirmDialogProps extends React.ComponentProps<typeof Dialog> {
    onCancel?: () => void
    onConfirm?: () => void | Promise<void>
    isPending?: boolean
    title?: React.ReactNode
    description?: React.ReactNode
    destructive?: boolean
    confirmText?: React.ReactNode
    confirmingText?: React.ReactNode
}

const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(({
    onCancel,
    onConfirm,
    isPending,
    title = "Are you sure?",
    description,
    destructive = false,
    confirmText = "Confirm",
    confirmingText = "Confirming",
    ...props
}, ref) => {
    return (
        <Dialog {...props}>
            <DialogContent ref={ref}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description &&
                        <DialogDescription>
                            {description}
                        </DialogDescription>}
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => {
                        onCancel?.()
                        props.onOpenChange?.(false)
                    }}>
                        Cancel
                    </Button>
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        disabled={isPending}
                        onClick={() => {
                            const result = onConfirm?.()
                            if (result instanceof Promise)
                                result.then(() => props.onOpenChange?.(false))
                            else
                                props.onOpenChange?.(false)
                        }}
                    >
                        {isPending
                            ? <>
                                <SpinningLoader />
                                {confirmingText}
                            </>
                            : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})
ConfirmDialog.displayName = "ConfirmDialog"

export default ConfirmDialog
