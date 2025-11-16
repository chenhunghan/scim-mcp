import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { userResourceSchema } from "../schemas/userResourceSchema";

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

export const schema = userResourceSchema;

export default async function createUser(
  userResource: InferSchema<typeof userResourceSchema>
) {
  const requestHeaders = headers();
  const apiToken = requestHeaders["x-scim-api-key"];
  const baseUrl = requestHeaders["x-scim-base-url"];

  if (!apiToken) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Missing required headers: x-scim-api-key",
        },
      ],
    };
  }

  if (!baseUrl) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Missing required headers: x-scim-base-url",
        },
      ],
    };
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
    const errorText = `${response.status} ${
      response.statusText
    } - ${JSON.stringify(await response.json())}`;

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: errorText,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `User created successfully`,
      },
    ],
    structuredContent: await response.json(),
  };
}
