import { type ToolMetadata, type InferSchema } from "xmcp";
import { userResource } from "../schemas/userResource";
import { scimRequest } from "../scimRequest";
import { z } from "zod";

export const schema = {
  id: z.string().describe("The unique identifier of the SCIM user resource to be replaced"),
  userResource: userResource.describe("The SCIM user resource data to replace with"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "replaceOneUserResource",
  description: "Replace a SCIM user resource by ID using PUT method",
  annotations: {
    title: "Replace SCIM user resource",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
  },
};

export default async function replaceOneUserResource({
  id,
  userResource,
}: InferSchema<typeof schema>) {
  try {
    // Following SCIM RFC 7644 Section 3.5.1 - Replacing with PUT
    const replacedUser = await scimRequest(`/Users/${id}`, "PUT", userResource);
    return replacedUser;
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
