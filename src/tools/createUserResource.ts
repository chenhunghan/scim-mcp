import { type ToolMetadata, type InferSchema } from "xmcp";
import { userResource } from "../schemas/userResource";
import { scimRequest } from "../scimRequest";

export const schema = {
  userResource,
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "createUserResource",
  description: "Create a SCIM user resource",
  annotations: {
    title: "Create a SCIM user resource",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function createUserResource({
  userResource,
}: InferSchema<typeof schema>) {
  try {
    const user = await scimRequest("/Users", "POST", userResource);
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
