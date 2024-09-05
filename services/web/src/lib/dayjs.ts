import RelativeTimePlugin from "dayjs/plugin/relativeTime"
import DurationPlugin from "dayjs/plugin/duration"
import dayjs from "dayjs"

dayjs.extend(RelativeTimePlugin)
dayjs.extend(DurationPlugin)

export default dayjs