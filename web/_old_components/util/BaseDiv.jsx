import classNames from "classnames"
import { forwardRef } from "react"


/**
 * @param {object} props
 * @param {string} props.className
 */
function BaseDiv({ className, additionalClasses, children }, ref) {
    return (
        <div className={classNames(className, additionalClasses)} ref={ref}>
            {children}
        </div>
    )
}

export default forwardRef(BaseDiv)