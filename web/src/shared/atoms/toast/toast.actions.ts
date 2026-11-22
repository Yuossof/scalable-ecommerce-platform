import { atom } from "jotai"
import { v4 as uuidv4 } from "uuid"
import { toastsAtom, Toast } from "./toast.atom"

export const showToastAtom = atom(
    null,
    (get, set, toast: Omit<Toast, "id" | "timeoutId">) => {
        const id = uuidv4()

        const timeoutId = window.setTimeout(() => {
            set(toastsAtom, (prev) => prev.filter((t) => t.id !== id))
        }, toast.duration ?? 4000)

        set(toastsAtom, (prev) => [
            ...prev,
            { ...toast, id, timeoutId },
        ])
    }
)


export const removeToastAtom = atom(
    null,
    (get, set, id: string) => {
        const toast = get(toastsAtom).find((t) => t.id === id)

        if (toast?.timeoutId) {
            clearTimeout(toast.timeoutId)
        }

        set(toastsAtom, (prev) => prev.filter((t) => t.id !== id))
    }
)
