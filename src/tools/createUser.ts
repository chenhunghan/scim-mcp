import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { userResourceSchema } from "../schemas/userResourceSchema";
import { z } from "zod";

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

export const schema = z.object(userResourceSchema).omit({
  id: true,
  meta: true,
});

export default async function createUser(
  userResource: InferSchema<typeof userResourceSchema>
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

  const data = await response.json();

  return {
    content: [
      {
        type: "text",
        text: `User created successfully`,
      },
      {
        type: "resource_link",
        name: "User resource",
        uri: `users://${data.id}`,
      },
    ],
    structuredContent: data,
  };
}
