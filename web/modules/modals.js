import { Button, ModalBody, ModalContent, ModalFooter, ModalHeader, Modal as UIModal } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { produce } from "immer"
import { useRef } from "react"
import { createContext, useContext, useState } from "react"


const ModalsContext = createContext()


export function ModalsProvider({ children }) {

    /** @type {[ModalObject[], function]} */
    const [modalStack, setModalStack] = useState([])

    /** @type {OpenModalFunction} */
    const openModal = options => {
        const id = Math.random().toString(36).slice(2, 12)

        if (typeof options === "function")
            options = options(id)

        setModalStack(prev => [...prev, {
            id,
            createdAt: new Date(),
            options,
            isClosing: false,
        }])
    }

    const closeModal = id => {
        setModalStack(produce(modalStack, draft => {
            draft.find(modal => modal.id === id).isClosing = true
        }))
    }

    const closeModalRef = useRef()
    closeModalRef.current = closeModal

    const finishAnimation = id => {
        if (modalStack.find(modal => modal.id === id).isClosing) {
            setModalStack(prev => prev.filter(modal => modal.id !== id))
        }
    }

    /** @type {OpenConfirmationModalFunction} */
    const openConfirmationModal = options => {
        openModal(id => {
            if (typeof options === "function")
                options = options(id)

            return {
                header: options.header,
                body: options.body,
                modalProps: options.modalProps,
                footer: <ConfirmationModalFooter
                    confirmButtonProps={options.confirmButtonProps}
                    cancelButtonProps={options.cancelButtonProps}
                    confirmButtonContent={options.confirmButtonContent}
                    cancelButtonContent={options.cancelButtonContent}
                    onConfirm={options.onConfirm}
                    onCancel={options.onCancel}
                    onClose={() => closeModalRef.current(id)}
                />,
                withCloseButton: false,
            }
        })
    }

    return (
        <ModalsContext.Provider value={{
            open: openModal,
            close: closeModal,
            confirm: openConfirmationModal,
        }}>
            {children}

            {modalStack.map((modal, i) =>
                <Modal
                    {...modal}
                    isOpen={i === modalStack.length - 1 && !modal.isClosing}
                    close={() => closeModal(modal.id)}
                    onAnimationComplete={def => {
                        if (def === "exit")
                            finishAnimation(modal.id)
                    }}
                    key={modal.id}
                />
            )}
        </ModalsContext.Provider>
    )
}


/**
 * @param {ModalObject & { isOpen: boolean, close: () => void, onAnimationComplete }} props
 */
function Modal({ options: { header, body, footer, modalProps, withCloseButton = true }, isOpen, close, onAnimationComplete }) {

    return (
        <UIModal
            isOpen={isOpen}
            onClose={close}
            motionProps={{
                onAnimationComplete,
            }}
            {...modalProps}
        >
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="font-medium">
                            {header}
                        </ModalHeader>
                        <ModalBody className="flex flex-col gap-unit-md">
                            {body}
                        </ModalBody>
                        {(footer || withCloseButton) &&
                            <ModalFooter>
                                {footer}
                                {withCloseButton &&
                                    <Button variant="light" onPress={onClose}>
                                        Close
                                    </Button>}
                            </ModalFooter>}
                    </>
                )}
            </ModalContent>
        </UIModal>
    )
}


function ConfirmationModalFooter({ onConfirm, onCancel, confirmButtonProps, cancelButtonProps, confirmButtonContent = "Confirm", cancelButtonContent = "Cancel", onClose }) {

    const confirmMutation = useMutation({
        mutationFn: () => onConfirm?.(),
        onSuccess: () => onClose(),
    })

    const cancelMutation = useMutation({
        mutationFn: () => onCancel?.(),
        onSuccess: () => onClose(),
    })

    return <>
        <Button
            variant="light"
            {...cancelButtonProps}
            onPress={() => cancelMutation.mutate()}
            isLoading={cancelMutation.isPending}
        >
            {cancelButtonContent}
        </Button>
        <Button
            color="primary"
            {...confirmButtonProps}
            onPress={() => confirmMutation.mutate()}
            isLoading={confirmMutation.isPending}
        >
            {confirmButtonContent}
        </Button>
    </>
}


/**
 * @return {{ 
 *   open: OpenModalFunction, 
 *   close: (modalId: string) => void, 
 *   confirm: OpenConfirmationModalFunction
 * }} 
 */
export function useModals() {
    return useContext(ModalsContext)
}


/**
 * @typedef {(options: ModalOptions | ((id: string) => ModalOptions)) => void} OpenModalFunction
 */


/**
 * @typedef {(options: ConfirmationModalOptions | ((id: string) => ConfirmationModalOptions)) => void} OpenConfirmationModalFunction
 */


/**
 * @typedef {object} ModalObject
 * @property {string} id
 * @property {Date} createdAt
 * @property {ModalOptions} options
 * @property {boolean} isClosing
 */


/**
 * @typedef {object} ModalOptions
 * @property {JSX.Element} header
 * @property {JSX.Element} body
 * @property {JSX.Element} footer
 * @property {boolean} withCloseButton
 * @property {import("@nextui-org/react").ModalProps} modalProps
 */


/**
 * @typedef {object} ConfirmationModalOptions
 * @property {JSX.Element} header
 * @property {JSX.Element} body
 * @property {() => void} onConfirm
 * @property {() => void} onCancel
 * @property {import("@nextui-org/react").ButtonProps} confirmButtonProps
 * @property {import("@nextui-org/react").ButtonProps} cancelButtonProps
 * @property {JSX.Element} confirmButtonContent
 * @property {JSX.Element} cancelButtonContent
 * @property {import("@nextui-org/react").ModalProps} modalProps
 */