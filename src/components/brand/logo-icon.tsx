import Image from "next/image";

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/images/somossalsa-mark.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      priority
      unoptimized
    />
  );
}
