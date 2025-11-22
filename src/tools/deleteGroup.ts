import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimToken } from "../utils/getSCIMApiKey";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";

export const metadata: ToolMetadata = {
  name: "delete-group",
  description: "Delete a group resource",
  annotations: {
    title: "Delete Group Resource",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  groupId: z.string().describe("The unique identifier of the group to delete"),
};

export default async function deleteGroup(
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

  const { groupId } = params;

  const response = await fetch(`${baseUrl}/Groups/${groupId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return {
    content: [
      {
        type: "text",
        text: `Group ${groupId} deleted successfully`,
      },
    ],
  };
}
