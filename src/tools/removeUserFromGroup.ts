import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "remove-user-from-group",
  description: "Remove a user from a group",
  annotations: {
    title: "Remove User from Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  groupId: z.string().describe("The unique identifier of the group"),
  userId: z.string().describe("The unique identifier of the user to remove from the group"),
};

export default async function removeUserFromGroup(
  params: InferSchema<typeof schema>
) {
  const requestHeaders = headers();
  const apiToken = requestHeaders["x-scim-api-key"];
  const baseUrl = requestHeaders["x-scim-base-url"];

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-key");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url");
  }

  const { groupId, userId } = params;

  // According to Azure AD documentation and RFC 7644 Section 3.5.2,
  // Azure AD sends remove operations with a value array containing the member to remove
  // Reference: https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups#update-group-remove-members
  const patchOperation = {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
    Operations: [
      {
        op: "Remove",
        path: "members",
        value: [
          {
            $ref: null,
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
        text: `User ${userId} removed from group ${groupId} successfully`,
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
