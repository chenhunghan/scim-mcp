import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { maskPII, PII_FIELDS } from "../utils/piiMasking";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "get-one-user",
  description: "Retrieve a single SCIM user resource by ID",
  annotations: {
    title: "Get One User Resource",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

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
  piiMasking: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Enable PII masking for sensitive fields (username, emails, phone numbers, addresses). When true, values are partially masked while maintaining readability. Default: true"
    ),
};

export default async function getOneUser(params: InferSchema<typeof schema>) {
  const {
    userId,
    attributes,
    excludedAttributes,
    piiMasking = true,
  } = params;

  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error(
      "Missing required headers: x-scim-api-token or SCIM_API_TOKEN env"
    );
  }

  if (!baseUrl) {
    throw new Error(
      "Missing required headers: x-scim-base-url or SCIM_API_BASE_URL env"
    );
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
    const errorBody = await readJsonBody(response);
    throw new Error(
      `Failed to get user: ${response.status} ${response.statusText}. ${JSON.stringify(errorBody)}`
    );
  }

  let data = await response.json();

  // Apply PII masking if enabled
  if (piiMasking) {
    data = maskPII(data, PII_FIELDS);
  }

  return {
    content: [
      {
        type: "text",
        text: `Get one user successfully`,
      },
    ],
    structuredContent: data ?? undefined,
  };
}
