import { type InferSchema, type ResourceMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  filter: z
    .string()
    .optional()
    .describe(
      "SCIM filter expression see 3.4.2.2. Filtering <https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2>"
    ),
};

export const metadata: ResourceMetadata = {
  name: "group-resources",
  title: "Group Resources",
  description: "Group Resources with optional filtering",
};

export default async function handler({ filter }: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiToken = requestHeaders["x-scim-api-key"];
  const baseUrl = requestHeaders["x-scim-base-url"];

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-key");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url");
  }

  const url = new URL(`${baseUrl}/Groups`);

  if (filter) {
    url.searchParams.append("filter", encodeURIComponent(filter));
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return {
    contents: [
      {
        uri: "groups://",
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
