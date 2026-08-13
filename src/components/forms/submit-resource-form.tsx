"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CountrySelect } from "@/components/forms/country-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResourceCategory } from "@/types/resource";
import { DEFAULT_SITE_COUNTRY, getCountrySlugFromPathname, getSiteCountryBySlug, SITE_COUNTRY_CODES } from "@/lib/site-countries";

type Fields = {
  submissionType: "new" | "update" | "report";
  resourceSlug: string;
  name: string;
  category: ResourceCategory;
  description: string;
  city: string;
  countryCode: string;
  instagram: string;
  whatsapp: string;
  website: string;
  relationship: "owner" | "recommendation";
  contactName: string;
  contactEmail: string;
};

const INITIAL_FIELDS: Fields = {
  submissionType: "new",
  resourceSlug: "",
  name: "",
  category: "dancewear",
  description: "",
  city: "",
  countryCode: DEFAULT_SITE_COUNTRY.code,
  instagram: "",
  whatsapp: "",
  website: "",
  relationship: "recommendation",
  contactName: "",
  contactEmail: ""
};

export function SubmitResourceForm({
  resourceSlug = "",
  resourceName = "",
  resourceCategory = "dancewear",
  correctionMode = false,
  resourceOptions = []
}: {
  resourceSlug?: string;
  resourceName?: string;
  resourceCategory?: ResourceCategory;
  correctionMode?: boolean;
  resourceOptions?: Array<{ slug: string; name: string; category: ResourceCategory }>;
}) {
  const t = useTranslations("submitResource");
  const f = useTranslations("forms");
  const pathname = usePathname();
  const siteCountry = getSiteCountryBySlug(getCountrySlugFromPathname(pathname) ?? "") ?? DEFAULT_SITE_COUNTRY;
  const isExistingResource = correctionMode || Boolean(resourceSlug);
  const [fields, setFields] = useState<Fields>(() => ({
    ...INITIAL_FIELDS,
    submissionType: isExistingResource ? "update" : "new",
    resourceSlug,
    name: resourceName,
    category: resourceCategory,
    countryCode: siteCountry.code
  }));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function setField<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !fields.name.trim()
      || !fields.countryCode
      || (isExistingResource && !fields.resourceSlug)
      || (fields.submissionType === "new" && !fields.instagram.trim() && !fields.whatsapp.trim() && !fields.website.trim())
      || (fields.submissionType !== "new" && !fields.description.trim())
    ) {
      setError(isExistingResource ? t("correctionRequiredError") : t("requiredError"));
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/resource-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      if (!response.ok) throw new Error(t("submitError"));
      setFields({ ...INITIAL_FIELDS, countryCode: siteCountry.code });
      setStatus("success");
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : t("submitError"));
    }
  }

  if (status === "success") {
    return (
      <div className="space-y-5 py-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-salsaGreen-500" />
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">{t("successTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("successDescription")}</p>
        </div>
        <Button asChild>
          <Link href="/resources">{t("backToResources")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {isExistingResource ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("resourceToCorrect")} required>
            <select
              value={fields.resourceSlug}
              onChange={(event) => {
                const option = resourceOptions.find((resource) => resource.slug === event.target.value);
                setFields((current) => ({
                  ...current,
                  resourceSlug: option?.slug ?? "",
                  name: option?.name ?? "",
                  category: option?.category ?? "other"
                }));
                setError("");
              }}
              disabled={Boolean(resourceSlug)}
              className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-surface-soft md:text-sm"
            >
              <option value="">{t("selectResource")}</option>
              {resourceOptions.map((resource) => (
                <option key={resource.slug} value={resource.slug}>{resource.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t("requestType")} required>
            <select
              value={fields.submissionType}
              onChange={(event) => setField("submissionType", event.target.value as "update" | "report")}
              className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:text-sm"
            >
              <option value="update">{t("requestUpdate")}</option>
              <option value="report">{t("requestReport")}</option>
            </select>
          </Field>
        </div>
      ) : null}

      {!isExistingResource ? <Field label={t("name")} required>
        <Input value={fields.name} onChange={(event) => setField("name", event.target.value)} />
      </Field> : null}

      {!isExistingResource ? <Field label={t("category")} required>
        <select
          value={fields.category}
          onChange={(event) => setField("category", event.target.value as ResourceCategory)}
          className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:text-sm"
        >
          <option value="dancewear">{t("categories.dancewear")}</option>
          <option value="dj">{t("categories.dj")}</option>
          <option value="photography">{t("categories.photography")}</option>
          <option value="other">{t("categories.other")}</option>
        </select>
      </Field> : null}

      <Field label={isExistingResource ? t("changeDescription") : t("description")} required={isExistingResource}>
        <Textarea
          rows={4}
          value={fields.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder={isExistingResource ? t("changeDescriptionPlaceholder") : t("descriptionPlaceholder")}
        />
      </Field>

      {!isExistingResource ? <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("city")}>
          <Input value={fields.city} onChange={(event) => setField("city", event.target.value)} />
        </Field>
        <Field label={t("country")} required>
          <CountrySelect value={fields.countryCode} onChange={(value) => setField("countryCode", value)} allowedCountryCodes={SITE_COUNTRY_CODES} />
        </Field>
      </div> : null}

      <div className="rounded-2xl bg-surface-soft/70 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">{isExistingResource ? t("evidenceSection") : t("contactSection")}</p>
        <div className="space-y-4">
          <Field label="Instagram">
            <Input value={fields.instagram} onChange={(event) => setField("instagram", event.target.value)} placeholder="@perfil" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp">
              <Input value={fields.whatsapp} onChange={(event) => setField("whatsapp", event.target.value)} />
            </Field>
            <Field label={t("website")}>
              <Input value={fields.website} onChange={(event) => setField("website", event.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">{isExistingResource ? t("evidenceHint") : t("contactHint")}</p>
        </div>
      </div>

      {!isExistingResource ? <Field label={t("relationship")} required>
        <select
          value={fields.relationship}
          onChange={(event) => setField("relationship", event.target.value as Fields["relationship"])}
          className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:text-sm"
        >
          <option value="recommendation">{t("relationshipRecommendation")}</option>
          <option value="owner">{t("relationshipOwner")}</option>
        </select>
      </Field> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("contactName")}>
          <Input value={fields.contactName} onChange={(event) => setField("contactName", event.target.value)} />
        </Field>
        <Field label={t("contactEmail")}>
          <Input type="email" value={fields.contactEmail} onChange={(event) => setField("contactEmail", event.target.value)} />
        </Field>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

      <p className="text-xs leading-5 text-muted-foreground">
        {t("privacyNotice")} <Link href="/legal/privacy" className="font-semibold text-brand-700 hover:underline">{f("privacyLink")}</Link>.
      </p>

      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {status === "submitting" ? t("submitting") : isExistingResource ? t("submitChange") : t("submit")}
      </Button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}{required ? " *" : ""}</Label>
      {children}
    </div>
  );
}
