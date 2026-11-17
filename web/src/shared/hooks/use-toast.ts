"use client"

import { useSetAtom } from "jotai"
import { showToastAtom } from "@/shared/atoms/toast/toast.actions"

export const useToast = () => {
  const showToast = useSetAtom(showToastAtom)

  const toast = {
    success: (message: string, duration?: number) =>
      showToast({ message, type: "success", duration }),

    error: (message: string, duration?: number) =>
      showToast({ message, type: "error", duration }),

    info: (message: string, duration?: number) =>
      showToast({ message, type: "info", duration }),

    warning: (message: string, duration?: number) =>
      showToast({ message, type: "warning", duration }),
  }

  return toast
}
