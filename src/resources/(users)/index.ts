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
  name: "user-resources",
  title: "User Resources",
  description: "User Resources with optional filtering",
};

export default async function handler({ filter }: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiToken = requestHeaders["x-scim-api-key"];
  const baseUrl = requestHeaders["x-scim-base-url"];

  if (!apiToken) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Missing required headers: x-scim-api-key",
        },
      ],
    };
  }

  if (!baseUrl) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Missing required headers: x-scim-base-url",
        },
      ],
    };
  }

  const url = new URL(`${baseUrl}/Users`);

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
    const errorText = `${response.status} ${
      response.statusText
    } - ${JSON.stringify(await response.json())}`;

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: errorText,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Got user resources`,
      },
    ],
    structuredContent: await response.json(),
  };
}
