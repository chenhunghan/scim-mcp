import { type ToolMetadata } from "xmcp";
import { faker } from "@faker-js/faker";

export const metadata: ToolMetadata = {
  name: "create-random-user-resource",
  description: "Generate a realistic SCIM user resource for testing",
  annotations: {
    title: "Create Random User Resource",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export const schema = {};

export default async function createRandomUserResource() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const userName = faker.internet.username({ firstName, lastName }).toLowerCase();

  const userResource = {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    userName: userName,
    name: {
      formatted: `${firstName} ${lastName}`,
      familyName: lastName,
      givenName: firstName,
    },
    displayName: `${firstName} ${lastName}`,
    emails: [
      {
        value: email,
        type: "work",
        primary: true,
      },
    ],
    active: true,
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
      employeeNumber: faker.string.numeric(6),
      department: faker.commerce.department(),
      organization: faker.company.name(),
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
