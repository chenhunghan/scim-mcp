import { type ToolMetadata, type InferSchema } from "xmcp";
import { z } from "zod";
import { scimRequest } from "../scimRequest";

// Define PATCH operation schema following SCIM RFC
const patchOperation = z.object({
  op: z.enum(["add", "remove", "replace"]).describe("The PATCH operation to perform"),
  path: z.string().optional().describe("RFC 7644 path to the attribute"),
  value: z.any().optional().describe("The value to set for add/replace operations")
});

export const schema = {
  id: z.string().describe("The unique identifier of the SCIM user resource to update"),
  operations: z.array(patchOperation).describe("Array of PATCH operations to apply"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "updateOneUserResource",
  description: "Update a SCIM user resource by ID using PATCH method for partial updates",
  annotations: {
    title: "Update SCIM user resource (PATCH)",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function updateOneUserResource({
  id,
  operations,
}: InferSchema<typeof schema>) {
  try {
    // Following SCIM RFC 7644 Section 3.5.2 - Modifying with PATCH
    const patchBody = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
      Operations: operations,
    };

    const updatedUser = await scimRequest(`/Users/${id}`, "PATCH", patchBody);
    return updatedUser;
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
