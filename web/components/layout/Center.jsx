import { forwardRef } from "react"
import BaseDiv from "../util/BaseDiv"


/**
 * @param {object} props
 * @param {string} props.className
 */
function Center({ children, className }, ref) {
    return (
        <BaseDiv
            className="flex flex-col justify-center items-center"
            additionalClasses={className}
            ref={ref}
        >
            {children}
        </BaseDiv>
    )
}


export default forwardRef(Center)