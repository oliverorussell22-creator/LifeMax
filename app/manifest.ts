import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeMax",
    short_name: "LifeMax",
    description: "A local-first wellness reflection app shell for daily check-ins and capture.",
    start_url: "/",
    display: "standalone",
    background_color: "#eff7f1",
    theme_color: "#1d6b4f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
