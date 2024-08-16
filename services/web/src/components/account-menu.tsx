import { IconLoader } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { useUser } from "@web/lib/auth"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { signOut } from "supertokens-web-js/recipe/session"


export default function AccountMenu() {

    const { data: user } = useUser()

    const userEmailInitial = user?.emails[0][0].toUpperCase() ?? " "

    const signOutMutation = useMutation({
        mutationFn: () => signOut(),
        onSuccess: () => {
            window.location.href = "/login"
        },
    })

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className="hover:scale-110 transition-transform">
                    <AvatarImage src={user?.metadata?.picture} />
                    <AvatarFallback>
                        {userEmailInitial}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link to="/projects">
                        Projects
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void toast.promise(signOutMutation.mutateAsync(), {
                    loading: "Signing out...",
                })}>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}