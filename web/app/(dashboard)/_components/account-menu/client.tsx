"use client"

import { useMutation } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { TbLoader3 } from "react-icons/tb"
import { toast } from "sonner"

export default function AccountMenuClient({
    photoSrc,
    fallback,
}: {
    photoSrc: string
    fallback: string
}) {
    const { mutate: handleSignOut, isPending, isSuccess } = useMutation({
        mutationFn: () => {
            const signingOut = signOut({ callbackUrl: "/login" })
            toast.promise(signingOut, {
                loading: "Signing out...",
            })
            return signingOut
        },
    })

    const isSigningOut = isPending || isSuccess

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className="hover:scale-110 transition-transform">
                    {photoSrc &&
                        <AvatarImage src={isSigningOut ? "" : photoSrc} />}
                    <AvatarFallback>
                        {isSigningOut ? <TbLoader3 className="animate-spin" /> : fallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem asChild>
                    <Link href="/projects">
                        Projects
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => void handleSignOut()}
                >
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}