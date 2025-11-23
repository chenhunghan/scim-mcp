import { faker } from "@faker-js/faker";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { z } from "zod";

export const metadata: ToolMetadata = {
  name: "generate-one-random-user-resource",
  description: "Generate a realistic SCIM user resource with optional overrides, does not create the user in the system,use with create-user tool to provision the user",
  annotations: {
    title: "Generate Random User Resource",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export const schema = {
  userName: z.string().optional().describe("Override the generated userName"),
  firstName: z.string().optional().describe("Override the generated first name"),
  lastName: z.string().optional().describe("Override the generated last name"),
  displayName: z.string().optional().describe("Override the generated display name"),
  email: z.string().optional().describe("Override the generated email"),
  active: z.boolean().optional().describe("Override the active status (default: true)"),
  employeeNumber: z.string().optional().describe("Override the generated employee number"),
  department: z.string().optional().describe("Override the generated department"),
  organization: z.string().optional().describe("Override the generated organization"),
};

export default async function generateRandomUserResource(params: InferSchema<typeof schema>) {
  const firstName = params.firstName ?? faker.person.firstName();
  const lastName = params.lastName ?? faker.person.lastName();
  const email = params.email ?? faker.internet.email({ firstName, lastName }).toLowerCase();
  const userName = params.userName ?? faker.internet.username({ firstName, lastName }).toLowerCase();
  const displayName = params.displayName ?? `${firstName} ${lastName}`;
  const active = params.active ?? true;
  const employeeNumber = params.employeeNumber ?? faker.string.numeric(6);
  const department = params.department ?? faker.commerce.department();
  const organization = params.organization ?? faker.company.name();

  const userResource = {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    userName: userName,
    externalId: faker.string.uuid(),
    name: {
      formatted: displayName,
      familyName: lastName,
      givenName: firstName,
    },
    displayName: displayName,
    emails: [
      {
        value: email,
        type: "work",
        primary: true,
      },
    ],
    active: active,
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
      employeeNumber: employeeNumber,
      department: department,
      organization: organization,
    },
  };

  return {
    content: [
      {
        type: "text",
        text: `Generated realistic SCIM user resource:\n\nUserName: ${userName}\nEmail: ${email}\nName: ${firstName} ${lastName}\n\n💡 This resource can be used directly with the create-user tool.`,
      },
    ],
    structuredContent: userResource,
  };
}
