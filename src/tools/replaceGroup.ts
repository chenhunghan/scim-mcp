import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { groupResourceSchema } from "../schemas/groupResourceSchema";
import { getScimToken } from "../utils/getSCIMApiKey";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "replace-group",
  description: "Replace a group resource",
  annotations: {
    title: "Replace Group Resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  groupId: z.string().describe("The unique identifier of the group to replace"),
  ...z.object(groupResourceSchema).omit({ id: true, meta: true }).shape,
};

export default async function replaceGroup(
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

  const { groupId, ...groupResource } = params;

  const response = await fetch(`${baseUrl}/Groups/${groupId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(groupResource),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await readJsonBody(response);

  return {
    content: [
      {
        type: "text",
        text: `Group ${groupId} replaced successfully`,
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
