import { Autocomplete, AutocompleteItem, Button, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"
import { resolveTailwindColor } from "@web/modules/colors"
import { fire } from "@web/modules/firebase"
import { useForm } from "@web/modules/form"
import { useQueryParam } from "@web/modules/router"
import { TRIGGER_INFO } from "@web/modules/triggers"
import { useAddDocument, useUser } from "@zachsents/fire-query"
import { doc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/router"
import { TbArrowRight, TbPlus } from "react-icons/tb"
import { TEAMS_COLLECTION, WORKFLOWS_COLLECTION } from "shared/firebase"


const triggers = Object.entries(TRIGGER_INFO).map(([id, info]) => ({ ...info, id }))


export default function CreateWorkflowButton() {

    const form = useForm({
        initial: {
            name: "",
            trigger: null,
        },
        validate: {
            name: val => val?.trim().length == 0 && "Please enter a name",
            trigger: val => !val && "Please select a trigger",
        },
    })

    const router = useRouter()
    const [teamId] = useQueryParam("team")
    const { data: user } = useUser()

    const addWorkflow = useAddDocument([WORKFLOWS_COLLECTION])

    const onSubmit = form.submit(async ({ name, trigger }) => {
        const docRef = await addWorkflow.mutateAsync({
            name,
            trigger: { type: trigger },
            team: doc(fire.db, TEAMS_COLLECTION, teamId),
            isEnabled: false,
            creator: user?.uid,
            createdAt: serverTimestamp(),
        })
        await router.push(`/workflow/${docRef.id}`)
    })

    const isReadyToCreate = user && teamId

    return (
        <Popover placement="bottom-end" onClose={form.reset}>
            <PopoverTrigger>
                <Button
                    startContent={<TbPlus />}
                    color="primary"
                    isDisabled={!isReadyToCreate}
                >
                    New Workflow
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[20rem] p-unit-lg">
                {titleProps =>
                    <form
                        className="flex flex-col items-stretch gap-unit-md"
                        onSubmit={onSubmit}
                    >
                        <p
                            className="font-bold text-large"
                            {...titleProps}
                        >
                            Create a new workflow
                        </p>

                        <Input
                            label="Name"
                            placeholder="e.g. Handle customer support tickets"
                            {...form.inputProps("name", { required: true })}
                            autoFocus
                        />

                        <p className="font-medium">
                            Choose how it's triggered
                        </p>

                        <Autocomplete
                            label="Trigger"
                            defaultItems={triggers}
                            {...form.inputProps("trigger", {
                                required: true,
                                valueKey: "selectedKey",
                                eventKey: "onSelectionChange",
                            })}
                        >
                            {trigger =>
                                <AutocompleteItem
                                    key={trigger.id}
                                    description={trigger.whenName}
                                    startContent={<trigger.icon className="text-large" style={{
                                        color: resolveTailwindColor(trigger.color, trigger.shade),
                                    }} />}
                                >
                                    {trigger.name}
                                </AutocompleteItem>}
                        </Autocomplete>

                        <Button
                            color="primary"
                            endContent={<TbArrowRight />}
                            type="submit"
                            isDisabled={!form.isValid}
                            isLoading={addWorkflow.isLoading}
                        >
                            Create Workflow
                        </Button>
                    </form>}
            </PopoverContent>
        </Popover>
    )
}
