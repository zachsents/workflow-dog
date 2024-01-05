import { Button, CopyButton, Stack } from "@mantine/core"
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { TbBrandGmail, TbCheck, TbClock, TbCopy, TbHandClick, TbLink, TbRun, TbWebhook } from "react-icons/tb"
import { useMutation } from "react-query"
import { WORKFLOW_RUNS_COLLECTION, WORKFLOW_TRIGGERS_COLLECTION } from "shared/firebase"
import { ASYNC_TRIGGER_URL, SYNC_TRIGGER_URL, TRIGGER_TYPE } from "shared/triggers"
import { DataType } from "shared/types"
import { fire } from "./firebase"
import { INTERVAL_UNITS } from "./scheduling"


export const TRIGGER_INFO = {
    [TRIGGER_TYPE.MANUAL]: {
        name: "Manual",
        whenName: "When triggered manually",
        description: "Triggered manually.",
        renderSubtitle: () => "Click to run",
        icon: TbHandClick,
        color: "gray",
        shade: 800,
        config: ({ trigger }) => {

            const runQuery = useMutation(async () => {
                const newDocRef = await addDoc(collection(fire.db, WORKFLOW_RUNS_COLLECTION), {
                    script: trigger.script,
                    trigger: doc(fire.db, WORKFLOW_TRIGGERS_COLLECTION, trigger.id),
                    status: RUN_STATUS.PENDING,
                    queuedAt: serverTimestamp(),
                })

                console.debug("Script run created:", newDocRef.id)

                return new Promise(resolve => {
                    const unsubscribe = onSnapshot(newDocRef, snapshot => {
                        const data = snapshot.data()
                        if (isStatusFinished(data?.status)) {
                            console.debug(data)
                            unsubscribe()
                            resolve()
                        }
                    })
                })
            })

            return (
                <Stack>
                    <Button
                        leftIcon={<TbRun />}
                        onClick={() => runQuery.mutate()}
                        loading={runQuery.isLoading}
                    >
                        Run Script
                    </Button>
                </Stack>
            )
        },
    },
    [TRIGGER_TYPE.RECURRING_SCHEDULE]: {
        name: "Schedule",
        whenName: "On a schedule",
        description: "Triggered on a recurring schedule.",
        icon: TbClock,
        renderSubtitle: ({ trigger }) => {

            if (!trigger?.schedule)
                return "Click to configure"

            return `Every ${trigger.schedule.interval} ${INTERVAL_UNITS(trigger.schedule.interval != 1).find(x => x.value === trigger.schedule.intervalUnit).label}`
        },
        color: "gray",
        shade: 800,
        allowMultiple: true,
        config: ({ trigger }) => {

            // const {mutate: saveNewSchedule } = useMutation(async newSchedule => {
            //     await updateDoc(doc(fire.db, WORKFLOW_TRIGGERS_COLLECTION, trigger.id), {
            //         schedule: newSchedule,
            //     })
            // }, {
            //     queryKey: ["save-trigger", trigger.id],
            //     onSuccess: () => {
            //         notifications.show({
            //             title: "Trigger saved!",
            //         })
            //     }
            // })

            return (
                // <ScheduleBuilder
                //     initial={trigger.schedule}
                // // onSubmit={saveNewSchedule}
                // >
                // </ScheduleBuilder>
                <></>
            )
        },
    },
    [TRIGGER_TYPE.ASYNC_URL]: {
        name: "Webhook (Async URL)",
        whenName: "When a webhook URL is requested",
        description: "Triggered by a request to a URL. Responds as soon as the request is received.",
        renderSubtitle: () => "Click to view details",
        icon: TbWebhook,
        color: "gray",
        shade: 800,
        config: ({ trigger }) => {

            const url = ASYNC_TRIGGER_URL + trigger.id

            return (
                <Stack spacing="xs">
                    <CopyButton value={url}>
                        {({ copied, copy }) => (
                            <Button
                                variant="subtle"
                                leftIcon={copied ? <TbCheck /> : <TbCopy />}
                                onClick={copy}
                            >
                                {copied ? "Copied!" : "Copy URL"}
                            </Button>
                        )}
                    </CopyButton>
                    <pre className="bg-gray-50 dark:bg-dark text-xs rounded-sm whitespace-pre-wrap break-all font-mono p-xs">
                        {url}
                    </pre>
                </Stack>
            )
        },
    },
    [TRIGGER_TYPE.SYNC_URL]: {
        name: "Request (Sync URL)",
        whenName: "When a URL is requested",
        description: "Triggered by a request to a URL. Responds after the script has finished running.",
        renderSubtitle: () => "Click to view details",
        icon: TbLink,
        color: "gray",
        shade: 800,
        config: ({ trigger }) => {

            const url = SYNC_TRIGGER_URL + trigger.id

            return (
                <Stack spacing="xs">
                    <CopyButton value={url}>
                        {({ copied, copy }) => (
                            <Button
                                variant="subtle"
                                leftIcon={copied ? <TbCheck /> : <TbCopy />}
                                onClick={copy}
                            >
                                {copied ? "Copied!" : "Copy URL"}
                            </Button>
                        )}
                    </CopyButton>
                    <pre className="bg-gray-50 dark:bg-dark text-xs rounded-sm whitespace-pre-wrap break-all font-mono p-xs">
                        {url}
                    </pre>
                </Stack>
            )
        },
    },

    [TRIGGER_TYPE.GMAIL_EMAIL_RECEIVED]: {
        name: "Gmail Email Received",
        whenName: "When an email is received",
        description: "Triggered when an email is received in a Gmail inbox.",
        renderSubtitle: () => "Click to view details",
        icon: TbBrandGmail,
        color: "red",
        shade: 400,
        outputs: {
            messageId: {
                label: "Message ID",
                type: DataType.STRING,
            },
            senderName: {
                label: "Sender Name",
                type: DataType.STRING,
            },
            senderEmailAddress: {
                label: "Sender Email Address",
                type: DataType.STRING,
            },
            subject: {
                label: "Subject",
                type: DataType.STRING,
            },
            date: {
                label: "Date",
                type: DataType.DATE,
            },
            plainText: {
                label: "Plain Text",
                type: DataType.LONG_STRING,
            },
            simpleText: {
                label: "Simple Text",
                type: DataType.LONG_STRING,
            },
            html: {
                label: "HTML",
                type: DataType.LONG_STRING,
            },
            recipientName: {
                label: "Recipient Name",
                type: DataType.STRING,
            },
            recipientEmailAddress: {
                label: "Recipient Email Address",
                type: DataType.STRING,
            },
        },
    }
}