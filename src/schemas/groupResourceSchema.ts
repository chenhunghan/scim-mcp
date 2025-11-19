import { z } from "zod";

/**
 * SCIM Group Resource Schema
 * https://datatracker.ietf.org/doc/html/rfc7643#section-4.2
 */
export const groupResourceSchema = {
  schemas: z
    .array(z.literal("urn:ietf:params:scim:schemas:core:2.0:Group"))
    .describe(
      "An array of Strings containing URIs that are used to indicate the namespaces of the SCIM schemas"
    ),
  displayName: z
    .string()
    .describe(
      "A human-readable name for the Group. REQUIRED."
    ),
  members: z
    .array(
      z.object({
        value: z
          .string()
          .optional()
          .describe(
            "Identifier of the member of this Group"
          ),
        $ref: z
          .string()
          .optional()
          .describe(
            "The URI corresponding to a SCIM resource that is a member of this Group"
          ),
        type: z
          .enum(["User", "Group"])
          .optional()
          .describe(
            "A label indicating the type of resource, e.g., 'User' or 'Group'"
          ),
        display: z
          .string()
          .optional()
          .describe(
            "A human-readable name for the member, primarily used for display purposes"
          ),
      })
    )
    .optional()
    .describe(
      "A list of members of the Group"
    ),
  externalId: z
    .string()
    .optional()
    .describe(
      "A String that is an identifier for the resource as defined by the provisioning client"
    ),
};
