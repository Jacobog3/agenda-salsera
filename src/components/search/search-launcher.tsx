import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function SearchLauncher({
  label,
  compactLabel
}: {
  label: string;
  compactLabel: string;
}) {
  return (
    <>
      <Link
        href="/search"
        aria-label={compactLabel}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-brand-200 hover:text-brand-600 md:hidden"
      >
        <Search className="h-4 w-4" />
      </Link>

      <Link
        href="/search"
        className="hidden min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-brand-200 hover:text-foreground md:inline-flex"
      >
        <Search className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </>
  );
}
