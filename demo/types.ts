export interface ScimUser {
  id: string;
  userName: string;
  displayName: string;
  email: string;
  active: boolean;
  meta: {
    created: string;
    lastModified: string;
  };
}

export interface ScimGroup {
  id: string;
  displayName: string;
  members: Array<{
    value: string; // User ID
    display: string; // User Display Name
  }>;
  meta: {
    created: string;
    lastModified: string;
  };
}

export interface ScimDatabase {
  users: ScimUser[];
  groups: ScimGroup[];
}

export type MessageRole = 'user' | 'model' | 'tool';

export interface ToolCallData {
  id: string;
  name: string;
  args: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  result?: any;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content?: string;
  toolCalls?: ToolCallData[];
  timestamp: number;
}
