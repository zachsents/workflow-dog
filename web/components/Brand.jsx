import { Group, Text } from "@mantine/core"
import siteInfo from "@web/site-info.json"
import classNames from "classnames"
import Link from "next/link"


export default function Brand({ className, src, includeText = false }) {
    return (
        <Link href="/" className="no-underline text-dark">
            <Group noWrap className={classNames("gap-lg", className)}>
                {includeText ?
                    <>
                        <img
                            src={src}
                            alt={`${siteInfo.name} logo`}
                            className="h-9 w-auto aspect-square rounded-sm shrink-0"
                        />
                        <Text className="text-2xl font-bold">
                            {siteInfo.name}
                        </Text>
                    </> :
                    <img
                        src={src}
                        alt={`${siteInfo.name} logo`}
                        className="h-9 w-auto rounded-sm shrink-0"
                    />}
            </Group>
        </Link>
    )
}
