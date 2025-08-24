import { type ToolMetadata } from "xmcp";
import { scimRequest } from "../scimRequest";

export const schema = {};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "listUserResources",
  description: "List all SCIM user resources",
  annotations: {
    title: "List SCIM user resources",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listUserResources() {
  try {
    const users = await scimRequest("/Users", "GET");
    return users;
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
