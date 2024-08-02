import { type IconProps } from "@tabler/icons-react"
import { cloneElement, memo } from "react"


const TI = memo(
    ({ children, ...props }: { children: React.ReactElement } & IconProps) =>
        cloneElement(children, {
            width: "1em",
            height: "1em",
            ...props,
        })
)

TI.displayName = "TI"

export default TI