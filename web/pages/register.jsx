import LoginContainer from "@web/components/login/LoginContainer"
import LoginForm from "@web/components/login/LoginForm"


export default function RegisterPage() {
    return (
        <LoginContainer>
            <div className="flex flex-row gap-10 items-center">
                <div className="max-w-md mb-8 flex flex-col gap-2">
                    <h1 className="text-4xl font-bold flex-1">
                        Get ready to build something amazing
                    </h1>
                    <p className="text-xl">
                        and save a ton of time doing it.
                    </p>
                </div>
                <div className="flex flex-col gap-unit-md items-stretch w-[20rem]">
                    <LoginForm register />
                </div>
            </div>
        </LoginContainer>
    )
}
