import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import aws from "astro-sst";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.vestia.dev",
  integrations: [
    starlight({
      title: "Vestia",
      logo: {
        light: "./src/assets/vestia-logo-light-mode.svg",
        dark: "./src/assets/vestia-logo-dark-mode.svg",
        replacesTitle: true,
      },
      social: {
        "x.com": "https://twitter.com/vestia_dev",
        github: "https://github.com/vestia-dev/sdk",
      },
      editLink: {
        baseUrl: "https://github.com/vestia-dev/sdk/edit/main/docs",
      },
      sidebar: [
        {
          label: "Introduction",
          link: "introduction",
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      favicon: "./src/assets/favicon.ico",
    }),
  ],
  output: "server",
  adapter: aws(),
});
