import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { maskPII, PII_FIELDS } from "../utils/piiMasking";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "get-one-group",
  description: "Retrieve a single SCIM group resource by ID",
  annotations: {
    title: "Get One Group Resource",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

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
  piiMasking: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Enable PII masking for sensitive fields including member information (display names, references). When true, values are partially masked while maintaining readability. Default: true"
    ),
};

export default async function getOneGroup(params: InferSchema<typeof schema>) {
  const {
    groupId,
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
    const errorBody = await readJsonBody(response);
    throw new Error(
      `Failed to get group: ${response.status} ${response.statusText}. ${JSON.stringify(errorBody)}`
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
        text: `Get one group successfully`,
      },
    ],
    structuredContent: data ?? undefined,
  };
}
