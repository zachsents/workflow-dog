import { forwardRef } from "react"
import BaseDiv from "../util/BaseDiv"


/**
 * @param {object} props
 * @param {string} props.className
 */
function Group({ children, className }, ref) {
    return (
        <BaseDiv
            className="flex flex-row items-center"
            additionalClasses={className}
            ref={ref}
        >
            {children}
        </BaseDiv>
    )
}


export default forwardRef(Group)