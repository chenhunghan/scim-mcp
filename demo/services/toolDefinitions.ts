declare interface Schema {
    /** Optional. The value should be validated against any (one or more) of the subschemas in the list. */
    anyOf?: Schema[];
    /** Optional. Default value of the data. */
    default?: unknown;
    /** Optional. The description of the data. */
    description?: string;
    /** Optional. Possible values of the element of primitive type with enum format. Examples: 1. We can define direction as : {type:STRING, format:enum, enum:["EAST", NORTH", "SOUTH", "WEST"]} 2. We can define apartment number as : {type:INTEGER, format:enum, enum:["101", "201", "301"]} */
    enum?: string[];
    /** Optional. Example of the object. Will only populated when the object is the root. */
    example?: unknown;
    /** Optional. The format of the data. Supported formats: for NUMBER type: "float", "double" for INTEGER type: "int32", "int64" for STRING type: "email", "byte", etc */
    format?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE ARRAY Schema of the elements of Type.ARRAY. */
    items?: Schema;
    /** Optional. Maximum number of the elements for Type.ARRAY. */
    maxItems?: string;
    /** Optional. Maximum length of the Type.STRING */
    maxLength?: string;
    /** Optional. Maximum number of the properties for Type.OBJECT. */
    maxProperties?: string;
    /** Optional. Maximum value of the Type.INTEGER and Type.NUMBER */
    maximum?: number;
    /** Optional. Minimum number of the elements for Type.ARRAY. */
    minItems?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE STRING Minimum length of the Type.STRING */
    minLength?: string;
    /** Optional. Minimum number of the properties for Type.OBJECT. */
    minProperties?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE INTEGER and NUMBER Minimum value of the Type.INTEGER and Type.NUMBER */
    minimum?: number;
    /** Optional. Indicates if the value may be null. */
    nullable?: boolean;
    /** Optional. Pattern of the Type.STRING to restrict a string to a regular expression. */
    pattern?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE OBJECT Properties of Type.OBJECT. */
    properties?: Record<string, Schema>;
    /** Optional. The order of the properties. Not a standard field in open api spec. Only used to support the order of the properties. */
    propertyOrdering?: string[];
    /** Optional. Required properties of Type.OBJECT. */
    required?: string[];
    /** Optional. The title of the Schema. */
    title?: string;
    /** Optional. The type of the data. */
    type?: Type;
}


declare enum Behavior {
    /**
     * This value is unused.
     */
    UNSPECIFIED = "UNSPECIFIED",
    /**
     * If set, the system will wait to receive the function response before continuing the conversation.
     */
    BLOCKING = "BLOCKING",
    /**
     * If set, the system will not wait to receive the function response. Instead, it will attempt to handle function responses as they become available while maintaining the conversation between the user and the model.
     */
    NON_BLOCKING = "NON_BLOCKING"
}

declare interface FunctionDeclaration {
    /** Defines the function behavior. */
    behavior?: Behavior;
    /** Optional. Description and purpose of the function. Model uses it to decide how and whether to call the function. */
    description?: string;
    /** Required. The name of the function to call. Must start with a letter or an underscore. Must be a-z, A-Z, 0-9, or contain underscores, dots and dashes, with a maximum length of 64. */
    name?: string;
    /** Optional. Describes the parameters to this function in JSON Schema Object format. Reflects the Open API 3.03 Parameter Object. string Key: the name of the parameter. Parameter names are case sensitive. Schema Value: the Schema defining the type used for the parameter. For function with no parameters, this can be left unset. Parameter names must start with a letter or an underscore and must only contain chars a-z, A-Z, 0-9, or underscores with a maximum length of 64. Example with 1 required and 1 optional parameter: type: OBJECT properties: param1: type: STRING param2: type: INTEGER required: - param1 */
    parameters?: Schema;
    /** Optional. Describes the parameters to the function in JSON Schema format. The schema must describe an object where the properties are the parameters to the function. For example: ``` { "type": "object", "properties": { "name": { "type": "string" }, "age": { "type": "integer" } }, "additionalProperties": false, "required": ["name", "age"], "propertyOrdering": ["name", "age"] } ``` This field is mutually exclusive with `parameters`. */
    parametersJsonSchema?: unknown;
    /** Optional. Describes the output from this function in JSON Schema format. Reflects the Open API 3.03 Response Object. The Schema defines the type used for the response value of the function. */
    response?: Schema;
    /** Optional. Describes the output from this function in JSON Schema format. The value specified by the schema is the response value of the function. This field is mutually exclusive with `response`. */
    responseJsonSchema?: unknown;
}

declare enum Type {
    /**
     * Not specified, should not be used.
     */
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
    /**
     * OpenAPI string type
     */
    STRING = "STRING",
    /**
     * OpenAPI number type
     */
    NUMBER = "NUMBER",
    /**
     * OpenAPI integer type
     */
    INTEGER = "INTEGER",
    /**
     * OpenAPI boolean type
     */
    BOOLEAN = "BOOLEAN",
    /**
     * OpenAPI array type
     */
    ARRAY = "ARRAY",
    /**
     * OpenAPI object type
     */
    OBJECT = "OBJECT",
    /**
     * Null type
     */
    NULL = "NULL"
}

export const scimTools: FunctionDeclaration[] = [
  {
    name: 'getUsers',
    description: 'Retrieve a list of all users in the system.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'getOneUser',
    description: 'Get details of a specific user by ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'The unique identifier of the user' }
      },
      required: ['id']
    }
  },
  {
    name: 'createUser',
    description: 'Create a new user account.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        userName: { type: Type.STRING, description: 'The username (e.g. jdoe)' },
        displayName: { type: Type.STRING, description: 'The full display name' },
        email: { type: Type.STRING, description: 'The email address' }
      },
      required: ['userName', 'displayName', 'email']
    }
  },
  {
    name: 'updateUser',
    description: 'Update user attributes like email or displayName.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'User ID to update' },
        email: { type: Type.STRING, description: 'New email address (optional)' },
        displayName: { type: Type.STRING, description: 'New display name (optional)' }
      },
      required: ['id']
    }
  },
  {
    name: 'deleteUser',
    description: 'Delete a user from the system.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'User ID to delete' }
      },
      required: ['id']
    }
  },
  {
    name: 'getGroups',
    description: 'Retrieve a list of all groups.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'createGroup',
    description: 'Create a new group.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        displayName: { type: Type.STRING, description: 'The name of the group' }
      },
      required: ['displayName']
    }
  },
  {
    name: 'patchGroup',
    description: 'Update a group name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'Group ID' },
        displayName: { type: Type.STRING, description: 'New group name' }
      },
      required: ['id', 'displayName']
    }
  },
  {
    name: 'deleteGroup',
    description: 'Delete a group.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'Group ID to delete' }
      },
      required: ['id']
    }
  },
  {
    name: 'addUserToGroup',
    description: 'Add a user to a group.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        userId: { type: Type.STRING, description: 'The ID of the user' },
        groupId: { type: Type.STRING, description: 'The ID of the group' }
      },
      required: ['userId', 'groupId']
    }
  },
  {
    name: 'removeUserFromGroup',
    description: 'Remove a user from a group.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        userId: { type: Type.STRING, description: 'The ID of the user' },
        groupId: { type: Type.STRING, description: 'The ID of the group' }
      },
      required: ['userId', 'groupId']
    }
  },
  {
    name: 'generateRandomUserResource',
    description: 'Generate random user data (name, email) to help with creation. Does not create the user, just returns data.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'generateRandomGroupResource',
    description: 'Generate random group name. Does not create group, just returns data.',
    parameters: { type: Type.OBJECT, properties: {} }
  }
];
