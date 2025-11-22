import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { userResourceSchema } from "../schemas/userResourceSchema";
import { getScimToken } from "../utils/getSCIMApiKey";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "replace-user",
  description: "Replace a user resource",
  annotations: {
    title: "Replace User Resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = {
  userId: z.string().describe("The unique identifier of the user to replace"),
  ...z.object(userResourceSchema).omit({ id: true, meta: true }).shape,
};

export default async function replaceUser(
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

  const { userId, ...userResource } = params;

  const response = await fetch(`${baseUrl}/Users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(userResource),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await readJsonBody(response);

  return {
    content: [
      {
        type: "text",
        text: `User ${userId} replaced successfully`,
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
