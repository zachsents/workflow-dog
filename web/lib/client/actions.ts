import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { produce } from "immer"
import _ from "lodash"
import { toast } from "sonner"
import { useQueryStoreApi } from "../queries/store"


interface UseActionOptions {
    showLoadingToast?: boolean
    successToast?: React.ReactNode | ((data: void) => React.ReactNode)
    showErrorToast?: boolean
    invalidateKey?: QueryKey
}

export function useAction(action: (...args: any[]) => Promise<any>, options?: UseActionOptions) {
    const store = useQueryStoreApi()
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (args: any[]) => {
            const resultPromise = action(...args)
                .then(result => {
                    if (result?.error)
                        throw result.error

                    if (result?.store) {
                        store.setState(produce((draft: any) => {
                            if (Array.isArray(result.store)) {
                                result.store.forEach((entry: any) => {
                                    _.set(draft, entry.path, entry.value)
                                })
                            }
                            else
                                _.set(draft, result.store.path, result.store.value)
                        }))
                    }

                    if (options?.invalidateKey)
                        queryClient.invalidateQueries({
                            queryKey: options.invalidateKey,
                        })

                    return result
                })

            if (options?.showLoadingToast)
                toast.promise(resultPromise, {
                    loading: "Loading...",
                    success: options?.successToast,
                    error: options?.showErrorToast && (error => error.message || "Error"),
                })
            else {
                if (options?.successToast)
                    resultPromise.then(result => {
                        toast.success(typeof options.successToast === "function"
                            ? options.successToast(result)
                            : options.successToast)
                    })

                if (options?.showErrorToast)
                    resultPromise.catch(error => {
                        toast.error(error.message || "Error")
                    })
            }

            return await resultPromise
        },
    })

    const execute = (...args: any[]) => mutation.mutateAsync(args)

    return [execute, mutation] as const
}
