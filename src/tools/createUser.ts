import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { userResourceSchema } from "../schemas/userResourceSchema";
import { getScimBaseUrl } from "../utils/getSCIMBaseUrl";
import { getScimToken } from "../utils/getSCIMToken";
import { readJsonBody } from "../utils/responseBody";

export const metadata: ToolMetadata = {
  name: "create-user",
  description: "Create a SCIM user resource",
  annotations: {
    title: "Create User Resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

const createUserInputSchema = z.object(userResourceSchema).omit({
  id: true,
  meta: true,
});

export const schema = {
  userResource: createUserInputSchema,
};

export default async function createUser(
  params: InferSchema<typeof schema>
) {
  const { userResource } = params;
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
  const baseUrl = getScimBaseUrl(requestHeaders);

  if (!apiToken) {
    throw new Error("Missing required headers: x-scim-api-token or SCIM_API_TOKEN env");
  }

  if (!baseUrl) {
    throw new Error("Missing required headers: x-scim-base-url or SCIM_API_BASE_URL env");
  }

  const response = await fetch(`${baseUrl}/Users`, {
    method: "POST",
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
        text: `User created successfully`,
      },
    ],
    structuredContent: data ?? undefined,
  };
}
