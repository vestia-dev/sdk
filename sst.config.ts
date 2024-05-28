/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vestia-sdk",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const isPersonalStage = $app.stage !== "production" && $app.stage !== "dev";
    if (!isPersonalStage) {
      const oidc = new aws.iam.OpenIdConnectProvider("GithubOidc", {
        clientIdLists: ["sts.amazonaws.com"],
        thumbprintLists: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
        url: `https://token.actions.githubusercontent.com`,
      });
      const organization = "vestia-dev";
      const repository = "sdk";
      const role = new aws.iam.Role("GithubRole", {
        name: `VestiaDocs-${$app.stage}-GithubRole`,
        assumeRolePolicy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Federated: oidc.arn,
              },
              Action: "sts:AssumeRoleWithWebIdentity",
              Condition: {
                StringLike: {
                  "token.actions.githubusercontent.com:sub": `repo:${organization}/${repository}:*`,
                },
              },
            },
          ],
        },
      });
      new aws.iam.RolePolicyAttachment("GithubRolePolicy", {
        role: role.name,
        policyArn: aws.iam.ManagedPolicies.AdministratorAccess,
      });
    }
    new sst.aws.Astro("VestiaDocs", {
      path: "docs",
      domain: {
        name:
          $app.stage === "production"
            ? "docs.vestia.dev"
            : `${$app.stage}-docs.vestia.dev`,
        dns: sst.cloudflare.dns({ zone: "96bbb4a5010bc2d18741ffc98a86d900" }),
      },
    });
  },
});
