# SCIM MCP Server

## Project Overview

**SCIM MCP** is a Model Context Protocol (MCP) server built with [XMCP](https://xmcp.dev), providing enterprise-ready user and group provisioning via the SCIM V2 protocol. This server enables AI agents and applications to interact with SCIM-compliant identity providers through standardized MCP tools and resources.

## Architecture

### Framework: XMCP

This project is built using XMCP, a declarative, file-system-based framework for creating MCP servers. XMCP automatically discovers and registers:

- **Tools**: Files in `src/tools/` become callable MCP tools
- **Resources**: Files in `src/resources/` become accessible MCP resources
- **Prompts**: (Disabled in this project) Would be in `src/prompts/`

### Transport

- **HTTP Transport**: Runs on port 3001 (configurable in `xmcp.config.ts`)
- **Endpoint**: `/mcp`
- **Development**: `npm run dev` with hot reload
- **Production**: `npm run build` then `npm start`

## Project Structure

```
scim-mcp/
├── src/
│   ├── tools/              # MCP tools (auto-discovered)
│   │   ├── createUser.ts   # SCIM user creation tool
│   │   └── userResourceSchema.ts  # Shared Zod schema for SCIM User
│   └── resources/          # MCP resources (auto-discovered)
│       ├── (config)/
│       │   └── app.ts      # Config resource: config://app
│       └── (users)/
│           └── [userId]/
│               └── index.ts # Dynamic resource: users://{userId}
├── xmcp.config.ts          # XMCP configuration
├── package.json
└── tsconfig.json
```

## Available Tools

### 1. create-user

Creates a SCIM user resource by sending a POST request to the SCIM provider's `/Users` endpoint.

**Schema**: Defined in `userResourceSchema.ts`, following SCIM RFC 7643 section 4.1.1

**Required Headers**:

- `x-scim-api-key`: Bearer token for SCIM API authentication
- `x-scim-base-url`: Base URL of the SCIM provider

**Parameters**: Full SCIM User resource including:

- `schemas`: Array of schema URIs
- `userName`: Unique identifier (required)
- `name`: User's name components (formatted, familyName, givenName, etc.)
- `emails`: Email addresses array
- `active`: User status
- Enterprise extension fields (employeeNumber, department, etc.)

**Returns**: Created user object from SCIM provider

**Example Usage**:

```typescript
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName": "bjensen@example.com",
  "name": {
    "givenName": "Barbara",
    "familyName": "Jensen"
  },
  "emails": [{
    "value": "bjensen@example.com",
    "type": "work",
    "primary": true
  }],
  "active": true
}
```

## Available Resources

### users://{userId}

Dynamic resource providing user profile information.

**URI**: `users://{userId}`
**Type**: Dynamic resource
**Parameters**:

- `userId` (string): The ID of the user

**Returns**: User profile data for the specified user

## SCIM Support

This server implements tools and resources aligned with SCIM V2 (RFC 7643):

- **User Resources**: Complete SCIM User schema with enterprise extension
- **Schema Validation**: All fields documented with RFC-derived descriptions using Zod `.describe()`
- **Enterprise Extension**: Full support for `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User`

### Supported SCIM Operations

Currently implemented:

- ✅ POST /Users (Create User)

Planned:

- GET /Users (List Users)
- GET /Users/{id} (Get User)
- PUT /Users/{id} (Replace User)
- PATCH /Users/{id} (Update User)
- DELETE /Users/{id} (Delete User)
- POST /Groups (Create Group)
- And more...

## Configuration

### XMCP Configuration (`xmcp.config.ts`)

```typescript
{
  http: true,                    // Enable HTTP transport
  paths: {
    tools: "./src/tools",        // Tools directory
    prompts: false,              // Prompts disabled
    resources: "./src/resources" // Resources directory
  }
}
```

### Environment Variables

Required for SCIM operations:

- Headers passed per-request (no env vars needed for auth)
- SCIM credentials provided via HTTP headers:
  - `x-scim-api-key`: API token/bearer token
  - `x-scim-base-url`: SCIM provider base URL

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

This starts XMCP with hot reload on port 3001. Any changes to tool or resource files will automatically reload the server.

### Building for Production

```bash
npm run build
npm start
```

Creates optimized bundle in `dist/` directory and runs the production server.

### Adding New Tools

1. Create a new `.ts` file in `src/tools/`
2. Export three elements:
   - `schema`: Zod schema for parameters (optional)
   - `metadata`: Tool metadata with name, description, annotations (optional)
   - `default`: Async function implementing the tool (required)

Example:

```typescript
import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";

export const schema = {
  userId: z.string().describe("The user ID"),
};

export const metadata: ToolMetadata = {
  name: "get-user",
  description: "Retrieve a SCIM user",
};

export default async function getUser({ userId }: InferSchema<typeof schema>) {
  // Implementation
  return userData;
}
```

### Adding New Resources

1. Create file in `src/resources/` with appropriate structure:

   - Static: `(scheme)/name.ts` → `scheme://name`
   - Dynamic: `(scheme)/[param]/name.ts` → `scheme://{param}/name`

2. Export three elements:
   - `schema`: Zod schema for parameters (optional for static)
   - `metadata`: Resource metadata (optional)
   - `default`: Handler function (required)

### Accessing Request Headers

Use the `headers()` function from `xmcp/headers` to access HTTP headers in tools or resources:

```typescript
import { headers } from "xmcp/headers";

const requestHeaders = headers();
const apiKey = requestHeaders["x-api-key"];
const baseUrl = requestHeaders["x-base-url"];
```

## References

- **XMCP Documentation**: https://xmcp.dev/llms-full.txt
- **SCIM RFC 7643 (Core Schema)**: https://datatracker.ietf.org/doc/html/rfc7643
- **SCIM RFC 7644 (Protocol)**: https://datatracker.ietf.org/doc/html/rfc7644
- **Model Context Protocol**: https://modelcontextprotocol.io
