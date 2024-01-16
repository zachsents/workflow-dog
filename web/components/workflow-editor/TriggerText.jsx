import classNames from "classnames"
import { object as triggerMap } from "triggers/web"
import Group from "../layout/Group"


export default function TriggerText({
    trigger,
    fallback = "No trigger set",
    classNames: { wrapper: wrapperClassName, fallback: fallbackClassname, text: textClassName } = {},
}) {

    const triggerInfo = triggerMap[trigger?.type]

    return triggerInfo ?
        <Group className={classNames("gap-unit-xs", wrapperClassName)}>
            <triggerInfo.icon style={{
                color: triggerInfo.color,
            }} />
            <p className={classNames("", textClassName)}>
                {triggerInfo.whenName || triggerInfo.name}
            </p>
        </Group> :
        <p className={classNames("", fallbackClassname)}>
            {fallback}
        </p>
}
