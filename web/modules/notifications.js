import { Button, Card, CardBody } from "@nextui-org/react"
import classNames from "classnames"
import { AnimatePresence, motion } from "framer-motion"
import { createContext, useContext, useMemo, useState } from "react"
import { TbX } from "react-icons/tb"


const NotificationsContext = createContext()


export function NotificationsProvider({ children, maxNotifications = 8, duration: defaultDuration = 3000, className }) {

    const [notifications, setNotifications] = useState([])

    const displayedNotifications = useMemo(
        () => [...notifications]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, maxNotifications),
        [notifications]
    )

    const notify = options => {
        const id = Math.random().toString(36).slice(2, 12)

        setNotifications(prev => [...prev, {
            id,
            createdAt: new Date(),
            options,
        }])

        const duration = options.duration ?? defaultDuration

        if (typeof duration === "number")
            setTimeout(() => closeNotification(id), duration)
    }

    const closeNotification = id => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <NotificationsContext.Provider value={{ notify, closeNotification }}>
            {children}

            <motion.div layout className={classNames(
                "fixed z-50 bottom-0 right-0 p-8 w-[28rem] flex flex-col-reverse gap-unit-sm items-stretch pointer-events-none",
                className
            )}>
                <AnimatePresence>
                    {displayedNotifications.map(notification =>
                        <Notification
                            {...notification}
                            close={() => closeNotification(notification.id)}
                            key={notification.id}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </NotificationsContext.Provider>
    )
}


/**
 * @param {{ id: string, createdAt: Date, options: NotificationOptions }} props
 */
function Notification({ options: { title, message, icon, classNames: _classNames = {} }, close }) {

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
        >
            <Card
                className="pointer-events-auto relative"
            >
                <CardBody className="flex flex-row gap-unit-md items-center pr-10">
                    {icon ?
                        <div className={classNames(
                            "text-white flex justify-center items-center p-2 rounded-full bg-primary-600",
                            _classNames?.icon
                        )}>
                            {icon}
                        </div> :
                        <div className={classNames(
                            "w-1 self-stretch rounded-sm bg-primary-600",
                            _classNames?.icon
                        )} />}
                    <div>
                        {title &&
                            <p className={classNames("font-medium", { "mb-1": !!message }, _classNames?.title)}>
                                {title}
                            </p>}
                        {message &&
                            <p className={classNames("text-small text-default-500", _classNames?.message)}>
                                {message}
                            </p>}
                    </div>
                </CardBody>

                <Button
                    isIconOnly variant="light" size="sm"
                    className="absolute top-0 right-0 m-unit-xs"
                    onClick={close}
                >
                    <TbX className="text-default-500" />
                </Button>
            </Card>
        </motion.div>
    )
}


/**
 * @return {{ notify: (options: NotificationOptions) => void, closeNotification: (notificationId: string) => void }} 
 */
export function useNotifications() {
    return useContext(NotificationsContext)
}


/**
 * @typedef {object} Notification
 * @property {string} id
 * @property {Date} createdAt
 * @property {options} NotificationOptions 
 */


/**
 * @typedef {object} NotificationOptions
 * @property {string} title
 * @property {string} message
 * @property {JSX.Element} icon
 * @property {number} duration
 * @property {{ icon: string, title: string, message: string }} classNames
 */