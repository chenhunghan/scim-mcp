import { Bot, CheckCircle2, Command, Loader2, Monitor, Moon, PauseCircle, Play, PlayCircle, Send, Sun, Terminal, User as UserIcon, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { scimService } from '../services/mockScimService';
import { ChatMessage, ToolCallData } from '../types';
import { useTheme } from './ThemeProvider';

// Types adapted from GenAI SDK for local state compatibility
interface Part {
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, any>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, any>;
  };
}

interface Content {
  role: 'user' | 'model';
  parts: Part[];
}

interface ChatInterfaceProps {
  apiKey: string;
}

const STORY_BOOK = [
  "Get all users currently in the system",
  "Create a new random user",
  "Add the user you just created to 'Engineering' group. If 'Engineering' group does not exist, create it first.",
  "Remove that user from 'Engineering' group",
  "Update that user's email to 'alice.engineer@demo.com'",
  "Rename the 'Engineering' group to 'Deprecated Group'",
  "List all groups that have no members",
  "Delete the 'Deprecated Group'"
];

// Robust ID generator to prevent collisions
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingInput, setIsTypingInput] = useState(false);
  
  // Auto-play state
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Need to keep track of chat history for the API context
  const chatHistoryRef = useRef<Content[]>([]);
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, inputValue, isProcessing]); 

  // Auto-play Logic with Typing Simulation
  useEffect(() => {
    if (!isAutoPlaying || isProcessing || isTypingInput) return;

    if (autoPlayIndex >= STORY_BOOK.length) {
      setIsAutoPlaying(false);
      return;
    }

    const textToType = STORY_BOOK[autoPlayIndex];
    let isCancelled = false;

    const typeWriter = async () => {
      setIsTypingInput(true);
      setInputValue('');
      
      // Initial delay before starting to type (User thinking)
      await new Promise(r => setTimeout(r, 1500));
      if (isCancelled || !isAutoPlaying) {
          setIsTypingInput(false);
          return;
      }

      for (let i = 0; i < textToType.length; i++) {
         if (!isAutoPlaying) break;
         setInputValue(prev => prev + textToType[i]);
         // Typing speed - Slower human pace
         await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
      }

      if (!isAutoPlaying) {
        setIsTypingInput(false);
        return;
      }

      // Pause before sending - simulate user reviewing their input
      await new Promise(r => setTimeout(r, 1500));
      
      handleSendMessage(textToType);
      setIsTypingInput(false);
      setAutoPlayIndex(prev => prev + 1);
    };

    typeWriter();

    return () => { isCancelled = true; };
  }, [isAutoPlaying, isProcessing, autoPlayIndex]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    const userMsgId = generateId();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // 1. Add user message to history
      chatHistoryRef.current.push({ role: 'user', parts: [{ text: content }] });

      // 2. Start the Turn Loop (Model -> Tool -> Model ...)
      await processTurn();

    } catch (error: any) {
      console.error("Error in chat loop:", error);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'model',
        content: "Sorry, I encountered an error processing your request.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processTurn = async () => {
    // Create initial placeholder message for the model's response
    let currentResponseId = generateId();
    setMessages(prev => [...prev, {
      id: currentResponseId,
      role: 'model',
      content: '', // Start empty
      toolCalls: [],
      timestamp: Date.now()
    }]);

    let keepGoing = true;

    while (keepGoing) {
      try {
        // MOCK STREAMING CALL
        const resultGenerator = mockGenerateContentStream(chatHistoryRef.current);

        let aggregatedText = '';
        const functionCalls: any[] = [];
        const responseParts: Part[] = [];

        // Handle Streaming Text
        for await (const chunk of resultGenerator) {
            if ('text' in chunk && chunk.text) {
                aggregatedText += chunk.text;
                updateMessageContent(currentResponseId, chunk.text);
            }
            if ('functionCall' in chunk && chunk.functionCall) {
               functionCalls.push(chunk.functionCall);
            }
        }

        // Add text to history parts if exists
        if (aggregatedText) {
            responseParts.push({ text: aggregatedText });
        }
        // Add function calls to history parts
        for (const fc of functionCalls) {
            responseParts.push({ functionCall: fc });
        }
        
        // Update history with model's complete response (text + tool calls)
        if (responseParts.length > 0) {
            chatHistoryRef.current.push({ role: 'model', parts: responseParts });
        }

        if (functionCalls.length > 0) {
          // Prepare Tool Responses
          const toolResponsesParts: Part[] = [];

          for (const fc of functionCalls) {
              if(!fc) continue;
              
              // 1. Show "Thinking/Calling" animation in UI
              const toolCallId = fc.id || generateId(); 
              addToolCallToMessage(currentResponseId, {
                  id: toolCallId,
                  name: fc.name,
                  args: fc.args,
                  status: 'pending'
              });

              // Simulate "Network Delay" for executing the tool - Slower
              await new Promise(r => setTimeout(r, 2000));

              // 2. Execute Tool
              let result;
              try {
                  // @ts-ignore - dynamic dispatch
                  if (typeof scimService[fc.name] === 'function') {
                      // @ts-ignore
                      // Pass the arguments object directly (Named Arguments pattern)
                      result = await scimService[fc.name](fc.args);
                  } else {
                      throw new Error(`Tool ${fc.name} not implemented`);
                  }

                  updateToolCallStatus(currentResponseId, toolCallId, 'success', result);

              } catch (err: any) {
                  result = { error: err.message };
                  updateToolCallStatus(currentResponseId, toolCallId, 'error', result);
              }

              // 3. Add to response parts for next API call
              toolResponsesParts.push({
                  functionResponse: {
                      name: fc.name,
                      response: { result }
                  }
              });
          }

          // Add the tool outputs to history
          chatHistoryRef.current.push({ role: 'user', parts: toolResponsesParts });
          
          // Small pause before creating the new bubble, to allow the user to see the tool completed
          await new Promise(r => setTimeout(r, 500));
          
          // Loop continues to let Model interpret the tool results.
          // CRITICAL: Start a NEW message bubble for the subsequent text.
          currentResponseId = generateId();
          setMessages(prev => [...prev, {
            id: currentResponseId,
            role: 'model',
            content: '', 
            toolCalls: [],
            timestamp: Date.now()
          }]);
          
        } else {
          // No function calls, we are done with this turn
          keepGoing = false;
        }
      } catch (e: any) {
        console.error("Mock Processing Error", e);
        updateMessageContent(currentResponseId, "Error processing response.");
        keepGoing = false;
      }
    }
  };

  // --- MOCK LLM ENGINE ---
  async function* mockGenerateContentStream(history: Content[]) {
    // Artificial delay to simulate "Thinking" time and allow the animation to be seen
    // Slower thinking for realism
    await new Promise(r => setTimeout(r, 2200));

    // 1. Identify Context
    const lastUserText = [...history].reverse().find(c => c.role === 'user' && c.parts[0]?.text)?.parts[0].text || "";
    const storyIndex = STORY_BOOK.indexOf(lastUserText);
    
    // Count how many times we've been called in this turn (User Message -> Tool -> Result -> [WE ARE HERE])
    // We count the number of 'user' messages that are purely function responses since the last text message
    let turnStep = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        if (msg.role === 'user') {
            if (msg.parts[0].text) break; // Found the start of the turn
            if (msg.parts[0].functionResponse) turnStep++;
        }
    }

    // Helper to stream text
    async function* stream(text: string) {
        const chars = text.split('');
        for (const char of chars) {
            // Slower streaming speed for reading
            await new Promise(r => setTimeout(r, 35)); 
            yield { text: char };
        }
    }

    // SCENARIO LOGIC
    if (storyIndex === 0) { // Get Users
        if (turnStep === 0) {
            yield* stream("I'll fetch the list of all users for you.\n");
            yield { functionCall: { name: 'getUsers', args: {} } };
        } else {
            yield* stream("Here are the users currently in the system.");
        }
    } 
    else if (storyIndex === 1) { // Create Random User
        if (turnStep === 0) {
            yield* stream("First, I'll generate some random user data to work with.\n");
            yield { functionCall: { name: 'generateRandomUserResource', args: {} } };
        } else if (turnStep === 1) {
            // Peek at the tool result from history to make it look real
            const lastResult = history[history.length - 1].parts[0].functionResponse?.response?.result;
            const data = lastResult || { userName: 'jdoe', displayName: 'John Doe', email: 'jdoe@test.com' };
            
            yield* stream(`Okay, I have generated data for ${data.displayName}. Creating the user now...\n`);
            yield { functionCall: { name: 'createUser', args: { userName: data.userName, displayName: data.displayName, email: data.email } } };
        } else {
            yield* stream("The user has been created successfully.");
        }
    }
    else if (storyIndex === 2) { // Add User to Group (Complex Logic)
        if (turnStep === 0) {
            yield* stream("I need to check if the 'Engineering' group exists first, and verify the user.\n");
            yield { functionCall: { name: 'getGroups', args: {} } };
        } else if (turnStep === 1) {
            // Brain logic: Check if group exists
            const groups = scimService.getGroups();
            const engGroup = groups.find(g => g.displayName === 'Engineering');
            
            if (!engGroup) {
                yield* stream("The 'Engineering' group doesn't exist. I'll create it now.\n");
                yield { functionCall: { name: 'createGroup', args: { displayName: 'Engineering' } } };
            } else {
                // Skip creation, go straight to add
                const users = scimService.getUsers();
                const lastUser = users[users.length - 1]; // Naive "last created" selection
                yield* stream("Found the 'Engineering' group. Adding the user to it.\n");
                yield { functionCall: { name: 'addUserToGroup', args: { userId: lastUser.id, groupId: engGroup.id } } };
            }
        } else if (turnStep === 2) {
             // If we are here, we might have just created the group OR just added the user.
             // Check what tool was just called
             const lastToolName = history[history.length - 1].parts[0].functionResponse?.name;
             
             if (lastToolName === 'createGroup') {
                 const groups = scimService.getGroups();
                 const engGroup = groups.find(g => g.displayName === 'Engineering');
                 const users = scimService.getUsers();
                 const lastUser = users[users.length - 1];

                 yield* stream("Group created. Now adding the user to 'Engineering'.\n");
                 yield { functionCall: { name: 'addUserToGroup', args: { userId: lastUser.id, groupId: engGroup?.id || '' } } };
             } else {
                 yield* stream("The user has been added to the group.");
             }
        } else {
            yield* stream("Operation complete.");
        }
    }
    else if (storyIndex === 3) { // Remove User
        if (turnStep === 0) {
            yield* stream("I'll look up the IDs for the user and the group to remove them.\n");
            yield { functionCall: { name: 'getGroups', args: {} } }; // Fake dependency
        } else if (turnStep === 1) {
             const groups = scimService.getGroups();
             const engGroup = groups.find(g => g.displayName === 'Engineering');
             if (engGroup && engGroup.members.length > 0) {
                 const memberId = engGroup.members[engGroup.members.length - 1].value;
                 yield* stream(`Removing user from 'Engineering' group.\n`);
                 yield { functionCall: { name: 'removeUserFromGroup', args: { userId: memberId, groupId: engGroup.id } } };
             } else {
                 yield* stream("I couldn't find the user in that group.");
             }
        } else {
            yield* stream("User removed from the group.");
        }
    }
    else if (storyIndex === 4) { // Update Email
        if (turnStep === 0) {
             // Find last user
             const users = scimService.getUsers();
             const lastUser = users[users.length - 1];
             yield* stream(`Updating email for ${lastUser.displayName}...\n`);
             yield { functionCall: { name: 'updateUser', args: { id: lastUser.id, email: 'alice.engineer@demo.com' } } };
        } else {
            yield* stream("Email address has been updated.");
        }
    }
    else if (storyIndex === 5) { // Rename Group
        if (turnStep === 0) {
            const groups = scimService.getGroups();
            const engGroup = groups.find(g => g.displayName === 'Engineering');
            if (engGroup) {
                 yield* stream("Renaming 'Engineering' to 'Deprecated Group'...\n");
                 yield { functionCall: { name: 'patchGroup', args: { id: engGroup.id, displayName: 'Deprecated Group' } } };
            } else {
                yield* stream("Could not find the 'Engineering' group.");
            }
        } else {
            yield* stream("Group renamed successfully.");
        }
    }
    else if (storyIndex === 6) { // List empty groups
        if (turnStep === 0) {
             yield* stream("Scanning for groups with no members...\n");
             yield { functionCall: { name: 'getGroups', args: {} } };
        } else {
             const groups = scimService.getGroups();
             const empty = groups.filter(g => g.members.length === 0);
             if (empty.length > 0) {
                 yield* stream(`I found the following empty groups: ${empty.map(g => g.displayName).join(', ')}.`);
             } else {
                 yield* stream("All groups currently have members.");
             }
        }
    }
    else if (storyIndex === 7) { // Delete Group
        if (turnStep === 0) {
             const groups = scimService.getGroups();
             const target = groups.find(g => g.displayName === 'Deprecated Group');
             if (target) {
                 yield* stream("Deleting 'Deprecated Group'...\n");
                 yield { functionCall: { name: 'deleteGroup', args: { id: target.id } } };
             } else {
                 yield* stream("Group not found.");
             }
        } else {
            yield* stream("Group deleted.");
        }
    }
    else {
        // Fallback for custom input (limited support in mock)
        yield* stream("I am running in Demo Mode. Please use the Story Book buttons to explore the SCIM capabilities!");
    }
  }

  // Helper to update state deeply
  const updateMessageContent = (msgId: string, text: string) => {
    setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
            return { ...m, content: (m.content || '') + text };
        }
        return m;
    }));
  };

  const addToolCallToMessage = (msgId: string, tool: ToolCallData) => {
    setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
            const existing = m.toolCalls || [];
            return { ...m, toolCalls: [...existing, tool] };
        }
        return m;
    }));
  };

  const updateToolCallStatus = (msgId: string, toolCallId: string, status: 'success' | 'error', result: any) => {
    setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
            return {
                ...m,
                toolCalls: m.toolCalls?.map(t => 
                    t.id === toolCallId ? { ...t, status, result } : t
                )
            };
        }
        return m;
    }));
  };

  const stopAutoPlay = () => setIsAutoPlaying(false);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-6 justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Command size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight">SCIM MCP</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              LLM & MCP
              {isAutoPlaying && <span className="text-emerald-500 animate-pulse">• Auto-Demo</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                title={`Current theme: ${theme}`}
            >
                {theme === 'light' && <Sun size={14} />}
                {theme === 'dark' && <Moon size={14} />}
                {theme === 'system' && <Monitor size={14} />}
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            {isAutoPlaying && (
                 <button onClick={() => setIsAutoPlaying(false)} className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors">
                    <PauseCircle size={12} /> Pause
                 </button>
            )}
            {!isAutoPlaying && autoPlayIndex < STORY_BOOK.length && (
                <button onClick={() => setIsAutoPlaying(true)} className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors">
                    <PlayCircle size={12} /> {autoPlayIndex > 0 ? 'Resume' : 'Play'}
                </button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <Bot size={48} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">SCIM Assistant</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Managing users and groups using standard protocols.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-2xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''} fade-in group`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-border transition-colors duration-300 ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}>
              {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>

            {/* Content */}
            <div className={`flex flex-col gap-1.5 max-w-[85%]`}>
              
              {/* Text Bubble */}
              {msg.content && (
                <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-md shadow-sm transition-colors duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 border border-border text-foreground'
                }`}>
                  {msg.content}
                </div>
              )}

              {/* Tool Calls Visualization */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="flex flex-col gap-2 my-1">
                  {msg.toolCalls.map((tool, idx) => (
                    <div key={idx} className="text-xs font-mono rounded-md overflow-hidden border border-border bg-card shadow-sm transition-colors duration-300">
                      
                      {/* Tool Header */}
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                        <Terminal size={12} className="text-muted-foreground" />
                        <span className="font-medium text-foreground">{tool.name}</span>
                        <div className="ml-auto flex items-center">
                            {tool.status === 'pending' && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
                            {tool.status === 'success' && <CheckCircle2 size={12} className="text-emerald-500" />}
                            {tool.status === 'error' && <XCircle size={12} className="text-destructive" />}
                        </div>
                      </div>

                      {/* Tool Args */}
                      <div className="px-3 py-2 text-muted-foreground bg-muted/10">
                         {JSON.stringify(tool.args)}
                      </div>

                      {/* Tool Result */}
                      {tool.status !== 'pending' && (
                          <div className={`px-3 py-2 border-t border-border ${tool.status === 'error' ? 'bg-destructive/10 text-destructive-foreground' : 'bg-background text-muted-foreground'}`}>
                             <span className="opacity-50 mr-1">{'=>'}</span> {JSON.stringify(tool.result).slice(0, 150)}
                             {JSON.stringify(tool.result).length > 150 && '...'}
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Thinking / Loading State */}
              {msg.role === 'model' && isProcessing && !msg.content && (!msg.toolCalls || msg.toolCalls.length === 0) && messages.indexOf(msg) === messages.length - 1 && (
                 <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground self-start">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium animate-pulse">Thinking...</span>
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Story Book / Quick Actions */}
      <div className="px-4 py-2 border-t border-border bg-background overflow-x-auto whitespace-nowrap scrollbar-hide transition-colors duration-300">
        <div className="flex gap-2">
            {STORY_BOOK.map((story, i) => (
                <button 
                    key={i}
                    onClick={() => {
                        stopAutoPlay();
                        handleSendMessage(story);
                    }}
                    disabled={isProcessing || isTypingInput}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all disabled:opacity-50 ${
                        autoPlayIndex === i && isAutoPlaying 
                            ? 'bg-primary text-primary-foreground ring-1 ring-primary' 
                            : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                    }`}
                >
                    {autoPlayIndex === i && isAutoPlaying ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />} {story.length > 25 ? story.substring(0,25)+'...' : story}
                </button>
            ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background transition-colors duration-300">
        <div className="flex gap-2 max-w-2xl mx-auto relative">
           <div className="relative flex-1 group">
             <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={stopAutoPlay}
                onKeyDown={(e) => {
                    stopAutoPlay();
                    if(e.key === 'Enter') handleSendMessage(inputValue);
                }}
                placeholder="Type a message..."
                className={`w-full bg-background border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 transition-all ${
                    isTypingInput ? 'border-primary ring-1 ring-primary' : 'border-input'
                }`}
                disabled={isProcessing || isTypingInput}
            />
           </div>
          
          <button
            onClick={() => {
                stopAutoPlay();
                handleSendMessage(inputValue);
            }}
            disabled={!inputValue.trim() || isProcessing || isTypingInput}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};