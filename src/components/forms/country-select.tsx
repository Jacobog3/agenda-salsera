"use client";

import { useLocale } from "next-intl";
import { COUNTRY_OPTIONS, getCountryName } from "@/lib/locations";
import type { Locale } from "@/types/locale";

type CountrySelectProps = {
  value: string;
  onChange: (countryCode: string) => void;
  id?: string;
  required?: boolean;
  allowedCountryCodes?: readonly string[];
};

function CountrySelectField({
  value,
  onChange,
  id,
  required = true,
  allowedCountryCodes,
  locale
}: CountrySelectProps & { locale: Locale }) {
  const placeholder = locale === "es" ? "Selecciona un país" : "Select a country";

  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:text-sm"
    >
      <option value="" disabled={required}>
        {placeholder}
      </option>
      {COUNTRY_OPTIONS
        .filter(({ code }) => !allowedCountryCodes || allowedCountryCodes.includes(code))
        .map(({ code }) => (
        <option key={code} value={code}>
          {getCountryName(code, locale)}
        </option>
        ))}
    </select>
  );
}

export function CountrySelect(props: CountrySelectProps) {
  const locale = useLocale() as Locale;
  return <CountrySelectField {...props} locale={locale} />;
}

export function AdminCountrySelect(props: CountrySelectProps) {
  return <CountrySelectField {...props} locale="es" />;
}
