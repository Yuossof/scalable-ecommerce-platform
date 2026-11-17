import { Toast } from "@/shared/atoms/toast/toast.atom"
import { Check } from "lucide-react"

const styles = {
    success: "bg-gray-50",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-500 text-black",
}

export const ToastItem = ({ toast }: { toast: Toast }) => {
    return (
        <div
            className={`min-w-[260px]  animate-toast-in rounded-xs px-4 py-2.5 shadow-md text-black border border-gray-200 flex items-center gap-5
      animate-slide-in ${styles[toast.type]}`}
        >
            {toast.type === "success" && (
                <div className="p-0.5 text-white bg-black">
                    <Check size={18}/>
                </div>
            )}
            <span className="text-md uppercase">
                {toast.message}
            </span>
        </div>
    )
}
