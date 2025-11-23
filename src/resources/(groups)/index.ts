import { type InferSchema, type ResourceMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../../utils/getSCIMBaseUrl";
import { getScimToken } from "../../utils/getSCIMToken";
import { maskPII, PII_FIELDS } from "../../utils/piiMasking";

export const schema = {
  filter: z
    .string()
    .optional()
    .describe(
      "SCIM filter expression see 3.4.2.2. Filtering <https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2>"
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
  piiMasking: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Enable PII masking for sensitive fields including member information (username, emails, phone numbers, display names). When true, values are partially masked while maintaining readability. Default: true"
    ),
};

export const metadata: ResourceMetadata = {
  name: "group-resources",
  title: "Group Resources",
  description: "Group Resources with optional filtering and pagination",
};

export default async function handler({
  filter,
  startIndex,
  count,
  piiMasking = true,
}: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-token or SCIM_API_TOKEN env");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url or SCIM_API_BASE_URL env");
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

  let data = await response.json();

  // Apply PII masking if enabled
  if (piiMasking) {
    data = maskPII(data, PII_FIELDS);
  }

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
