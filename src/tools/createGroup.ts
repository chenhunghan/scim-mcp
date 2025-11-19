import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { groupResourceSchema } from "../schemas/groupResourceSchema";
import { z } from "zod";

export const metadata: ToolMetadata = {
  name: "create-group",
  description: "Create a group resource",
  annotations: {
    title: "Create Group Resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export const schema = z.object(groupResourceSchema).omit({
  id: true,
  meta: true,
});

export default async function createGroup(
  groupResource: InferSchema<typeof groupResourceSchema>
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

  const response = await fetch(`${baseUrl}/Groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(groupResource),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return {
    content: [
      {
        type: "text",
        text: `Group created successfully`,
      },
      {
        type: "resource_link",
        name: "Group resource",
        uri: `groups://${data.id}`,
      },
    ],
    structuredContent: data,
  };
}
