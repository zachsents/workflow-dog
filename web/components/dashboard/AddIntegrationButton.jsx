import { Autocomplete, AutocompleteItem, Button, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"
import { resolveTailwindColor } from "@web/modules/colors"
import { useForm } from "@web/modules/form"
import { INTEGRATION_INFO } from "@web/modules/integrations"
import { useEffect } from "react"
import { TbArrowRight, TbPlus } from "react-icons/tb"
import { INTEGRATION_AUTH_TYPE } from "shared/integrations"


const integrationServices = Object.entries(INTEGRATION_INFO).map(([id, info]) => ({ ...info, id }))


export default function AddIntegrationButton() {

    const form = useForm({
        initial: {
            service: null,
            apiKey: "",
            user: "",
            pass: "",
        },
        validate: {
            service: val => !val && "Please select a service",
            // TO DO: check if the service is that type, then require it
            // apiKey: val => !val && "Please enter an API key",
            // user: val => !val && "Please enter a username",
            // pass: val => !val && "Please enter a password",
        },
    })

    useEffect(() => {
        form.reset("apiKey")
    }, [form.values.service])

    const onSubmit = form.submit(async (values) => {
        console.log(values)
    })

    return (
        <Popover placement="bottom-end" onClose={form.reset}>
            <PopoverTrigger>
                <Button
                    startContent={<TbPlus />}
                    color="primary"
                // isDisabled={!isReadyToCreate}
                >
                    Connect an Integration
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
                            Connect a new integration
                        </p>

                        <Autocomplete
                            label="Service"
                            defaultItems={integrationServices}
                            {...form.inputProps("service", {
                                required: true,
                                valueKey: "selectedKey",
                                eventKey: "onSelectionChange",
                            })}
                        >
                            {service =>
                                <AutocompleteItem
                                    key={service.id}
                                    description={service.description}
                                    startContent={<service.icon className="text-2xl" style={{
                                        color: resolveTailwindColor(service.color, service.shade),
                                    }} />}
                                >
                                    {service.name}
                                </AutocompleteItem>}
                        </Autocomplete>

                        {INTEGRATION_INFO[form.values.service]?.authType === INTEGRATION_AUTH_TYPE.API_KEY &&
                            <APIKeyInputs
                                form={form}
                            />}

                        {INTEGRATION_INFO[form.values.service]?.authType === INTEGRATION_AUTH_TYPE.USER_PASS &&
                            <UserPassInputs
                                form={form}
                            />}

                        <Button
                            color="primary"
                            endContent={<TbArrowRight />}
                            type="submit"
                            isDisabled={!form.isValid}
                        // isLoading={addWorkflow.isLoading}
                        >
                            Create Workflow
                        </Button>
                    </form>}
            </PopoverContent>
        </Popover>
    )
}


function APIKeyInputs({ form }) {

    return (<>
        <Input
            label="API Key"
            description="This is a long string of characters that you can find in your integration's settings"
            {...form.inputProps("apiKey", { required: true })}
        />
    </>)
}


function UserPassInputs({ form }) {

    return (<>
        <Input
            label="Username"
            {...form.inputProps("user", { required: true })}
        />
        <Input
            label="Password" type="password"
            {...form.inputProps("pass", { required: true })}
        />
    </>)
}