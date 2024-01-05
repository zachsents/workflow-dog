import { GoogleAuthProvider, signOut as _signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { fire } from "."
import { useUser } from "@zachsents/fire-query"


export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(fire.auth, provider)
        .then(result => {
            console.debug("Logged in with Google popup as", result.user.email)
            return result.user
        })
}


export async function signInWithEmail(email, password) {
    return signInWithEmailAndPassword(fire.auth, email, password)
        .then(userCredential => {
            console.debug("Logged in with email as", userCredential.user.email)
            return userCredential.user
        })
}

export async function createUserWithEmail(email, password) {
    return createUserWithEmailAndPassword(fire.auth, email, password)
        .then(userCredential => {
            console.debug("Created account and logged in with email as", userCredential.user.email)
            return userCredential.user
        })
}


export async function signOut() {
    await _signOut(fire.auth)
    console.debug("Logged out")
}


export function useMustBeSignedIn(redirect = "/login") {
    const router = useRouter()
    const { data: user } = useUser()
    const hasEmitted = user !== undefined

    useEffect(() => {
        if (hasEmitted && !user && redirect)
            router.push(redirect)
    }, [user?.uid, hasEmitted, redirect])

    return user
}


export function useMustNotBeSignedIn(redirect = "/") {
    const router = useRouter()
    const { data: user } = useUser()
    const hasEmitted = user !== undefined

    useEffect(() => {
        if (hasEmitted && user && redirect)
            router.push(redirect)
    }, [user?.uid, hasEmitted, redirect])
}
