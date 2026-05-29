export default function manifest() {
  return {
    name: "Rangayan Creations",
    short_name: "Rangayan",
    description: "Installation & Business Management",
    start_url: "/installations",
    display: "standalone",
    background_color: "#1A1C2E",
    theme_color: "#6C5CE7",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "131x109",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
