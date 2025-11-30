import React, { useEffect, useState } from 'react';
import { User, Users, Folder, Mail, Shield, Circle, Hash, Database } from 'lucide-react';
import { scimService } from '../services/mockScimService';
import { ScimDatabase } from '../types';

export const ScimDashboard: React.FC = () => {
  const [data, setData] = useState<ScimDatabase>({ users: [], groups: [] });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to changes in the mock database
    const unsubscribe = scimService.subscribe((newData) => {
      setData(newData);
      
      // Simple logic to find the newest item to highlight temporarily
      const allItems = [...newData.users, ...newData.groups];
      if (allItems.length > 0) {
        // Find item modified most recently
        const sorted = allItems.sort((a, b) => 
          new Date(b.meta.lastModified).getTime() - new Date(a.meta.lastModified).getTime()
        );
        if (new Date().getTime() - new Date(sorted[0].meta.lastModified).getTime() < 1000) {
            setHighlightedId(sorted[0].id);
            setTimeout(() => setHighlightedId(null), 2000);
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      <div className="h-14 flex items-center px-4 border-b border-border bg-muted/10">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Database size={14} className="text-muted-foreground" />
          Directory State
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* Users Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Users
            </h3>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-mono px-1.5 py-0.5 rounded-md">{data.users.length}</span>
          </div>
          <div className="space-y-2">
            {data.users.length === 0 && (
                <div className="text-muted-foreground text-xs italic p-4 border border-dashed border-border rounded-md text-center bg-muted/20">No users found.</div>
            )}
            {data.users.map(user => (
              <div 
                key={user.id} 
                className={`p-3 rounded-md border text-sm transition-all duration-300 ${
                  highlightedId === user.id 
                    ? 'bg-accent border-primary/50' 
                    : 'bg-background border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start justify-between">
                    <div>
                        <div className="font-medium text-foreground">{user.displayName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {user.email}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded cursor-help" title={user.id}>
                          {user.id.length > 8 ? user.id.substring(0, 8) + '...' : user.id}
                        </span>
                        {user.active && (
                             <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Groups
            </h3>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-mono px-1.5 py-0.5 rounded-md">{data.groups.length}</span>
          </div>
          <div className="space-y-2">
            {data.groups.length === 0 && (
                <div className="text-muted-foreground text-xs italic p-4 border border-dashed border-border rounded-md text-center bg-muted/20">No groups found.</div>
            )}
            {data.groups.map(group => (
              <div 
                key={group.id} 
                className={`p-3 rounded-md border text-sm transition-all duration-300 ${
                    highlightedId === group.id 
                      ? 'bg-accent border-primary/50' 
                      : 'bg-background border-border hover:bg-accent/50'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-foreground flex items-center gap-2">
                        <Folder size={14} className="text-muted-foreground" />
                        {group.displayName}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded cursor-help" title={group.id}>
                      {group.id.length > 8 ? group.id.substring(0, 8) + '...' : group.id}
                    </span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                    <div className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Hash size={10} /> Members
                    </div>
                    {group.members.length === 0 ? (
                         <span className="text-[10px] text-muted-foreground/50 italic">Empty group</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {group.members.map(m => (
                                <span key={m.value} className="text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded text-foreground flex items-center gap-1" title={m.value}>
                                    <User size={8} className="text-muted-foreground" /> {m.display}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};