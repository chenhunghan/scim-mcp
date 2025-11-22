import { type InferSchema, type ResourceMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../../../utils/getSCIMBaseUrl";
import { getScimToken } from "../../../utils/getSCIMToken";

export const schema = {
  groupId: z.string().describe("The ID of the group"),
  attributes: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of attribute names to return. Per RFC 7644 Section 3.9, only specified attributes will be returned (e.g., 'displayName,members')"
    ),
  excludedAttributes: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of attribute names to exclude from the response. Per RFC 7644 Section 3.9"
    ),
};

export const metadata: ResourceMetadata = {
  name: "group-resource",
  title: "Group Resource",
  description: "Group Resource by ID",
};

export default async function handler({
  groupId,
  attributes,
  excludedAttributes,
}: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-token");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url");
  }

  const url = new URL(`${baseUrl}/Groups/${groupId}`);

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
        uri: `groups://${groupId}`,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
