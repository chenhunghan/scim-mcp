import { faker } from "@faker-js/faker";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { z } from "zod";

export const metadata: ToolMetadata = {
  name: "generate-random-group-resource",
  description: "Generate a realistic SCIM group resource with optional overrides, does not create the group in the system, use with create-group tool to provision the group",
  annotations: {
    title: "Generate Random Group Resource",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export const schema = {
  displayName: z.string().optional().describe("Override the generated group display name"),
  externalId: z.string().optional().describe("Override the generated external ID"),
};

export default async function generateRandomGroupResource(params: InferSchema<typeof schema>) {
  const displayName = params.displayName ?? `${faker.commerce.department()} Team`;
  const externalId = params.externalId ?? faker.string.uuid();

  const groupResource = {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    displayName: displayName,
    externalId: externalId,
  };

  return {
    content: [
      {
        type: "text",
        text: `Generated realistic SCIM group resource:\n\nDisplay Name: ${displayName}\nExternal ID: ${externalId}\n\n💡 This resource can be used directly with the create-group tool.`,
      },
    ],
    structuredContent: groupResource,
  };
}
