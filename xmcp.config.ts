import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  paths: {
    tools: "./src/tools",
    prompts: false,
    resources: "./src/resources",
  },
  experimental: {
    oauth: {
      baseUrl: "https://dev-k1hztrek6c61zbsx.eu.auth0.com",
      endpoints: {
        authorizationUrl: "https://dev-k1hztrek6c61zbsx.eu.auth0.com/authorize",
        tokenUrl: "https://dev-k1hztrek6c61zbsx.eu.auth0.com/oauth/token",
        registerUrl: "https://dev-k1hztrek6c61zbsx.eu.auth0.com/oidc/register",
      },
      issuerUrl: "https://dev-k1hztrek6c61zbsx.eu.auth0.com",
      defaultScopes: ["openid", "profile", "email"],
      pathPrefix: "/oauth2",
    },
  },
};

export default config;
