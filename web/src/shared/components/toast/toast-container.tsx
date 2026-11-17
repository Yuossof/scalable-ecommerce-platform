"use client"

import { useAtom } from "jotai"
import { toastsAtom } from "@/shared/atoms/toast/toast.atom"
import { ToastItem } from "./toast-item"

const ToastContainer = () => {
  const [toasts] = useAtom(toastsAtom)

  if (!toasts.length) return null

  return (
    <div className="fixed top-6 right-6 z-9999 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export { ToastContainer }
