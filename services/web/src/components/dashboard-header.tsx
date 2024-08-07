import { IconExternalLink, IconHeart } from "@tabler/icons-react"
import AccountMenu from "./account-menu"
import TI from "./tabler-icon"
import { Button } from "./ui/button"
import React, { forwardRef } from "react"
import { cn } from "@web/lib/utils"


interface DashboardHeaderProps {
    withBrandTitle?: boolean
}

const DashboardHeader = forwardRef<HTMLDivElement, DashboardHeaderProps & React.ComponentProps<"header">>(({
    withBrandTitle,
    ...props
}, ref) => {
    return (
        <header
            {...props}
            className={cn("flex justify-between items-stretch gap-10 px-10 py-4 self-stretch", props.className)}
            ref={ref}
        >
            <BrandLink href="/" withTitle={withBrandTitle} />
            <div className="flex-center gap-10">
                <FeedbackButton />
                <AccountMenu />
            </div>
        </header>
    )
})

export default DashboardHeader


interface BrandLinkProps {
    withTitle?: boolean
}

export const BrandLink = forwardRef<HTMLAnchorElement, BrandLinkProps & React.ComponentProps<"a">>(({
    withTitle = false,
    ...props
}, ref) =>
    <a
        {...props}
        className={cn("flex-center gap-[0.5em] group/brandlink", props.className)}
        ref={ref}
    >
        <img src="/logo.svg" className="w-auto h-[1.75em] transition-transform group-hover/brandlink:scale-110" />
        {withTitle &&
            <h1 className="font-semibold group-hover/brandlink:text-primary transition-colors">
                WorkflowDog
            </h1>}
    </a>
)


export const FeedbackButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>((props, ref) =>
    <Button
        asChild variant="outline" size="sm"
        {...props}
        className={cn("gap-2 group/feedbackbutton", props.className)}
        ref={ref}
    >
        <a href="/feedback" target="_blank">
            <TI>
                <IconHeart className="group-hover/feedbackbutton:scale-125 group-hover/feedbackbutton:fill-red-500 transition" />
            </TI>
            Leave Feedback
            <TI><IconExternalLink /></TI>
        </a>
    </Button>
)