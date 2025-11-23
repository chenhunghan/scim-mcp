import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { maskPII, PII_FIELDS } from "../utils/piiMasking";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "get-groups",
  description: "List/search SCIM group resources with optional filtering and pagination",
  annotations: {
    title: "Get Groups",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  filter: z
    .string()
    .optional()
    .describe(
      "SCIM filter expression per RFC 7644 Section 3.4.2.2. Examples: 'displayName eq \"Administrators\"', 'members.value eq \"user-id\"'"
    ),
  startIndex: z
    .number()
    .optional()
    .describe(
      "The 1-based index of the first query result. A value less than 1 SHALL be interpreted as 1."
    ),
  count: z
    .number()
    .optional()
    .describe(
      "Non-negative integer. Specifies the desired maximum number of query results per page."
    ),
  sortBy: z
    .string()
    .optional()
    .describe(
      "Attribute path to sort results by (e.g., 'displayName', 'meta.created')"
    ),
  sortOrder: z
    .enum(["ascending", "descending"])
    .optional()
    .describe("Sort order for results. Default: ascending"),
  attributes: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of attribute names to return (e.g., 'displayName,members')"
    ),
  excludedAttributes: z
    .string()
    .optional()
    .describe("Comma-separated list of attribute names to exclude"),
  piiMasking: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Enable PII masking for sensitive fields including member information (display names, references). When true, values are partially masked while maintaining readability. Default: true"
    ),
};

export default async function getGroups(params: InferSchema<typeof schema>) {
  const {
    filter,
    startIndex,
    count,
    sortBy,
    sortOrder,
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

  const url = new URL(`${baseUrl}/Groups`);

  if (filter) {
    url.searchParams.append("filter", filter);
  }
  if (startIndex !== undefined) {
    url.searchParams.append("startIndex", startIndex.toString());
  }
  if (count !== undefined) {
    url.searchParams.append("count", count.toString());
  }
  if (sortBy) {
    url.searchParams.append("sortBy", sortBy);
  }
  if (sortOrder) {
    url.searchParams.append("sortOrder", sortOrder);
  }
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
      `Failed to get groups: ${response.status} ${response.statusText}. ${JSON.stringify(errorBody)}`
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
        text: `Get groups successfully`,
      },
      {
        type: "resource_link",
        name: "Group resources",
        uri: "groups://",
      },
    ],
    structuredContent: data ?? undefined,
  };
}
