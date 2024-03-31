import { cn } from "@web/lib/utils"
import { plural } from "@web/modules/grammar"
import React from "react"
import { TbAlertCircle, TbAlertHexagon, TbCheck, TbCircle, TbClock, TbRun, TbX } from "react-icons/tb"


export default function StatusIcon({ status, hasErrors, errorCount }) {

    switch (status) {
        case "completed":
            return hasErrors ?
                <StatusText
                    icon={TbAlertCircle}
                    className="text-red-600"
                >
                    {errorCount
                        != null ?
                        `${errorCount} ${plural("error", errorCount)}` :
                        "Errors"
                    }
                </StatusText> :
                <StatusText
                    icon={TbCheck}
                    className="text-green-600"
                >
                    Completed
                </StatusText>
        case "failed":
            return <StatusText
                icon={TbAlertHexagon}
                className="text-red-600"
            >
                Failed
            </StatusText>
        case "running":
            return <StatusText
                icon={TbRun}
                className="text-violet-600"
            >
                Running
            </StatusText>
        case "scheduled":
            return <StatusText
                icon={TbClock}
                className="text-blue-500"
            >
                Scheduled
            </StatusText>
        case "cancelled":
            return <StatusText
                icon={TbX}
                className="text-muted-foreground"
            >
                Cancelled
            </StatusText>
        case "pending":
            return <StatusText
                icon={TbCircle}
                className="text-muted-foreground"
            >
                Pending
            </StatusText>
        default:
            return <StatusText
                icon={TbCircle}
                className="text-muted-foreground"
            >
                Unknown
            </StatusText>
    }
}


interface StatusTextProps extends React.ComponentProps<"div"> {
    icon: React.ComponentType
    children?: React.ReactNode
}

function StatusText({ icon: Icon, children, ...props }: StatusTextProps) {
    return (
        <div
            {...props}
            className={cn("flex flex-nowrap items-center gap-1", props.className)}
        >
            <Icon />
            <span className="text-xs">
                {children}
            </span>
        </div>
    )
}