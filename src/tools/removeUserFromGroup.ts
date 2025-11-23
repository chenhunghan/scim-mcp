import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
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
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-token or SCIM_API_TOKEN env");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url or SCIM_API_BASE_URL env");
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
    ],
    structuredContent: data ?? undefined,
  };
}
