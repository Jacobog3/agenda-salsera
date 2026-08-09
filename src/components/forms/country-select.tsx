"use client";

import { useLocale } from "next-intl";
import { COUNTRY_OPTIONS, getCountryName } from "@/lib/locations";
import type { Locale } from "@/types/locale";

export function CountrySelect({
  value,
  onChange,
  id,
  required = true
}: {
  value: string;
  onChange: (countryCode: string) => void;
  id?: string;
  required?: boolean;
}) {
  const locale = useLocale() as Locale;
  const placeholder = locale === "es" ? "Selecciona un país" : "Select a country";

  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
    >
      <option value="" disabled={required}>
        {placeholder}
      </option>
      {COUNTRY_OPTIONS.map(({ code }) => (
        <option key={code} value={code}>
          {getCountryName(code, locale)}
        </option>
      ))}
    </select>
  );
}
