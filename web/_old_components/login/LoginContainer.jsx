import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react"
import Center from "../layout/Center"
import siteInfo from "@web/site-info.json"


export default function LoginContainer({ children }) {
    return (
        <Center className="h-screen w-screen grid-bg grid-bg-anim">
            <Card>
                <CardHeader className="flex gap-unit-md px-10">
                    <img src="/logo.svg" alt="WorkflowDog logo" className="max-h-[2.5em]" />
                    <div>
                        <h1 className="text-2xl font-bold">
                            {siteInfo.name}
                        </h1>
                        <p className="text-small text-default-500">
                            The only true visual automation builder
                        </p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="flex flex-col items-stretch gap-unit-md px-unit-xl py-8">
                    {children}
                </CardBody>
            </Card>
        </Center>
    )
}
