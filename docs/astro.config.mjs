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
      head: [
        {
          tag: "script",
          content: `  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(
    '${process.env.POSTHOG_API_KEY}',
    {
      api_host:'https://eu.i.posthog.com',
      person_profiles: 'identified_only'
    }
  )`,
        },
      ],
    }),
  ],
  output: "server",
  adapter: aws(),
});
