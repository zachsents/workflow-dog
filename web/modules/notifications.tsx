import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { cn } from "@web/lib/utils"
import "client-only"
import { AnimatePresence, motion } from "framer-motion"
import { createContext, useContext, useMemo, useState } from "react"
import { TbX } from "react-icons/tb"
import { uniqueId } from "./util"


interface NotificationOptions {
    title?: string
    message: string
    icon?: JSX.Element
    duration?: number
    classNames?: {
        icon?: string
        title?: string
        message?: string
    }
    content?: JSX.Element
}

type Notification = {
    id: string
    createdAt: Date
    options: NotificationOptions
}


type NotificationsContext = {
    notify: (options: NotificationOptions) => string
    close: (notificationId: string) => void
}


const notificationsContext = createContext<NotificationsContext | null>(null)


interface NotificationsProviderProps {
    children: any
    maxNotifications: number
    duration: number
    className: string
}

export function NotificationsProvider({
    children,
    maxNotifications = 8,
    duration: defaultDuration = 3000,
    className
}: NotificationsProviderProps) {

    const [notifications, setNotifications] = useState<Notification[]>([])

    const displayedNotifications = useMemo(
        () => [...notifications]
            .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())
            .slice(0, maxNotifications),
        [notifications]
    )

    const closeNotification: NotificationsContext["close"] = id => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const notify: NotificationsContext["notify"] = options => {

        const id = uniqueId("notification")

        setNotifications(prev => [...prev, {
            id,
            createdAt: new Date(),
            options,
        }])

        const duration = options.duration ?? defaultDuration

        if (typeof duration === "number")
            setTimeout(() => closeNotification(id), duration)

        return id
    }

    return (
        <notificationsContext.Provider value={{ notify, close: closeNotification }}>
            {children}

            <motion.div layout className={cn(
                "fixed z-[60] bottom-0 right-0 p-8 w-[28rem] flex flex-col-reverse gap-unit-sm items-stretch pointer-events-none",
                className
            )}>
                <AnimatePresence>
                    {displayedNotifications.map(notification =>
                        <NotificationPopup
                            {...notification}
                            close={() => closeNotification(notification.id)}
                            key={notification.id}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </notificationsContext.Provider>
    )
}


interface NotificationPopupProps extends Notification {
    close: () => void
}

function NotificationPopup({
    options: {
        title,
        message,
        icon,
        classNames = {},
        content
    },
    close
}: NotificationPopupProps) {

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
        >
            <Card className="pointer-events-auto relative p-4 pr-10 flex items-center gap-4">
                <div className={cn(
                    "bg-primary text-primary-foreground flex center",
                    icon ? "p-2 rounded-full" : "w-1 self-stretch rounded-sm",
                    classNames.icon
                )}>
                    {icon || null}
                </div>

                <div>
                    {title &&
                        <p className={cn("font-medium", !!message && "mb-1", classNames.title)}>
                            {title}
                        </p>}
                    {message &&
                        <p className={cn("text-small text-muted-foreground", classNames?.message)}>
                            {message}
                        </p>}

                    {content}
                </div>

                <Button
                    variant="ghost" size="icon"
                    className="absolute top-0 right-0 m-2"
                    onClick={close}
                >
                    <TbX className="text-muted-foreground" />
                </Button>
            </Card>
        </motion.div>
    )
}


export function useNotifications() {
    const context = useContext(notificationsContext)
    if (!context)
        throw new Error("useNotifications must be used within a NotificationsProvider")
    return context
}