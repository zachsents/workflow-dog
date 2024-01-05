import { useCollectionQuery, useUser } from "@zachsents/fire-query"
import { where } from "firebase/firestore"
import { useMemo } from "react"
import { TEAMS_COLLECTION } from "shared/firebase"


export function useTeamsForUser(userId) {

    const { data: user } = useUser()
    userId ??= user?.uid

    const { data: editingTeams } = useCollectionQuery([TEAMS_COLLECTION], [
        userId && where("editors", "array-contains", userId)
    ])

    const { data: viewingTeams } = useCollectionQuery([TEAMS_COLLECTION], [
        userId && where("viewers", "array-contains", userId)
    ])

    return useMemo(() => editingTeams && viewingTeams && [
        ...editingTeams?.map(team => ({ ...team, role: "editor" })),
        ...viewingTeams?.map(team => ({ ...team, role: "viewer" }))
    ], [editingTeams, viewingTeams])
}
