import { z } from "zod";

/**
 * SCIM PATCH Operation Schema
 * https://datatracker.ietf.org/doc/html/rfc7644#section-3.5.2
 */
export const patchOperationSchema = {
  schemas: z
    .array(z.literal("urn:ietf:params:scim:api:messages:2.0:PatchOp"))
    .describe("The SCIM schema URI for PATCH operations"),
  Operations: z
    .array(
      z.object({
        op: z
          .enum(["add", "remove", "replace"])
          .describe(
            "The operation to perform. Valid values are 'add', 'remove', and 'replace'"
          ),
        path: z
          .string()
          .optional()
          .describe(
            "The attribute path describing the target of the operation. Required for 'remove' and 'replace' operations"
          ),
        value: z
          .any()
          .optional()
          .describe(
            "The value to be used for the operation. Required for 'add' and 'replace' operations"
          ),
      })
    )
    .describe("Array of PATCH operations to apply to the resource"),
};
