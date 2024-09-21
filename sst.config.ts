/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vestia-sdk",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  console: {
    autodeploy: {
      target(event) {
        if (
          event.type === "branch" &&
          event.action === "pushed" &&
          event.branch === "main"
        ) {
          return {
            stage: "production",
          };
        }
      },
    },
  },
  async run() {
    const secrets = {
      PosthogAPIKey: new sst.Secret("PosthogAPIKey"),
    };

    new sst.aws.Astro("VestiaDocs", {
      path: "docs",
      environment: {
        POSTHOG_API_KEY: secrets.PosthogAPIKey.value,
      },
      domain: {
        name:
          $app.stage === "production"
            ? "docs.vestia.dev"
            : `${$app.stage}-docs.vestia.dev`,
        dns: sst.cloudflare.dns({ zone: "96bbb4a5010bc2d18741ffc98a86d900" }),
      },
    });

    new sst.aws.Remix("VestiaDemo", {
      path: "demo",
      environment: {
        VITE_POSTHOG_API_KEY: secrets.PosthogAPIKey.value,
      },
      domain: {
        name:
          $app.stage === "production"
            ? "demo.vestia.dev"
            : `${$app.stage}-demo.vestia.dev`,
        dns: sst.cloudflare.dns({ zone: "96bbb4a5010bc2d18741ffc98a86d900" }),
      },
    });

    new sst.x.DevCommand("ReactPackage", {
      dev: {
        autostart: true,
        command: "npm run dev",
        directory: "packages/react",
      },
    });
  },
});
