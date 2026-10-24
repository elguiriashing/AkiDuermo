import { headers } from "next/headers";
import { stayLocale } from "@/lib/akiduermo-i18n";
import { StayAppShell } from "@/components/StayAppShell";
import { SharedAccount } from "@/components/SharedAccount";
export const metadata = {
  title: "Your account · AkiDuermo",
  robots: { index: false, follow: false },
};
export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  return (
    <StayAppShell locale={locale}>
      <SharedAccount
        locale={locale}
        product="AkiDuermo"
        home={`/account?lang=${locale}`}
        membership={`/membership?lang=${locale}`}
        path="/settings"
        query={await searchParams}
      />
    </StayAppShell>
  );
}
