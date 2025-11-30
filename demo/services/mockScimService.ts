import { ScimUser, ScimGroup, ScimDatabase } from '../types';

// Helper for UUID generation
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const REAL_FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Isabella", "Elijah", "Sophia", "William",
  "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
  "Abigail", "Mason", "Emily", "Michael", "Elizabeth", "Ethan", "Sofia", "Daniel", "Avery", "Jacob",
  "Ella", "Logan", "Madison", "Jackson", "Scarlett", "Levi", "Victoria", "Sebastian", "Aria", "Mateo",
  "Grace", "Jack", "Chloe", "Owen", "Camila", "Theodore", "Penelope", "Aiden", "Riley", "Samuel",
  "Luna", "Joseph", "Lillian", "John", "Layla", "David", "Zoey", "Wyatt", "Nora", "Matthew",
  "Sarah", "Chris", "Jessica", "Tom", "Anna", "Robert", "Laura", "Steven", "Julia", "Paul"
];

const REAL_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart"
];

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Legal', 'Operations', 'Product', 'Support', 'IT'];
const GROUP_SUFFIXES = ['Team', 'Squad', 'Guild', 'Department', 'Committee', 'Board', 'Admins', 'Managers'];

type Listener = (data: ScimDatabase) => void;

export class MockScimService {
  private data: ScimDatabase;
  private listeners: Listener[] = [];

  constructor() {
    this.data = { users: [], groups: [] };
    this.seedInitialData();
  }

  private seedInitialData() {
    // Generate 3 to 6 initial users
    const numUsers = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numUsers; i++) {
        const user = this.generateRandomInternalUser();
        this.data.users.push(user);
    }

    // Generate 1 to 2 initial groups
    const numGroups = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numGroups; i++) {
        const groupName = this.generateRandomGroupName();
        const newGroup: ScimGroup = {
            id: generateUUID(),
            displayName: groupName,
            members: [],
            meta: { created: new Date().toISOString(), lastModified: new Date().toISOString() }
        };
        
        // Randomly assign some users to this group
        const shuffledUsers = [...this.data.users].sort(() => 0.5 - Math.random());
        const groupSize = Math.floor(Math.random() * (this.data.users.length + 1));
        
        for(let j=0; j<groupSize; j++) {
            newGroup.members.push({
                value: shuffledUsers[j].id,
                display: shuffledUsers[j].displayName
            });
        }
        
        this.data.groups.push(newGroup);
    }
  }

  private generateRandomInternalUser(): ScimUser {
      const fn = REAL_FIRST_NAMES[Math.floor(Math.random() * REAL_FIRST_NAMES.length)];
      const ln = REAL_LAST_NAMES[Math.floor(Math.random() * REAL_LAST_NAMES.length)];
      const domain = 'company.com';
      
      return {
          id: generateUUID(),
          userName: `${fn.toLowerCase()}.${ln.toLowerCase()}`,
          displayName: `${fn} ${ln}`,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
          active: true,
          meta: { created: new Date().toISOString(), lastModified: new Date().toISOString() }
      };
  }
  
  private generateRandomGroupName(): string {
      const d = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      const s = GROUP_SUFFIXES[Math.floor(Math.random() * GROUP_SUFFIXES.length)];
      return `${d} ${s}`;
  }

  // --- Subscription for React Reactivity ---
  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.data); // Initial emit
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const snapshot = JSON.parse(JSON.stringify(this.data));
    this.listeners.forEach(l => l(snapshot));
  }

  // --- SCIM Tools ---
  // Updated to receive named arguments (Tool Calling standard)

  getUsers() {
    return this.data.users;
  }

  getOneUser({ id }: { id: string }) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) throw new Error(`User with ID ${id} not found`);
    return user;
  }

  createUser({ userName, displayName, email }: { userName: string, displayName: string, email: string }) {
    const newUser: ScimUser = {
      id: generateUUID(),
      userName,
      displayName,
      email,
      active: true,
      meta: { created: new Date().toISOString(), lastModified: new Date().toISOString() }
    };
    this.data.users.push(newUser);
    this.notify();
    return newUser;
  }

  updateUser({ id, email, displayName }: { id: string, email?: string, displayName?: string }) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    
    const updates: any = {};
    if (email) updates.email = email;
    if (displayName) updates.displayName = displayName;
    
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      meta: { ...this.data.users[idx].meta, lastModified: new Date().toISOString() }
    };
    this.notify();
    return this.data.users[idx];
  }

  deleteUser({ id }: { id: string }) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    
    this.data.users.splice(idx, 1);
    
    // Cleanup memberships
    this.data.groups.forEach(g => {
      g.members = g.members.filter(m => m.value !== id);
    });
    
    this.notify();
    return { success: true, id };
  }

  getGroups() {
    return this.data.groups;
  }

  createGroup({ displayName }: { displayName: string }) {
    const newGroup: ScimGroup = {
      id: generateUUID(),
      displayName,
      members: [],
      meta: { created: new Date().toISOString(), lastModified: new Date().toISOString() }
    };
    this.data.groups.push(newGroup);
    this.notify();
    return newGroup;
  }

  patchGroup({ id, displayName }: { id: string, displayName: string }) {
    const idx = this.data.groups.findIndex(g => g.id === id);
    if (idx === -1) throw new Error(`Group ${id} not found`);

    this.data.groups[idx].displayName = displayName;
    this.data.groups[idx].meta.lastModified = new Date().toISOString();
    this.notify();
    return this.data.groups[idx];
  }

  deleteGroup({ id }: { id: string }) {
    const idx = this.data.groups.findIndex(g => g.id === id);
    if (idx === -1) throw new Error(`Group ${id} not found`);

    this.data.groups.splice(idx, 1);
    this.notify();
    return { success: true, id };
  }

  addUserToGroup({ userId, groupId }: { userId: string, groupId: string }) {
    const user = this.data.users.find(u => u.id === userId);
    const group = this.data.groups.find(g => g.id === groupId);

    if (!user) throw new Error(`User ${userId} not found`);
    if (!group) throw new Error(`Group ${groupId} not found`);

    if (group.members.some(m => m.value === userId)) {
      return { message: "User already in group", group };
    }

    group.members.push({ value: user.id, display: user.displayName });
    group.meta.lastModified = new Date().toISOString();
    this.notify();
    return group;
  }

  removeUserFromGroup({ userId, groupId }: { userId: string, groupId: string }) {
    const groupIdx = this.data.groups.findIndex(g => g.id === groupId);
    if (groupIdx === -1) throw new Error(`Group ${groupId} not found`);

    this.data.groups[groupIdx].members = this.data.groups[groupIdx].members.filter(m => m.value !== userId);
    this.data.groups[groupIdx].meta.lastModified = new Date().toISOString();
    this.notify();
    return this.data.groups[groupIdx];
  }

  // --- Helper Generators for the "Random" tools ---
  
  generateRandomUserResource() {
    const fn = REAL_FIRST_NAMES[Math.floor(Math.random() * REAL_FIRST_NAMES.length)];
    const ln = REAL_LAST_NAMES[Math.floor(Math.random() * REAL_LAST_NAMES.length)];
    
    return {
      userName: `${fn.toLowerCase()}.${ln.toLowerCase()}`,
      displayName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`
    };
  }

  generateRandomGroupResource() {
    return {
      displayName: this.generateRandomGroupName()
    };
  }
}

export const scimService = new MockScimService();