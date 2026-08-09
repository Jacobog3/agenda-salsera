export const brand = {
  name: "SomosSalsa",
  domain: "somossalsa.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hola@somossalsa.com",
  instagramHandle: "@somossalsa.app",
  instagramUrl: "https://www.instagram.com/somossalsa.app",
  logoPath: "/images/somossalsa-og.png",
  iconPath: "/icon.png",
  colors: {
    blue: "#0AA9D1",
    red: "#C52F5A",
    green: "#18B57C",
    yellow: "#F4D55F",
    orange: "#FB923C",
    ink: "#10263B"
  }
} as const;
