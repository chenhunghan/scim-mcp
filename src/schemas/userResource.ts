import { z } from "zod";

export const userResource = z.object({
    schemas: z.array(
      z.union([
        z.literal("urn:ietf:params:scim:schemas:core:2.0:User"),
        z.literal("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"),
      ])
    ),
    userName: z
      .string()
      .describe(
        `A service provider's unique identifier for the user, typically used by the user to directly authenticate to the service provider. Often displayed to the user as their unique identifier within the system (as opposed to "id" or "externalId", which are generally opaque and not user-friendly identifiers).  Each User MUST include a non-empty userName value.  This identifier MUST be unique across the service provider's entire set of Users.  This attribute is REQUIRED and is case insensitive.`
      ),
    name: z
      .object({
        formatted: z
          .ostring()
          .describe(
            `The full name, including all middle names, titles, and suffixes as appropriate, formatted for display (e.g., "Ms. Barbara Jane Jensen, III").`
          ),
        familyName: z.ostring(),
        givenName: z.ostring(),
        middleName: z.ostring(),
        honorificPrefix: z.ostring(),
        honorificSuffix: z.ostring(),
      })
      .optional()
      .describe(
        `The components of the user's name.  Service providers MAY return just the full name as a single string in the formatted sub-attribute, or they MAY return just the individual component attributes using the other sub-attributes, or they MAY return both. If both variants are returned, they SHOULD be describing the same name, with the formatted name indicating how the component attributes should be combined.`
      ),
    displayName: z
      .ostring()
      .describe(
        `The name of the user, suitable for display to end-users.  Each user returned MAY include a non-empty displayName value.  The name SHOULD be the full name of the User being described, if known (e.g., "Babs Jensen" or "Ms. Barbara J Jensen, III") but MAY be a username or handle, if that is all that is available (e.g., "bjensen").  The value provided SHOULD be the primary textual label by which this User is normally displayed by the service provider when presenting it to end-users.`
      ),
    nickName: z.ostring(),
    profileUrl: z
      .ostring()
      .describe(
        `A URI that is a uniform resource locator (as defined in Section 1.1.3 of [RFC3986]) and that points to a location representing the user's online profile (e.g., a web page).  URIs are canonicalized per Section 6.2 of [RFC3986].`
      ),
    titleL: z.ostring(),
    userType: z
      .ostring()
      .describe(
        `Used to identify the relationship between the organization and the user.  Typical values used might be "Contractor", "Employee", "Intern", "Temp", "External", and "Unknown", but any value may be used.`
      ),
    preferredLanguage: z.ostring(),
    locale: z.ostring(),
    timezone: z.ostring(),
    active: z
      .oboolean()
      .describe(
        `A Boolean value indicating the user's administrative status.  The definitive meaning of this attribute is determined by the service provider.  As a typical example, a value of true implies that the user is able to log in, while a value of false implies that the user's account has been suspended.`
      ),
    password: z.ostring(),
    emails: z
      .array(
        z.object({
          value: z.ostring(),
          type: z.ostring(),
          primary: z.oboolean(),
        })
      )
      .optional()
      .describe(`Email addresses for the User.  The value SHOULD be specified according to [RFC5321].  Service providers SHOULD canonicalize the value according to [RFC5321], e.g., "bjensen@example.com" instead of "bjensen@EXAMPLE.COM".  The "display" sub-attribute MAY be used to return the canonicalized representation of the email value. The "type" sub-attribute is used to provide a classification meaningful to the (human) user.  The user interface should encourage the use of basic values of "work", "home", and "other" and MAY allow additional type values to be used at the discretion of SCIM clients.`),
  })