import { type InferSchema, type ResourceMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  userId: z.string().describe("The ID of the user"),
  attributes: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of attribute names to return. Per RFC 7644 Section 3.9, only specified attributes will be returned (e.g., 'userName,emails')"
    ),
  excludedAttributes: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of attribute names to exclude from the response. Per RFC 7644 Section 3.9"
    ),
};

export const metadata: ResourceMetadata = {
  name: "user-resource",
  title: "User Resource",
  description: "User Resource by ID",
};

export default async function handler({
  userId,
  attributes,
  excludedAttributes,
}: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiToken = requestHeaders["x-scim-api-key"];
  const baseUrl = requestHeaders["x-scim-base-url"];

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-key");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url");
  }

  const url = new URL(`${baseUrl}/Users/${userId}`);

  if (attributes) {
    url.searchParams.append("attributes", attributes);
  }

  if (excludedAttributes) {
    url.searchParams.append("excludedAttributes", excludedAttributes);
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
        uri: `users://${userId}`,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
