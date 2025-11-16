import { z } from "zod";

/**
 * https://datatracker.ietf.org/doc/html/rfc7643#section-4.1
 */
export const userResourceSchema = {
  schemas: z
    .array(
      z.union([
        z.literal("urn:ietf:params:scim:schemas:core:2.0:User"),
        z.literal("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"),
      ])
    )
    .describe(
      "An array of Strings containing URIs that are used to indicate the namespaces of the SCIM schemas that define the attributes present in the current JSON structure"
    ),
  userName: z
    .string()
    .describe(
      "A service provider's unique identifier for the user, typically used by the user to directly authenticate to the service provider. Each User MUST include a non-empty userName value. This identifier MUST be unique across the service provider's entire set of Users"
    ),
  name: z
    .object({
      formatted: z
        .string()
        .optional()
        .describe(
          "The full name, including all middle names, titles, and suffixes as appropriate, formatted for display (e.g., 'Ms. Barbara Jane Jensen, III')"
        ),
      familyName: z
        .string()
        .optional()
        .describe(
          "The family name of the User, or last name in most Western languages (e.g., 'Jensen' given the full name 'Ms. Barbara Jane Jensen, III')"
        ),
      givenName: z
        .string()
        .optional()
        .describe(
          "The given name of the User, or first name in most Western languages (e.g., 'Barbara' given the full name 'Ms. Barbara Jane Jensen, III')"
        ),
      middleName: z
        .string()
        .optional()
        .describe(
          "The middle name(s) of the User (e.g., 'Jane' given the full name 'Ms. Barbara Jane Jensen, III')"
        ),
      honorificPrefix: z
        .string()
        .optional()
        .describe(
          "The honorific prefix(es) of the User, or title in most Western languages (e.g., 'Ms.' given the full name 'Ms. Barbara Jane Jensen, III')"
        ),
      honorificSuffix: z
        .string()
        .optional()
        .describe(
          "The honorific suffix(es) of the User, or suffix in most Western languages (e.g., 'III' given the full name 'Ms. Barbara Jane Jensen, III')"
        ),
    })
    .optional()
    .describe(
      "The components of the user's name. Service providers MAY return just the full name as a single string in the formatted sub-attribute, or they MAY return just the individual component attributes using the other sub-attributes, or they MAY return both"
    ),
  displayName: z
    .string()
    .optional()
    .describe(
      "The name of the user, suitable for display to end-users. Each user returned MAY include a non-empty displayName value. The name SHOULD be the full name of the User being described, if known"
    ),
  nickName: z
    .string()
    .optional()
    .describe(
      "The casual way to address the user in real life, e.g., 'Bob' or 'Bobby' instead of 'Robert'. This attribute SHOULD NOT be used to represent a User's username (e.g., bjensen or mpepperidge)"
    ),
  profileUrl: z
    .string()
    .optional()
    .describe(
      "A URI that is a uniform resource locator and that points to a location representing the user's online profile (e.g., a web page)"
    ),
  titleL: z
    .string()
    .optional()
    .describe("The user's title, such as 'Vice President'"),
  userType: z
    .string()
    .optional()
    .describe(
      "Used to identify the relationship between the organization and the user. Typical values used might be 'Contractor', 'Employee', 'Intern', 'Temp', 'External', and 'Unknown', but any value may be used"
    ),
  preferredLanguage: z
    .string()
    .optional()
    .describe(
      "Indicates the user's preferred written or spoken languages and is generally used for selecting a localized user interface. The value indicates the set of natural languages that are preferred"
    ),
  locale: z
    .string()
    .optional()
    .describe(
      "Used to indicate the User's default location for purposes of localizing such items as currency, date time format, or numerical representations"
    ),
  timezone: z
    .string()
    .optional()
    .describe(
      "The User's time zone, in IANA Time Zone database format, also known as the 'Olson' time zone database format (e.g., 'America/Los_Angeles')"
    ),
  active: z
    .boolean()
    .optional()
    .describe(
      "A Boolean value indicating the user's administrative status. The definitive meaning of this attribute is determined by the service provider. As a typical example, a value of true implies that the user is able to log in, while a value of false implies that the user's account has been suspended"
    ),
  password: z
    .string()
    .optional()
    .describe(
      "This attribute is intended to be used as a means to set, replace, or compare (i.e., filter for equality) a password. The cleartext value or the hashed value of a password SHALL NOT be returnable by a service provider"
    ),
  emails: z
    .array(
      z.object({
        value: z
          .string()
          .toLowerCase()
          .optional()
          .describe(
            "Email addresses for the user. The value SHOULD be specified according to RFC5321. Service providers SHOULD canonicalize the value according to RFC5321, e.g., 'bjensen@example.com' instead of 'bjensen@EXAMPLE.COM'"
          ),
        type: z
          .string()
          .optional()
          .describe(
            "A label indicating the attribute's function, e.g., 'work' or 'home'"
          ),
        primary: z
          .boolean()
          .optional()
          .describe(
            "A Boolean value indicating the 'primary' or preferred attribute value for this attribute, e.g., the preferred mailing address or the primary email address. The primary attribute value 'true' MUST appear no more than once"
          ),
      })
    )
    .optional()
    .describe(
      "Email addresses for the User. The value SHOULD be specified according to RFC5321. Service providers SHOULD canonicalize the value according to RFC5321. Canonical type values of 'work', 'home', and 'other'"
    ),
  "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": z
    .object({
      employeeNumber: z
        .string()
        .optional()
        .describe(
          "A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization"
        ),
      department: z
        .string()
        .optional()
        .describe("Identifies the name of a department"),
      costCenter: z
        .string()
        .optional()
        .describe("Identifies the name of a cost center"),
      organization: z
        .string()
        .optional()
        .describe("Identifies the name of an organization"),
      division: z
        .string()
        .optional()
        .describe("Identifies the name of a division"),
      manager: z
        .object({
          value: z
            .string()
            .optional()
            .describe(
              "The 'id' of the SCIM resource representing the user's manager"
            ),
        })
        .optional()
        .describe(
          "The user's manager. A complex type that optionally allows service providers to represent organizational hierarchy by referencing the 'id' attribute of another User"
        ),
    })
    .optional()
    .describe(
      "Enterprise User Schema Extension that defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise"
    ),
};
