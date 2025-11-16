import { type InferSchema, type ResourceMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  userId: z.string().describe("The ID of the user"),
};

export const metadata: ResourceMetadata = {
  name: "user-resource",
  title: "User Resource",
  description: "User Resource by ID",
};

export default async function handler({ userId }: InferSchema<typeof schema>) {
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

  const response = await fetch(`${baseUrl}/Users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/scim+json",
      Authorization: `Bearer ${apiToken}`,
    },
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
        text: `Got one user resource with ID ${userId}`,
      },
    ],
    structuredContent: await response.json(),
  };
}
