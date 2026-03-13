import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function SpanishPublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <div className="h-20 md:hidden" />
      <BottomNav />
    </div>
  );
}
