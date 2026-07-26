import { Loader2 } from "lucide-react"

interface Props {
  message?: string
}

export function LoadingState({ message = "Loading..." }: Props) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[#0972D3]" />
      <p className="text-sm text-[#5F6B7A]">{message}</p>
    </div>
  )
}