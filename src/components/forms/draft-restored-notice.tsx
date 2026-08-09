import { RotateCcw } from "lucide-react";

export function DraftRestoredNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-800">
      <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
