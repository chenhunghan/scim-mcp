import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { patchOperationSchema } from "../schemas/patchOperationSchema";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "patch-user",
  description: "Partially update a user resource",
  annotations: {
    title: "Patch User Resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  userId: z.string().describe("The unique identifier of the user to patch"),
  ...patchOperationSchema,
};

export default async function patchUser(
  params: InferSchema<typeof schema>
) {
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-token or SCIM_API_TOKEN env");
  }

  if (!baseUrl) {
     throw new Error("Missing required headers: x-scim-base-url or SCIM_API_BASE_URL env");
  }

  const { userId, ...patchOperation } = params;

  const response = await fetch(`${baseUrl}/Users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(patchOperation),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await readJsonBody(response);

  return {
    content: [
      {
        type: "text",
        text: `User ${userId} patched successfully`,
      },
      {
        type: "resource_link",
        name: "User resource",
        uri: `users://${userId}`,
      },
    ],
    structuredContent: data ?? undefined,
  };
}
