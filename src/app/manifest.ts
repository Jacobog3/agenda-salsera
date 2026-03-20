import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ExploraGuate",
    short_name: "ExploraGuate",
    description: "Eventos, spots y academias de salsa y bachata en Guatemala.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6fafc",
    theme_color: "#1497d4",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
