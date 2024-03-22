import { cn } from "@web/lib/utils"
import { TbLoader3 } from "react-icons/tb"

interface LoaderProps extends React.SVGAttributes<SVGElement> {
    mr?: boolean
    ml?: boolean
}

export default function Loader({ ml, mr, className, ...props }: LoaderProps) {
    return (
        <TbLoader3
            {...props}
            className={cn("animate-spin", ml && "ml-2", mr && "mr-2", className)}
        />
    )
}