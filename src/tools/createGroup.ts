import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import { groupResourceSchema } from "../schemas/groupResourceSchema";
import { getScimToken } from "../utils/getSCIMApiKey";
import { readJsonBody } from "../utils/responseBody";

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

const createGroupInputSchema = z.object(groupResourceSchema).omit({
  id: true,
  meta: true,
});

export const schema = {
  groupResource: createGroupInputSchema,
};

export default async function createGroup(
  params: InferSchema<typeof schema>
) {
  const { groupResource } = params;
  const requestHeaders = headers();
  const apiToken = getScimToken(requestHeaders);
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

  const data = await readJsonBody(response);

  return {
    content: [
      {
        type: "text",
        text: `Group created successfully`,
      },
      ...(data?.id
        ? [
            {
              type: "resource_link",
              name: "Group resource",
              uri: `groups://${data.id}`,
            },
          ]
        : []),
    ],
    structuredContent: data ?? undefined,
  };
}
