import { type ToolMetadata, type InferSchema } from "xmcp";
import { scimRequest } from "../scimRequest";
import { z } from "zod";

export const schema = {
  id: z.string().describe("The unique identifier of the SCIM user resource to retrieve"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "getOneUserResource",
  description: "Retrieve a single SCIM user resource by ID",
  annotations: {
    title: "Get SCIM user resource",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getOneUserResource({
  id,
}: InferSchema<typeof schema>) {
  try {
    const user = await scimRequest(`/Users/${id}`, "GET");
    return user;
  } catch (error) {
    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error),
          },
        ],
        isError: true,
      },
    };
  }
}
