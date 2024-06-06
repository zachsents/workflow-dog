import { cn } from "@web/lib/utils"
import { extendComponent } from "@web/modules/util"


const HeaderContainer = extendComponent<"div">(({ children, ...props }, ref) => {
    if (!Array.isArray(children))
        children = [children]

    return (
        <div
            {...props}
            className={
                cn(
                    "flex center flex-nowrap text-primary-foreground bg-slate-900/80 backdrop-blur-sm p-1 rounded-md shadow-lg pointer-events-auto",
                    props.className,
                )
            }
            style={{
                maxWidth: "calc(100vw - 2rem)",
            }}
            ref={ref}
        >
            {children}
        </div >
    )
})

export default HeaderContainer