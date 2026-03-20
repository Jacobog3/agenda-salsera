import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CookieConsent } from "@/components/shared/cookie-consent";

export default function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <div className="bottom-nav-spacer md:hidden" />
      <BottomNav />
      <CookieConsent />
    </div>
  );
}
