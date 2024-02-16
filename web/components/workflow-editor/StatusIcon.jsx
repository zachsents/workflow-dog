import { plural } from "@web/modules/grammar"
import classNames from "classnames"
import { TbAlertCircle, TbAlertHexagon, TbCheck, TbCircle, TbClock, TbRun, TbX } from "react-icons/tb"


export default function StatusIcon({ status, hasErrors, errorCount }) {

    switch (status) {
        case "completed":
            return hasErrors ?
                <StatusText icon={TbAlertCircle} className="text-danger-500">
                    {errorCount != null ?
                        `${errorCount} ${plural("error", errorCount)}` :
                        "Errors"
                    }
                </StatusText> :
                <StatusText icon={TbCheck} className="text-success-600">Completed</StatusText>
        case "failed":
            return <StatusText icon={TbAlertHexagon} className="text-danger-500">Failed</StatusText>
        case "running":
            return <StatusText icon={TbRun} className="text-primary-500">Running</StatusText>
        case "scheduled":
            return <StatusText icon={TbClock} className="text-primary-500">Scheduled</StatusText>
        case "cancelled":
            return <StatusText icon={TbX} className="text-default-500">Cancelled</StatusText>
        case "pending":
            return <StatusText icon={TbCircle} className="text-default-500">Pending</StatusText>
        default:
            return <StatusText icon={TbCircle} className="text-default-500">Unknown</StatusText>
    }
}

function StatusText({ className, icon: Icon, children }) {
    return (
        <div className={classNames("flex flex-nowrap items-center gap-1", className)}>
            <Icon />
            <span className="text-xs">{children}</span>
        </div>
    )
}