import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SuperTokens from "supertokens-web-js"
import Session from "supertokens-web-js/recipe/session"
import ThirdParty, { getAuthorisationURLWithQueryParamsAndSetState, signInAndUp } from "supertokens-web-js/recipe/thirdparty"
import { trpc } from "./trpc"


SuperTokens.init({
    appInfo: {
        appName: "WorkflowDog",
        apiDomain: import.meta.env.VITE_APP_ORIGIN,
        apiBasePath: "/api/auth",
    },
    recipeList: [
        Session.init(),
        ThirdParty.init(),
    ],
})


export async function isLoggedIn() {
    return await Session.doesSessionExist()
}


export function useIsLoggedIn() {
    return useQuery({
        queryKey: ["isLoggedIn"],
        queryFn: isLoggedIn,
    })
}


export function useMustBeLoggedIn() {
    const navigate = useNavigate()
    const { data: isLoggedIn } = useIsLoggedIn()
    useEffect(() => {
        if (isLoggedIn === false)
            navigate("/login")
    }, [isLoggedIn === false])
}


export function useUserId() {
    return trpc.auth.userId.useQuery()
}

export function useUser() {
    return trpc.auth.user.useQuery()
}


export async function getGoogleSignInUrl() {
    return await getAuthorisationURLWithQueryParamsAndSetState({
        thirdPartyId: "google",
        frontendRedirectURI: `${import.meta.env.VITE_APP_ORIGIN}/login/callback`,
    })
}


export async function handleGoogleCallback() {
    const res = await signInAndUp()

    switch (res.status) {
        case "OK":
            if (res.createdNewRecipeUser && res.user.loginMethods.length === 1) {
                // sign up successful
            } else {
                // sign in successful
            }
            return res.user
        case "SIGN_IN_UP_NOT_ALLOWED":
            console.debug(res)
            throw new Error(res.reason)
        case "NO_EMAIL_GIVEN_BY_PROVIDER":
            console.debug(res)
            throw new Error("No email provided by social login. Please use another form of login")
    }

    // can check this if needed in catch block: err.isSuperTokensGeneralError
}