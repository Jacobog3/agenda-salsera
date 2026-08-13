import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SomosSalsa",
    short_name: "SomosSalsa",
    description: "Encuentra eventos, festivales, academias, artistas y lugares para bailar.",
    start_url: "/gt",
    scope: "/gt/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0AA9D1",
    icons: [
      {
        src: "/icon.png?v=somossalsa-1",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon.png?v=somossalsa-1",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
