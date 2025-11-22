import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { patchOperationSchema } from "../schemas/patchOperationSchema";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "patch-group",
  description: "Partially update a group resource",
  annotations: {
    title: "Patch Group Resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  groupId: z.string().describe("The unique identifier of the group to patch"),
  ...patchOperationSchema,
};

export default async function patchGroup(
  params: InferSchema<typeof schema>
) {
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-key");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url");
  }

  const { groupId, ...patchOperation } = params;

  const response = await fetch(`${baseUrl}/Groups/${groupId}`, {
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
        text: `Group ${groupId} patched successfully`,
      },
      {
        type: "resource_link",
        name: "Group resource",
        uri: `groups://${groupId}`,
      },
    ],
    structuredContent: data ?? undefined,
  };
}
