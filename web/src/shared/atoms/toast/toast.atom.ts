import { atom } from "jotai"

export type ToastType = "success" | "error" | "info" | "warning"

export type Toast = {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
  timeoutId?: number
}


export const toastsAtom = atom<Toast[]>([])
