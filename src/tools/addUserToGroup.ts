import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "add-user-to-group",
  description: "Add a user to a group",
  annotations: {
    title: "Add User to Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  groupId: z.string().describe("The unique identifier of the group"),
  userId: z.string().describe("The unique identifier of the user to add to the group"),
};

export default async function addUserToGroup(
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

  const { groupId, userId } = params;

  // According to RFC 7644 Section 3.5.2, adding a member to a group
  // requires a PATCH operation with "add" on the "members" attribute
  const patchOperation = {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    Operations: [
      {
        op: "add",
        path: "members",
        value: [
          {
            value: userId,
          },
        ],
      },
    ],
  };

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
        text: `User ${userId} added to group ${groupId} successfully`,
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
