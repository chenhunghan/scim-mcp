import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";

export const metadata: ToolMetadata = {
  name: "delete-user",
  description: "Delete a user resource",
  annotations: {
    title: "Delete User Resource",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  userId: z.string().describe("The unique identifier of the user to delete"),
};

export default async function deleteUser(
  params: InferSchema<typeof schema>
) {
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-token");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url");
  }

  const { userId } = params;

  const response = await fetch(`${baseUrl}/Users/${userId}`, {
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
        text: `User ${userId} deleted successfully`,
      },
    ],
  };
}
